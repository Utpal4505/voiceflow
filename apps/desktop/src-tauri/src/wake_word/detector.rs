use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

use super::audio_stream::RingBuffer;
use super::dtw::DtwMatcher;
use super::mfcc::{MfccExtractor, NUM_CEPSTRA, SAMPLE_RATE};
use super::templates::{save_user_profile, WakeWordTemplates};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WakeWordConfig {
    pub enabled: bool,
    pub phrase: String,       // "hey_voiceflow", "hey_flow", or "both"
    pub sensitivity: f32,     // 0.0 to 1.0 (default 0.5)
}

impl Default for WakeWordConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            phrase: "hey_voiceflow".to_string(),
            sensitivity: 0.5,
        }
    }
}

#[derive(Debug, Clone)]
pub struct CalibrationState {
    pub phrase: String,
    pub samples: Vec<Vec<[f32; NUM_CEPSTRA]>>,
    pub is_collecting: bool,
}

pub struct WakeWordDetector {
    is_running: Arc<AtomicBool>,
    _calibration_state: Arc<Mutex<Option<CalibrationState>>>,
}

impl WakeWordDetector {
    pub fn start(
        app: AppHandle,
        buffer: Arc<Mutex<RingBuffer>>,
        config: Arc<Mutex<WakeWordConfig>>,
        calibration_state: Arc<Mutex<Option<CalibrationState>>>,
    ) -> Self {
        let is_running = Arc::new(AtomicBool::new(true));
        let running_flag = is_running.clone();
        let cal_state_clone = calibration_state.clone();

        std::thread::spawn(move || {
            let extractor = MfccExtractor::new();
            let mut templates = WakeWordTemplates::build(&extractor);

            let mut last_trigger_time = Instant::now() - Duration::from_secs(10);
            let mut last_log_time = Instant::now() - Duration::from_secs(10);
            let cooldown = Duration::from_millis(2500);

            println!("[WakeWord Detector] Worker thread initialized and active");

            while running_flag.load(Ordering::Relaxed) {
                // 1. Fetch current config
                let current_config = {
                    if let Ok(cfg) = config.lock() {
                        cfg.clone()
                    } else {
                        WakeWordConfig::default()
                    }
                };

                // Check if a calibration session is currently underway
                let cal_session = {
                    if let Ok(guard) = cal_state_clone.lock() {
                        guard.clone()
                    } else {
                        None
                    }
                };

                let in_calibration = cal_session.is_some();

                // If not enabled and not calibrating, sleep
                if !current_config.enabled && !in_calibration {
                    std::thread::sleep(Duration::from_millis(200));
                    continue;
                }

                // 2. Fetch linear slice of last 2.2 seconds of audio (35,200 samples @ 16kHz)
                let audio_samples = {
                    if let Ok(buf) = buffer.lock() {
                        buf.get_linear_slice()
                    } else {
                        Vec::new()
                    }
                };

                if audio_samples.len() < SAMPLE_RATE {
                    std::thread::sleep(Duration::from_millis(80));
                    continue;
                }

                // 3. Adaptive Voice Activity Detection (VAD) on the most recent 400ms (6,400 samples)
                let recent_len = 6400.min(audio_samples.len());
                let recent_samples = &audio_samples[audio_samples.len() - recent_len..];
                let mut sum_sq = 0.0f32;
                for &s in recent_samples {
                    sum_sq += s * s;
                }
                let rms = (sum_sq / recent_len as f32).sqrt();

                // Adaptive VAD threshold:
                // Sensitivity 0.0 -> 0.0060 (quieter environments)
                // Sensitivity 0.5 -> 0.0035 (standard conversational speech 30-50cm)
                // Sensitivity 1.0 -> 0.0018 (soft speech / quiet whispers)
                let vad_energy_threshold = if in_calibration {
                    0.0030f32 // Slightly sensitive during user enrollment
                } else {
                    (0.006 - current_config.sensitivity.clamp(0.0, 1.0) * 0.0042).max(0.0015)
                };

                // Periodic diagnostic logging every 2.0s
                let now = Instant::now();
                if now.duration_since(last_log_time) >= Duration::from_millis(2000) {
                    last_log_time = now;
                    println!(
                        "[WakeWord Detector] Live Monitor: RMS={:.5} (VAD gate={:.5}) | Mode='{}' | Calibrating={} | Sens={:.2}",
                        rms, vad_energy_threshold, current_config.phrase, in_calibration, current_config.sensitivity
                    );
                }

                // If room is quieter than VAD gate, sleep to preserve 0% idle CPU
                if rms < vad_energy_threshold {
                    std::thread::sleep(Duration::from_millis(60));
                    continue;
                }

                println!(
                    "[WakeWord VAD] >>> VOICE ACTIVITY DETECTED! RMS={:.5} >= gate={:.5}",
                    rms, vad_energy_threshold
                );

                // --- PATH A: VOICE ENROLLMENT / CALIBRATION MODE ---
                if let Some(mut session) = cal_session {
                    // Extract recent candidate utterance (last 1.6s ~ 25,600 samples)
                    let candidate_len = 25600.min(audio_samples.len());
                    let candidate_audio = &audio_samples[audio_samples.len() - candidate_len..];

                    let query_mfcc = extractor.extract(candidate_audio);
                    if query_mfcc.len() >= 30 {
                        session.samples.push(query_mfcc);
                        let sample_num = session.samples.len();

                        println!(
                            "[WakeWord Calibration] Captured voice sample #{}/3 for '{}' ({} MFCC frames)",
                            sample_num, session.phrase, session.samples.last().unwrap().len()
                        );

                        let step_payload = serde_json::json!({
                            "step": sample_num,
                            "maxSteps": 3,
                            "phrase": session.phrase
                        });
                        let _ = app.emit("wake-word:calibration-step", step_payload);

                        if sample_num >= 3 {
                            println!("[WakeWord Calibration] All 3 samples captured! Ensembling medoid profile...");
                            let best_prototype = WakeWordTemplates::select_best_prototype(&session.samples);
                            let _ = save_user_profile(&session.phrase, best_prototype.clone(), 3);

                            if session.phrase == "hey_flow" {
                                templates.user_hey_flow = Some(best_prototype);
                            } else {
                                templates.user_hey_voiceflow = Some(best_prototype);
                            }

                            if let Ok(mut guard) = cal_state_clone.lock() {
                                *guard = None; // Reset calibration session
                            }

                            let complete_payload = serde_json::json!({
                                "phrase": session.phrase,
                                "success": true
                            });
                            let _ = app.emit("wake-word:calibration-complete", complete_payload);
                            println!("[WakeWord Calibration] Calibration complete and user profile activated!");
                        } else {
                            // Update stored session state
                            if let Ok(mut guard) = cal_state_clone.lock() {
                                *guard = Some(session);
                            }
                        }

                        // Pause between samples so user has time to prepare
                        std::thread::sleep(Duration::from_millis(1600));
                        continue;
                    }
                }

                // --- PATH B: STANDARD BACKGROUND WAKE WORD DETECTION ---
                // 4. Cooldown check
                if last_trigger_time.elapsed() < cooldown {
                    std::thread::sleep(Duration::from_millis(100));
                    continue;
                }

                // 5. Compute MFCC features on candidate speech slice (last 1.6s ~ 25,600 samples)
                let candidate_len = 25600.min(audio_samples.len());
                let candidate_audio = &audio_samples[audio_samples.len() - candidate_len..];

                let query_mfcc = extractor.extract(candidate_audio);
                if query_mfcc.len() < 25 {
                    std::thread::sleep(Duration::from_millis(50));
                    continue;
                }

                let check_voiceflow = current_config.phrase == "hey_voiceflow" || current_config.phrase == "both";
                let check_flow = current_config.phrase == "hey_flow" || current_config.phrase == "both";

                let mut matched_phrase: Option<&str> = None;
                let mut best_score = f32::INFINITY;
                let mut active_threshold = 0.0f32;

                // Test "Hey VoiceFlow"
                if check_voiceflow {
                    if let Some(user_tpl) = &templates.user_hey_voiceflow {
                        // Matching against user's enrolled voice (high precision!)
                        let dist = DtwMatcher::distance(&query_mfcc, user_tpl);
                        // Sensitivity threshold for enrolled voice: 0.60 to 0.95
                        let threshold = 0.60 + current_config.sensitivity.clamp(0.0, 1.0) * 0.35;
                        println!(
                            "[WakeWord DTW] VoiceFlow (Enrolled User Profile): Distance={:.3} vs Threshold={:.3}",
                            dist, threshold
                        );
                        if dist < threshold && dist < best_score {
                            best_score = dist;
                            active_threshold = threshold;
                            matched_phrase = Some("Hey VoiceFlow");
                        }
                    } else {
                        // Matching against synthetic base template
                        let dist = DtwMatcher::distance(&query_mfcc, &templates.base_hey_voiceflow);
                        let threshold = 1.15 + current_config.sensitivity.clamp(0.0, 1.0) * 0.50;
                        println!(
                            "[WakeWord DTW] VoiceFlow (Base Generic Template): Distance={:.3} vs Threshold={:.3}",
                            dist, threshold
                        );
                        if dist < threshold && dist < best_score {
                            best_score = dist;
                            active_threshold = threshold;
                            matched_phrase = Some("Hey VoiceFlow");
                        }
                    }
                }

                // Test "Hey Flow"
                if check_flow {
                    if let Some(user_tpl) = &templates.user_hey_flow {
                        let dist = DtwMatcher::distance(&query_mfcc, user_tpl);
                        let threshold = 0.60 + current_config.sensitivity.clamp(0.0, 1.0) * 0.35;
                        println!(
                            "[WakeWord DTW] Flow (Enrolled User Profile): Distance={:.3} vs Threshold={:.3}",
                            dist, threshold
                        );
                        if dist < threshold && dist < best_score {
                            best_score = dist;
                            active_threshold = threshold;
                            matched_phrase = Some("Hey Flow");
                        }
                    } else {
                        let dist = DtwMatcher::distance(&query_mfcc, &templates.base_hey_flow);
                        let threshold = 1.15 + current_config.sensitivity.clamp(0.0, 1.0) * 0.50;
                        println!(
                            "[WakeWord DTW] Flow (Base Generic Template): Distance={:.3} vs Threshold={:.3}",
                            dist, threshold
                        );
                        if dist < threshold && dist < best_score {
                            best_score = dist;
                            active_threshold = threshold;
                            matched_phrase = Some("Hey Flow");
                        }
                    }
                }

                // 6. Action Execution on Detection
                if let Some(phrase_name) = matched_phrase {
                    last_trigger_time = Instant::now();
                    println!(
                        "[WakeWord Trigger] >>> WAKE WORD MATCHED! Phrase='{}' (Score={:.3} < Threshold={:.3}) <<<",
                        phrase_name, best_score, active_threshold
                    );

                    // Notify frontend overlay to play chime
                    let _ = app.emit("wake-word:triggered", phrase_name);

                    // Automatically surface VoiceFlow overlay window and begin listening
                    crate::trigger_wake_word_overlay(app.clone());

                    // Sleep 1.5s to prevent feedback loop
                    std::thread::sleep(Duration::from_millis(1500));
                } else {
                    std::thread::sleep(Duration::from_millis(50));
                }
            }

            println!("[WakeWord Detector] Worker thread exiting gracefully");
        });

        Self {
            is_running,
            _calibration_state: calibration_state,
        }
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::Relaxed);
    }
}
