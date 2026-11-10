use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, SampleFormat, StreamConfig};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;

pub struct AudioCapture {
    is_running: Arc<AtomicBool>,
    thread_handle: Option<JoinHandle<()>>,
}

impl AudioCapture {
    pub fn stop(&mut self) {
        self.is_running.store(false, Ordering::Relaxed);
        if let Some(handle) = self.thread_handle.take() {
            let _ = handle.join();
        }
    }
}

impl Drop for AudioCapture {
    fn drop(&mut self) {
        self.stop();
    }
}

pub struct RingBuffer {
    data: Vec<f32>,
    write_pos: usize,
    capacity: usize,
}

impl RingBuffer {
    pub fn new(capacity: usize) -> Self {
        Self {
            data: vec![0.0; capacity],
            write_pos: 0,
            capacity,
        }
    }

    pub fn push_samples(&mut self, samples: &[f32]) {
        for &sample in samples {
            self.data[self.write_pos] = sample;
            self.write_pos = (self.write_pos + 1) % self.capacity;
        }
    }

    pub fn get_linear_slice(&self) -> Vec<f32> {
        let mut out = Vec::with_capacity(self.capacity);
        // From oldest to newest
        out.extend_from_slice(&self.data[self.write_pos..]);
        out.extend_from_slice(&self.data[..self.write_pos]);
        out
    }
}

pub fn start_audio_capture(
    sample_rate_target: u32,
    _buffer_seconds: f32,
    buffer: Arc<Mutex<RingBuffer>>,
) -> Result<AudioCapture, String> {
    let is_running = Arc::new(AtomicBool::new(true));
    let running_flag = is_running.clone();

    // Spawn a dedicated OS audio thread to own the CPAL Stream (solves Windows WASAPI COM threading)
    let (tx, rx) = std::sync::mpsc::channel::<Result<(), String>>();

    let thread_handle = std::thread::spawn(move || {
        let host = cpal::default_host();
        let device: Device = match host.default_input_device() {
            Some(dev) => dev,
            None => {
                let _ = tx.send(Err("No default microphone input device found".to_string()));
                return;
            }
        };

        let device_name = device.name().unwrap_or_else(|_| "Default Microphone".to_string());
        println!("[WakeWord Audio] Initializing microphone: {}", device_name);

        let default_config = match device.default_input_config() {
            Ok(cfg) => cfg,
            Err(e) => {
                let _ = tx.send(Err(format!("Failed to read default input config: {}", e)));
                return;
            }
        };

        let sample_format = default_config.sample_format();
        let stream_config: StreamConfig = default_config.into();
        let channels = stream_config.channels as usize;
        let in_sample_rate = stream_config.sample_rate.0;

        println!(
            "[WakeWord Audio] Device format: {:?}, Channels: {}, Sample Rate: {}Hz -> Target: {}Hz",
            sample_format, channels, in_sample_rate, sample_rate_target
        );

        let resample_step = in_sample_rate as f64 / sample_rate_target as f64;

        let stream_result = match sample_format {
            SampleFormat::F32 => build_stream::<f32>(
                &device,
                &stream_config,
                channels,
                resample_step,
                buffer.clone(),
                running_flag.clone(),
            ),
            SampleFormat::I16 => build_stream::<i16>(
                &device,
                &stream_config,
                channels,
                resample_step,
                buffer.clone(),
                running_flag.clone(),
            ),
            SampleFormat::U16 => build_stream::<u16>(
                &device,
                &stream_config,
                channels,
                resample_step,
                buffer.clone(),
                running_flag.clone(),
            ),
            _ => Err(format!("Unsupported audio sample format: {:?}", sample_format)),
        };

        let stream = match stream_result {
            Ok(s) => s,
            Err(e) => {
                let _ = tx.send(Err(e));
                return;
            }
        };

        if let Err(e) = stream.play() {
            let _ = tx.send(Err(format!("Failed to start microphone stream: {}", e)));
            return;
        }

        println!("[WakeWord Audio] Microphone stream started successfully");
        let _ = tx.send(Ok(()));

        // Keep audio stream alive in this thread while running
        while running_flag.load(Ordering::Relaxed) {
            std::thread::sleep(std::time::Duration::from_millis(150));
        }

        println!("[WakeWord Audio] Microphone stream stopping and dropping on audio thread");
        drop(stream);
    });

    match rx.recv() {
        Ok(Ok(())) => Ok(AudioCapture {
            is_running,
            thread_handle: Some(thread_handle),
        }),
        Ok(Err(e)) => Err(e),
        Err(e) => Err(format!("Audio thread initialization channel error: {}", e)),
    }
}

pub trait ToF32Sample: cpal::Sample {
    fn to_f32_sample(self) -> f32;
}

impl ToF32Sample for f32 {
    #[inline]
    fn to_f32_sample(self) -> f32 {
        self
    }
}

impl ToF32Sample for i16 {
    #[inline]
    fn to_f32_sample(self) -> f32 {
        self as f32 / i16::MAX as f32
    }
}

impl ToF32Sample for u16 {
    #[inline]
    fn to_f32_sample(self) -> f32 {
        (self as f32 - u16::MAX as f32 / 2.0) / (u16::MAX as f32 / 2.0)
    }
}

fn build_stream<T>(
    device: &Device,
    config: &StreamConfig,
    channels: usize,
    resample_step: f64,
    buffer: Arc<Mutex<RingBuffer>>,
    running: Arc<AtomicBool>,
) -> Result<cpal::Stream, String>
where
    T: ToF32Sample + cpal::Sample + cpal::SizedSample + 'static,
{
    let mut fractional_pos: f64 = 0.0;

    let stream = device
        .build_input_stream(
            config,
            move |data: &[T], _: &cpal::InputCallbackInfo| {
                if !running.load(Ordering::Relaxed) {
                    return;
                }

                // 1. Convert multi-channel interleaved to mono f32
                let mut mono_samples = Vec::with_capacity(data.len() / channels);
                for chunk in data.chunks_exact(channels) {
                    let mut sum = 0.0f32;
                    for &sample in chunk {
                        sum += sample.to_f32_sample();
                    }
                    mono_samples.push(sum / channels as f32);
                }

                // 2. Downsample to target (16,000 Hz) using linear interpolation
                if mono_samples.is_empty() {
                    return;
                }

                let mut resampled = Vec::with_capacity((mono_samples.len() as f64 / resample_step) as usize + 2);
                while (fractional_pos as usize) < mono_samples.len() {
                    let idx = fractional_pos as usize;
                    let next_idx = (idx + 1).min(mono_samples.len() - 1);
                    let frac = (fractional_pos - idx as f64) as f32;

                    let sample = mono_samples[idx] * (1.0 - frac) + mono_samples[next_idx] * frac;
                    resampled.push(sample);

                    fractional_pos += resample_step;
                }
                fractional_pos -= mono_samples.len() as f64;

                // 3. Push resampled 16kHz mono audio into circular ring buffer
                if let Ok(mut lock) = buffer.lock() {
                    lock.push_samples(&resampled);
                }
            },
            |err| {
                eprintln!("[WakeWord Audio] Microphone stream error: {}", err);
            },
            None,
        )
        .map_err(|e| format!("Failed to build input audio stream: {}", e))?;

    Ok(stream)
}
