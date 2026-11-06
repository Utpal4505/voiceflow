import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export default function MainWindow() {
  const [overlayVisible, setOverlayVisible] = useState(false);

  async function toggleOverlay() {
    if (overlayVisible) {
      await invoke("hide_overlay");
    } else {
      await invoke("show_overlay");
    }
    setOverlayVisible((v) => !v);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">VoiceFlow</h1>
        <p className="text-sm text-zinc-400">Voice typing for your entire desktop</p>
      </div>

      <button
        onClick={toggleOverlay}
        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium transition hover:bg-indigo-500 active:scale-95"
      >
        {overlayVisible ? "Hide Overlay" : "Show Overlay"}
      </button>

      <p className="text-xs text-zinc-600">Module 01 — Desktop Foundation ✓</p>
    </div>
  );
}
