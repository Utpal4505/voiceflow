use super::mfcc::{MfccExtractor, NUM_CEPSTRA, SAMPLE_RATE};
use std::f32::consts::PI;

pub struct WakeWordTemplates {
    pub hey_voiceflow: Vec<[f32; NUM_CEPSTRA]>,
    pub hey_flow: Vec<[f32; NUM_CEPSTRA]>,
}

impl WakeWordTemplates {
    pub fn build(extractor: &MfccExtractor) -> Self {
        let hey_voiceflow_audio = synthesize_phrase_hey_voiceflow();
        let hey_flow_audio = synthesize_phrase_hey_flow();

        let hey_voiceflow = extractor.extract(&hey_voiceflow_audio);
        let hey_flow = extractor.extract(&hey_flow_audio);

        println!(
            "[WakeWord Templates] Initialized templates: 'Hey VoiceFlow' ({} frames), 'Hey Flow' ({} frames)",
            hey_voiceflow.len(),
            hey_flow.len()
        );

        Self {
            hey_voiceflow,
            hey_flow,
        }
    }
}

/// Generates synthetic audio waveform with specified formants and friction noise
fn synthesize_phoneme(
    duration_sec: f32,
    pitch_hz: f32,
    formants: &[(f32, f32)], // (frequency_hz, bandwidth_hz)
    noise_level: f32,
) -> Vec<f32> {
    let num_samples = (duration_sec * SAMPLE_RATE as f32) as usize;
    let mut out = Vec::with_capacity(num_samples);

    let mut phase = 0.0f32;
    let mut rng_state: u32 = 12345;

    for i in 0..num_samples {
        let t = i as f32 / SAMPLE_RATE as f32;
        // Pitch pulse train (glottal pulse)
        phase += 2.0 * PI * pitch_hz / SAMPLE_RATE as f32;
        if phase > 2.0 * PI {
            phase -= 2.0 * PI;
        }

        // Glottal excitation with harmonic decay
        let mut excitation = (phase).sin() + 0.5 * (2.0 * phase).sin() + 0.25 * (3.0 * phase).sin();

        // Add aspiration / fricative noise if needed
        if noise_level > 0.0 {
            rng_state = rng_state.wrapping_mul(1664525).wrapping_add(1013904223);
            let white_noise = (rng_state as f32 / u32::MAX as f32) * 2.0 - 1.0;
            excitation = excitation * (1.0 - noise_level) + white_noise * noise_level;
        }

        // Resonate through formants (2nd order IIR resonator bank)
        let mut sample = 0.0f32;
        for &(f_res, bw) in formants {
            let r = (-PI * bw / SAMPLE_RATE as f32).exp();
            let phi = 2.0 * PI * f_res / SAMPLE_RATE as f32;
            sample += excitation * (r.powi(2) + 1.0) * (phi * t).sin();
        }

        // Amplitude envelope (taper start and end)
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

/// Synthesizes acoustic template for "Hey VoiceFlow"
/// [h] -> [ey] -> pause -> [v] -> [oy] -> [s] -> pause -> [f] -> [l] -> [ow]
fn synthesize_phrase_hey_voiceflow() -> Vec<f32> {
    let mut audio = Vec::new();

    // 1. "Hey": [h] (60ms) + [ey] (180ms)
    audio.extend(synthesize_phoneme(0.06, 120.0, &[(1000.0, 300.0), (2200.0, 400.0)], 0.85));
    audio.extend(synthesize_phoneme(0.18, 130.0, &[(480.0, 80.0), (2100.0, 120.0), (2800.0, 150.0)], 0.05));

    // Dip / boundary (40ms)
    audio.extend(vec![0.0f32; (0.04 * SAMPLE_RATE as f32) as usize]);

    // 2. "Voice": [v] (70ms) + [oy] (170ms) + [s] (110ms)
    audio.extend(synthesize_phoneme(0.07, 125.0, &[(300.0, 100.0), (1200.0, 200.0)], 0.40));
    audio.extend(synthesize_phoneme(0.17, 128.0, &[(520.0, 90.0), (1100.0, 120.0), (2400.0, 180.0)], 0.05));
    audio.extend(synthesize_phoneme(0.11, 0.0, &[(4800.0, 800.0), (6200.0, 1000.0)], 0.95));

    // Dip / boundary (30ms)
    audio.extend(vec![0.0f32; (0.03 * SAMPLE_RATE as f32) as usize]);

    // 3. "Flow": [f] (80ms) + [l] (60ms) + [ow] (200ms)
    audio.extend(synthesize_phoneme(0.08, 0.0, &[(3500.0, 700.0), (5500.0, 1200.0)], 0.90));
    audio.extend(synthesize_phoneme(0.06, 120.0, &[(360.0, 80.0), (1150.0, 100.0), (2700.0, 150.0)], 0.10));
    audio.extend(synthesize_phoneme(0.20, 115.0, &[(490.0, 80.0), (880.0, 100.0), (2400.0, 200.0)], 0.05));

    audio
}

/// Synthesizes acoustic template for "Hey Flow"
/// [h] -> [ey] -> pause -> [f] -> [l] -> [ow]
fn synthesize_phrase_hey_flow() -> Vec<f32> {
    let mut audio = Vec::new();

    // 1. "Hey": [h] (60ms) + [ey] (190ms)
    audio.extend(synthesize_phoneme(0.06, 120.0, &[(1000.0, 300.0), (2200.0, 400.0)], 0.85));
    audio.extend(synthesize_phoneme(0.19, 130.0, &[(480.0, 80.0), (2100.0, 120.0), (2800.0, 150.0)], 0.05));

    // Boundary pause (50ms)
    audio.extend(vec![0.0f32; (0.05 * SAMPLE_RATE as f32) as usize]);

    // 2. "Flow": [f] (90ms) + [l] (70ms) + [ow] (220ms)
    audio.extend(synthesize_phoneme(0.09, 0.0, &[(3500.0, 700.0), (5500.0, 1200.0)], 0.90));
    audio.extend(synthesize_phoneme(0.07, 120.0, &[(360.0, 80.0), (1150.0, 100.0), (2700.0, 150.0)], 0.10));
    audio.extend(synthesize_phoneme(0.22, 115.0, &[(490.0, 80.0), (880.0, 100.0), (2400.0, 200.0)], 0.05));

    audio
}
