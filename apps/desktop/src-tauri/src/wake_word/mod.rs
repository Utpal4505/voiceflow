pub mod audio_stream;
pub mod detector;
pub mod dtw;
pub mod mfcc;
pub mod templates;

pub use detector::{CalibrationState, WakeWordConfig};

use std::sync::{Arc, Mutex};
use tauri::AppHandle;

use audio_stream::{start_audio_capture, AudioCapture, RingBuffer};
use detector::WakeWordDetector;
use mfcc::SAMPLE_RATE;
use templates::{delete_user_profile, load_user_profiles};

pub struct WakeWordService {
    config: Arc<Mutex<WakeWordConfig>>,
    buffer: Arc<Mutex<RingBuffer>>,
    calibration_state: Arc<Mutex<Option<CalibrationState>>>,
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
        // Keep a rolling buffer of 2.5 seconds @ 16kHz (40,000 samples)
        let buffer_capacity = (SAMPLE_RATE as f32 * 2.5) as usize;
        let buffer = Arc::new(Mutex::new(RingBuffer::new(buffer_capacity)));

        Self {
            config: Arc::new(Mutex::new(WakeWordConfig::default())),
            buffer,
            calibration_state: Arc::new(Mutex::new(None)),
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

    pub fn start_calibration(&mut self, app: &AppHandle, phrase: String) {
        println!("[WakeWord Service] Initializing voice calibration wizard for '{}'", phrase);

        // Ensure audio capture is running for calibration even if wake-word wasn't toggled yet
        self.start_listening(app);

        if let Ok(mut guard) = self.calibration_state.lock() {
            *guard = Some(CalibrationState {
                phrase,
                samples: Vec::new(),
                is_collecting: true,
            });
        }
    }

    pub fn cancel_calibration(&mut self) {
        println!("[WakeWord Service] Cancelling active voice calibration");
        if let Ok(mut guard) = self.calibration_state.lock() {
            *guard = None;
        }
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
        delete_user_profile(phrase)
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
                    self.calibration_state.clone(),
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
