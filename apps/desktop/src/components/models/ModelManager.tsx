import { ModelInfo, WhisperModelId } from "@voiceflow/contracts";

interface Props {
  models: ModelInfo[];
  downloadProgressMap: Record<string, number>;
  onDownload: (modelId: WhisperModelId) => void;
  onDelete: (modelId: WhisperModelId) => void;
  onSetActive: (modelId: WhisperModelId) => void;
}

export default function ModelManager({
  models,
  downloadProgressMap,
  onDownload,
  onDelete,
  onSetActive,
}: Props) {
  const installedCount = models.filter((m) => m.installed).length;
  const totalStorageMb = models
    .filter((m) => m.installed)
    .reduce((sum, m) => sum + m.sizeMb, 0);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Voice Recognition Models
          </h2>
          <p className="text-xs text-zinc-400">
            Download and switch Whisper models for your hardware and accuracy needs
          </p>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
          Storage Used: <span className="text-zinc-200 font-mono font-medium">{totalStorageMb} MB</span>
        </div>
      </div>

      {/* First-Run Setup Banner */}
      {installedCount === 0 && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-indigo-300">
              👋 Welcome! VoiceFlow needs a voice model to recognize speech
            </span>
            <span className="text-[11px] text-zinc-400">
              We recommend the Base (English) model (140MB) for fast, accurate typing.
            </span>
          </div>

          <button
            onClick={() => onDownload("base.en")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 cursor-pointer active:scale-95 shadow-md shadow-indigo-600/30 shrink-0"
          >
            Download Recommended (140 MB)
          </button>
        </div>
      )}

      {/* Model Comparison Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/40">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-medium text-zinc-400">
            <tr>
              <th className="py-2.5 px-4">Model</th>
              <th className="py-2.5 px-3">Size</th>
              <th className="py-2.5 px-3">Speed</th>
              <th className="py-2.5 px-3">Accuracy</th>
              <th className="py-2.5 px-3">Languages</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {models.map((model) => {
              const progress = downloadProgressMap[model.id];
              const isDownloading = typeof progress === "number";

              return (
                <tr
                  key={model.id}
                  className={`transition hover:bg-zinc-900/40 ${
                    model.active ? "bg-indigo-950/20" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-zinc-200">
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.id === "base.en" && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 font-mono text-[9px] text-indigo-300">
                          Recommended
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-zinc-400">
                    {model.sizeMb >= 1000
                      ? `${(model.sizeMb / 1000).toFixed(1)} GB`
                      : `${model.sizeMb} MB`}
                  </td>

                  <td className="py-3 px-3 text-zinc-400">{model.speed}</td>

                  <td className="py-3 px-3 text-amber-400">
                    {"★".repeat(model.accuracy)}
                    {"☆".repeat(5 - model.accuracy)}
                  </td>

                  <td className="py-3 px-3 capitalize text-zinc-400">
                    {model.languages === "english-only" ? "English" : "99 Languages"}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {isDownloading ? (
                      <div className="inline-flex flex-col items-end gap-1 w-28">
                        <span className="font-mono text-[10px] text-indigo-400">
                          {progress}% Downloading…
                        </span>
                        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-150"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : model.installed ? (
                      <div className="inline-flex items-center gap-2">
                        {model.active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => onSetActive(model.id)}
                            className="rounded bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-zinc-700 cursor-pointer active:scale-95"
                          >
                            Use
                          </button>
                        )}

                        <button
                          onClick={() => onDelete(model.id)}
                          title="Delete model file"
                          className="rounded p-1 text-zinc-500 transition hover:bg-red-950/40 hover:text-red-400 cursor-pointer active:scale-95"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onDownload(model.id)}
                        className="rounded bg-zinc-800 px-3 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-indigo-600 hover:text-white cursor-pointer active:scale-95"
                      >
                        Install
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
