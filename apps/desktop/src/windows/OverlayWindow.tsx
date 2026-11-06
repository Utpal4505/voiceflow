import { invoke } from "@tauri-apps/api/core";
import MicIcon from "../components/overlay/MicIcon";
import WaveformBars from "../components/overlay/WaveformBars";

export default function OverlayWindow() {
  return (
    <div className="flex h-full w-full items-center gap-4 rounded-2xl bg-zinc-900/95 px-5 py-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600">
        <MicIcon className="h-5 w-5 text-white" />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-hidden">
        <WaveformBars />
        <p className="truncate text-xs text-zinc-500">Listening…</p>
      </div>

      <button
        onClick={() => invoke("hide_overlay")}
        className="shrink-0 rounded-md px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}
