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
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const seqRef = useRef(0);
  const silentChunksCountRef = useRef(0);
  const onChunkRef = useRef(onChunk);

  useEffect(() => {
    onChunkRef.current = onChunk;
  }, [onChunk]);

  const destroyPipeline = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.onmessage = null;
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setVolume(0);
    setIsSilent(false);
    seqRef.current = 0;
    silentChunksCountRef.current = 0;
  }, []);

  const ensurePipeline = useCallback(async () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed" &&
      workletNodeRef.current &&
      mediaStreamRef.current &&
      mediaStreamRef.current.active
    ) {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      return workletNodeRef.current;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId:
            selectedDeviceId && selectedDeviceId !== "default"
              ? { exact: selectedDeviceId }
              : undefined,
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    return () => {
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
