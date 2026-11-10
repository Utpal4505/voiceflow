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
            let templates = WakeWordTemplates::build(&extractor);

            let mut last_trigger_time = Instant::now() - Duration::from_secs(10);
            let cooldown = Duration::from_millis(2500);

            // Minimum RMS threshold to consider voice activity (VAD)
            let vad_energy_threshold = 0.012f32;

            println!("[WakeWord Detector] Worker thread active and listening");

            while running_flag.load(Ordering::Relaxed) {
                // 1. Check if wake word feature is currently enabled
                let current_config = {
                    if let Ok(cfg) = config.lock() {
                        cfg.clone()
                    } else {
                        WakeWordConfig::default()
                    }
                };

                if !current_config.enabled {
                    std::thread::sleep(Duration::from_millis(200));
                    continue;
                }

                // 2. Fetch linear slice of last 2.2 seconds of audio (35,200 samples)
                let audio_samples = {
                    if let Ok(buf) = buffer.lock() {
                        buf.get_linear_slice()
                    } else {
                        Vec::new()
                    }
                };

                if audio_samples.len() < SAMPLE_RATE {
                    std::thread::sleep(Duration::from_millis(100));
                    continue;
                }

                // 3. Fast Voice Activity Detection (VAD) on the most recent 400ms (6,400 samples)
                let recent_len = 6400.min(audio_samples.len());
                let recent_samples = &audio_samples[audio_samples.len() - recent_len..];
                let mut sum_sq = 0.0f32;
                for &s in recent_samples {
                    sum_sq += s * s;
                }
                let rms = (sum_sq / recent_len as f32).sqrt();

                // If room is silent, sleep to keep CPU at 0%
                if rms < vad_energy_threshold {
                    std::thread::sleep(Duration::from_millis(80));
                    continue;
                }

                // 4. Cooldown check
                if last_trigger_time.elapsed() < cooldown {
                    std::thread::sleep(Duration::from_millis(100));
                    continue;
                }

                // 5. Compute MFCC features on candidate speech slice (last 1.6s ~ 25,600 samples)
                let candidate_len = 25600.min(audio_samples.len());
                let candidate_audio = &audio_samples[audio_samples.len() - candidate_len..];

                let query_mfcc = extractor.extract(candidate_audio);
                if query_mfcc.is_empty() {
                    std::thread::sleep(Duration::from_millis(50));
                    continue;
                }

                // 6. Base distance threshold adjusted by sensitivity
                // Sensitivity 0.0 -> 1.05 (strict), 0.5 -> 1.35 (balanced), 1.0 -> 1.65 (loose)
                let dist_threshold = 1.05 + current_config.sensitivity.clamp(0.0, 1.0) * 0.60;

                let mut matched_phrase: Option<&str> = None;
                let mut best_score = f32::INFINITY;

                let check_voiceflow = current_config.phrase == "hey_voiceflow" || current_config.phrase == "both";
                let check_flow = current_config.phrase == "hey_flow" || current_config.phrase == "both";

                if check_voiceflow {
                    let d = DtwMatcher::distance(&query_mfcc, &templates.hey_voiceflow);
                    if d < dist_threshold && d < best_score {
                        best_score = d;
                        matched_phrase = Some("Hey VoiceFlow");
                    }
                }

                if check_flow {
                    let d = DtwMatcher::distance(&query_mfcc, &templates.hey_flow);
                    if d < dist_threshold && d < best_score {
                        best_score = d;
                        matched_phrase = Some("Hey Flow");
                    }
                }

                // 7. Trigger action if match found
                if let Some(phrase_name) = matched_phrase {
                    last_trigger_time = Instant::now();
                    println!(
                        "[WakeWord] Wake word detected: '{}' (DTW Score: {:.3}, Threshold: {:.3})",
                        phrase_name, best_score, dist_threshold
                    );

                    // Notify frontend overlay and app
                    let _ = app.emit("wake-word:triggered", phrase_name);

                    // Automatically open overlay and focus dictation
                    crate::trigger_wake_word_overlay(app.clone());

                    // Sleep longer to prevent double triggers during utterance
                    std::thread::sleep(Duration::from_millis(1200));
                } else {
                    // Small step between analysis frames
                    std::thread::sleep(Duration::from_millis(60));
                }
            }

            println!("[WakeWord Detector] Worker thread exiting gracefully");
        });

        Self { is_running }
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::Relaxed);
    }
}
