import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useCallback } from "react";
import MicIcon from "../components/overlay/MicIcon";
import WaveformBars from "../components/overlay/WaveformBars";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useSettingsStore } from "../stores/settingsStore";

export default function OverlayWindow() {
  const currentSessionIdRef = useRef<string | null>(null);

  const {
    status: wsStatus,
    isConnected,
    transcript,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
  } = useWebSocket();

  const handleAudioChunk = useCallback(
    (chunk: ArrayBuffer, seq: number) => {
      if (currentSessionIdRef.current && isConnected) {
        sendAudioChunk(currentSessionIdRef.current, seq, chunk);
      }
    },
    [isConnected, sendAudioChunk]
  );

  const { isRecording, volume, isSilent, error, startRecording, stopRecording } =
    useAudio(handleAudioChunk);

  const { selectedDeviceId, availableDevices, initDeviceListener } =
    useSettingsStore();

  const handleClose = useCallback(() => {
    if (currentSessionIdRef.current) {
      cancelSession(currentSessionIdRef.current);
      currentSessionIdRef.current = null;
    }
    stopRecording();
    invoke("hide_overlay");
  }, [cancelSession, stopRecording]);

  const handleSubmit = useCallback(() => {
    if (currentSessionIdRef.current) {
      stopSession(currentSessionIdRef.current);
    }
    stopRecording();
    // In Module 07, text insertion will occur here
  }, [stopSession, stopRecording]);

  useEffect(() => {
    const unlisten = initDeviceListener();
    const sessionId = crypto.randomUUID();
    currentSessionIdRef.current = sessionId;

    startSession(sessionId);
    startRecording();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unlisten();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [initDeviceListener, startSession, startRecording, handleClose, handleSubmit]);

  const activeDeviceLabel =
    availableDevices.find((d) => d.deviceId === selectedDeviceId)?.label ||
    "Default Microphone";

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-zinc-900/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-md select-none">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600">
          {isRecording && (
            <span
              className="absolute -inset-1 rounded-full bg-indigo-500 blur-xs transition-opacity duration-150"
              style={{ opacity: Math.max(0.3, volume * 1.5) }}
            />
          )}
          <MicIcon className="relative h-4 w-4 text-white" />
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <WaveformBars volume={volume} isRecording={isRecording} />
          <div className="flex items-center gap-2">
            <span className="truncate text-[11px] text-zinc-400">
              {transcript?.text ? (
                <span className="text-zinc-100 font-medium">{transcript.text}</span>
              ) : isSilent ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ No sound detected — is mic muted?
                </span>
              ) : error ? (
                <span className="text-red-400 font-medium truncate">{error}</span>
              ) : !isConnected ? (
                <span className="text-amber-400">Connecting to local engine…</span>
              ) : (
                "Listening… (Streaming to local engine)"
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSubmit}
            className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-indigo-500 cursor-pointer active:scale-95"
          >
            Enter ↵
          </button>
          <button
            onClick={handleClose}
            className="rounded-md bg-zinc-800/80 px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-white cursor-pointer active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[10px] text-zinc-500">
        <span className="truncate max-w-[240px]">Mic: {activeDeviceLabel}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className="capitalize">{wsStatus}</span>
        </div>
      </div>
    </div>
  );
}
