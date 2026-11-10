import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useCallback, useState } from "react";
import WaveformBars from "../components/overlay/WaveformBars";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useHistoryStore } from "../stores/historyStore";
import { useSettingsStore } from "../stores/settingsStore";
import VoiceFlowLogo from "../components/common/VoiceFlowLogo";
import { Mic, Check, AlertCircle, Loader2, Globe, Search, Sparkles } from "lucide-react";
import { trackDictationCompleted, trackInsertionFailed } from "../lib/telemetry";
import { audioChime } from "../utils/audioChime";

const MAX_RECORDING_MS = 180_000;

export default function OverlayWindow() {
  const currentSessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasInsertedRef = useRef(false);
  const [executingAction, setExecutingAction] = useState<{
    label: string;
    category: "app" | "web" | "search";
  } | null>(null);

  const { addHistoryItem } = useHistoryStore();
  const { initDeviceListener } = useSettingsStore();

  useEffect(() => {
    const unlisten = initDeviceListener();
    return () => unlisten();
  }, [initDeviceListener]);

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

  useEffect(() => {
    console.log("[Overlay] Component mounted");
    return () => console.log("[Overlay] Component unmounted");
  }, []);

  const handleAudioChunkRef = useRef<(chunk: ArrayBuffer, seq: number) => void>(() => {});
  const handleSubmitRef = useRef<() => void>(() => {});
  const prerollBufferRef = useRef<ArrayBuffer | null>(null);
  const seqOffsetRef = useRef<number>(0);
  const hasSpokenRef = useRef<boolean>(false);
  const lastVoiceTimeRef = useRef<number>(0);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;
  const volumeRef = useRef<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const onChunkCallback = useCallback((chunk: ArrayBuffer, seq: number) => {
    handleAudioChunkRef.current(chunk, seq);

    if (Date.now() - startTimeRef.current > MAX_RECORDING_MS) {
      console.warn("[Overlay] Max recording limit reached, submitting...");
      handleSubmitRef.current();
    }
  }, []);

  const { isRecording, volume, isSilent, error: audioError, startRecording, stopRecording } =
    useAudio(onChunkCallback);
  volumeRef.current = volume;

  // Wall-Clock Adaptive Silence Auto-Submit Monitor
  useEffect(() => {
    if (sessionState !== "recording") {
      hasSpokenRef.current = false;
      lastVoiceTimeRef.current = 0;
      setCountdownSeconds(null);
      return;
    }

    const timer = setInterval(() => {
      const currentVol = volumeRef.current;
      const currentText = (transcriptRef.current?.text || "").trim().toLowerCase();

      // Voice onset: active volume >= 0.008 OR partial transcript text has arrived!
      if (currentVol >= 0.008 || currentText.length > 0) {
        if (!hasSpokenRef.current) {
          hasSpokenRef.current = true;
          console.log("[Overlay] Voice onset detected (volume:", currentVol.toFixed(4), "text:", currentText, ")");
        }
        lastVoiceTimeRef.current = Date.now();
        setCountdownSeconds((prev) => (prev !== null ? null : prev));
        return;
      }

      // If speech was active previously, and now we are in silence:
      if (hasSpokenRef.current && lastVoiceTimeRef.current > 0) {
        const silenceMs = Date.now() - lastVoiceTimeRef.current;

        const isCommand =
          currentText.startsWith("open ") ||
          currentText.startsWith("launch ") ||
          currentText.startsWith("start ") ||
          currentText.startsWith("search ") ||
          currentText.startsWith("google ") ||
          currentText.startsWith("youtube ");

        // Commands: 750ms silence window for instant execution
        // Long dictation: 2200ms silence window to allow natural thinking pauses
        const silenceLimitMs = isCommand ? 750 : 2200;

        // Visual Countdown during dictation thinking pause (at >= 1200ms)
        if (!isCommand && silenceMs >= 1200 && silenceMs < silenceLimitMs) {
          const remainingSec = Math.max(1, Math.ceil((silenceLimitMs - silenceMs) / 1000));
          setCountdownSeconds(remainingSec);
        } else if (isCommand || silenceMs < 1200) {
          setCountdownSeconds((prev) => (prev !== null ? null : prev));
        }

        if (silenceMs >= silenceLimitMs) {
          console.log(
            `[Overlay] Auto-submit triggered on silence (${silenceMs}ms, isCommand: ${isCommand})`
          );
          hasSpokenRef.current = false;
          lastVoiceTimeRef.current = 0;
          setCountdownSeconds(null);
          handleSubmitRef.current();
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [sessionState]);

  const handleAudioChunk = useCallback(
    (chunk: ArrayBuffer, seq: number) => {
      if (currentSessionIdRef.current && isConnected) {
        sendAudioChunk(currentSessionIdRef.current, seq + seqOffsetRef.current, chunk);
      }
    },
    [isConnected, sendAudioChunk]
  );
  handleAudioChunkRef.current = handleAudioChunk;

  const cleanupState = useCallback(() => {
    stopRecording();
    const sessionId = currentSessionIdRef.current;
    if (sessionId) {
      cancelSession(sessionId);
      currentSessionIdRef.current = null;
    }
    prerollBufferRef.current = null;
    seqOffsetRef.current = 0;
    hasInsertedRef.current = false;
    hasSpokenRef.current = false;
    lastVoiceTimeRef.current = 0;
    setCountdownSeconds(null);
    setExecutingAction(null);
  }, [cancelSession, stopRecording]);

  const cleanupStateRef = useRef(cleanupState);
  cleanupStateRef.current = cleanupState;

  const handleClose = useCallback(() => {
    console.log("[Overlay] handleClose called, current session:", currentSessionIdRef.current);
    cleanupState();
    invoke("hide_overlay")
      .then(() => console.log("[Overlay] hide_overlay invoke succeeded"))
      .catch((err) => console.error("[Overlay] hide_overlay invoke error:", err));
  }, [cleanupState]);

  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  const handleInsert = useCallback(
    async (textToInsert: string) => {
      console.log("[Overlay] handleInsert called with:", textToInsert, "hasInserted:", hasInsertedRef.current);
      if (hasInsertedRef.current || !textToInsert) return;

      // Smart Voice Action Interception (App Launcher / Web Search / Domain Open)
      const { voiceActionsEnabled } = useSettingsStore.getState();
      if (voiceActionsEnabled) {
        try {
          const action = await invoke<{ type: string; payload: any } | null>("parse_voice_action", {
            text: textToInsert,
          });

          if (action) {
            console.log("[Overlay] Intercepted Smart Voice Action:", action);
            hasInsertedRef.current = true;

            let label = "Executing action…";
            let category: "app" | "web" | "search" = "app";

            if (action.type === "OpenUrl") {
              label = `Opening ${action.payload.domain}…`;
              category = "web";
            } else if (action.type === "SearchWeb") {
              label = `Searching ${action.payload.provider}: "${action.payload.query}"…`;
              category = "search";
            } else if (action.type === "LaunchApp") {
              label = `Launching ${action.payload.display_name}…`;
              category = "app";
            }

            setExecutingAction({ label, category });
            audioChime.playWakeChime();

            // Execute action natively via Rust
            await invoke("execute_voice_action", { action });

            // Allow brief visual feedback, then cleanly close overlay without typing text
            setTimeout(() => {
              setExecutingAction(null);
              handleClose();
            }, 850);
            return;
          }
        } catch (actionErr) {
          console.warn("[Overlay] Voice action parser check error:", actionErr);
        }
      }

      hasInsertedRef.current = true;

      // Add to local history log
      addHistoryItem({
        text: textToInsert,
        timestamp: Date.now(),
        durationMs: Date.now() - (startTimeRef.current || Date.now()),
      });

      const totalLatencyMs = Date.now() - (startTimeRef.current || Date.now());
      const wordCount = textToInsert.trim().split(/\s+/).filter(Boolean).length;
      const audioDurationSec = transcript?.metrics?.audioDurationMs
        ? transcript.metrics.audioDurationMs / 1000
        : totalLatencyMs / 1000;

      try {
        console.log("[Overlay] Invoking Tauri 'insert_text' command...");
        await invoke("insert_text", { text: textToInsert });
        console.log("[Overlay] 'insert_text' invocation resolved successfully");

        // Telemetry: Record successful dictation metrics (Metadata only, NO text/audio)
        trackDictationCompleted({
          audioDurationSec,
          wordCount,
          totalLatencyMs,
          rtf: transcript?.metrics?.rtf,
          modelId: transcript?.metrics?.modelId,
          engineTier: transcript?.metrics?.engineTier,
        });
      } catch (err) {
        console.error("[Overlay] 'insert_text' invocation failed:", err);
        trackInsertionFailed({
          reason: err instanceof Error ? err.message : String(err),
          durationMs: totalLatencyMs,
        });
      } finally {
        console.log("[Overlay] handleInsert cleanup: stopping recording and resetting session");
        stopRecording();
        const sessionId = currentSessionIdRef.current;
        if (sessionId) {
          resetSession(sessionId);
          currentSessionIdRef.current = null;
        }
        hasInsertedRef.current = false;
      }
    },
    [addHistoryItem, resetSession, stopRecording]
  );

  const handleSubmit = useCallback(() => {
    console.log("[Overlay] handleSubmit called, sessionState:", sessionStateRef.current);
    if (sessionStateRef.current === "recording" && currentSessionIdRef.current) {
      console.log("[Overlay] Stopping recording and submitting to backend for transcription...");
      stopSession(currentSessionIdRef.current);
      stopRecording();
    } else if (sessionStateRef.current === "done" && transcript?.text) {
      console.log("[Overlay] In done state, proceeding to insert text immediately");
      handleInsert(transcript.text);
    }
  }, [stopSession, transcript, handleInsert, stopRecording]);
  handleSubmitRef.current = handleSubmit;

  const handleStartRecording = useCallback(async () => {
    const sessionId = crypto.randomUUID();
    console.log("[Overlay] handleStartRecording initiated with sessionId:", sessionId);
    currentSessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    hasInsertedRef.current = false;
    hasSpokenRef.current = false;
    lastVoiceTimeRef.current = 0;
    setCountdownSeconds(null);

    startSession(sessionId);

    // Pillar 1: One-Breath Seamless Dictation - flush trailing pre-roll PCM audio chunk #0
    try {
      let preroll = prerollBufferRef.current;
      if (!preroll) {
        const pcmBytes = await invoke<number[] | null>("get_wake_word_preroll_audio");
        if (pcmBytes && pcmBytes.length > 0) {
          preroll = new Uint8Array(pcmBytes).buffer;
        }
      }

      if (preroll && isConnected) {
        console.log(
          "[Overlay] Streaming one-breath pre-roll audio chunk (seq #0) to backend...",
          preroll.byteLength,
          "bytes"
        );
        sendAudioChunk(sessionId, 0, preroll);
        prerollBufferRef.current = null;
        seqOffsetRef.current = 1;
      } else {
        seqOffsetRef.current = 0;
      }
    } catch (err) {
      console.warn("[Overlay] Pre-roll audio check completed (none or error):", err);
      seqOffsetRef.current = 0;
    }

    startRecording();
  }, [startSession, isConnected, sendAudioChunk, startRecording]);

  const handleStartRecordingRef = useRef(handleStartRecording);
  handleStartRecordingRef.current = handleStartRecording;

  // Auto-insert transcript when done
  useEffect(() => {
    console.log("[Overlay] sessionState changed ->", sessionState, "transcript:", transcript?.text);
    if (sessionState === "done") {
      if (transcript?.text && !hasInsertedRef.current) {
        console.log("[Overlay] Transcription done, scheduling auto-insert in 150ms...");
        const timer = setTimeout(() => {
          handleInsert(transcript.text);
        }, 150);
        return () => clearTimeout(timer);
      } else if (!transcript?.text) {
        console.log("[Overlay] Transcription done with empty text, auto-closing in 1000ms...");
        const timer = setTimeout(() => {
          handleClose();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [sessionState, transcript, handleInsert, handleClose]);

  // Keyboard shortcut listener within overlay window
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      console.log("[Overlay] DOM KeyDown:", e.key);
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
    let unlistenWakeWord: (() => void) | undefined;

    async function registerTauriEvents() {
      try {
        unlistenWakeWord = await listen<string>("wake-word:triggered", async (event) => {
          console.log("[Overlay] Wake word triggered by Rust listener:", event.payload);
          audioChime.playWakeChime();
          try {
            const preroll = await invoke<number[] | null>("get_wake_word_preroll_audio");
            if (preroll && preroll.length > 0) {
              prerollBufferRef.current = new Uint8Array(preroll).buffer;
              console.log("[Overlay] Captured pre-roll audio buffer:", prerollBufferRef.current.byteLength, "bytes");
            }
          } catch (err) {
            console.warn("[Overlay] Failed to fetch one-breath pre-roll audio:", err);
          }
        });

        unlistenShow = await listen("overlay:show", () => {
          console.log("[Overlay] Event received: overlay:show");
          handleStartRecordingRef.current();
        });

        unlistenSubmit = await listen("overlay:submit", () => {
          console.log("[Overlay] Event received: overlay:submit");
          handleSubmitRef.current();
        });

        unlistenToggle = await listen("overlay:toggle", () => {
          console.log("[Overlay] Event received: overlay:toggle, state:", sessionStateRef.current);
          if (sessionStateRef.current === "recording") {
            handleSubmitRef.current();
          } else {
            handleCloseRef.current();
          }
        });

        unlistenHide = await listen("overlay:hide", () => {
          console.log("[Overlay] Event received: overlay:hide (cleaning up local state)");
          cleanupStateRef.current();
        });
        console.log("[Overlay] Tauri event listeners successfully attached");
      } catch (err) {
        console.warn("[Overlay] Failed to register Tauri listeners (running in browser?):", err);
      }
    }

    registerTauriEvents();

    return () => {
      unlistenWakeWord?.();
      unlistenShow?.();
      unlistenSubmit?.();
      unlistenToggle?.();
      unlistenHide?.();
    };
  }, []);

  return (
    <div
      style={{ backgroundColor: "transparent" }}
      className="flex h-screen w-screen items-center justify-center p-2 select-none font-sans overflow-hidden bg-transparent"
    >
      {/* Floating Dynamic Capsule Pill (Uses exact VoiceFlow Design Token System) */}
      <div className="vf-hud-container w-full max-w-[440px] justify-between">
        {/* VoiceFlow Brand Mark / State Orb */}
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
          {executingAction ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.6)] animate-pulse">
              {executingAction.category === "search" ? (
                <Search className="h-3.5 w-3.5 text-white" />
              ) : executingAction.category === "web" ? (
                <Globe className="h-3.5 w-3.5 text-white" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-white" />
              )}
            </div>
          ) : sessionState === "recording" ? (
            <div className="vf-mic-badge">
              <span
                className="absolute -inset-1 rounded-full bg-[#FF5722]/50 blur-[3px] transition-opacity duration-150 animate-pulse"
                style={{ opacity: Math.max(0.3, volume * 1.8) }}
              />
              <Mic className="h-3.5 w-3.5 text-white relative z-10" />
            </div>
          ) : sessionState === "processing" ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5722] shadow-[0_0_15px_rgba(255,87,34,0.6)]">
              <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
            </div>
          ) : sessionState === "done" ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
            </div>
          ) : sessionState === "error" ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <AlertCircle className="h-3.5 w-3.5 text-white" />
            </div>
          ) : (
            <VoiceFlowLogo className="h-6 w-6 rounded-lg shadow-sm" />
          )}
        </div>

        {/* Dynamic Waveform & Live Text Display */}
        <div className="flex flex-1 items-center gap-3 px-2 overflow-hidden">
          {sessionState === "recording" && (
            <div className="shrink-0">
              <WaveformBars volume={volume} isRecording={isRecording} barCount={12} accent="coral" />
            </div>
          )}

          <div className="flex flex-1 items-center truncate">
            <span className="truncate text-xs font-medium tracking-tight">
              {countdownSeconds !== null ? (
                <span className="text-amber-300 font-semibold animate-pulse">
                  Pausing… submitting in {countdownSeconds}s (speak to continue)
                </span>
              ) : executingAction ? (
                <span className="text-[#C4B5FD] font-semibold animate-pulse">
                  {executingAction.label}
                </span>
              ) : sessionState === "processing" ? (
                <span className="text-[#FF8A65] font-semibold">Transcribing with Whisper…</span>
              ) : sessionState === "done" ? (
                <span className="text-[#10B981] font-semibold">
                  {transcript?.text ? `Inserting: "${transcript.text}"` : "Done!"}
                </span>
              ) : sessionState === "error" || sessionError || audioError ? (
                <span className="text-red-400">
                  {sessionError || audioError || "Engine error"}
                </span>
              ) : transcript?.text ? (
                <span className="text-white font-medium">{transcript.text}</span>
              ) : isSilent ? (
                <span className="text-amber-400">⚠️ No sound — check mic</span>
              ) : !isConnected ? (
                <span className="text-amber-400">Connecting engine…</span>
              ) : (
                <span className="text-slate-300">Listening to voice…</span>
              )}
            </span>
          </div>
        </div>

        {/* Tactile Keycap Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {sessionState === "recording" && (
            <>
              <button
                onClick={handleSubmit}
                className="vf-keycap cursor-pointer flex items-center gap-1 hover:border-white/30"
                title="Finish & Insert (Enter)"
              >
                <span>Enter</span>
                <span className="font-mono text-[10px] text-slate-300">↵</span>
              </button>
              <button
                onClick={handleClose}
                className="rounded-md border border-white/10 bg-transparent hover:bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
                title="Cancel (Esc)"
              >
                Esc
              </button>
            </>
          )}

          {sessionState === "done" && (
            <button
              onClick={() => transcript?.text && handleInsert(transcript.text)}
              className="rounded-md bg-[#10B981] hover:bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-md shadow-emerald-500/30 transition cursor-pointer active:scale-95"
            >
              Insert ↵
            </button>
          )}

          {sessionState === "error" && (
            <button
              onClick={handleStartRecording}
              className="rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md shadow-red-500/30 transition hover:bg-red-500 cursor-pointer active:scale-95"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
