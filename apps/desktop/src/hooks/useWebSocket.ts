import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SessionState, ModelInfo, WhisperModelId, HardwareProfile, PerformanceMetrics } from "@voiceflow/contracts";

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export interface TranscriptData {
  sessionId: string;
  text: string;
  isFinal: boolean;
  metrics?: PerformanceMetrics;
}

export interface DownloadProgressPayload {
  modelId: WhisperModelId;
  progress: number;
  downloaded: number;
  total: number;
}

export function useWebSocket(serverUrl = "http://localhost:3001") {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, number>>({});
  const [hardwareProfile, setHardwareProfile] = useState<HardwareProfile | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Connected to engine at", serverUrl);
      setStatus("connected");
      socket.emit("get_models");
      socket.emit("get_hardware_profile");
    });

    socket.on("disconnect", (reason) => {
      console.warn("[WebSocket] Disconnected:", reason);
      setStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("[WebSocket] Connection error:", err.message);
      setStatus("error");
    });

    socket.on("session_started", (data) => {
      console.log("[WebSocket] session_started:", data);
      setSessionState("recording");
      setSessionError(null);
    });

    socket.on("partial_transcript", (data: TranscriptData) => {
      console.log("[WebSocket] partial_transcript:", data.text);
      setTranscript(data);
    });

    socket.on("final_transcript", (data: TranscriptData) => {
      console.log("[WebSocket] final_transcript:", data.text);
      setTranscript(data);
      setSessionState("done");
    });

    socket.on("session_error", (data: { error: string }) => {
      console.error("[WebSocket] session_error:", data.error);
      setSessionError(data.error);
      setSessionState("error");
    });

    socket.on("session_cancelled", () => {
      console.log("[WebSocket] session_cancelled received");
      setSessionState("idle");
      setTranscript(null);
    });

    socket.on("session_reset_complete", () => {
      console.log("[WebSocket] session_reset_complete received");
      setSessionState("idle");
      setTranscript(null);
    });

    socket.on("models_updated", (updatedModels: ModelInfo[]) => {
      setModels(updatedModels);
    });

    socket.on("hardware_profile", (profile: HardwareProfile) => {
      setHardwareProfile(profile);
    });

    socket.on("model_download_progress", (data: DownloadProgressPayload) => {
      setDownloadProgressMap((prev) => ({
        ...prev,
        [data.modelId]: data.progress,
      }));
    });

    socket.on("model_download_complete", (data: { modelId: string }) => {
      setDownloadProgressMap((prev) => {
        const next = { ...prev };
        delete next[data.modelId];
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  const startSession = useCallback((sessionId: string, modelId?: string) => {
    console.log("[WebSocket] startSession invoked with sessionId:", sessionId, "modelId:", modelId);
    if (!socketRef.current?.connected) {
      setSessionError("VoiceFlow Engine (:3001) is not connected");
      setSessionState("error");
      return;
    }
    setSessionState("recording");
    setTranscript(null);
    setSessionError(null);
    socketRef.current.emit("session_start", {
      sessionId,
      modelId,
      sampleRate: 16000,
    });
  }, []);

  const sendAudioChunk = useCallback(
    (sessionId: string, seq: number, buffer: ArrayBuffer) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("audio_chunk", {
          sessionId,
          seq,
          buffer,
        });
      }
    },
    []
  );

  const stopSession = useCallback((sessionId: string) => {
    console.log("[WebSocket] stopSession invoked with sessionId:", sessionId);
    if (socketRef.current?.connected) {
      setSessionState("processing");
      socketRef.current.emit("session_stop", { sessionId });
    }
  }, []);

  const cancelSession = useCallback((sessionId: string) => {
    console.log("[WebSocket] cancelSession invoked with sessionId:", sessionId);
    // Set state optimistically so UI responds immediately
    setSessionState("idle");
    setTranscript(null);
    setSessionError(null);
    if (socketRef.current?.connected) {
      socketRef.current.emit("session_cancel", { sessionId });
    }
  }, []);

  const resetSession = useCallback((sessionId: string) => {
    console.log("[WebSocket] resetSession invoked with sessionId:", sessionId);
    if (socketRef.current?.connected) {
      socketRef.current.emit("session_reset", { sessionId });
    }
    setSessionState("idle");
    setTranscript(null);
    setSessionError(null);
  }, []);

  const downloadModel = useCallback((modelId: WhisperModelId) => {
    if (socketRef.current?.connected) {
      setDownloadProgressMap((prev) => ({ ...prev, [modelId]: 0 }));
      socketRef.current.emit("download_model", { modelId });
    }
  }, []);

  const deleteModel = useCallback((modelId: WhisperModelId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("delete_model", { modelId });
    }
  }, []);

  const setActiveModel = useCallback((modelId: WhisperModelId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("set_active_model", { modelId });
    }
  }, []);

  return {
    status,
    isConnected: status === "connected",
    sessionState,
    transcript,
    sessionError,
    models,
    downloadProgressMap,
    hardwareProfile,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
    resetSession,
    downloadModel,
    deleteModel,
    setActiveModel,
  };
}
