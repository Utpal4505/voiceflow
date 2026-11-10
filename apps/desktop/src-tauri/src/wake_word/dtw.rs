use super::mfcc::NUM_CEPSTRA;

pub struct DtwMatcher;

impl DtwMatcher {
    /// Computes local Euclidean distance between two MFCC feature vectors (ignoring energy c0).
    #[inline]
    fn frame_distance(a: &[f32; NUM_CEPSTRA], b: &[f32; NUM_CEPSTRA]) -> f32 {
        let mut sum_sq = 0.0f32;
        // Compare c1 through c12 (spectral envelope / phonetic shape)
        for i in 1..NUM_CEPSTRA {
            let diff = a[i] - b[i];
            sum_sq += diff * diff;
        }
        sum_sq.sqrt()
    }

    /// Computes normalized Dynamic Time Warping (DTW) distance between query and template.
    /// Returns a normalized score where 0.0 is an exact acoustic match, and lower is better.
    pub fn distance(query: &[[f32; NUM_CEPSTRA]], template: &[[f32; NUM_CEPSTRA]]) -> f32 {
        let n = query.len();
        let m = template.len();

        if n == 0 || m == 0 {
            return f32::INFINITY;
        }

        // Allow reasonable temporal warping (speech rate variability of +/- 45%)
        let ratio = n as f32 / m as f32;
        if ratio < 0.45 || ratio > 2.2 {
            return f32::INFINITY;
        }

        // Sakoe-Chiba band width
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
            // Normalize by path length (N + M)
            total_cost / (n + m) as f32
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
        assert!(dist < 1e-5, "Self distance should be ~0, got {}", dist);
    }

    #[test]
    fn test_dtw_dissimilar_distance() {
        let pattern_a = vec![[1.0f32; NUM_CEPSTRA]; 20];
        let pattern_b = vec![[5.0f32; NUM_CEPSTRA]; 20];
        let dist = DtwMatcher::distance(&pattern_a, &pattern_b);
        assert!(dist > 1.0, "Dissimilar patterns should have high distance, got {}", dist);
    }
}
