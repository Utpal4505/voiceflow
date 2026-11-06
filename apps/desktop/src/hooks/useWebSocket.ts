import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SessionState } from "@voiceflow/contracts";

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export interface TranscriptData {
  sessionId: string;
  text: string;
  isFinal: boolean;
}

export function useWebSocket(serverUrl = "http://localhost:3001") {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
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
      setStatus("connected");
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("error");
    });

    socket.on("session_started", () => {
      setSessionState("recording");
      setSessionError(null);
    });

    socket.on("partial_transcript", (data: TranscriptData) => {
      setTranscript(data);
    });

    socket.on("final_transcript", (data: TranscriptData) => {
      setTranscript(data);
      setSessionState("done");
    });

    socket.on("session_error", (data: { error: string }) => {
      setSessionError(data.error);
      setSessionState("error");
    });

    socket.on("session_cancelled", () => {
      setSessionState("idle");
      setTranscript(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  const startSession = useCallback((sessionId: string, modelId?: string) => {
    if (socketRef.current?.connected) {
      setSessionState("recording");
      setTranscript(null);
      setSessionError(null);
      socketRef.current.emit("session_start", {
        sessionId,
        modelId,
        sampleRate: 16000,
      });
    }
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
    if (socketRef.current?.connected) {
      setSessionState("processing");
      socketRef.current.emit("session_stop", { sessionId });
    }
  }, []);

  const cancelSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      setSessionState("idle");
      setTranscript(null);
      socketRef.current.emit("session_cancel", { sessionId });
    }
  }, []);

  return {
    status,
    isConnected: status === "connected",
    sessionState,
    transcript,
    sessionError,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
  };
}
