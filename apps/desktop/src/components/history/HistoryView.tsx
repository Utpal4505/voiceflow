import { useState } from "react";
import { Search, Copy, Check, Trash2, Clock, FileText } from "lucide-react";
import { useHistoryStore, HistoryItem } from "../../stores/historyStore";

export default function HistoryView() {
  const { history, removeHistoryItem, clearHistory } = useHistoryStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleCopy(item: HistoryItem) {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Fallback
    }
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header and Filter Controls */}
      <div className="surface-card rounded-xl p-4.5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Transcription History</h2>
            <p className="text-xs text-slate-400">
              Browse, search, and copy your recent voice dictations
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 cursor-pointer active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search through past transcriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-[#121319] pl-8 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#FF6338]/80"
          />
        </div>
      </div>

      {/* History Items Feed */}
      {filteredHistory.length === 0 ? (
        <div className="surface-card rounded-xl p-12 text-center flex flex-col items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-slate-600" />
          <span className="text-sm font-medium text-slate-300">
            {searchTerm ? "No matching transcriptions found" : "No transcriptions yet"}
          </span>
          <p className="text-xs text-slate-500 max-w-sm">
            Press <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-slate-300">Ctrl + Space</kbd> anywhere to start voice typing.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="surface-card surface-card-hover rounded-xl p-4 flex flex-col gap-2.5 transition"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="h-3 w-3 text-slate-500" />
                    {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                  </span>
                  <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-slate-400">
                    {item.wordCount} words
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white cursor-pointer active:scale-95"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? (
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

                  <button
                    onClick={() => removeHistoryItem(item.id)}
                    className="rounded-lg p-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer active:scale-95"
                    title="Delete transcription"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed select-text font-normal">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
