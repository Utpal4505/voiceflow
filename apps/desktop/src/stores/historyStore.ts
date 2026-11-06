import { create } from "zustand";

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  durationMs: number;
  modelId?: string;
  charCount: number;
  wordCount: number;
}

interface HistoryStore {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, "id" | "charCount" | "wordCount">) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

const STORAGE_KEY = "voiceflow_transcription_history";

function loadFromStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToStorage(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {
    // Ignore storage quota errors
  }
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  history: loadFromStorage(),

  addHistoryItem: (item) => {
    const trimmed = item.text.trim();
    if (!trimmed) return;

    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      charCount: trimmed.length,
      wordCount: words,
    };

    set((state) => {
      const updated = [newItem, ...state.history].slice(0, 100);
      saveToStorage(updated);
      return { history: updated };
    });
  },

  removeHistoryItem: (id) => {
    set((state) => {
      const updated = state.history.filter((i) => i.id !== id);
      saveToStorage(updated);
      return { history: updated };
    });
  },

  clearHistory: () => {
    saveToStorage([]);
    set({ history: [] });
  },
}));
