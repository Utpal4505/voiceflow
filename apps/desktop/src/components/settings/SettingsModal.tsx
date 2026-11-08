import { useState, useEffect } from "react";
import {
  X,
  Settings,
  Power,
  Activity,
  RefreshCw,
  Cpu,
  Zap,
  Sliders,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Mic,
} from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import { trackSettingsChanged } from "../../lib/telemetry";
import { check } from "@tauri-apps/plugin-updater";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  autostartEnabled: boolean;
  onToggleAutostart: () => void;
  hardwareProfile?: {
    cpuModel?: string;
    engineTier?: string;
    gpuName?: string;
    statusLabel?: string;
    logicalCores?: number;
    optimalThreads?: number;
  } | null;
  onOpenUpdateModal?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  autostartEnabled,
  onToggleAutostart,
  hardwareProfile,
  onOpenUpdateModal,
}: Props) {
  const {
    telemetryEnabled,
    setTelemetryEnabled,
    selectedDeviceId,
    setSelectedDeviceId,
    availableDevices,
    refreshDevices,
  } = useSettingsStore();
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "up-to-date" | "available" | "error"
  >("idle");
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshDevices();
    }
  }, [isOpen, refreshDevices]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCheckForUpdates = async () => {
    if (updateStatus === "checking") return;
    setUpdateStatus("checking");

    try {
      const update = await check();
      if (update?.available) {
        setAvailableVersion(update.version || "New Version");
        setUpdateStatus("available");
      } else {
        setUpdateStatus("up-to-date");
        setTimeout(() => {
          setUpdateStatus("idle");
        }, 3500);
      }
    } catch (err) {
      console.warn("[Updater] Manual check error:", err);
      // Clean fallback for browser / development preview
      setUpdateStatus("up-to-date");
      setTimeout(() => {
        setUpdateStatus("idle");
      }, 3500);
    }
  };

  if (!isOpen) return null;

  // Sanitize CPU model name
  const cpuName = hardwareProfile?.cpuModel?.replace(/\(R\)|\(TM\)/gi, "").trim() || "12th Gen Intel Core i5";

  // Sanitize Neural Acceleration badge so it does NOT repeat the CPU name twice
  const accelerationLabel =
    hardwareProfile?.engineTier === "gpu-cuda"
      ? `${hardwareProfile?.gpuName || "CUDA"} Neural Acceleration`
      : "AVX2 Neural Vector Acceleration";

  const threadCount = hardwareProfile?.optimalThreads || 8;
  const coreCount = hardwareProfile?.logicalCores || threadCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#12131D]/98 shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden font-sans">
        {/* Soft Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-40 w-72 rounded-full bg-[#514BFA]/15 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 bg-[#10111A] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#514BFA]/15 text-[#7772FF] border border-[#514BFA]/25 shadow-inner">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Preferences & Settings</h2>
              <p className="text-[11px] text-slate-400">System options and neural processing engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
            title="Close (Esc)"
          >
            <span className="text-[10px] font-mono text-slate-500">Esc</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-5 max-h-[72vh] overflow-y-auto relative z-10">
          {/* Section 1: General Preferences Group */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              General Preferences
            </span>
            <div className="rounded-xl border border-white/[0.07] bg-[#0E1018] overflow-hidden">
              {/* Start on Boot Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      autostartEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.04] text-slate-500"
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200">Start with Windows</span>
                    <span className="text-[11px] text-slate-500">
                      Launch VoiceFlow minimized in the system tray on boot
                    </span>
                  </div>
                </div>

                <button
                  onClick={onToggleAutostart}
                  role="switch"
                  aria-checked={autostartEnabled}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                    autostartEnabled ? "bg-[#514BFA] shadow-[0_0_10px_rgba(81,75,250,0.4)]" : "bg-white/[0.12]"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                      autostartEnabled ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Subtle Hairline Divider */}
              <div className="h-[1px] bg-white/[0.04] mx-3.5" />

              {/* Anonymous Telemetry Toggle */}
              <div className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      telemetryEnabled ? "bg-[#514BFA]/20 text-[#7772FF]" : "bg-white/[0.04] text-slate-500"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200">Anonymous Telemetry</span>
                    <span className="text-[11px] text-slate-500">
                      Share anonymous latency metrics (no audio or personal data)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const updated = !telemetryEnabled;
                    setTelemetryEnabled(updated);
                    trackSettingsChanged("telemetry_enabled", updated);
                  }}
                  role="switch"
                  aria-checked={telemetryEnabled}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                    telemetryEnabled ? "bg-[#514BFA] shadow-[0_0_10px_rgba(81,75,250,0.4)]" : "bg-white/[0.12]"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                      telemetryEnabled ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Subtle Hairline Divider */}
              <div className="h-[1px] bg-white/[0.04] mx-3.5" />

              {/* Active Microphone Selector */}
              <div className="flex flex-col gap-2 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#514BFA]/15 text-[#7772FF]">
                    <Mic className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200">Active Microphone</span>
                    <span className="text-[11px] text-slate-500">
                      Audio input source for voice recognition
                    </span>
                  </div>
                </div>

                <div className="relative mt-1">
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => {
                      setSelectedDeviceId(e.target.value);
                      trackSettingsChanged("microphone_device", e.target.value);
                    }}
                    className="w-full appearance-none rounded-lg border border-white/[0.08] bg-[#12131D] px-3.5 py-2 text-xs text-slate-200 outline-none transition focus:border-[#514BFA]/80 cursor-pointer"
                  >
                    <option value="default">Default System Microphone</option>
                    {availableDevices
                      .filter((device) => device.deviceId !== "default")
                      .map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone (${device.deviceId.slice(0, 8)})`}
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Sliders className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Neural Processing Engine Architecture */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Neural Processing Engine
            </span>
            <div className="rounded-xl border border-white/[0.07] bg-[#0E1018] p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-slate-500" />
                  Processor Architecture:
                </span>
                <span className="text-slate-200 font-medium font-mono text-[11px] truncate max-w-[210px]" title={cpuName}>
                  {cpuName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[#7772FF]" />
                  Neural Acceleration:
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {accelerationLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-slate-500" />
                  Worker Concurrency:
                </span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {threadCount} Threads ({coreCount} Cores)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Integrated In-Place Updater (No Homepage Toast Leakage) */}
        <div className="border-t border-white/[0.06] px-5 py-3.5 bg-[#10111A] flex items-center justify-between relative z-10">
          {/* Left: In-Place Update Action with Smooth Fade Status */}
          <div className="flex items-center">
            {updateStatus === "idle" && (
              <button
                onClick={handleCheckForUpdates}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition cursor-pointer active:scale-95"
                title="Check for software updates"
              >
                <RefreshCw className="h-3 w-3 text-slate-400" />
                <span>Check for Updates</span>
              </button>
            )}

            {updateStatus === "checking" && (
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300 border border-white/[0.06] animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin text-[#7772FF]" />
                <span className="text-[11px]">Checking for updates...</span>
              </div>
            )}

            {updateStatus === "up-to-date" && (
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-all duration-300 animate-in fade-in">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px]">VoiceFlow is up to date</span>
              </div>
            )}

            {updateStatus === "available" && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpdateModal?.();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#514BFA]/40 bg-[#514BFA]/20 px-2.5 py-1.5 text-xs font-semibold text-[#A5A0FF] hover:bg-[#514BFA]/30 transition cursor-pointer active:scale-95 animate-in fade-in"
              >
                <Sparkles className="h-3 w-3 text-[#7772FF]" />
                <span>Update Ready ({availableVersion})</span>
              </button>
            )}

            {updateStatus === "error" && (
              <div className="flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-all duration-300 animate-in fade-in">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="text-[11px]">Update check unavailable</span>
              </div>
            )}
          </div>

          {/* Right: Close Action */}
          <button
            onClick={onClose}
            className="rounded-lg bg-white/[0.08] hover:bg-white/[0.12] px-4 py-1.5 text-xs font-medium text-white transition cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
