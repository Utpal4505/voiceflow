import { useState, type FormEvent } from "react";
import { Plus, Trash2, ArrowRight, Sparkles, BookOpen, Layers, Lightbulb, Check } from "lucide-react";
import { useVocabularyStore, VocabularyItem } from "../../stores/vocabularyStore";

interface PresetPack {
  title: string;
  category: VocabularyItem["category"];
  terms: Array<{ term: string; replacement?: string }>;
}

const PRESET_PACKS: PresetPack[] = [
  {
    title: "Modern Developer & DevOps",
    category: "tech",
    terms: [
      { term: "Kubernetes", replacement: "K8s" },
      { term: "TypeScript", replacement: "TS" },
      { term: "GraphQL" },
      { term: "PostgreSQL", replacement: "Postgres" },
      { term: "TailwindCSS" },
      { term: "Docker" },
    ],
  },
  {
    title: "AI & Machine Learning",
    category: "tech",
    terms: [
      { term: "PyTorch" },
      { term: "HuggingFace" },
      { term: "LangChain" },
      { term: "TensorFlow" },
      { term: "VectorDB" },
      { term: "Whisper" },
    ],
  },
  {
    title: "SaaS & Productivity",
    category: "name",
    terms: [
      { term: "VoiceFlow" },
      { term: "GitHub" },
      { term: "Notion" },
      { term: "Linear" },
      { term: "Figma" },
      { term: "Postman" },
    ],
  },
];

export default function VocabularyView() {
  const { terms, addTerm, removeTerm } = useVocabularyStore();
  const [newTerm, setNewTerm] = useState("");
  const [newReplacement, setNewReplacement] = useState("");
  const [newCategory, setNewCategory] = useState<VocabularyItem["category"]>("tech");
  const [recentlyAddedPack, setRecentlyAddedPack] = useState<string | null>(null);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newTerm.trim()) return;
    addTerm(newTerm, newReplacement, newCategory);
    setNewTerm("");
    setNewReplacement("");
  }

  function handleAddPack(pack: PresetPack) {
    pack.terms.forEach(({ term, replacement }) => {
      const alreadyExists = terms.some(
        (t) => t.term.toLowerCase() === term.toLowerCase()
      );
      if (!alreadyExists) {
        addTerm(term, replacement, pack.category);
      }
    });
    setRecentlyAddedPack(pack.title);
    setTimeout(() => setRecentlyAddedPack(null), 2000);
  }

  const categoryBadges: Record<VocabularyItem["category"], string> = {
    tech: "bg-[#FF5722]/15 text-[#FF7A50] border-[#FF5722]/30",
    acronym: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    name: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    general: "bg-slate-500/15 text-slate-300 border-slate-500/30",
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
            className="flex-1 w-full rounded-lg border border-white/[0.08] bg-[#141414] px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#FF5722] shadow-inner"
          />

          <input
            type="text"
            placeholder="Auto-replace with (optional)"
            value={newReplacement}
            onChange={(e) => setNewReplacement(e.target.value)}
            className="w-full sm:w-56 rounded-lg border border-white/[0.08] bg-[#141414] px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#FF5722] shadow-inner"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="rounded-lg border border-white/[0.08] bg-[#141414] px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer shadow-inner"
          >
            <option value="tech">Tech</option>
            <option value="acronym">Acronym</option>
            <option value="name">Name</option>
            <option value="general">General</option>
          </select>

          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#FF6347] px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-[#FF5722]/35 transition hover:brightness-110 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Term</span>
          </button>
        </form>
      </div>

      {/* Vocabulary Terms Grid */}
      <div className="surface-card rounded-xl p-4.5 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#FF5722]" />
            <span className="text-xs font-semibold text-slate-200">
              Dictionary Terms ({terms.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Automatically prioritized during voice recognition
          </span>
        </div>

        {terms.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No custom terms added yet. Add your first term above or choose a preset pack below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {terms.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#141414] p-2.5 transition hover:border-white/10 shadow-inner"
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
                      <span className="text-[#FF7A50] font-mono">{item.replacement}</span>
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

      {/* Preset Terminology Packs Strip (Enriches Layout & Fills Empty Space) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_PACKS.map((pack) => {
          const isAdded = recentlyAddedPack === pack.title;
          const allAlreadyAdded = pack.terms.every((t) =>
            terms.some((item) => item.term.toLowerCase() === t.term.toLowerCase())
          );

          return (
            <div
              key={pack.title}
              className="surface-card rounded-xl p-4 flex flex-col justify-between gap-3"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-[#FF5722]" />
                    <span className="text-xs font-semibold text-white">
                      {pack.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {pack.terms.length} terms
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pack.terms.map(({ term }) => (
                    <span
                      key={term}
                      className="rounded-md border border-white/[0.06] bg-[#141414] px-2 py-0.5 text-[10px] text-slate-300 font-mono"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAddPack(pack)}
                disabled={allAlreadyAdded}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer active:scale-95 ${
                  allAlreadyAdded
                    ? "border border-white/[0.06] bg-[#141414] text-slate-500 cursor-default"
                    : isAdded
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-[#FF5722]/15 text-[#FF7A50] hover:bg-[#FF5722] hover:text-white border border-[#FF5722]/30 shadow-xs shadow-[#FF5722]/20"
                }`}
              >
                {allAlreadyAdded ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>All Added</span>
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Added Pack!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>Add Preset Pack</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Whisper Acoustic Tuning Pro-Tips Card */}
      <div className="surface-card rounded-xl p-4 flex items-start gap-3.5 border border-white/[0.06]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/25">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold text-white">How VoiceFlow Custom Vocabulary Works</span>
          <p className="text-slate-400 leading-relaxed">
            Whisper uses neural beam-search decoding. When you add company names, developer terminology, or acronyms to your dictionary, VoiceFlow prompts the neural acoustic decoder with these terms before transcribing, drastically reducing phonetic misinterpretations (like converting <em>&quot;Kubernetes&quot;</em> into <em>&quot;cooper netties&quot;</em>).
          </p>
        </div>
      </div>
    </div>
  );
}
