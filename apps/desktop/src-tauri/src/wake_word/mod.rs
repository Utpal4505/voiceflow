pub mod audio_stream;
pub mod detector;
pub mod dtw;
pub mod mfcc;
pub mod templates;

pub use detector::WakeWordConfig;

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::AppHandle;

use audio_stream::{start_audio_capture, AudioCapture, RingBuffer};
use detector::WakeWordDetector;
use dtw::DtwMatcher;
use mfcc::{MfccExtractor, NUM_CEPSTRA, SAMPLE_RATE};
use templates::{delete_user_profile, load_user_profiles, save_user_profile, WakeWordTemplates};

pub struct WakeWordService {
    config: Arc<Mutex<WakeWordConfig>>,
    buffer: Arc<Mutex<RingBuffer>>,
    calibration_samples: Vec<Vec<[f32; NUM_CEPSTRA]>>,
    reload_flag: Arc<AtomicBool>,
    capture: Option<AudioCapture>,
    detector: Option<WakeWordDetector>,
}

impl Default for WakeWordService {
    fn default() -> Self {
        Self::new()
    }
}

impl WakeWordService {
    pub fn new() -> Self {
        let buffer_capacity = (SAMPLE_RATE as f32 * 2.5) as usize;
        let buffer = Arc::new(Mutex::new(RingBuffer::new(buffer_capacity)));
        let reload_flag = Arc::new(AtomicBool::new(false));

        Self {
            config: Arc::new(Mutex::new(WakeWordConfig::default())),
            buffer,
            calibration_samples: Vec::new(),
            reload_flag,
            capture: None,
            detector: None,
        }
    }

    pub fn get_config(&self) -> WakeWordConfig {
        if let Ok(guard) = self.config.lock() {
            guard.clone()
        } else {
            WakeWordConfig::default()
        }
    }

    pub fn set_config(&mut self, app: &AppHandle, new_config: WakeWordConfig) {
        println!(
            "[WakeWord Service] Updating config: enabled={}, phrase='{}', sensitivity={:.2}",
            new_config.enabled, new_config.phrase, new_config.sensitivity
        );

        let was_enabled = if let Ok(guard) = self.config.lock() {
            guard.enabled
        } else {
            false
        };

        if let Ok(mut guard) = self.config.lock() {
            *guard = new_config.clone();
        }

        if new_config.enabled && !was_enabled {
            self.start_listening(app);
        } else if !new_config.enabled && was_enabled {
            self.stop_listening();
        }
    }

    pub fn start_calibration(&mut self, app: &AppHandle, phrase: &str) {
        println!("[WakeWord Service] Starting calibration session for '{}'", phrase);
        self.calibration_samples.clear();
        self.start_listening(app);
    }

    pub fn cancel_calibration(&mut self) {
        println!("[WakeWord Service] Calibration cancelled");
        self.calibration_samples.clear();
    }

