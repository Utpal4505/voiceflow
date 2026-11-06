import { create } from "zustand";

export interface VocabularyItem {
  id: string;
  term: string;
  replacement?: string;
  category: "tech" | "acronym" | "name" | "general";
  createdAt: number;
}

interface VocabularyStore {
  terms: VocabularyItem[];
  addTerm: (term: string, replacement?: string, category?: VocabularyItem["category"]) => void;
  removeTerm: (id: string) => void;
  clearTerms: () => void;
}

const STORAGE_KEY = "voiceflow_vocabulary_terms";

const DEFAULT_TERMS: VocabularyItem[] = [
  { id: "1", term: "VoiceFlow", category: "name", createdAt: Date.now() },
  { id: "2", term: "Whisper", category: "tech", createdAt: Date.now() },
  { id: "3", term: "Tauri", category: "tech", createdAt: Date.now() },
  { id: "4", term: "Kubernetes", replacement: "K8s", category: "tech", createdAt: Date.now() },
  { id: "5", term: "TypeScript", category: "tech", createdAt: Date.now() },
];

function loadFromStorage(): VocabularyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TERMS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TERMS;
  }
}

function saveToStorage(items: VocabularyItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export const useVocabularyStore = create<VocabularyStore>((set) => ({
  terms: loadFromStorage(),

  addTerm: (term, replacement, category = "general") => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const newItem: VocabularyItem = {
      id: crypto.randomUUID(),
      term: trimmed,
      replacement: replacement?.trim() || undefined,
      category,
      createdAt: Date.now(),
    };

    set((state) => {
      const updated = [newItem, ...state.terms];
      saveToStorage(updated);
      return { terms: updated };
    });
  },

  removeTerm: (id) => {
    set((state) => {
      const updated = state.terms.filter((t) => t.id !== id);
      saveToStorage(updated);
      return { terms: updated };
    });
  },

  clearTerms: () => {
    saveToStorage([]);
    set({ terms: [] });
  },
}));
