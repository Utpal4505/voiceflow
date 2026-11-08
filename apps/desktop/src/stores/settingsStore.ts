import { create } from "zustand";
import { AudioDevice, getAudioInputDevices, onAudioDeviceChange } from "../utils/audioDevices";
import { isTelemetryEnabled, setTelemetryEnabled } from "../lib/telemetry";
import { emit, listen } from "@tauri-apps/api/event";

interface SettingsState {
  selectedDeviceId: string;
  availableDevices: AudioDevice[];
  telemetryEnabled: boolean;
  setSelectedDeviceId: (id: string) => void;
  setTelemetryEnabled: (enabled: boolean) => void;
  refreshDevices: () => Promise<void>;
  initDeviceListener: () => () => void;
}

const STORAGE_KEY = "voiceflow_selected_mic";

let isMonitoringInitialized = false;

function startGlobalDeviceMonitoring() {
  if (isMonitoringInitialized || typeof window === "undefined") return;
  isMonitoringInitialized = true;

  // 1. Initial query of audio hardware devices
  useSettingsStore.getState().refreshDevices();

  // 2. Hardware change listener (Bluetooth connects/disconnects, USB mics)
  onAudioDeviceChange(() => {
    console.log("[SettingsStore] Audio hardware change detected, refreshing devices...");
    useSettingsStore.getState().refreshDevices();
  });

  // 3. Cross-webview mic changes via Tauri events (e.g. MainWindow -> OverlayWindow)
  try {
    listen<{ deviceId: string }>("settings:mic-changed", (event) => {
      const newId = event.payload?.deviceId;
      if (newId && useSettingsStore.getState().selectedDeviceId !== newId) {
        console.log("[SettingsStore] Received cross-window mic change event:", newId);
        useSettingsStore.setState({ selectedDeviceId: newId });
      }
    }).catch(() => {});
  } catch {
    // Non-Tauri browser preview
  }

  // 4. Cross-window storage event fallback
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue && e.newValue !== useSettingsStore.getState().selectedDeviceId) {
      console.log("[SettingsStore] Storage event sync for mic:", e.newValue);
      useSettingsStore.setState({ selectedDeviceId: e.newValue });
    }
  });
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  selectedDeviceId: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) || "default" : "default",
  availableDevices: [],
  telemetryEnabled: isTelemetryEnabled(),

  setSelectedDeviceId: (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ selectedDeviceId: id });
    try {
      emit("settings:mic-changed", { deviceId: id }).catch(() => {});
    } catch {
      // In browser preview
    }
  },

  setTelemetryEnabled: (enabled: boolean) => {
    setTelemetryEnabled(enabled);
    set({ telemetryEnabled: enabled });
  },

  refreshDevices: async () => {
    const devices = await getAudioInputDevices();
    const currentSelected = get().selectedDeviceId;

    const deviceStillExists =
      currentSelected === "default" ||
      devices.some((d) => d.deviceId === currentSelected);

    if (!deviceStillExists) {
      localStorage.setItem(STORAGE_KEY, "default");
      set({ availableDevices: devices, selectedDeviceId: "default" });
      try {
        emit("settings:mic-changed", { deviceId: "default" }).catch(() => {});
      } catch {
        // In browser preview
      }
    } else {
      set({ availableDevices: devices });
    }
  },

  initDeviceListener: () => {
    startGlobalDeviceMonitoring();
    return () => {};
  },
}));

// Automatically initialize monitoring on store load in all webview processes
if (typeof window !== "undefined") {
  startGlobalDeviceMonitoring();
}