    /// Records one deliberate calibration speech sample from the user (waits for real voice onset > 0.012 RMS)
    pub fn record_calibration_step(
        &mut self,
        app: &AppHandle,
        phrase: String,
        step_index: usize,
    ) -> Result<serde_json::Value, String> {
        self.start_listening(app);

        println!(
            "[WakeWord Calibration] Waiting for user to speak step #{}/3 ('{}')...",
            step_index, phrase
        );

        let start_wait = Instant::now();
        let timeout = Duration::from_millis(6000);
        let speech_onset_threshold = 0.012f32;
        let speech_silence_threshold = 0.010f32;

        let mut voice_detected = false;
        let mut speech_start = Instant::now();
        let mut silence_frame_count: usize = 0;
        let mut peak_rms = 0.0f32;
        let extractor = MfccExtractor::new();

        while start_wait.elapsed() < timeout {
            // Check recent 120ms RMS (1,920 samples)
            let audio_samples = {
                if let Ok(buf) = self.buffer.lock() {
                    buf.get_linear_slice()
                } else {
                    Vec::new()
                }
            };

            if audio_samples.len() < SAMPLE_RATE {
                std::thread::sleep(Duration::from_millis(40));
                continue;
            }

            let check_len = 1920.min(audio_samples.len());
            let check_slice = &audio_samples[audio_samples.len() - check_len..];
            let mut sum_sq = 0.0f32;
            for &s in check_slice {
                sum_sq += s * s;
            }
            let rms = (sum_sq / check_len as f32).sqrt();

            if !voice_detected {
                if rms >= speech_onset_threshold {
                    voice_detected = true;
                    speech_start = Instant::now();
                    silence_frame_count = 0;
                    peak_rms = rms;
                    println!(
                        "[WakeWord Calibration] Voice onset detected! RMS={:.5} >= {:.5}",
                        rms, speech_onset_threshold
                    );
                } else {
                    std::thread::sleep(Duration::from_millis(40));
                    continue;
                }
            } else {
                if rms > peak_rms {
                    peak_rms = rms;
                }

                if rms < speech_silence_threshold {
                    silence_frame_count += 1;
                } else {
                    silence_frame_count = 0;
                }

                let speech_dur = speech_start.elapsed();

                // Speech endpointing conditions:
                // 1. Natural end of phrase: silence for >= 160ms (4 frames @ 40ms) after at least 380ms of speech
                // 2. Max utterance timeout: 1.35 seconds
                let is_speech_done = (silence_frame_count >= 4 && speech_dur >= Duration::from_millis(380))
                    || speech_dur >= Duration::from_millis(1350);

                if is_speech_done {
                    let actual_speech_ms = speech_dur.as_millis();
                    println!(
                        "[WakeWord Calibration] Speech completed! Duration: {}ms, Peak RMS: {:.5}. Validating...",
                        actual_speech_ms, peak_rms
                    );

                    // Quality Gate 1: Volume Check
                    if peak_rms < 0.013 {
                        return Err("Voice was too quiet. Please speak clearly at normal volume.".to_string());
                    }
                    if peak_rms > 0.45 {
                        return Err("Mic volume clipped. Please speak at normal speaking volume.".to_string());
                    }

                    // Quality Gate 2: Duration Check
                    if actual_speech_ms < 280 {
                        return Err("Speech was too brief. Please pronounce the full phrase clearly.".to_string());
                    }
                    if actual_speech_ms > 1300 && silence_frame_count < 4 {
                        return Err("Recording took too long. Just say the phrase itself.".to_string());
                    }

                    // Extract speech audio with 120ms pre/post margin
                    let speech_sample_count = ((speech_dur.as_secs_f32() + 0.12) * SAMPLE_RATE as f32) as usize;
                    let candidate_len = speech_sample_count.clamp(5600, 22000).min(audio_samples.len());
                    let candidate_audio = &audio_samples[audio_samples.len() - candidate_len..];

                    let mfcc_frames = extractor.extract(candidate_audio);
                    if mfcc_frames.len() < 25 {
                        return Err("Could not extract speech features. Please speak clearly.".to_string());
                    }

                    // Quality Gate 3: Consistency Check with Step 1
                    // If this is step 2 or 3, ensure it sounds like the same wake phrase as step 1!
                    if !self.calibration_samples.is_empty() {
                        let dist_to_first = DtwMatcher::distance(&mfcc_frames, &self.calibration_samples[0]);
                        println!(
                            "[WakeWord Calibration] Consistency check vs Step 1: Distance={:.3}",
                            dist_to_first
                        );
                        if dist_to_first > 0.78 || dist_to_first.is_infinite() {
                            return Err("Didn't sound quite like the first sample. Please repeat the wake phrase.".to_string());
                        }
                    }

                    self.calibration_samples.push(mfcc_frames);
                    let current_count = self.calibration_samples.len();

                    println!(
                        "[WakeWord Calibration] Validated & accepted sample #{}/3 (frames: {})",
                        current_count,
                        self.calibration_samples.last().unwrap().len()
                    );

                    if current_count >= 3 {
                        println!("[WakeWord Calibration] All 3 samples gathered! Generating speed-augmented ensemble (9 prototypes)...");
                        let best_prototype = WakeWordTemplates::select_best_prototype(&self.calibration_samples);
                        let augmented_prototypes = templates::augment_calibration_samples(&self.calibration_samples);

                        save_user_profile(&phrase, best_prototype, augmented_prototypes)?;
                        self.reload_flag.store(true, Ordering::Relaxed);
                        self.calibration_samples.clear();

                        return Ok(serde_json::json!({
                            "step": 3,
                            "isComplete": true,
                            "phrase": phrase
                        }));
                    } else {
                        return Ok(serde_json::json!({
                            "step": current_count,
                            "isComplete": false,
                            "phrase": phrase
                        }));
                    }
                }

                std::thread::sleep(Duration::from_millis(40));
            }
        }

        Err("No speech detected within 6 seconds. Please tap and speak clearly.".to_string())
    }

    pub fn get_enrolled_status(&self) -> serde_json::Value {
        let profiles = load_user_profiles();
        serde_json::json!({
            "hasHeyVoiceflow": profiles.hey_voiceflow.is_some(),
            "hasHeyFlow": profiles.hey_flow.is_some(),
            "heyVoiceflowUpdatedAt": profiles.hey_voiceflow.as_ref().map(|p| p.updated_at).unwrap_or(0),
            "heyFlowUpdatedAt": profiles.hey_flow.as_ref().map(|p| p.updated_at).unwrap_or(0),
        })
    }

    pub fn reset_enrollment(&mut self, phrase: &str) -> Result<(), String> {
        delete_user_profile(phrase)?;
        self.reload_flag.store(true, Ordering::Relaxed);
        Ok(())
    }

    pub fn start_listening(&mut self, app: &AppHandle) {
        if self.capture.is_some() {
            return;
        }

        println!("[WakeWord Service] Starting background audio stream & detector...");

        match start_audio_capture(SAMPLE_RATE as u32, 2.5, self.buffer.clone()) {
            Ok(capture) => {
                let detector = WakeWordDetector::start(
                    app.clone(),
                    self.buffer.clone(),
                    self.config.clone(),
                    self.reload_flag.clone(),
                );
                self.capture = Some(capture);
                self.detector = Some(detector);
                println!("[WakeWord Service] Audio capture and wake-word detector started successfully");
            }
            Err(e) => {
                eprintln!("[WakeWord Service] Failed to initialize microphone capture: {}", e);
            }
        }
    }

    pub fn stop_listening(&mut self) {
        println!("[WakeWord Service] Stopping wake-word listener...");
        if let Some(detector) = self.detector.take() {
            detector.stop();
        }
        self.capture = None;
        println!("[WakeWord Service] Wake-word listener stopped");
    }
}
