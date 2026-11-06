import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useCallback } from "react";
import WaveformBars from "../components/overlay/WaveformBars";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useHistoryStore } from "../stores/historyStore";
import VoiceFlowLogo from "../components/common/VoiceFlowLogo";
import { Mic, Check, AlertCircle, Loader2 } from "lucide-react";

const MAX_RECORDING_MS = 180_000;

export default function OverlayWindow() {
  const currentSessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamedTextRef = useRef<string>("");
  const reconcileQueueRef = useRef<Promise<void>>(Promise.resolve());
  const hasFinalizedRef = useRef(false);

  const { addHistoryItem } = useHistoryStore();

  const {
    isConnected,
    sessionState,
    transcript,
    sessionError,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
    resetSession,
  } = useWebSocket();

  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;

  // Stream reconciliation queue to prevent out-of-order typing
  const queueReconcile = useCallback((targetText: string) => {
    if (!targetText || targetText.trim().length === 0) return;

    reconcileQueueRef.current = reconcileQueueRef.current
      .then(async () => {
        const current = streamedTextRef.current;
        const next = targetText.trimStart();
        if (current === next) return;

        let commonPrefixLen = 0;
        const minLen = Math.min(current.length, next.length);
        while (
          commonPrefixLen < minLen &&
          current[commonPrefixLen] === next[commonPrefixLen]
        ) {
          commonPrefixLen++;
        }

        const backspaces = current.length - commonPrefixLen;
        const toAppend = next.slice(commonPrefixLen);

        streamedTextRef.current = next;

        if (backspaces > 0 || toAppend.length > 0) {
          await invoke("reconcile_streamed_text", {
            backspaces,
            append: toAppend,
          });
        }
      })
      .catch((err) => {
        console.error("Stream reconciliation error:", err);
      });
  }, []);

  const queueReconcileRef = useRef(queueReconcile);
  queueReconcileRef.current = queueReconcile;

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

  // Cancel and cleanly erase any streamed draft text
  const handleCancel = useCallback(async () => {
    stopRecording();
    const sessionId = currentSessionIdRef.current;
    if (sessionId) {
      cancelSession(sessionId);
      resetSession(sessionId);
      currentSessionIdRef.current = null;
    }

    const charsToErase = streamedTextRef.current.length;
    streamedTextRef.current = "";
    hasFinalizedRef.current = false;

    if (charsToErase > 0) {
      try {
        await invoke("cancel_streamed_text", { total_chars: charsToErase });
      } catch {
        // ignore
      }
    }

    invoke("hide_overlay").catch(() => {});
  }, [cancelSession, resetSession]);

  const handleCancelRef = useRef(handleCancel);
  handleCancelRef.current = handleCancel;

  // Dismiss overlay and reset state without erasing streamed text
  const handleDismiss = useCallback(() => {
    stopRecording();
    const sessionId = currentSessionIdRef.current;
    if (sessionId) {
      cancelSession(sessionId);
      resetSession(sessionId);
      currentSessionIdRef.current = null;
    }
    streamedTextRef.current = "";
    hasFinalizedRef.current = false;
    invoke("hide_overlay").catch(() => {});
  }, [cancelSession, resetSession]);

  const handleDismissRef = useRef(handleDismiss);
  handleDismissRef.current = handleDismiss;

  // Accept and finalize dictation
  const handleFinalize = useCallback(
    async (finalText: string) => {
      if (hasFinalizedRef.current) return;
      hasFinalizedRef.current = true;

      stopRecording();

      // Reconcile any remaining difference with final transcript
      if (finalText && finalText.trim().length > 0) {
        queueReconcileRef.current(finalText);
      }

      await reconcileQueueRef.current;

      const textToRecord = (finalText || streamedTextRef.current).trim();
      if (textToRecord) {
        addHistoryItem({
          text: textToRecord,
          timestamp: Date.now(),
          durationMs: Date.now() - (startTimeRef.current || Date.now()),
        });
      }

      const sessionId = currentSessionIdRef.current;
      if (sessionId) {
        resetSession(sessionId);
        currentSessionIdRef.current = null;
      }

      streamedTextRef.current = "";

      invoke("hide_overlay").catch(() => {});
    },
    [addHistoryItem, resetSession]
  );

  const handleFinalizeRef = useRef(handleFinalize);
  handleFinalizeRef.current = handleFinalize;

  const handleSubmit = useCallback(() => {
    if (sessionStateRef.current === "recording" && currentSessionIdRef.current) {
      stopSession(currentSessionIdRef.current);
      stopRecording();
    } else if (sessionStateRef.current === "processing") {
      // User pressed Enter while waiting for whisper-cli: fast finalize with already streamed text
      handleFinalizeRef.current(streamedTextRef.current);
    } else if (sessionStateRef.current === "done") {
      handleFinalizeRef.current(transcript?.text || "");
    }
  }, [stopSession, transcript]);

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

  const handleStartRecording = useCallback(() => {
    if (sessionStateRef.current === "recording") {
      return;
    }
    const sessionId = crypto.randomUUID();
    currentSessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    hasFinalizedRef.current = false;
    streamedTextRef.current = "";
    reconcileQueueRef.current = Promise.resolve();

    startSession(sessionId);
    startRecording();
  }, [startSession, startRecording]);

  const handleStartRecordingRef = useRef(handleStartRecording);
  handleStartRecordingRef.current = handleStartRecording;

  // Stream incoming partial transcript live into active text field
  useEffect(() => {
    if (sessionState === "recording" && transcript?.text) {
      queueReconcile(transcript.text);
    }
  }, [sessionState, transcript, queueReconcile]);

  // When final transcript arrives, finalize and accept immediately
  useEffect(() => {
    if (sessionState === "done") {
      const finalText = transcript?.text || "";
      handleFinalizeRef.current(finalText);
    }
  }, [sessionState, transcript]);

  // Clean dismiss on error without backspacing user text
  useEffect(() => {
    if (sessionState === "error") {
      stopRecording();
      const timer = setTimeout(() => {
        handleDismissRef.current();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionState, stopRecording]);

  // Keyboard shortcut listener within overlay window
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelRef.current();
      } else if (e.key === "Enter") {
        e.preventDefault();
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
            handleCancelRef.current();
          }
        });

        unlistenHide = await listen("overlay:hide", () => {
          handleCancelRef.current();
        });
      } catch {
        // Plain browser mode
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

  return (
    <div className="flex h-full w-full items-center justify-center p-3 select-none font-sans">
      {/* Floating Dynamic Capsule Pill (Wispr Flow / Dynamic Island Style) */}
      <div className="flex w-full max-w-[440px] items-center justify-between rounded-full border border-white/[0.12] bg-[#0E1017]/96 px-4 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(255,99,56,0.15)] backdrop-blur-2xl">
        {/* VoiceFlow Brand Mark / State Orb */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          {sessionState === "recording" ? (
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6338] shadow-md shadow-[#FF6338]/40">
              <span
                className="absolute -inset-1 rounded-full bg-[#FF6338]/50 blur-[3px] transition-opacity duration-150 animate-pulse"
                style={{ opacity: Math.max(0.3, volume * 1.8) }}
              />
              <Mic className="h-3.5 w-3.5 text-white relative z-10" />
            </div>
          ) : sessionState === "processing" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
              <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
            </div>
          ) : sessionState === "done" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
            </div>
          ) : sessionState === "error" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
              <AlertCircle className="h-3.5 w-3.5 text-white" />
            </div>
          ) : (
            <VoiceFlowLogo className="h-7 w-7 rounded-lg shadow-sm" />
          )}
        </div>

        {/* Dynamic Waveform & Live Text Display */}
        <div className="flex flex-1 items-center gap-3 px-3 overflow-hidden">
          {sessionState === "recording" && (
            <div className="shrink-0">
              <WaveformBars volume={volume} isRecording={isRecording} barCount={12} />
            </div>
          )}

          <div className="flex flex-1 items-center truncate">
            <span className="truncate text-xs font-medium tracking-tight">
              {sessionState === "processing" ? (
                <span className="text-[#FF6338]">Transcribing with Whisper…</span>
              ) : sessionState === "done" ? (
                <span className="text-emerald-400">Accepted!</span>
              ) : sessionState === "error" || sessionError || audioError ? (
                <span className="text-red-400">
                  {sessionError || audioError || "Engine error"}
                </span>
              ) : transcript?.text ? (
                <span className="text-white">{transcript.text}</span>
              ) : isSilent ? (
                <span className="text-amber-400">⚠️ No sound — check mic</span>
              ) : !isConnected ? (
                <span className="text-amber-400">Connecting engine…</span>
              ) : (
                <span className="text-slate-300">Streaming live to cursor…</span>
              )}
            </span>
          </div>
        </div>

        {/* Minimal Keyboard Shortcuts */}
        <div className="flex items-center gap-1.5 shrink-0">
          {sessionState === "recording" && (
            <>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] px-2.5 py-1 text-[11px] font-medium text-slate-200 transition cursor-pointer active:scale-95"
                title="Finish & Accept"
              >
                <span>Enter</span>
                <kbd className="font-mono text-[9px] text-slate-400">↵</kbd>
              </button>
              <button
                onClick={handleCancel}
                className="rounded-full bg-white/[0.04] hover:bg-white/[0.1] px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
                title="Cancel & Erase"
              >
                Esc
              </button>
            </>
          )}

          {sessionState === "error" && (
            <button
              onClick={handleStartRecording}
              className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-red-500 cursor-pointer active:scale-95"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
