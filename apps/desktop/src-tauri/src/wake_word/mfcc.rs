use std::f32::consts::PI;

pub const SAMPLE_RATE: usize = 16_000;
pub const FRAME_SIZE: usize = 400; // 25ms @ 16kHz
pub const HOP_SIZE: usize = 160;   // 10ms @ 16kHz
pub const NUM_MEL_FILTERS: usize = 26;
pub const NUM_CEPSTRA: usize = 13;
const FFT_SIZE: usize = 512;

pub struct MfccExtractor {
    hamming_window: Vec<f32>,
    filter_banks: Vec<Vec<f32>>,
    dct_matrix: Vec<Vec<f32>>,
    lifter: Vec<f32>,
}

impl MfccExtractor {
    pub fn new() -> Self {
        // 1. Precompute Hamming window
        let mut hamming = Vec::with_capacity(FRAME_SIZE);
        for i in 0..FRAME_SIZE {
            let val = 0.54 - 0.46 * (2.0 * PI * i as f32 / (FRAME_SIZE - 1) as f32).cos();
            hamming.push(val);
        }

        // 2. Precompute Mel filterbanks (100 Hz to 8000 Hz)
        let f_min = 100.0f32;
        let f_max = (SAMPLE_RATE / 2) as f32; // 8000 Hz

        let hz_to_mel = |hz: f32| 2595.0 * (1.0 + hz / 700.0).log10();
        let mel_to_hz = |mel: f32| 700.0 * (10.0f32.powf(mel / 2595.0) - 1.0);

        let mel_min = hz_to_mel(f_min);
        let mel_max = hz_to_mel(f_max);

        let mut mel_points = Vec::with_capacity(NUM_MEL_FILTERS + 2);
        for i in 0..=(NUM_MEL_FILTERS + 1) {
            let mel = mel_min + (mel_max - mel_min) * (i as f32 / (NUM_MEL_FILTERS + 1) as f32);
            mel_points.push(mel_to_hz(mel));
        }

        // Convert Hz points to FFT bin indices
        let mut bin_points = Vec::with_capacity(NUM_MEL_FILTERS + 2);
        for &hz in &mel_points {
            let bin = ((FFT_SIZE as f32 + 1.0) * hz / SAMPLE_RATE as f32).floor() as usize;
            bin_points.push(bin.min(FFT_SIZE / 2));
        }

        let num_bins = FFT_SIZE / 2 + 1;
        let mut filter_banks = Vec::with_capacity(NUM_MEL_FILTERS);

        for m in 1..=NUM_MEL_FILTERS {
            let mut filter = vec![0.0f32; num_bins];
            let left = bin_points[m - 1];
            let center = bin_points[m];
            let right = bin_points[m + 1];

            if center > left {
                for k in left..center {
                    filter[k] = (k - left) as f32 / (center - left) as f32;
                }
            }
            if right > center {
                for k in center..=right {
                    filter[k] = (right - k) as f32 / (right - center) as f32;
                }
            }
            filter_banks.push(filter);
        }

        // 3. Precompute DCT-II matrix (NUM_CEPSTRA x NUM_MEL_FILTERS)
        let mut dct_matrix = Vec::with_capacity(NUM_CEPSTRA);
        for i in 0..NUM_CEPSTRA {
            let mut row = Vec::with_capacity(NUM_MEL_FILTERS);
            let factor = if i == 0 {
                (1.0 / NUM_MEL_FILTERS as f32).sqrt()
            } else {
                (2.0 / NUM_MEL_FILTERS as f32).sqrt()
            };
            for j in 0..NUM_MEL_FILTERS {
                let angle = PI * i as f32 * (j as f32 + 0.5) / NUM_MEL_FILTERS as f32;
                row.push(factor * angle.cos());
            }
            dct_matrix.push(row);
        }

        // 4. Precompute cepstral lifter (L = 22)
        let l = 22.0f32;
        let mut lifter = Vec::with_capacity(NUM_CEPSTRA);
        for i in 0..NUM_CEPSTRA {
            let val = 1.0 + (l / 2.0) * (PI * i as f32 / l).sin();
            lifter.push(val);
        }

        Self {
            hamming_window: hamming,
            filter_banks,
            dct_matrix,
            lifter,
        }
    }

