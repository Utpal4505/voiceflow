import { useState, type FormEvent } from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useVocabularyStore, VocabularyItem } from "../../stores/vocabularyStore";

export default function VocabularyView() {
  const { terms, addTerm, removeTerm } = useVocabularyStore();
  const [newTerm, setNewTerm] = useState("");
  const [newReplacement, setNewReplacement] = useState("");
  const [newCategory, setNewCategory] = useState<VocabularyItem["category"]>("tech");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newTerm.trim()) return;
    addTerm(newTerm, newReplacement, newCategory);
    setNewTerm("");
    setNewReplacement("");
  }

  const categoryBadges: Record<VocabularyItem["category"], string> = {
    tech: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    acronym: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    name: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    general: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header and Add Word Card */}
      <div className="surface-card rounded-xl p-4.5 flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Custom Vocabulary & Dictionary</h2>
          <p className="text-xs text-slate-400">
            Guide Whisper recognition for technical terminology, company names, and shorthand expansions
          </p>
        </div>

        {/* Add Term Form */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-white/[0.04]">
          <input
            type="text"
            placeholder="Custom term (e.g. Kubernetes, Next.js)"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            className="flex-1 w-full rounded-lg border border-white/[0.08] bg-[#121319] px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#FF6338]/80"
          />

          <input
            type="text"
            placeholder="Auto-replace with (optional)"
            value={newReplacement}
            onChange={(e) => setNewReplacement(e.target.value)}
            className="w-full sm:w-56 rounded-lg border border-white/[0.08] bg-[#121319] px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#FF6338]/80"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="rounded-lg border border-white/[0.08] bg-[#121319] px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="tech">Tech</option>
            <option value="acronym">Acronym</option>
            <option value="name">Name</option>
            <option value="general">General</option>
          </select>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-[#FF6338] px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-[#FF6338]/20 transition hover:bg-[#e6552e] cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Term</span>
          </button>
        </form>
      </div>

      {/* Vocabulary Terms Grid */}
      <div className="surface-card rounded-xl p-4.5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <span className="text-xs font-semibold text-slate-300">
            Dictionary Terms ({terms.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Automatically prioritized during voice recognition
          </span>
        </div>

        {terms.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No custom terms added yet. Add your first term above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {terms.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#121319] p-2.5 transition hover:border-white/10"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`rounded border px-1.5 py-0.2 text-[9px] font-medium uppercase ${
                      categoryBadges[item.category]
                    }`}
                  >
                    {item.category}
                  </span>

                  <span className="text-xs font-medium text-slate-200 truncate">
                    {item.term}
                  </span>

                  {item.replacement && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <ArrowRight className="h-2.5 w-2.5 text-slate-500" />
                      <span className="text-[#FF6338] font-mono">{item.replacement}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeTerm(item.id)}
                  className="rounded p-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer active:scale-95 shrink-0 ml-1.5"
                  title="Remove word"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
