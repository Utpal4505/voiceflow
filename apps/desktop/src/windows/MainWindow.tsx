import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState, useRef, useCallback } from "react";
import AudioStudio from "../components/audio/AudioStudio";
import ModelManager from "../components/models/ModelManager";
import HistoryView from "../components/history/HistoryView";
import VocabularyView from "../components/vocabulary/VocabularyView";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useSettingsStore } from "../stores/settingsStore";
import { useHistoryStore } from "../stores/historyStore";
import { useVocabularyStore } from "../stores/vocabularyStore";
import VoiceFlowLogo from "../components/common/VoiceFlowLogo";
import { Mic, Cpu, History, BookOpen, Loader2 } from "lucide-react";

export type NavTab = "studio" | "models" | "history" | "vocabulary";

export default function MainWindow() {
  const [activeTab, setActiveTab] = useState<NavTab>("studio");
  const [liveText, setLiveText] = useState("");

  const currentSessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasInsertedRef = useRef(false);

  const {
    selectedDeviceId,
    availableDevices,
    setSelectedDeviceId,
    initDeviceListener,
  } = useSettingsStore();

  const {
    isConnected,
    status: wsStatus,
    sessionState,
    transcript,
    models,
    downloadProgressMap,
    hardwareProfile,
    downloadModel,
    deleteModel,
    setActiveModel,
    startSession,
    sendAudioChunk,
    stopSession,
    cancelSession,
    resetSession,
  } = useWebSocket();

  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;

  const { history, addHistoryItem } = useHistoryStore();
  const { terms } = useVocabularyStore();

  // Audio chunk streamer
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

  const onChunkCallback = useCallback((chunk: ArrayBuffer, seq: number) => {
    handleAudioChunkRef.current(chunk, seq);
  }, []);

  const { isRecording, volume, isSilent, error, startRecording, stopRecording } =
    useAudio(onChunkCallback);

  const stopRecordingRef = useRef(stopRecording);
  stopRecordingRef.current = stopRecording;
  const startRecordingRef = useRef(startRecording);
  startRecordingRef.current = startRecording;

  // Insert text into foreground editor
  const handleInsert = useCallback(
    async (textToInsert: string) => {
      if (hasInsertedRef.current || !textToInsert) return;
      hasInsertedRef.current = true;

      // Add to persistent history
      addHistoryItem({
        text: textToInsert,
        timestamp: Date.now(),
        durationMs: Date.now() - (startTimeRef.current || Date.now()),
      });

      try {
        await invoke("insert_text", { text: textToInsert });
      } catch {
        // Fallback
      }
    },
    [addHistoryItem]
  );

  const handleInsertRef = useRef(handleInsert);
  handleInsertRef.current = handleInsert;

  // Start dictation session
  const handleStartDictation = useCallback(() => {
    const sessionId = crypto.randomUUID();
    currentSessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    hasInsertedRef.current = false;

    startSession(sessionId);
    startRecordingRef.current();
  }, [startSession]);

  const handleStartDictationRef = useRef(handleStartDictation);
  handleStartDictationRef.current = handleStartDictation;

  // Stop dictation session
  const handleStopDictation = useCallback(() => {
    if (sessionStateRef.current === "recording" && currentSessionIdRef.current) {
      stopSession(currentSessionIdRef.current);
      stopRecordingRef.current();
    }
  }, [stopSession]);

  const handleStopDictationRef = useRef(handleStopDictation);
  handleStopDictationRef.current = handleStopDictation;

  // Toggle dictation
  const handleToggleDictation = useCallback(() => {
    if (sessionStateRef.current === "recording") {
      handleStopDictationRef.current();
    } else {
      handleStartDictationRef.current();
    }
  }, []);

  const handleToggleDictationRef = useRef(handleToggleDictation);
  handleToggleDictationRef.current = handleToggleDictation;

  // Cancel dictation
  const handleCancelDictation = useCallback(() => {
    if (currentSessionIdRef.current) {
      cancelSession(currentSessionIdRef.current);
      resetSession(currentSessionIdRef.current);
      currentSessionIdRef.current = null;
    }
    stopRecordingRef.current();
    hasInsertedRef.current = false;
  }, [cancelSession, resetSession]);

  const handleCancelDictationRef = useRef(handleCancelDictation);
  handleCancelDictationRef.current = handleCancelDictation;

  // When transcription is received
  useEffect(() => {
    if (sessionState === "done") {
      if (transcript?.text) {
        setLiveText(transcript.text);
        if (!hasInsertedRef.current) {
          handleInsertRef.current(transcript.text);
        }
      }
      if (currentSessionIdRef.current) {
        resetSession(currentSessionIdRef.current);
        currentSessionIdRef.current = null;
      }
    }
  }, [sessionState, transcript, resetSession]);

  // Audio device change listener
  useEffect(() => {
    const unlisten = initDeviceListener();
    return () => unlisten();
  }, [initDeviceListener]);

  // Global shortcut listeners from Tauri
  useEffect(() => {
    let unlistenToggle: (() => void) | undefined;
    let unlistenSubmit: (() => void) | undefined;
    let unlistenCancel: (() => void) | undefined;

    async function registerEvents() {
      try {
        unlistenToggle = await listen("dictation:toggle", () => {
          handleToggleDictationRef.current();
        });
        unlistenSubmit = await listen("dictation:submit", () => {
          handleStopDictationRef.current();
        });
        unlistenCancel = await listen("dictation:cancel", () => {
          handleCancelDictationRef.current();
        });
      } catch {
        // Plain web browser mode
      }
    }

    registerEvents();

    return () => {
      unlistenToggle?.();
      unlistenSubmit?.();
      unlistenCancel?.();
    };
  }, []);

  const activeModel = models.find((m) => m.active);

  const navItems = [
    { id: "studio" as NavTab, label: "Voice Studio", icon: Mic },
    { id: "models" as NavTab, label: "Whisper Models", icon: Cpu },
    { id: "history" as NavTab, label: "History Log", icon: History, count: history.length },
    { id: "vocabulary" as NavTab, label: "Vocabulary", icon: BookOpen, count: terms.length },
  ];

  return (
    <div className="flex h-screen flex-col bg-[#0B0C12] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Integrated Desktop Header Navigation */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#10121A] px-6 z-20">
        {/* Brand Mark */}
        <div className="flex items-center gap-3">
          <VoiceFlowLogo className="h-7 w-7 rounded-lg shadow-sm shadow-[#514BFA]/30" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-tight text-white">VoiceFlow</span>
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
              v0.1
            </span>
          </div>
        </div>

        {/* Center Segmented Navigation Rail */}
        <nav className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-[#0E0F14] p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-[#181B2B] text-white shadow-sm border border-white/[0.08]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "text-[#7772FF]" : "text-slate-400"}`}
                />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 font-mono text-[9px] text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Hardware Engine Status & Dictation Indicator */}
        <div className="flex items-center gap-3">
          {/* Live Dictation State Badge */}
          {isRecording ? (
            <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-[11px] font-semibold">Listening to Voice...</span>
            </div>
          ) : sessionState === "processing" ? (
            <div className="flex items-center gap-2 rounded-full border border-[#514BFA]/30 bg-[#514BFA]/10 px-3 py-1 text-xs text-[#A5A0FF]">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-[11px] font-semibold">Transcribing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0E0F14] px-3 py-1 text-xs text-slate-300">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-[11px] font-medium text-slate-300">
                {isConnected
                  ? hardwareProfile?.statusLabel || "AVX2 Engine Ready"
                  : `Engine: ${wsStatus}`}
              </span>
            </div>
          )}

          {/* Shortcut Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0E0F14] px-2.5 py-1 text-xs text-slate-400">
            <span className="text-[10px]">Direct Typing:</span>
            <kbd className="font-mono text-[10px] text-white">Ctrl + Space</kbd>
          </div>
        </div>
      </header>

      {/* Main Full-Bleed Content Workspace */}
      <main className="flex-1 overflow-y-auto px-8 py-6 relative z-10">
        {activeTab === "studio" && (
          <AudioStudio
            selectedDeviceId={selectedDeviceId}
            availableDevices={availableDevices}
            onSelectDevice={setSelectedDeviceId}
            isRecording={isRecording}
            volume={volume}
            isSilent={isSilent}
            error={error}
            onToggleDictation={handleToggleDictation}
            hardwareProfile={hardwareProfile}
            activeModelName={activeModel?.name}
            onNavigateHistory={() => setActiveTab("history")}
            onNavigateModels={() => setActiveTab("models")}
            liveText={liveText}
            sessionState={sessionState}
            onClearText={() => setLiveText("")}
          />
        )}

        {activeTab === "models" && (
          <ModelManager
            models={models}
            downloadProgressMap={downloadProgressMap}
            onDownload={downloadModel}
            onDelete={deleteModel}
            onSetActive={setActiveModel}
          />
        )}

        {activeTab === "history" && <HistoryView />}

        {activeTab === "vocabulary" && <VocabularyView />}
      </main>
    </div>
  );
}
