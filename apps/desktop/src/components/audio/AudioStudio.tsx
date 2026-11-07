import {
  Mic,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Sliders,
  Clock,
  ArrowRight,
  Square,
  ShieldAlert,
  Keyboard,
} from "lucide-react";
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
  onToggleDictation: () => void;
  hardwareProfile: any;
  activeModelName?: string;
  onNavigateHistory?: () => void;
  onNavigateModels?: () => void;
  liveText?: string;
  sessionState?: string;
  onClearText?: () => void;
}

export default function AudioStudio({
  selectedDeviceId,
  availableDevices,
  onSelectDevice,
  isRecording,
  volume,
  isSilent,
  error,
  onToggleDictation,
  activeModelName,
  onNavigateHistory,
  onNavigateModels,
  liveText = "",
  sessionState = "idle",
  onClearText,
}: Props) {
  const { history } = useHistoryStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPad, setCopiedPad] = useState(false);

  const recentItems = history.slice(0, 4);

  async function handleCopyItem(item: HistoryItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Fallback
    }
  }

  async function handleCopyPad() {
    if (!liveText.trim()) return;
    try {
      await navigator.clipboard.writeText(liveText);
      setCopiedPad(true);
      setTimeout(() => setCopiedPad(false), 1800);
    } catch {
      // Fallback
    }
  }

  const volumePercent = Math.round(volume * 100);
  const vuSegments = 24;
  const activeSegments = Math.round(volume * vuSegments);

  const wordCount = liveText.trim()
    ? liveText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start select-none font-sans">
      {/* Left Column: Interactive Voice Dictation Canvas & Feed (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        {/* Main Live Dictation Notepad Card */}
        <div className="surface-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
          {/* Subtle Ambient Backlight Glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#514BFA]/10 blur-3xl" />

          {/* Studio Header Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isRecording
                    ? "bg-[#514BFA] shadow-[0_0_10px_#7772FF] animate-pulse"
                    : sessionState === "processing"
                    ? "bg-[#A5A0FF] animate-spin"
                    : "bg-emerald-400"
                }`}
              />
              <span className="text-xs font-semibold text-white tracking-tight">
                {isRecording
                  ? "Dictation in Progress..."
                  : sessionState === "processing"
                  ? "Transcribing with Whisper..."
                  : "Voice Dictation Pad"}
              </span>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-slate-400">
                {wordCount} words
              </span>
            </div>

            <div className="flex items-center gap-2">
              {liveText && (
                <>
                  <button
                    onClick={handleCopyPad}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white cursor-pointer active:scale-95"
                    title="Copy text to clipboard"
                  >
                    {copiedPad ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onClearText && (
                    <button
                      onClick={onClearText}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300 cursor-pointer active:scale-95"
                      title="Clear notepad"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Dictation Output Canvas */}
          <div className="min-h-[160px] rounded-xl border border-white/[0.06] bg-[#0E1018] p-4 flex flex-col justify-between relative z-10">
            {liveText ? (
              <p className="text-sm text-slate-100 leading-relaxed font-normal whitespace-pre-wrap select-text">
                {liveText}
                {isRecording && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[#7772FF] animate-pulse align-middle" />
                )}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <Mic className="h-7 w-7 text-slate-600" />
                <span className="text-xs text-slate-400 font-medium">
                  {isRecording ? "Listening to your voice... Speak naturally" : "Ready for voice input"}
                </span>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Click the button below to dictate here, or use the global shortcut in any app.
                </p>
              </div>
            )}

            {/* Dynamic Soundwave Visualizer in Pad */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] mt-2">
              <WaveformBars volume={volume} isRecording={isRecording} barCount={16} />
              <span className="font-mono text-[10px] text-slate-500">
                {isRecording ? `${volumePercent}% Level` : "Acoustic Standby"}
              </span>
            </div>
          </div>

          {/* Primary Big Dictation Control Button */}
          <div className="flex items-center justify-between pt-1 relative z-10">
            <button
              onClick={onToggleDictation}
              className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl py-3 px-6 font-semibold text-xs transition cursor-pointer active:scale-[0.98] shadow-md ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/25 animate-pulse"
                  : "bg-gradient-to-r from-[#514BFA] to-[#7772FF] hover:brightness-110 text-white shadow-[#514BFA]/30"
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop Dictating</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Start Voice Dictation</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-950/40 border border-red-500/30 px-3 py-2 text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Recent Transcriptions Strip */}
        <div className="surface-card rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Recent Voice Dictations
              </h3>
            </div>
            {onNavigateHistory && (
              <button
                onClick={onNavigateHistory}
                className="flex items-center gap-1 text-[11px] text-[#7772FF] hover:text-[#A5A0FF] transition font-medium cursor-pointer"
              >
                <span>View Full Log</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>

          {recentItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No recent transcriptions. Dictate text to see your history here.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="surface-card-hover rounded-lg border border-white/[0.04] bg-[#0E1018] p-3 flex flex-col gap-1.5 transition"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.wordCount} words</span>
                      <button
                        onClick={() => handleCopyItem(item)}
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
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-normal">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Audio Hardware & Model Strip (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Audio Input & Calibrated VU Meter Card */}
        <div className="surface-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Microphone Hardware
              </h3>
              <p className="text-[11px] text-slate-400">Input source and sensitivity monitoring</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              16kHz Active
            </span>
          </div>

          {/* Device Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-slate-300">Active Microphone</label>
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => onSelectDevice(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/[0.08] bg-[#0E1018] px-3.5 py-2 text-xs text-slate-200 outline-none transition focus:border-[#514BFA]/80 cursor-pointer"
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
              <span className="font-medium text-slate-300">Sensitivity Level</span>
              <span className="font-mono text-xs text-slate-400">
                {isRecording ? `${volumePercent}%` : "Standby"}
              </span>
            </div>

            {/* Segmented VU Bars */}
            <div className="flex flex-col gap-1.5">
              <div className="flex h-3.5 w-full gap-1 rounded bg-[#0E1018] p-1 border border-white/[0.04]">
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
                      className={`flex-1 rounded-[1px] transition-colors duration-75 ${colorClass}`}
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

            {/* Diagnostic Status */}
            <div className="text-[11px] pt-1">
              {isRecording ? (
                isSilent ? (
                  <span className="text-amber-400 font-medium">
                    ⚠️ No audio detected — check mic hardware switch
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    ✓ Clear acoustic signal detected
                  </span>
                )
              ) : (
                <span className="text-slate-500">
                  Ready. Voice input converts into text via local Whisper engine.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Active Whisper Model Card */}
        <div
          onClick={onNavigateModels}
          className="surface-card surface-card-hover rounded-2xl p-5 flex items-center justify-between cursor-pointer transition"
          title="Click to view all models"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#514BFA]/15 text-[#7772FF] border border-[#514BFA]/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Active Neural Model
              </span>
              <span className="text-sm font-semibold text-white">
                {activeModelName || "Base (English)"}
              </span>
              <span className="text-[11px] text-slate-500">
                140 MB · Instant inference (~120ms)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#7772FF] font-medium">
            <span>Manage</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Global Typing Shortcut Card */}
        <div className="surface-card rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-[#7772FF]" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Global Voice Typing
              </span>
            </div>
            <kbd className="rounded-lg border border-white/10 bg-[#0E1018] px-2.5 py-1 font-mono text-xs font-semibold text-white shadow-inner">
              Ctrl + Space
            </kbd>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Press this hotkey anywhere in Windows—in VS Code, Slack, Word, or Chrome—to dictate directly into your active cursor without switching windows.
          </p>
        </div>
      </div>
    </div>
  );
}
