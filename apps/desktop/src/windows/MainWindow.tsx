import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState, useRef, useCallback } from "react";
import AudioStudio from "../components/audio/AudioStudio";
import ModelManager from "../components/models/ModelManager";
import HistoryView from "../components/history/HistoryView";
import VocabularyView from "../components/vocabulary/VocabularyView";
import SettingsModal from "../components/settings/SettingsModal";
import UpdateModal from "../components/updater/UpdateModal";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useSettingsStore } from "../stores/settingsStore";
import { useHistoryStore } from "../stores/historyStore";
import { useVocabularyStore } from "../stores/vocabularyStore";
import VoiceFlowLogo from "../components/common/VoiceFlowLogo";
import { Mic, Cpu, History, BookOpen, Loader2, Settings } from "lucide-react";
import { trackAppLaunched } from "../lib/telemetry";

export type NavTab = "studio" | "models" | "history" | "vocabulary";

export default function MainWindow() {
  const [activeTab, setActiveTab] = useState<NavTab>("studio");
  const [liveText, setLiveText] = useState("");
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentSessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasInsertedRef = useRef(false);
  const hasTriggeredInitialDownloadRef = useRef(false);
  const triggerUpdateCheckRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    invoke<boolean>("get_autostart_status")
      .then((enabled) => setAutostartEnabled(enabled))
      .catch(() => {});
    trackAppLaunched();

    let unlisten: (() => void) | undefined;
    listen<boolean>("autostart-changed", (event) => {
      if (typeof event.payload === "boolean") {
        setAutostartEnabled(event.payload);
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {});

    return () => {
      unlisten?.();
    };
  }, []);

  const handleToggleAutostart = async () => {
    try {
      const updated = await invoke<boolean>("set_autostart_status", {
        enabled: !autostartEnabled,
      });
      setAutostartEnabled(updated);
    } catch (err) {
      console.error("Failed to toggle autostart:", err);
    }
  };

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

  const hasTrackedLaunchRef = useRef(false);
  useEffect(() => {
    if (hardwareProfile && !hasTrackedLaunchRef.current) {
      hasTrackedLaunchRef.current = true;
      trackAppLaunched({
        engineTier: hardwareProfile.engineTier,
        recommendedModelId: hardwareProfile.recommendedModelId,
        cpuModel: hardwareProfile.cpuModel,
        logicalCores: hardwareProfile.logicalCores,
      });
    }
  }, [hardwareProfile]);

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

  // Record finalized transcription into local history
  const handleFinalizeTranscription = useCallback(
    (finalText: string) => {
      if (hasInsertedRef.current || !finalText) return;
      hasInsertedRef.current = true;

      // Add to persistent history
      addHistoryItem({
        text: finalText,
        timestamp: Date.now(),
        durationMs: Date.now() - (startTimeRef.current || Date.now()),
      });
      console.log("[MainWindow] Transcription finalized and saved to history");
    },
    [addHistoryItem]
  );

  const handleFinalizeTranscriptionRef = useRef(handleFinalizeTranscription);
  handleFinalizeTranscriptionRef.current = handleFinalizeTranscription;

  // Start dictation session
  const handleStartDictation = useCallback(() => {
    if (currentSessionIdRef.current) {
      resetSession(currentSessionIdRef.current);
    }
    const sessionId = crypto.randomUUID();
    currentSessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    hasInsertedRef.current = false;

    startSession(sessionId);
    startRecordingRef.current();
  }, [startSession, resetSession]);

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
      currentSessionIdRef.current = null;
    }
    stopRecordingRef.current();
    hasInsertedRef.current = false;
  }, [cancelSession]);

  const handleCancelDictationRef = useRef(handleCancelDictation);
  handleCancelDictationRef.current = handleCancelDictation;

  // When transcription is received in MainWindow, show text in pad and store in history without stealing focus
  useEffect(() => {
    if (sessionState === "done" && transcript?.text) {
      setLiveText(transcript.text);
      if (!hasInsertedRef.current) {
        handleFinalizeTranscriptionRef.current(transcript.text);
      }
    }
  }, [sessionState, transcript]);

  // Keyboard shortcut listener within MainWindow (Enter to stop, Esc to cancel during recording)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isDictating = isRecording || sessionState === "recording";
      if (isDictating) {
        if (e.key === "Enter") {
          e.preventDefault();
          console.log("[MainWindow] Enter pressed during recording, stopping dictation...");
          handleStopDictationRef.current();
        } else if (e.key === "Escape") {
          e.preventDefault();
          console.log("[MainWindow] Escape pressed during recording, cancelling dictation...");
          handleCancelDictationRef.current();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, sessionState]);

  // Audio device change listener
  useEffect(() => {
    const unlisten = initDeviceListener();
    return () => unlisten();
  }, [initDeviceListener]);

  // First-run automatic download of recommended model
  useEffect(() => {
    if (
      isConnected &&
      models.length > 0 &&
      !hasTriggeredInitialDownloadRef.current
    ) {
      hasTriggeredInitialDownloadRef.current = true;
      const anyInstalled = models.some((m) => m.installed);
      const isBaseDownloading = typeof downloadProgressMap["base.en"] === "number";

      if (!anyInstalled && !isBaseDownloading) {
        downloadModel("base.en");
      }
    }
  }, [isConnected, models, downloadProgressMap, downloadModel]);

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
    <div className="flex h-screen flex-col bg-[#212121] bg-warm-dot-grid text-slate-100 select-none overflow-hidden font-sans relative">
      {/* Subtle Atmospheric Warm Glow Mesh matching landing page */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-[#514BFA]/[0.08] blur-3xl z-0" />

      {/* Top Integrated Desktop Header Navigation */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#181818]/90 backdrop-blur-md px-6 z-20">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-3">
          <VoiceFlowLogo className="h-7 w-7 rounded-lg shadow-sm shadow-[#514BFA]/30" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white">VoiceFlow</span>
          </div>
        </div>

        {/* Center: Clean Segmented Navigation Rail (matches web studio switcher) */}
        <nav className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#141414] p-1 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#282828] text-white shadow-xs border border-white/[0.14] font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "text-[#7772FF]" : "text-slate-400"}`}
                />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 font-mono text-[9px] text-slate-300">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Status Indicator & Settings Trigger */}
        <div className="flex items-center gap-3">
          {/* Live Dictation State / Engine Badge */}
          {isRecording ? (
            <div className="flex items-center gap-2 rounded-full border border-[#FF5722]/40 bg-[#FF5722]/15 px-3 py-1 text-xs text-[#FFA07A] animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#FF5722] shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
              <span className="text-[11px] font-semibold">Listening to Voice...</span>
            </div>
          ) : sessionState === "processing" ? (
            <div className="flex items-center gap-2 rounded-full border border-[#514BFA]/40 bg-[#514BFA]/15 px-3 py-1 text-xs text-[#A5A0FF]">
              <Loader2 className="h-3 w-3 animate-spin text-[#7772FF]" />
              <span className="text-[11px] font-semibold">Transcribing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#141414] px-3 py-1.5 text-xs text-slate-300 shadow-inner">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected
                    ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-[11px] font-medium text-slate-300">
                {isConnected ? "Engine Ready" : `Engine: ${wsStatus}`}
              </span>
            </div>
          )}

          {/* Clean Settings Gear Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-lg border border-white/[0.08] bg-[#141414] hover:bg-white/[0.06] hover:border-white/[0.16] p-2 text-slate-400 hover:text-white transition cursor-pointer active:scale-95 shadow-inner"
            title="Open Preferences & Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Auto-Updater Modal (Only shows when an actual update is available) */}
      <UpdateModal triggerCheckRef={triggerUpdateCheckRef} />

      {/* Preferences & System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autostartEnabled={autostartEnabled}
        onToggleAutostart={handleToggleAutostart}
        hardwareProfile={hardwareProfile}
        onOpenUpdateModal={() => triggerUpdateCheckRef.current?.()}
      />

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
