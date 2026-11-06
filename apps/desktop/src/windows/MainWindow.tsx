import { invoke } from "@tauri-apps/api/core";

export default function MainWindow() {
  async function handleToggle() {
    await invoke("toggle_overlay");
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-zinc-950 text-white select-none">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">VoiceFlow</h1>
        <p className="text-sm text-zinc-400">Voice typing for your entire desktop</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleToggle}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium transition hover:bg-indigo-500 active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          Toggle Overlay
        </button>

        <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-xs text-zinc-400">
          <span>Global Shortcut:</span>
          <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-200">Ctrl + Space</kbd>
        </div>
      </div>

      <p className="text-xs text-zinc-600">Module 02 — Global Shortcut & Window Management ✓</p>
    </div>
  );
}