    /// Computes sequence of 13-dimensional MFCC vectors for the input 16kHz mono audio slice.
    pub fn extract(&self, audio: &[f32]) -> Vec<[f32; NUM_CEPSTRA]> {
        if audio.len() < FRAME_SIZE {
            return Vec::new();
        }

        let num_frames = (audio.len() - FRAME_SIZE) / HOP_SIZE + 1;
        let mut mfccs = Vec::with_capacity(num_frames);

        let mut frame_buf = [0.0f32; FRAME_SIZE];

        for f in 0..num_frames {
            let start = f * HOP_SIZE;
            let slice = &audio[start..start + FRAME_SIZE];

            // 1. Pre-emphasis: y[n] = x[n] - 0.97 * x[n-1]
            frame_buf[0] = slice[0];
            for i in 1..FRAME_SIZE {
                frame_buf[i] = slice[i] - 0.97 * slice[i - 1];
            }

            // 2. Apply Hamming window
            for i in 0..FRAME_SIZE {
                frame_buf[i] *= self.hamming_window[i];
            }

            // 3. Compute Power Spectrum (via 512-point zero-padded real DFT)
            let power_spectrum = self.compute_power_spectrum(&frame_buf);

            // 4. Apply Mel filterbanks
            let mut mel_energies = [0.0f32; NUM_MEL_FILTERS];
            for (m, filter) in self.filter_banks.iter().enumerate() {
                let mut sum = 0.0f32;
                for k in 0..filter.len() {
                    sum += power_spectrum[k] * filter[k];
                }
                // Log energy with floor epsilon
                mel_energies[m] = (sum.max(1e-6)).ln();
            }

            // 5. Apply DCT-II to obtain cepstral coefficients
            let mut cepstrum = [0.0f32; NUM_CEPSTRA];
            for i in 0..NUM_CEPSTRA {
                let mut sum = 0.0f32;
                for j in 0..NUM_MEL_FILTERS {
                    sum += self.dct_matrix[i][j] * mel_energies[j];
                }
                // Apply lifter
                cepstrum[i] = sum * self.lifter[i];
            }

            mfccs.push(cepstrum);
        }

        mfccs
    }

    /// Fast power spectrum calculation for 512-point FFT size
    fn compute_power_spectrum(&self, frame: &[f32; FRAME_SIZE]) -> Vec<f32> {
        let num_bins = FFT_SIZE / 2 + 1;
        let mut powers = Vec::with_capacity(num_bins);

        // Standard DFT on 512 points for the 257 positive frequency bins
        for k in 0..num_bins {
            let mut real = 0.0f32;
            let mut imag = 0.0f32;
            let omega = 2.0 * PI * k as f32 / FFT_SIZE as f32;

            for n in 0..FRAME_SIZE {
                let angle = omega * n as f32;
                real += frame[n] * angle.cos();
                imag -= frame[n] * angle.sin();
            }

            let power = (real * real + imag * imag) / FFT_SIZE as f32;
            powers.push(power);
        }

        powers
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mfcc_extraction_dimensions() {
        let extractor = MfccExtractor::new();
        // 1 second of synthetic 440Hz sine wave
        let mut audio = Vec::with_capacity(SAMPLE_RATE);
        for i in 0..SAMPLE_RATE {
            let t = i as f32 / SAMPLE_RATE as f32;
            audio.push((2.0 * PI * 440.0 * t).sin());
        }

        let mfccs = extractor.extract(&audio);
        assert!(!mfccs.is_empty(), "MFCC output should not be empty");
        assert_eq!(mfccs[0].len(), NUM_CEPSTRA, "Each frame should have 13 cepstral coefficients");
    }
}
