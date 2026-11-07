import { useEffect } from "react";
import {
  X,
  Settings,
  Power,
  Activity,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { trackSettingsChanged } from "../../lib/telemetry";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  autostartEnabled: boolean;
  onToggleAutostart: () => void;
  hardwareProfile: any;
  onCheckUpdates: () => void;
  currentVersion?: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  autostartEnabled,
  onToggleAutostart,
  hardwareProfile,
  onCheckUpdates,
  currentVersion = "v0.1.0",
}: Props) {
  const { telemetryEnabled, setTelemetryEnabled } = useSettingsStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#12141F] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 bg-[#10121B]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#514BFA]/15 text-[#7772FF]">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Preferences & Settings</h2>
              <p className="text-[11px] text-slate-400">Configure background behaviors and system options</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* Section: System Startup */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              System Startup
            </span>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0E1018] p-3.5">
              <div className="flex items-center gap-3">
                <Power className={`h-4 w-4 ${autostartEnabled ? "text-emerald-400" : "text-slate-500"}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-200">Start on Windows Boot</span>
                  <span className="text-[11px] text-slate-500">
                    Launch VoiceFlow minimized in the background on startup
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleAutostart}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  autostartEnabled ? "bg-[#514BFA]" : "bg-white/[0.12]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    autostartEnabled ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Privacy & Telemetry */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Privacy & Diagnostics
            </span>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0E1018] p-3.5">
              <div className="flex items-center gap-3">
                <Activity className={`h-4 w-4 ${telemetryEnabled ? "text-[#7772FF]" : "text-slate-500"}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-200">Anonymous Telemetry</span>
                  <span className="text-[11px] text-slate-500">
                    Share anonymous hardware metrics to optimize Whisper inference
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const updated = !telemetryEnabled;
                  setTelemetryEnabled(updated);
                  trackSettingsChanged("telemetry_enabled", updated);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  telemetryEnabled ? "bg-[#514BFA]" : "bg-white/[0.12]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    telemetryEnabled ? "translate-x-4.5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Software Updates */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Application Updates
            </span>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0E1018] p-3.5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-200">VoiceFlow {currentVersion}</span>
                  <span className="text-[11px] text-slate-500">Built with Whisper.cpp and Tauri 2</span>
                </div>
              </div>

              <button
                onClick={onCheckUpdates}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer active:scale-95"
              >
                <RefreshCw className="h-3 w-3 text-slate-400" />
                <span>Check Updates</span>
              </button>
            </div>
          </div>

          {/* Section: Hardware Engine Telemetry */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Processing Engine Architecture
            </span>
            <div className="rounded-xl border border-white/[0.06] bg-[#0E1018] p-4 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-slate-500" />
                  CPU Model:
                </span>
                <span className="text-slate-200 font-medium font-mono text-[11px]">
                  {hardwareProfile?.cpuModel || "12th Gen Intel Core i5"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#7772FF]" />
                  Engine Acceleration:
                </span>
                <span className="text-emerald-400 font-medium text-[11px]">
                  {hardwareProfile?.statusLabel || "AVX2 Neural Vector Engine"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Worker Concurrency:</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {hardwareProfile?.logicalCores || 8} Threads
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-6 py-3.5 bg-[#10121B] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/[0.06] hover:bg-white/[0.1] px-4 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
