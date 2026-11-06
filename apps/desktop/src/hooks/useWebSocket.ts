import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export interface TranscriptData {
  sessionId: string;
  text: string;
  isFinal: boolean;
}

export function useWebSocket(serverUrl = "http://localhost:3001") {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
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

    socket.on("partial_transcript", (data: TranscriptData) => {
      setTranscript(data);
    });

    socket.on("final_transcript", (data: TranscriptData) => {
      setTranscript(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl]);

  const startSession = useCallback((sessionId: string, modelId?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("session_start", {
        sessionId,
        modelId,
        sampleRate: 16000,
      });
      setTranscript(null);
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
      socketRef.current.emit("session_stop", { sessionId });
    }
  }, []);

  const cancelSession = useCallback((sessionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("session_cancel", { sessionId });
      setTranscript(null);
    }
  }, []);

  return {
    status,
    isConnected: status === "connected",
    transcript,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
  };
}
