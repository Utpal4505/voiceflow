import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";

export interface AudioCaptureState {
  isRecording: boolean;
  volume: number;
  isSilent: boolean;
  error: string | null;
}

export function useAudio(onChunk?: (chunk: ArrayBuffer, seq: number) => void) {
  const selectedDeviceId = useSettingsStore((s) => s.selectedDeviceId);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isSilent, setIsSilent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const activeDeviceIdRef = useRef<string | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const seqRef = useRef(0);
  const silentChunksCountRef = useRef(0);
  const onChunkRef = useRef(onChunk);

  useEffect(() => {
    onChunkRef.current = onChunk;
  }, [onChunk]);

  const destroyPipeline = useCallback(() => {
    console.log("[Audio] destroyPipeline called, closing existing stream & context");
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("[Audio] Stopped track:", track.label);
      });
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    activeDeviceIdRef.current = null;
    setIsRecording(false);
    setVolume(0);
    setIsSilent(false);
    seqRef.current = 0;
    silentChunksCountRef.current = 0;
  }, []);

  const ensurePipeline = useCallback(async () => {
    // Check if the current pipeline is already running and using the matching device
    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed" &&
      workletNodeRef.current &&
      mediaStreamRef.current &&
      mediaStreamRef.current.active &&
      activeDeviceIdRef.current === selectedDeviceId
    ) {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      return workletNodeRef.current;
    }

    // If the device changed or stream is inactive, clean up the old pipeline first
    if (mediaStreamRef.current || audioContextRef.current) {
      destroyPipeline();
    }

    try {
      console.log("[Audio] Requesting mic stream for deviceId:", selectedDeviceId);
      let stream: MediaStream | null = null;

      // 1. If a specific device is selected, attempt exact constraint
      if (selectedDeviceId && selectedDeviceId !== "default") {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: { exact: selectedDeviceId },
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          console.log("[Audio] Acquired stream with exact deviceId constraint");
        } catch (exactErr) {
          console.warn("[Audio] Exact deviceId constraint failed (common with Bluetooth HFP), trying ideal constraint with DSP:", exactErr);
          try {
            // 2. Fall back to ideal constraint with DSP
            stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                deviceId: { ideal: selectedDeviceId },
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            console.log("[Audio] Acquired stream with ideal deviceId constraint");
          } catch (idealErr) {
            console.warn("[Audio] Ideal constraint with DSP failed, trying relaxed ideal constraint without sampleRate:", idealErr);
            try {
              // 3. Fall back to relaxed ideal constraint (let browser choose native sampleRate/channelCount)
              stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  deviceId: { ideal: selectedDeviceId },
                },
              });
              console.log("[Audio] Acquired stream with relaxed ideal device constraint");
            } catch (relaxedErr) {
              console.warn("[Audio] Relaxed device constraint failed, falling back to default mic:", relaxedErr);
            }
          }
        }
      }

      // 4. Default fallback with DSP
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          console.log("[Audio] Acquired stream with default mic constraints");
        } catch (defaultErr) {
          console.warn("[Audio] Default constraints failed, falling back to generic audio: true", defaultErr);
          // 5. Ultimate fallback: generic audio input
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          console.log("[Audio] Acquired stream with generic audio: true");
        }
      }

      const track = stream.getAudioTracks()[0];
      activeDeviceIdRef.current = selectedDeviceId;
      console.log(`[Audio] Connected mic track: "${track?.label}" (requested: ${selectedDeviceId}, settings:`, track?.getSettings(), `)`);

      if (track) {
        track.onended = () => {
          console.warn(`[Audio] Active microphone track ended (device unplugged/disconnected): "${track.label}"`);
          destroyPipeline();
        };
      }

      mediaStreamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      if (audioCtx.state === "suspended") {
        await audioCtx.resume().catch(() => {});
      }

      await audioCtx.audioWorklet.addModule("/pcm-processor.js");

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        const { type, buffer, volume: chunkVolume } = event.data;
        if (type === "chunk") {
          setVolume(chunkVolume);

          if (chunkVolume < 0.015) {
            silentChunksCountRef.current += 1;
            if (silentChunksCountRef.current >= 6) {
              setIsSilent(true);
            }
          } else {
            silentChunksCountRef.current = 0;
            setIsSilent(false);
          }

          if (onChunkRef.current) {
            onChunkRef.current(buffer, seqRef.current++);
          }
        }
      };

      sourceNode.connect(workletNode);
      return workletNode;
    } catch (err: unknown) {
      destroyPipeline();
      const message =
        err instanceof Error ? err.message : "Failed to access microphone";
      console.error("[Audio] Error ensuring audio pipeline:", message);
      setError(message);
      return null;
    }
  }, [selectedDeviceId, destroyPipeline]);

  const stopRecording = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ type: "STOP" });
    }
    setIsRecording(false);
    setVolume(0);
    setIsSilent(false);
    seqRef.current = 0;
    silentChunksCountRef.current = 0;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setIsSilent(false);
    silentChunksCountRef.current = 0;
    seqRef.current = 0;

    const worklet = await ensurePipeline();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume().catch(() => {});
    }
    if (worklet) {
      worklet.port.postMessage({ type: "START" });
      setIsRecording(true);
    }
  }, [ensurePipeline]);

  useEffect(() => {
    // Pre-warm the microphone pipeline and circular pre-roll buffer in background
    ensurePipeline().catch(() => {});

    // Listen for hardware plug/unplug or Bluetooth connect/disconnect events
    const handleDeviceChange = () => {
      console.log("[Audio] Device change event detected in useAudio");
      if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
        destroyPipeline();
        ensurePipeline().catch(() => {});
      }
    };

    if (navigator.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    }

    return () => {
      if (navigator.mediaDevices?.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
      }
      destroyPipeline();
    };
  }, [ensurePipeline, destroyPipeline]);

  return {
    isRecording,
    volume,
    isSilent,
    error,
    startRecording,
    stopRecording,
  };
}
