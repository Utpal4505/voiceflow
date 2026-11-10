use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

use super::audio_stream::RingBuffer;
use super::dtw::DtwMatcher;
use super::mfcc::{MfccExtractor, SAMPLE_RATE};
use super::templates::WakeWordTemplates;

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

pub struct WakeWordDetector {
    is_running: Arc<AtomicBool>,
}

impl WakeWordDetector {
    pub fn start(
        app: AppHandle,
        buffer: Arc<Mutex<RingBuffer>>,
        config: Arc<Mutex<WakeWordConfig>>,
    ) -> Self {
        let is_running = Arc::new(AtomicBool::new(true));
        let running_flag = is_running.clone();

        std::thread::spawn(move || {
            let extractor = MfccExtractor::new();
            let mut templates = WakeWordTemplates::build(&extractor);

            let mut last_trigger_time = Instant::now() - Duration::from_secs(10);
            let mut last_log_time = Instant::now() - Duration::from_secs(10);
            let mut last_templates_reload = Instant::now();
            let cooldown = Duration::from_millis(2500);

            println!("[WakeWord Detector] Continuous listening worker thread active");

            while running_flag.load(Ordering::Relaxed) {
                // Periodically reload user templates in case they were updated by calibration wizard
                if last_templates_reload.elapsed() > Duration::from_secs(2) {
                    last_templates_reload = Instant::now();
                    templates = WakeWordTemplates::build(&extractor);
                }

                // 1. Fetch current config
                let current_config = {
                    if let Ok(cfg) = config.lock() {
                        cfg.clone()
                    } else {
                        WakeWordConfig::default()
                    }
                };

                // If disabled, sleep
                if !current_config.enabled {
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

                // 3. Adaptive Voice Activity Detection (VAD) on the most recent 350ms (5,600 samples)
                let recent_len = 5600.min(audio_samples.len());
                let recent_samples = &audio_samples[audio_samples.len() - recent_len..];
                let mut sum_sq = 0.0f32;
                for &s in recent_samples {
                    sum_sq += s * s;
                }
                let rms = (sum_sq / recent_len as f32).sqrt();

                // Adaptive VAD threshold:
                // Base ambient room noise floor is ~0.0040 - 0.0055
                // Real conversational speech is ~0.015 - 0.040
                // Sensitivity 0.0 -> 0.016 (only strong clear voice)
                // Sensitivity 0.5 -> 0.011 (standard normal voice, above noise floor)
                // Sensitivity 1.0 -> 0.007 (softer voice)
                let vad_energy_threshold = (0.016 - current_config.sensitivity.clamp(0.0, 1.0) * 0.009).max(0.007);

                // Periodic diagnostic logging every 2.0s
                let now = Instant::now();
                if now.duration_since(last_log_time) >= Duration::from_millis(2000) {
                    last_log_time = now;
                    println!(
                        "[WakeWord Detector] Live Monitor: RMS={:.5} (VAD gate={:.5}) | Mode='{}' | Sens={:.2}",
                        rms, vad_energy_threshold, current_config.phrase, current_config.sensitivity
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

                // 4. Cooldown check
                if last_trigger_time.elapsed() < cooldown {
                    std::thread::sleep(Duration::from_millis(100));
                    continue;
                }

                // 5. Compute MFCC features on candidate speech slice (last 1.5s ~ 24,000 samples)
                let candidate_len = 24000.min(audio_samples.len());
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
                        // Matching against user's enrolled voice (Cosine DTW distance)
                        let dist = DtwMatcher::distance(&query_mfcc, user_tpl);
                        // Sensitivity threshold for enrolled voice: 0.45 (strict) to 0.65 (sensitive)
                        let threshold = 0.45 + current_config.sensitivity.clamp(0.0, 1.0) * 0.20;
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
                        let threshold = 0.55 + current_config.sensitivity.clamp(0.0, 1.0) * 0.20;
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
                        let threshold = 0.45 + current_config.sensitivity.clamp(0.0, 1.0) * 0.20;
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
                        let threshold = 0.55 + current_config.sensitivity.clamp(0.0, 1.0) * 0.20;
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
                    std::thread::sleep(Duration::from_millis(60));
                }
            }

            println!("[WakeWord Detector] Continuous listening worker thread exiting");
        });

        Self { is_running }
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::Relaxed);
    }
}
