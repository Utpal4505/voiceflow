import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import ModelManager from "../components/models/ModelManager";
import WaveformBars from "../components/overlay/WaveformBars";
import { useAudio } from "../hooks/useAudio";
import { useWebSocket } from "../hooks/useWebSocket";
import { useSettingsStore } from "../stores/settingsStore";

export default function MainWindow() {
  const {
    selectedDeviceId,
    availableDevices,
    setSelectedDeviceId,
    initDeviceListener,
  } = useSettingsStore();

  const {
    isConnected,
    status: wsStatus,
    models,
    downloadProgressMap,
    hardwareProfile,
    downloadModel,
    deleteModel,
    setActiveModel,
  } = useWebSocket();

  const { isRecording, volume, isSilent, error, startRecording, stopRecording } =
    useAudio();

  useEffect(() => {
    const unlisten = initDeviceListener();
    return () => unlisten();
  }, [initDeviceListener]);

  async function handleToggleOverlay() {
    await invoke("toggle_overlay");
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white select-none">
      <header className="flex items-center justify-between border-b border-zinc-800/80 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-sm shadow-md shadow-indigo-600/30">
            VF
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">VoiceFlow</h1>
            <p className="text-xs text-zinc-400">Desktop Voice Typing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="text-zinc-300">
              {isConnected
                ? hardwareProfile?.statusLabel || "Engine Connected (:3001)"
                : `Engine: ${wsStatus}`}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            <span>Activation:</span>
            <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-200">
              Ctrl + Space
            </kbd>
          </div>

          <button
            onClick={handleToggleOverlay}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium transition hover:bg-indigo-500 active:scale-95 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            Toggle Overlay
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl flex flex-col gap-6">
          {/* Module 08: Model Manager Component */}
          <ModelManager
            models={models}
            downloadProgressMap={downloadProgressMap}
            onDownload={downloadModel}
            onDelete={deleteModel}
            onSetActive={setActiveModel}
          />

          {/* Microphone Settings */}
          <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Microphone Settings
              </h2>
              <p className="text-xs text-zinc-400">
                Select and verify your preferred recording hardware
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-300">
                Active Microphone
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 outline-none transition focus:border-indigo-500 cursor-pointer"
              >
                <option value="default">Default System Microphone</option>
                {availableDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">
                  Hardware Test (16kHz Quality Pipeline)
                </span>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition cursor-pointer active:scale-95 ${
                    isRecording
                      ? "bg-red-600/90 hover:bg-red-500 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  {isRecording ? "Stop Test" : "Test Mic Level"}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <WaveformBars volume={volume} isRecording={isRecording} />
                <span className="text-xs text-zinc-400">
                  {isRecording ? (
                    isSilent ? (
                      <span className="text-amber-400">
                        ⚠️ No audio detected — check hardware mute switch
                      </span>
                    ) : (
                      `Input Level: ${Math.round(volume * 100)}%`
                    )
                  ) : (
                    "Click Test Mic Level to verify"
                  )}
                </span>
              </div>

              {error && (
                <div className="rounded bg-red-950/50 border border-red-800/50 px-3 py-1.5 text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>
          </section>

          <footer className="text-center text-xs text-zinc-600 pb-6">
            Module 08 — Model Manager with Download, Install & Switch ✓
          </footer>
        </div>
      </main>
    </div>
  );
}
