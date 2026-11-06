import { Mic, Volume2, ShieldAlert, Cpu, Sparkles, CheckCircle2, Sliders, Clock, Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import WaveformBars from "../overlay/WaveformBars";
import { useHistoryStore, HistoryItem } from "../../stores/historyStore";

interface Props {
  selectedDeviceId: string;
  availableDevices: Array<{ deviceId: string; label: string }>;
  onSelectDevice: (deviceId: string) => void;
  isRecording: boolean;
  volume: number;
  isSilent: boolean;
  error: string | null;
  onToggleTest: () => void;
  hardwareProfile: any;
  activeModelName?: string;
  onNavigateHistory?: () => void;
}

export default function AudioStudio({
  selectedDeviceId,
  availableDevices,
  onSelectDevice,
  isRecording,
  volume,
  isSilent,
  error,
  onToggleTest,
  hardwareProfile,
  activeModelName,
  onNavigateHistory,
}: Props) {
  const { history } = useHistoryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const recentItems = history.slice(0, 4);

  async function handleCopy(item: HistoryItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Fallback
    }
  }

  const volumePercent = Math.round(volume * 100);
  const vuSegments = 24;
  const activeSegments = Math.round(volume * vuSegments);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Left Column: Audio Input Studio & Hardware Testing (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Hardware Status Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="surface-card rounded-xl p-3.5 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Engine</span>
              <span className="text-xs font-semibold text-slate-200 truncate">
                {hardwareProfile?.statusLabel || "AVX2 CPU Engine"}
              </span>
            </div>
          </div>

          <div className="surface-card rounded-xl p-3.5 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF6338]/10 text-[#FF6338] border border-[#FF6338]/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Active Model</span>
              <span className="text-xs font-semibold text-slate-200 truncate">
                {activeModelName || "Base (English)"}
              </span>
            </div>
          </div>

          <div className="surface-card rounded-xl p-3.5 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Format</span>
              <span className="text-xs font-semibold text-slate-200 truncate">
                16kHz Mono PCM
              </span>
            </div>
          </div>
        </div>

        {/* Audio Input Device & Level Configuration */}
        <div className="surface-card rounded-xl p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Audio Input Configuration</h2>
              <p className="text-xs text-slate-400">Select and monitor your recording microphone</p>
            </div>

            <button
              onClick={onToggleTest}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 shadow-sm ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-[#FF6338] hover:bg-[#e6552e] text-white shadow-[#FF6338]/20"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>{isRecording ? "Stop Audio Test" : "Test Live Mic"}</span>
            </button>
          </div>

          {/* Device Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-300">Input Source</label>
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => onSelectDevice(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/[0.08] bg-[#1a1d26] px-3.5 py-2 text-xs text-slate-200 outline-none transition focus:border-[#FF6338]/80 cursor-pointer"
              >
                <option value="default">Default System Microphone</option>
                {availableDevices.map((device) => (
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

          {/* Calibrated VU Meter */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Acoustic Signal Level</span>
              <span className="font-mono text-xs text-slate-400">
                {isRecording ? `${volumePercent}%` : "Idle"}
              </span>
            </div>

            {/* Segmented VU Bars */}
            <div className="flex flex-col gap-1.5">
              <div className="flex h-4 w-full gap-1 rounded bg-[#121319] p-1 border border-white/[0.04]">
                {Array.from({ length: vuSegments }).map((_, i) => {
                  const isLit = isRecording && i < activeSegments;
                  const isPeak = i >= 20;
                  const isHigh = i >= 15 && i < 20;

                  const colorClass = isLit
                    ? isPeak
                      ? "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]"
                      : isHigh
                      ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                      : "bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                    : "bg-white/[0.04]";

                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-[1.5px] transition-colors duration-75 ${colorClass}`}
                    />
                  );
                })}
              </div>

              <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
                <span>-48dB</span>
                <span>-24dB</span>
                <span>-12dB</span>
                <span>-6dB</span>
                <span>0dB (Peak)</span>
              </div>
            </div>

            {/* Waveform Visualization & Feedback */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
              <WaveformBars volume={volume} isRecording={isRecording} barCount={14} />

              <div className="text-xs">
                {isRecording ? (
                  isSilent ? (
                    <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>No audio detected — verify hardware mute switch</span>
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Signal active (16kHz PCM clean)
                    </span>
                  )
                ) : (
                  <span className="text-slate-500">
                    Click &ldquo;Test Live Mic&rdquo; to test your mic before voice typing
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-950/40 border border-red-500/30 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Quick Recent Activity Feed & Keyboard Tips (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="surface-card rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Recent Dictations</h3>
            </div>
            {onNavigateHistory && (
              <button
                onClick={onNavigateHistory}
                className="flex items-center gap-1 text-[11px] text-[#FF6338] hover:text-[#ff7c57] transition font-medium cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {recentItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Mic className="h-6 w-6 text-slate-600" />
              <span>No dictations recorded yet</span>
              <p className="text-[11px] text-slate-600 max-w-xs">
                Press <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-slate-300">Ctrl + Space</kbd> anywhere to start voice typing.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="surface-card-hover rounded-lg border border-white/[0.04] bg-[#121319]/60 p-3 flex flex-col gap-1.5 transition"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.wordCount} words</span>
                      <button
                        onClick={() => handleCopy(item)}
                        className="rounded p-1 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Shortcut Card */}
        <div className="surface-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-200">Global Activation</span>
            <span className="text-[11px] text-slate-400">Hold or press to activate voice typing</span>
          </div>
          <kbd className="rounded-lg border border-white/10 bg-[#121319] px-3 py-1.5 font-mono text-xs font-medium text-slate-200 shadow-inner">
            Ctrl + Space
          </kbd>
        </div>
      </div>
    </div>
  );
}
