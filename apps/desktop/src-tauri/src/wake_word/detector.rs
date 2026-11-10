use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, Manager};

use super::audio_stream::RingBuffer;
use super::dtw::DtwMatcher;
use super::mfcc::{MfccExtractor, SAMPLE_RATE};
use super::templates::WakeWordTemplates;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WakeWordConfig {
    pub enabled: bool,
    pub phrase: String,   // "hey_voiceflow", "hey_flow", or "both"
    pub sensitivity: f32, // 0.0 to 1.0 (default 0.5)
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
        reload_flag: Arc<AtomicBool>,
    ) -> Self {
        let is_running = Arc::new(AtomicBool::new(true));
        let running_flag = is_running.clone();

        std::thread::spawn(move || {
            let extractor = MfccExtractor::new();
            let mut templates = WakeWordTemplates::build(&extractor);

            let mut last_trigger_time = Instant::now() - Duration::from_secs(10);
            let mut last_log_time = Instant::now() - Duration::from_secs(10);
            let cooldown = Duration::from_millis(1500);

            // Speech endpointing state tracker
            let mut is_speech_active = false;
            let mut speech_samples_accumulated: usize = 0;
            let mut silence_frame_count: usize = 0;
            let mut was_overlay_open = false;

            let step_sleep_ms: u64 = 40;
            let step_samples = (SAMPLE_RATE as f32 * (step_sleep_ms as f32 / 1000.0)) as usize;

            println!("[WakeWord Detector] Continuous listening worker thread active");

            while running_flag.load(Ordering::Relaxed) {
                // Event-driven template reload (when user completes calibration or resets)
                if reload_flag.swap(false, Ordering::Relaxed) {
                    println!("[WakeWord Detector] Reloading voice templates after profile update...");
                    templates = WakeWordTemplates::build(&extractor);
                }

                // 1. Check if dictation overlay is visible
                let is_overlay_open = if let Some(overlay) = app.get_webview_window("overlay") {
                    crate::is_overlay_window_visible(&overlay)
                } else {
                    false
                };

                // While overlay is open (user is actively dictating into VoiceFlow), suspend wake-word detection
                if is_overlay_open {
                    if !was_overlay_open {
                        println!("[WakeWord Detector] Overlay opened; pausing wake-word listening during dictation session");
                        was_overlay_open = true;
                    }
                    is_speech_active = false;
                    speech_samples_accumulated = 0;
                    silence_frame_count = 0;
                    std::thread::sleep(Duration::from_millis(120));
                    continue;
                }

                // When overlay closes, enforce a 1.2s post-dictation cooldown to ignore trailing voice/clicks
                if was_overlay_open {
                    println!("[WakeWord Detector] Overlay closed; wake-word detector re-armed with 1.2s cooldown");
                    was_overlay_open = false;
                    last_trigger_time = Instant::now();
                    is_speech_active = false;
                    speech_samples_accumulated = 0;
                    silence_frame_count = 0;
                    std::thread::sleep(Duration::from_millis(120));
                    continue;
                }

                // 2. Fetch current config
                let current_config = {
                    if let Ok(cfg) = config.lock() {
                        cfg.clone()
                    } else {
                        WakeWordConfig::default()
                    }
                };

                // If disabled, reset speech state and sleep
                if !current_config.enabled {
                    is_speech_active = false;
                    speech_samples_accumulated = 0;
                    silence_frame_count = 0;
                    std::thread::sleep(Duration::from_millis(200));
                    continue;
                }

                // Front-load cooldown: do not accumulate audio while within cooldown period
                if last_trigger_time.elapsed() < cooldown {
                    is_speech_active = false;
                    speech_samples_accumulated = 0;
                    silence_frame_count = 0;
                    std::thread::sleep(Duration::from_millis(step_sleep_ms));
                    continue;
                }

                // 3. Fetch linear slice of audio buffer (capacity ~2.5s)
                let audio_samples = {
                    if let Ok(buf) = buffer.lock() {
                        buf.get_linear_slice()
                    } else {
                        Vec::new()
                    }
                };

                if audio_samples.len() < SAMPLE_RATE {
                    std::thread::sleep(Duration::from_millis(50));
                    continue;
                }

                // 4. Short-time RMS on recent 120ms (1920 samples) for VAD
                let check_len = 1920.min(audio_samples.len());
                let check_samples = &audio_samples[audio_samples.len() - check_len..];
                let mut sum_sq = 0.0f32;
                for &s in check_samples {
                    sum_sq += s * s;
                }
                let rms = (sum_sq / check_len as f32).sqrt();

                // Adaptive VAD threshold:
                // Base ambient room noise floor is ~0.0035 - 0.0055
                // Real conversational speech is ~0.015 - 0.045
                let vad_energy_threshold =
                    (0.015 - current_config.sensitivity.clamp(0.0, 1.0) * 0.008).max(0.0065);

                // Periodic diagnostic logging every 2.5s
                let now = Instant::now();
                if now.duration_since(last_log_time) >= Duration::from_millis(2500) {
                    last_log_time = now;
                    println!(
                        "[WakeWord Detector] Live Monitor: RMS={:.5} (VAD gate={:.5}) | Mode='{}' | Sens={:.2} | Active={}",
                        rms, vad_energy_threshold, current_config.phrase, current_config.sensitivity, is_speech_active
                    );
                }

                // 5. Speech Endpointing State Machine
                let mut should_evaluate = false;

                if !is_speech_active {
                    if rms >= vad_energy_threshold {
                        is_speech_active = true;
                        silence_frame_count = 0;
                        // Include 2000 samples (~125ms) pre-roll padding to preserve initial onset fricatives
                        speech_samples_accumulated = 2000;
                        println!(
                            "[WakeWord VAD] >>> VOICE ACTIVITY ONSET! RMS={:.5} >= gate={:.5}",
                            rms, vad_energy_threshold
                        );
                    }
                } else {
                    speech_samples_accumulated += step_samples;

                    if rms < vad_energy_threshold {
                        silence_frame_count += 1;
                    } else {
                        silence_frame_count = 0;
                    }

                    // A. Natural end of phrase: silence for >= 160ms (4 frames @ 40ms)
                    //    after at least 450ms (7,200 samples) and not exceeding 1350ms (21,600 samples)
                    if silence_frame_count >= 4
                        && speech_samples_accumulated >= 7200
                        && speech_samples_accumulated <= 21600
                    {
                        should_evaluate = true;
                        is_speech_active = false;
                    }
                    // B. Continuous speech overflow: speech exceeding 1.35s without any pause
                    //    is conversational speech or a long sentence, NOT an isolated wake word.
                    else if speech_samples_accumulated > 21600 {
                        is_speech_active = false;
                        silence_frame_count = 0;
                        speech_samples_accumulated = 0;
                    }
                    // C. Transient click/noise (< 450ms followed by silence)
                    else if silence_frame_count >= 4 && speech_samples_accumulated < 7200 {
                        is_speech_active = false;
                        silence_frame_count = 0;
                        speech_samples_accumulated = 0;
                    }
                }

                if !should_evaluate {
                    std::thread::sleep(Duration::from_millis(step_sleep_ms));
                    continue;
                }

                // 6. Extract clean endpointed utterance
                let candidate_len = speech_samples_accumulated
                    .clamp(6400, 22000)
                    .min(audio_samples.len());
                let candidate_audio = &audio_samples[audio_samples.len() - candidate_len..];
                let speech_dur_ms = (candidate_len as f32 / SAMPLE_RATE as f32 * 1000.0) as u32;

                println!(
                    "[WakeWord Segmenter] Utterance captured: {} samples ({}ms). Running MFCC & DTW...",
                    candidate_len, speech_dur_ms
                );

                // Reset tracker
                speech_samples_accumulated = 0;
                silence_frame_count = 0;

                let query_mfcc = extractor.extract(candidate_audio);
                if query_mfcc.len() < 20 {
                    std::thread::sleep(Duration::from_millis(step_sleep_ms));
                    continue;
                }

                let check_voiceflow =
                    current_config.phrase == "hey_voiceflow" || current_config.phrase == "both";
                let check_flow =
                    current_config.phrase == "hey_flow" || current_config.phrase == "both";

                let mut matched_phrase: Option<&str> = None;
                let mut best_score = f32::INFINITY;
                let mut active_threshold = 0.0f32;

                // Test "Hey VoiceFlow"
                if check_voiceflow {
                    if let Some(prototypes) = &templates.user_hey_voiceflow {
                        let dist = WakeWordTemplates::min_ensemble_distance(&query_mfcc, prototypes);
                        // Enrolled threshold curve: 0.42 (sens 0.0) to 0.54 (sens 1.0) -> 0.486 at 0.55
                        // Empirically isolates true speech (0.34 - 0.47) from other words (0.56 - 0.75)
                        let threshold = 0.42 + current_config.sensitivity.clamp(0.0, 1.0) * 0.12;
                        println!(
                            "[WakeWord DTW] VoiceFlow (Enrolled User Profile - {} prototypes): Distance={:.3} vs Threshold={:.3}",
                            prototypes.len(), dist, threshold
                        );
                        if dist < threshold && dist < best_score {
                            best_score = dist;
                            active_threshold = threshold;
                            matched_phrase = Some("Hey VoiceFlow");
                        }
                    } else {
                        let dist = DtwMatcher::distance(&query_mfcc, &templates.base_hey_voiceflow);
                        let threshold = 0.48 + current_config.sensitivity.clamp(0.0, 1.0) * 0.14;
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
                    if let Some(prototypes) = &templates.user_hey_flow {
                        let dist = WakeWordTemplates::min_ensemble_distance(&query_mfcc, prototypes);
                        let threshold = 0.42 + current_config.sensitivity.clamp(0.0, 1.0) * 0.12;
                        println!(
                            "[WakeWord DTW] Flow (Enrolled User Profile - {} prototypes): Distance={:.3} vs Threshold={:.3}",
                            prototypes.len(), dist, threshold
                        );
                        if dist < threshold && dist < best_score {
                            best_score = dist;
                            active_threshold = threshold;
                            matched_phrase = Some("Hey Flow");
                        }
                    } else {
                        let dist = DtwMatcher::distance(&query_mfcc, &templates.base_hey_flow);
                        let threshold = 0.48 + current_config.sensitivity.clamp(0.0, 1.0) * 0.14;
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

                // 7. Action on match
                if let Some(phrase_name) = matched_phrase {
                    last_trigger_time = Instant::now();
                    println!(
                        "[WakeWord Trigger] >>> WAKE WORD MATCHED! Phrase='{}' (Score={:.3} < Threshold={:.3}) <<<",
                        phrase_name, best_score, active_threshold
                    );

                    // Notify frontend overlay to play earcon chime
                    let _ = app.emit("wake-word:triggered", phrase_name);

                    // Automatically surface VoiceFlow overlay window and begin listening
                    crate::trigger_wake_word_overlay(app.clone());

                    is_speech_active = false;
                    speech_samples_accumulated = 0;
                    silence_frame_count = 0;

                    // Sleep 400ms to allow overlay window to show and transition to active
                    std::thread::sleep(Duration::from_millis(400));
                } else {
                    std::thread::sleep(Duration::from_millis(step_sleep_ms));
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
