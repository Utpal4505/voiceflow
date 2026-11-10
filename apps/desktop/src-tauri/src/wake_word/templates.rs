use super::dtw::DtwMatcher;
use super::mfcc::{MfccExtractor, NUM_CEPSTRA, SAMPLE_RATE};
use std::f32::consts::PI;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UserVoiceProfile {
    pub phrase: String,
    pub mfcc_frames: Vec<[f32; NUM_CEPSTRA]>,
    pub sample_count: usize,
    pub updated_at: u64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct VoiceProfilesState {
    pub hey_voiceflow: Option<UserVoiceProfile>,
    pub hey_flow: Option<UserVoiceProfile>,
}

pub struct WakeWordTemplates {
    pub base_hey_voiceflow: Vec<[f32; NUM_CEPSTRA]>,
    pub base_hey_flow: Vec<[f32; NUM_CEPSTRA]>,
    pub user_hey_voiceflow: Option<Vec<[f32; NUM_CEPSTRA]>>,
    pub user_hey_flow: Option<Vec<[f32; NUM_CEPSTRA]>>,
}

impl WakeWordTemplates {
    pub fn build(extractor: &MfccExtractor) -> Self {
        let hey_voiceflow_audio = synthesize_phrase_hey_voiceflow();
        let hey_flow_audio = synthesize_phrase_hey_flow();

        let base_hey_voiceflow = extractor.extract(&hey_voiceflow_audio);
        let base_hey_flow = extractor.extract(&hey_flow_audio);

        println!(
            "[WakeWord Templates] Base templates synthesized: 'Hey VoiceFlow' ({} frames), 'Hey Flow' ({} frames)",
            base_hey_voiceflow.len(),
            base_hey_flow.len()
        );

        // Load saved user voice profiles from disk if they exist
        let saved_profiles = load_user_profiles();
        let mut user_hey_voiceflow = None;
        let mut user_hey_flow = None;

        if let Some(p) = saved_profiles.hey_voiceflow {
            println!(
                "[WakeWord Templates] Loaded enrolled user voice profile for 'Hey VoiceFlow' ({} frames, {} samples)",
                p.mfcc_frames.len(),
                p.sample_count
            );
            user_hey_voiceflow = Some(p.mfcc_frames);
        }

        if let Some(p) = saved_profiles.hey_flow {
            println!(
                "[WakeWord Templates] Loaded enrolled user voice profile for 'Hey Flow' ({} frames, {} samples)",
                p.mfcc_frames.len(),
                p.sample_count
            );
            user_hey_flow = Some(p.mfcc_frames);
        }

        Self {
            base_hey_voiceflow,
            base_hey_flow,
            user_hey_voiceflow,
            user_hey_flow,
        }
    }

    /// Selects the best prototype from multiple recorded voice calibration samples using pairwise DTW medoid selection
    pub fn select_best_prototype(samples: &[Vec<[f32; NUM_CEPSTRA]>]) -> Vec<[f32; NUM_CEPSTRA]> {
        if samples.is_empty() {
            return Vec::new();
        }
        if samples.len() == 1 {
            return samples[0].clone();
        }

        let mut best_index = 0;
        let mut min_sum_dist = f32::INFINITY;

        for (i, candidate) in samples.iter().enumerate() {
            let mut sum_dist = 0.0f32;
            for (j, other) in samples.iter().enumerate() {
                if i != j {
                    let d = DtwMatcher::distance(candidate, other);
                    if d.is_finite() {
                        sum_dist += d;
                    } else {
                        sum_dist += 5.0; // penalty for non-alignable sample
                    }
                }
            }
            if sum_dist < min_sum_dist {
                min_sum_dist = sum_dist;
                best_index = i;
            }
        }

        println!(
            "[WakeWord Calibration] Medoid selection picked sample #{} out of {} (average pairwise DTW distance: {:.3})",
            best_index + 1,
            samples.len(),
            min_sum_dist / (samples.len() - 1) as f32
        );

        samples[best_index].clone()
    }
}

pub fn get_profiles_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        if let Ok(appdata) = std::env::var("APPDATA") {
            return PathBuf::from(appdata).join("VoiceFlow").join("profiles");
        }
    }
    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = std::env::var("HOME") {
            return PathBuf::from(home)
                .join("Library")
                .join("Application Support")
                .join("VoiceFlow")
                .join("profiles");
        }
    }
    PathBuf::from("profiles")
}

pub fn load_user_profiles() -> VoiceProfilesState {
    let file_path = get_profiles_dir().join("voice_profile.json");
    if file_path.exists() {
        if let Ok(content) = fs::read_to_string(&file_path) {
            if let Ok(profiles) = serde_json::from_str::<VoiceProfilesState>(&content) {
                return profiles;
            }
        }
    }
    VoiceProfilesState::default()
}

pub fn save_user_profile(phrase: &str, frames: Vec<[f32; NUM_CEPSTRA]>, sample_count: usize) -> Result<(), String> {
    let dir = get_profiles_dir();
    fs::create_dir_all(&dir).map_err(|e| format!("Failed to create profile dir: {}", e))?;

    let mut profiles = load_user_profiles();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let profile = UserVoiceProfile {
        phrase: phrase.to_string(),
        mfcc_frames: frames,
        sample_count,
        updated_at: now,
    };

    if phrase == "hey_flow" {
        profiles.hey_flow = Some(profile);
    } else {
        profiles.hey_voiceflow = Some(profile);
    }

    let file_path = dir.join("voice_profile.json");
    let json_data = serde_json::to_string_pretty(&profiles)
        .map_err(|e| format!("Failed to serialize voice profile: {}", e))?;

    fs::write(&file_path, json_data).map_err(|e| format!("Failed to write profile file: {}", e))?;
    println!("[WakeWord Calibration] Saved enrolled voice profile to {:?}", file_path);

    Ok(())
}

