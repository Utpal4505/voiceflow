import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useCallback } from "react";
import MicIcon from "../components/overlay/MicIcon";
import WaveformBars from "../components/overlay/WaveformBars";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useSettingsStore } from "../stores/settingsStore";

const MAX_RECORDING_MS = 180_000;

export default function OverlayWindow() {
  const currentSessionIdRef = useRef<string | null>(null);
  const silenceCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const hasInsertedRef = useRef(false);

  const {
    isConnected,
    sessionState,
    transcript,
    sessionError,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
  } = useWebSocket();

  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;

  const handleAudioChunk = useCallback(
    (chunk: ArrayBuffer, seq: number) => {
      if (currentSessionIdRef.current && isConnected) {
        sendAudioChunk(currentSessionIdRef.current, seq, chunk);
      }
    },
    [isConnected, sendAudioChunk]
  );

  const handleAudioChunkRef = useRef(handleAudioChunk);
  handleAudioChunkRef.current = handleAudioChunk;

  const handleClose = useCallback(() => {
    if (currentSessionIdRef.current) {
      cancelSession(currentSessionIdRef.current);
      currentSessionIdRef.current = null;
    }
    stopRecording();
    hasInsertedRef.current = false;
    invoke("hide_overlay").catch(() => {});
  }, [cancelSession]);

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  const handleInsert = useCallback(
    async (textToInsert: string) => {
      if (hasInsertedRef.current || !textToInsert) return;
      hasInsertedRef.current = true;

      try {
        await invoke("insert_text", { text: textToInsert });
      } catch {
        handleCloseRef.current();
      }
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (sessionStateRef.current === "recording" && currentSessionIdRef.current) {
      stopSession(currentSessionIdRef.current);
      stopRecording();
    } else if (sessionStateRef.current === "done" && transcript?.text) {
      handleInsert(transcript.text);
    }
  }, [stopSession, transcript, handleInsert]);

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  const onChunkCallback = useCallback((chunk: ArrayBuffer, seq: number) => {
    handleAudioChunkRef.current(chunk, seq);

    if (Date.now() - startTimeRef.current > MAX_RECORDING_MS) {
      handleSubmitRef.current();
    }
  }, []);

  const { isRecording, volume, isSilent, error: audioError, startRecording, stopRecording } =
    useAudio(onChunkCallback);

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const { selectedDeviceId, availableDevices, initDeviceListener } =
    useSettingsStore();

  const handleStartRecording = useCallback(() => {
    const sessionId = crypto.randomUUID();
    currentSessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    silenceCountRef.current = 0;
    hasInsertedRef.current = false;

    startSession(sessionId);
    startRecording();
  }, [startSession, startRecording]);

  const handleStartRecordingRef = useRef(handleStartRecording);
  handleStartRecordingRef.current = handleStartRecording;

  // Insert transcript when done
  useEffect(() => {
    if (sessionState === "done") {
      if (transcript?.text && !hasInsertedRef.current) {
        const timer = setTimeout(() => {
          handleInsert(transcript.text);
        }, 300);
        return () => clearTimeout(timer);
      } else if (!transcript?.text) {
        const timer = setTimeout(() => {
          handleClose();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [sessionState, transcript, handleInsert, handleClose]);

  // Audio device change listener
  useEffect(() => {
    const unlisten = initDeviceListener();
    return () => unlisten();
  }, [initDeviceListener]);

  // Keyboard shortcut listener within overlay window
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleCloseRef.current();
      } else if (e.key === "Enter") {
        handleSubmitRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Tauri global overlay event listeners (Ctrl+Space triggers)
  useEffect(() => {
    let unlistenShow: (() => void) | undefined;
    let unlistenToggle: (() => void) | undefined;
    let unlistenSubmit: (() => void) | undefined;
    let unlistenHide: (() => void) | undefined;

    async function registerTauriEvents() {
      try {
        unlistenShow = await listen("overlay:show", () => {
          handleStartRecordingRef.current();
        });

        unlistenSubmit = await listen("overlay:submit", () => {
          handleSubmitRef.current();
        });

        unlistenToggle = await listen("overlay:toggle", () => {
          if (sessionStateRef.current === "recording") {
            handleSubmitRef.current();
          } else {
            handleCloseRef.current();
          }
        });

        unlistenHide = await listen("overlay:hide", () => {
          handleCloseRef.current();
        });
      } catch {
        // Running in plain browser mode outside Tauri
      }
    }

    registerTauriEvents();

    return () => {
      unlistenShow?.();
      unlistenSubmit?.();
      unlistenToggle?.();
      unlistenHide?.();
    };
  }, []);

  const activeDeviceLabel =
    availableDevices.find((d) => d.deviceId === selectedDeviceId)?.label ||
    "Default Microphone";

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-zinc-900/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-md select-none">
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600">
          {sessionState === "recording" && (
            <span
              className="absolute -inset-1 rounded-full bg-indigo-500 blur-xs transition-opacity duration-150 animate-pulse"
              style={{ opacity: Math.max(0.3, volume * 1.5) }}
            />
          )}

          {sessionState === "processing" ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : sessionState === "done" ? (
            <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <MicIcon className="relative h-4 w-4 text-white" />
          )}
        </div>

        {/* Content & Visualizer */}
        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          {sessionState === "recording" && (
            <WaveformBars volume={volume} isRecording={isRecording} />
          )}

          <div className="flex items-center gap-2">
            <span className="truncate text-xs text-zinc-300">
              {sessionState === "processing" ? (
                <span className="text-indigo-400 font-medium">Finalizing transcription…</span>
              ) : sessionState === "done" ? (
                <span className="text-emerald-400 font-medium">
                  {transcript?.text ? `Inserting: "${transcript.text}"` : "Inserting text…"}
                </span>
              ) : sessionState === "error" || sessionError || audioError ? (
                <span className="text-red-400 font-medium truncate">
                  {sessionError || audioError || "Engine error"}
                </span>
              ) : transcript?.text ? (
                <span className="text-zinc-100 font-medium">{transcript.text}</span>
              ) : isSilent ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ No sound detected — is mic muted?
                </span>
              ) : !isConnected ? (
                <span className="text-amber-400">Connecting to engine…</span>
              ) : (
                <span className="text-zinc-400">Listening… (Speak naturally)</span>
              )}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {sessionState === "recording" && (
            <>
              <button
                onClick={handleSubmit}
                className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-indigo-500 cursor-pointer active:scale-95 shadow-sm"
              >
                Enter ↵
              </button>
              <button
                onClick={handleClose}
                className="rounded-md bg-zinc-800/80 px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-white cursor-pointer active:scale-95"
              >
                Cancel
              </button>
            </>
          )}

          {sessionState === "processing" && (
            <span className="text-[11px] text-zinc-500 px-2">Processing…</span>
          )}

          {sessionState === "done" && (
            <button
              onClick={() => transcript?.text && handleInsert(transcript.text)}
              className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-emerald-500 cursor-pointer active:scale-95 shadow-sm"
            >
              Insert Now ↵
            </button>
          )}

          {sessionState === "error" && (
            <button
              onClick={handleStartRecording}
              className="rounded-md bg-red-600/80 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-500 cursor-pointer active:scale-95"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[10px] text-zinc-500">
        <span className="truncate max-w-[240px]">Mic: {activeDeviceLabel}</span>
        <div className="flex items-center gap-2">
          <span className="capitalize text-zinc-400">State: {sessionState}</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
