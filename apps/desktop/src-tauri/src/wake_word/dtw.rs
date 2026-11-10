use super::mfcc::NUM_CEPSTRA;

pub struct DtwMatcher;

impl DtwMatcher {
    /// Computes local Cosine distance between two MFCC feature vectors (ignoring energy c0).
    /// Bounded in [0.0, 2.0]: 0.0 = identical spectral shape, ~1.0 = uncorrelated speech, 2.0 = opposite.
    #[inline]
    pub fn frame_distance(a: &[f32; NUM_CEPSTRA], b: &[f32; NUM_CEPSTRA]) -> f32 {
        let mut dot = 0.0f32;
        let mut norm_a = 0.0f32;
        let mut norm_b = 0.0f32;

        // Compare c1 through c12 (phonetic spectral shape, ignoring c0 volume)
        for i in 1..NUM_CEPSTRA {
            dot += a[i] * b[i];
            norm_a += a[i] * a[i];
            norm_b += b[i] * b[i];
        }

        let denom = (norm_a * norm_b).sqrt();
        if denom > 1e-6 {
            let sim = (dot / denom).clamp(-1.0, 1.0);
            1.0 - sim
        } else {
            1.0
        }
    }

    /// Computes normalized Dynamic Time Warping (DTW) distance between query and template.
    /// Returns the average frame distance along the optimal path (0.0 = identical, lower is better).
    pub fn distance(query: &[[f32; NUM_CEPSTRA]], template: &[[f32; NUM_CEPSTRA]]) -> f32 {
        let n = query.len();
        let m = template.len();

        if n == 0 || m == 0 {
            return f32::INFINITY;
        }

        // Allow reasonable temporal warping (speech rate variability of +/- 50%)
        let ratio = n as f32 / m as f32;
        if ratio < 0.40 || ratio > 2.5 {
            return f32::INFINITY;
        }

        // Sakoe-Chiba band width (35% of max length)
        let band_width = ((n.max(m) as f32) * 0.35).ceil() as usize;

        // DP matrix initialization
        let mut prev_row = vec![f32::INFINITY; m + 1];
        let mut curr_row = vec![f32::INFINITY; m + 1];
        prev_row[0] = 0.0;

        for i in 1..=n {
            curr_row.fill(f32::INFINITY);
            let q_vec = &query[i - 1];

            let j_center = (i as f32 * m as f32 / n as f32).round() as usize;
            let j_start = j_center.saturating_sub(band_width).max(1);
            let j_end = (j_center + band_width).min(m);

            for j in j_start..=j_end {
                let cost = Self::frame_distance(q_vec, &template[j - 1]);
                let min_prev = prev_row[j]
                    .min(curr_row[j - 1])
                    .min(prev_row[j - 1]);

                curr_row[j] = cost + min_prev;
            }

            prev_row.copy_from_slice(&curr_row);
        }

        let total_cost = prev_row[m];
        if total_cost.is_infinite() {
            f32::INFINITY
        } else {
            // Average frame distance along the warping path
            total_cost / ((n + m) as f32 / 2.0)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dtw_self_distance_is_zero() {
        let dummy = vec![[1.0f32; NUM_CEPSTRA]; 20];
        let dist = DtwMatcher::distance(&dummy, &dummy);
        assert!(dist < 1e-4, "Self distance should be ~0, got {}", dist);
    }

    #[test]
    fn test_dtw_similar_distance() {
        let a = vec![[1.0f32; NUM_CEPSTRA]; 20];
        let mut b = vec![[1.0f32; NUM_CEPSTRA]; 20];
        for i in 0..20 {
            b[i][1] += 0.1;
        }
        let dist = DtwMatcher::distance(&a, &b);
        assert!(dist < 0.15, "Similar patterns should have low distance, got {}", dist);
    }

    #[test]
    fn test_dtw_dissimilar_distance() {
        let a = vec![[1.0f32; NUM_CEPSTRA]; 20];
        let b = vec![[-1.0f32; NUM_CEPSTRA]; 20];
        let dist = DtwMatcher::distance(&a, &b);
        assert!(dist > 0.8, "Opposite patterns should have high distance, got {}", dist);
    }
}
