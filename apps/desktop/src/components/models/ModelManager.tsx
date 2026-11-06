import { useState } from "react";
import { ModelInfo, WhisperModelId } from "@voiceflow/contracts";
import {
  Download,
  Trash2,
  HardDrive,
  Globe2,
  Search,
  Cpu,
} from "lucide-react";

interface Props {
  models: ModelInfo[];
  downloadProgressMap: Record<string, number>;
  onDownload: (modelId: WhisperModelId) => void;
  onDelete: (modelId: WhisperModelId) => void;
  onSetActive: (modelId: WhisperModelId) => void;
}

type FilterType = "all" | "english" | "multilingual" | "installed";

// Approximate memory footprints for Whisper model architectures
const RAM_REQUIREMENTS: Record<string, string> = {
  "tiny.en": "~150 MB",
  tiny: "~150 MB",
  "base.en": "~250 MB",
  "base.en-q5": "~180 MB",
  base: "~250 MB",
  "small.en": "~600 MB",
  "small.en-q5": "~400 MB",
  small: "~600 MB",
  "medium.en": "~1.8 GB",
  medium: "~1.8 GB",
  "large-v3": "~3.5 GB",
};

export default function ModelManager({
  models,
  downloadProgressMap,
  onDownload,
  onDelete,
  onSetActive,
}: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const installedCount = models.filter((m) => m.installed).length;
  const totalStorageMb = models
    .filter((m) => m.installed)
    .reduce((sum, m) => sum + m.sizeMb, 0);

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "english") return model.languages === "english-only";
    if (filter === "multilingual") return model.languages === "multilingual";
    if (filter === "installed") return model.installed;
    return true;
  });

  return (
    <section className="flex flex-col gap-5 w-full select-none">
      {/* Header and Control Bar */}
      <div className="surface-card rounded-xl p-4.5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Speech Recognition Models</h2>
            <p className="text-xs text-slate-400">
              Download and manage local neural Whisper models optimized for AVX2 execution
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#121319] px-3 py-1.5 text-xs text-slate-300">
              <HardDrive className="h-3.5 w-3.5 text-[#FF6338]" />
              <span>Storage Used:</span>
              <span className="font-mono font-medium text-white">
                {totalStorageMb >= 1000
                  ? `${(totalStorageMb / 1000).toFixed(1)} GB`
                  : `${totalStorageMb} MB`}
              </span>
            </div>

            <span className="rounded-lg border border-white/[0.08] bg-[#121319] px-3 py-1.5 text-xs font-mono text-slate-400">
              {installedCount} of {models.length} Installed
            </span>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(
              [
                { id: "all", label: "All Models" },
                { id: "english", label: "English Only" },
                { id: "multilingual", label: "Multilingual" },
                { id: "installed", label: "Installed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 whitespace-nowrap ${
                  filter === tab.id
                    ? "bg-[#FF6338] text-white shadow-sm shadow-[#FF6338]/20"
                    : "bg-[#121319] text-slate-400 hover:bg-[#1a1d26] hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#121319] pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#FF6338]/80"
            />
          </div>
        </div>
      </div>

      {/* Model Table */}
      <div className="surface-card rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/[0.06] bg-[#121319] text-[11px] font-medium text-slate-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Model Architecture</th>
              <th className="py-3 px-3 font-semibold">Disk Size</th>
              <th className="py-3 px-3 font-semibold">RAM Usage</th>
              <th className="py-3 px-3 font-semibold">Inference Latency</th>
              <th className="py-3 px-3 font-semibold">Accuracy</th>
              <th className="py-3 px-3 font-semibold">Languages</th>
              <th className="py-3 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredModels.map((model) => {
              const progress = downloadProgressMap[model.id];
              const isDownloading = typeof progress === "number";
              const ramReq = RAM_REQUIREMENTS[model.id] || "~500 MB";

              return (
                <tr
                  key={model.id}
                  className={`transition-colors duration-150 hover:bg-white/[0.02] ${
                    model.active ? "bg-[#FF6338]/[0.06]" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{model.name}</span>
                      {model.id === "base.en" && (
                        <span className="rounded bg-[#FF6338]/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#FF6338] border border-[#FF6338]/30">
                          Recommended
                        </span>
                      )}
                      {model.id.includes("q5") && (
                        <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-indigo-300 border border-indigo-500/30">
                          Q5 Quantized
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-400">
                    {model.sizeMb >= 1000
                      ? `${(model.sizeMb / 1000).toFixed(1)} GB`
                      : `${model.sizeMb} MB`}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-slate-500" />
                      {ramReq}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-mono text-xs text-slate-300">
                      {model.speed === "Instant"
                        ? "⚡ Instant (~120ms)"
                        : model.speed === "Fast"
                        ? "⚡ Fast (~250ms)"
                        : model.speed === "Good"
                        ? "⚡ Moderate (~550ms)"
                        : "⏳ Heavy (~1400ms)"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-1.5 w-16 rounded-full bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full bg-emerald-400"
                          style={{ width: `${(model.accuracy / 5) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {Math.round((model.accuracy / 5) * 100)}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-400">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <Globe2 className="h-3 w-3 text-slate-500" />
                      {model.languages === "english-only" ? "English" : "99 Languages"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {isDownloading ? (
                      <div className="inline-flex flex-col items-end gap-1 w-28">
                        <span className="font-mono text-[10px] text-[#FF6338] font-medium">
                          {progress}% Downloading
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full bg-[#FF6338] transition-all duration-150"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : model.installed ? (
                      <div className="inline-flex items-center gap-2">
                        {model.active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => onSetActive(model.id)}
                            className="rounded-lg bg-white/[0.07] px-3 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-white/[0.12] hover:text-white cursor-pointer active:scale-95"
                          >
                            Use
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(model.id)}
                          title="Delete model file"
                          className="rounded-lg p-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownload(model.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#121319] px-3 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-[#FF6338] hover:border-[#FF6338] hover:text-white cursor-pointer active:scale-95"
                      >
                        <Download className="h-3 w-3" />
                        <span>Install</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