pub fn delete_user_profile(phrase: &str) -> Result<(), String> {
    let dir = get_profiles_dir();
    let mut profiles = load_user_profiles();

    if phrase == "hey_flow" {
        profiles.hey_flow = None;
    } else if phrase == "both" || phrase == "all" {
        profiles.hey_flow = None;
        profiles.hey_voiceflow = None;
    } else {
        profiles.hey_voiceflow = None;
    }

    let file_path = dir.join("voice_profile.json");
    let json_data = serde_json::to_string_pretty(&profiles)
        .map_err(|e| format!("Failed to serialize voice profile: {}", e))?;

    fs::write(&file_path, json_data).map_err(|e| format!("Failed to write profile file: {}", e))?;
    println!("[WakeWord Calibration] Reset voice profile for '{}'", phrase);

    Ok(())
}

/// Generates synthetic audio waveform with specified formants and friction noise
fn synthesize_phoneme(
    duration_sec: f32,
    pitch_hz: f32,
    formants: &[(f32, f32)],
    noise_level: f32,
) -> Vec<f32> {
    let num_samples = (duration_sec * SAMPLE_RATE as f32) as usize;
    let mut out = Vec::with_capacity(num_samples);

    let mut phase = 0.0f32;
    let mut rng_state: u32 = 12345;

    for i in 0..num_samples {
        let t = i as f32 / SAMPLE_RATE as f32;
        phase += 2.0 * PI * pitch_hz / SAMPLE_RATE as f32;
        if phase > 2.0 * PI {
            phase -= 2.0 * PI;
        }

        let mut excitation = (phase).sin() + 0.5 * (2.0 * phase).sin() + 0.25 * (3.0 * phase).sin();

        if noise_level > 0.0 {
            rng_state = rng_state.wrapping_mul(1664525).wrapping_add(1013904223);
            let white_noise = (rng_state as f32 / u32::MAX as f32) * 2.0 - 1.0;
            excitation = excitation * (1.0 - noise_level) + white_noise * noise_level;
        }

        let mut sample = 0.0f32;
        for &(f_res, bw) in formants {
            let r = (-PI * bw / SAMPLE_RATE as f32).exp();
            let phi = 2.0 * PI * f_res / SAMPLE_RATE as f32;
            sample += excitation * (r.powi(2) + 1.0) * (phi * t).sin();
        }

        let envelope = if t < 0.03 {
            t / 0.03
        } else if t > duration_sec - 0.03 {
            (duration_sec - t) / 0.03
        } else {
            1.0
        };

        out.push(sample * envelope * 0.2);
    }

    out
}

fn synthesize_phrase_hey_voiceflow() -> Vec<f32> {
    let mut audio = Vec::new();
    audio.extend(synthesize_phoneme(0.06, 120.0, &[(1000.0, 300.0), (2200.0, 400.0)], 0.85));
    audio.extend(synthesize_phoneme(0.18, 130.0, &[(480.0, 80.0), (2100.0, 120.0), (2800.0, 150.0)], 0.05));
    audio.extend(vec![0.0f32; (0.04 * SAMPLE_RATE as f32) as usize]);
    audio.extend(synthesize_phoneme(0.07, 125.0, &[(300.0, 100.0), (1200.0, 200.0)], 0.40));
    audio.extend(synthesize_phoneme(0.17, 128.0, &[(520.0, 90.0), (1100.0, 120.0), (2400.0, 180.0)], 0.05));
    audio.extend(synthesize_phoneme(0.11, 0.0, &[(4800.0, 800.0), (6200.0, 1000.0)], 0.95));
    audio.extend(vec![0.0f32; (0.03 * SAMPLE_RATE as f32) as usize]);
    audio.extend(synthesize_phoneme(0.08, 0.0, &[(3500.0, 700.0), (5500.0, 1200.0)], 0.90));
    audio.extend(synthesize_phoneme(0.06, 120.0, &[(360.0, 80.0), (1150.0, 100.0), (2700.0, 150.0)], 0.10));
    audio.extend(synthesize_phoneme(0.20, 115.0, &[(490.0, 80.0), (880.0, 100.0), (2400.0, 200.0)], 0.05));
    audio
}

fn synthesize_phrase_hey_flow() -> Vec<f32> {
    let mut audio = Vec::new();
    audio.extend(synthesize_phoneme(0.06, 120.0, &[(1000.0, 300.0), (2200.0, 400.0)], 0.85));
    audio.extend(synthesize_phoneme(0.19, 130.0, &[(480.0, 80.0), (2100.0, 120.0), (2800.0, 150.0)], 0.05));
    audio.extend(vec![0.0f32; (0.05 * SAMPLE_RATE as f32) as usize]);
    audio.extend(synthesize_phoneme(0.09, 0.0, &[(3500.0, 700.0), (5500.0, 1200.0)], 0.90));
    audio.extend(synthesize_phoneme(0.07, 120.0, &[(360.0, 80.0), (1150.0, 100.0), (2700.0, 150.0)], 0.10));
    audio.extend(synthesize_phoneme(0.22, 115.0, &[(490.0, 80.0), (880.0, 100.0), (2400.0, 200.0)], 0.05));
    audio
}
