import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import MicIcon from "../components/overlay/MicIcon";
import WaveformBars from "../components/overlay/WaveformBars";

export default function OverlayWindow() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        invoke("hide_overlay");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-full w-full items-center gap-4 rounded-2xl bg-zinc-900/95 px-5 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-md select-none">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600">
        <span className="absolute -inset-0.5 rounded-full bg-indigo-500 opacity-75 blur-xs animate-pulse" />
        <MicIcon className="relative h-5 w-5 text-white" />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <WaveformBars />
        <p className="truncate text-xs font-medium text-zinc-400">Listening… (Press Esc to cancel)</p>
      </div>

      <button
        onClick={() => invoke("hide_overlay")}
        className="shrink-0 rounded-md px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white active:scale-95 cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
}
