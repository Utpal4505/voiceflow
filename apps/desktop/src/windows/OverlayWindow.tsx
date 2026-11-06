import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import MicIcon from "../components/overlay/MicIcon";
import WaveformBars from "../components/overlay/WaveformBars";
import { useAudio } from "../hooks/useAudio";
import { useSettingsStore } from "../stores/settingsStore";

export default function OverlayWindow() {
  const { isRecording, volume, isSilent, error, startRecording, stopRecording } =
    useAudio((_chunk, seq) => {
      // Chunk ready for WebSocket transport (Module 04)
      if (seq % 10 === 0) {
        // Heartbeat
      }
    });

  const { selectedDeviceId, availableDevices, initDeviceListener } =
    useSettingsStore();

  useEffect(() => {
    const unlisten = initDeviceListener();
    startRecording();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        stopRecording();
        invoke("hide_overlay");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      stopRecording();
      unlisten();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [initDeviceListener, startRecording, stopRecording]);

  const activeDeviceLabel =
    availableDevices.find((d) => d.deviceId === selectedDeviceId)?.label ||
    "Default Microphone";

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-zinc-900/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-md select-none">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600">
          {isRecording && (
            <span
              className="absolute -inset-1 rounded-full bg-indigo-500 blur-xs transition-opacity duration-150"
              style={{ opacity: Math.max(0.3, volume * 1.5) }}
            />
          )}
          <MicIcon className="relative h-4 w-4 text-white" />
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
          <WaveformBars volume={volume} isRecording={isRecording} />
          <div className="flex items-center gap-2">
            <span className="truncate text-[11px] text-zinc-400">
              {isSilent ? (
                <span className="text-amber-400 font-medium">
                  ⚠️ No sound detected — is mic muted?
                </span>
              ) : error ? (
                <span className="text-red-400 font-medium truncate">{error}</span>
              ) : (
                "Listening… (16kHz PCM active)"
              )}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            stopRecording();
            invoke("hide_overlay");
          }}
          className="shrink-0 rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer active:scale-95"
        >
          Cancel
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[10px] text-zinc-500">
        <span className="truncate max-w-[280px]">Mic: {activeDeviceLabel}</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
}
