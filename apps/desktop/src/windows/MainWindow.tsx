import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
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
import { Mic, Cpu, History, BookOpen, ExternalLink } from "lucide-react";

export type NavTab = "studio" | "models" | "history" | "vocabulary";

export default function MainWindow() {
  const [activeTab, setActiveTab] = useState<NavTab>("studio");

  const {
    selectedDeviceId,
    availableDevices,
    setSelectedDeviceId,
    initDeviceListener,
  } = useSettingsStore();

  const {
    isConnected,
    status: wsStatus,
    models,
    downloadProgressMap,
    hardwareProfile,
    downloadModel,
    deleteModel,
    setActiveModel,
  } = useWebSocket();

  const { history } = useHistoryStore();
  const { terms } = useVocabularyStore();

  const { isRecording, volume, isSilent, error, startRecording, stopRecording } =
    useAudio();

  useEffect(() => {
    const unlisten = initDeviceListener();
    return () => unlisten();
  }, [initDeviceListener]);

  async function handleToggleOverlay() {
    await invoke("toggle_overlay");
  }

  const activeModel = models.find((m) => m.active);

  const navItems = [
    { id: "studio" as NavTab, label: "Audio Studio", icon: Mic },
    { id: "models" as NavTab, label: "Whisper Models", icon: Cpu },
    { id: "history" as NavTab, label: "History Log", icon: History, count: history.length },
    { id: "vocabulary" as NavTab, label: "Vocabulary", icon: BookOpen, count: terms.length },
  ];

  return (
    <div className="flex h-screen flex-col bg-[#0F1015] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Integrated Desktop Header Navigation */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#14161E] px-6 z-20">
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
                    ? "bg-[#1C1F2A] text-white shadow-sm border border-white/[0.08]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#FF6338]" : "text-slate-400"}`} />
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

        {/* Right Hardware Engine Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Engine Status */}
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0E0F14] px-3 py-1 text-xs text-slate-300">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-[11px] font-medium text-slate-300">
              {isConnected
                ? hardwareProfile?.statusLabel || "AVX2 Engine Ready"
                : `Engine: ${wsStatus}`}
            </span>
          </div>

          {/* Toggle Overlay Button */}
          <button
            onClick={handleToggleOverlay}
            className="flex items-center gap-1.5 rounded-lg bg-[#FF6338] px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-[#FF6338]/20 transition hover:bg-[#e6552e] cursor-pointer active:scale-95"
          >
            <span>Toggle Overlay</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </button>
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
            onToggleTest={isRecording ? stopRecording : startRecording}
            hardwareProfile={hardwareProfile}
            activeModelName={activeModel?.name}
            onNavigateHistory={() => setActiveTab("history")}
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
