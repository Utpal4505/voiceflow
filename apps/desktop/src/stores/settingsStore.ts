import { create } from "zustand";
import { AudioDevice, getAudioInputDevices, onAudioDeviceChange } from "../utils/audioDevices";
import { isTelemetryEnabled, setTelemetryEnabled } from "../lib/telemetry";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export type WakeWordPhrase = "hey_voiceflow" | "hey_flow" | "both";

interface WakeWordConfig {
  enabled: boolean;
  phrase: string;
  sensitivity: number;
}

interface EnrollmentInfo {
  hasHeyVoiceflow: boolean;
  hasHeyFlow: boolean;
  heyVoiceflowUpdatedAt: number;
  heyFlowUpdatedAt: number;
}

interface SettingsState {
  selectedDeviceId: string;
  availableDevices: AudioDevice[];
  telemetryEnabled: boolean;
  wakeWordEnabled: boolean;
  wakeWordPhrase: WakeWordPhrase;
  wakeWordSensitivity: number;
  enrollmentInfo: EnrollmentInfo;

  setSelectedDeviceId: (id: string) => void;
  setTelemetryEnabled: (enabled: boolean) => void;
  setWakeWordEnabled: (enabled: boolean) => Promise<void>;
  setWakeWordPhrase: (phrase: WakeWordPhrase) => Promise<void>;
  setWakeWordSensitivity: (sensitivity: number) => Promise<void>;
  refreshDevices: () => Promise<void>;
  refreshEnrollment: () => Promise<void>;
  resetEnrollment: (phrase: string) => Promise<void>;
  initDeviceListener: () => () => void;
}

const STORAGE_KEY_MIC = "voiceflow_selected_mic";
const STORAGE_KEY_WW_ENABLED = "voiceflow_wakeword_enabled";
const STORAGE_KEY_WW_PHRASE = "voiceflow_wakeword_phrase";
const STORAGE_KEY_WW_SENSITIVITY = "voiceflow_wakeword_sensitivity";

let isMonitoringInitialized = false;

function loadInitialWakeWordState() {
  if (typeof window === "undefined") {
    return { enabled: false, phrase: "hey_voiceflow" as WakeWordPhrase, sensitivity: 0.5 };
  }
  const enabled = localStorage.getItem(STORAGE_KEY_WW_ENABLED) === "true";
  const phrase = (localStorage.getItem(STORAGE_KEY_WW_PHRASE) as WakeWordPhrase) || "hey_voiceflow";
  const rawSens = localStorage.getItem(STORAGE_KEY_WW_SENSITIVITY);
  const sensitivity = rawSens ? parseFloat(rawSens) : 0.5;
  return { enabled, phrase, sensitivity: isNaN(sensitivity) ? 0.5 : sensitivity };
}

async function syncWakeWordToRust(enabled: boolean, phrase: WakeWordPhrase, sensitivity: number) {
  try {
    await invoke("set_wake_word_config", {
      config: {
        enabled,
        phrase,
        sensitivity,
      },
    });
    console.log("[SettingsStore] Synchronized wake-word config to Rust engine:", { enabled, phrase, sensitivity });
  } catch (err) {
    console.warn("[SettingsStore] Failed to sync wake-word config to Tauri:", err);
  }
}

function startGlobalDeviceMonitoring() {
  if (isMonitoringInitialized || typeof window === "undefined") return;
  isMonitoringInitialized = true;

  // 1. Initial query of audio hardware devices & enrollment status
  useSettingsStore.getState().refreshDevices();
  useSettingsStore.getState().refreshEnrollment();

  // 2. Sync initial wake word configuration into Rust
  const initialWw = loadInitialWakeWordState();
  if (initialWw.enabled) {
    syncWakeWordToRust(initialWw.enabled, initialWw.phrase, initialWw.sensitivity);
  }

  // 3. Hardware change listener (Bluetooth connects/disconnects, USB mics)
  onAudioDeviceChange(() => {
    console.log("[SettingsStore] Audio hardware change detected, refreshing devices...");
    useSettingsStore.getState().refreshDevices();
  });

  // 4. Cross-webview sync via Tauri events
  try {
    listen<{ deviceId: string }>("settings:mic-changed", (event) => {
      const newId = event.payload?.deviceId;
      if (newId && useSettingsStore.getState().selectedDeviceId !== newId) {
        console.log("[SettingsStore] Received cross-window mic change event:", newId);
        useSettingsStore.setState({ selectedDeviceId: newId });
      }
    }).catch(() => {});

    listen<WakeWordConfig>("wake-word:config-changed", (event) => {
      const payload = event.payload;
      if (payload) {
        console.log("[SettingsStore] Received cross-window wake-word config event:", payload);
        useSettingsStore.setState({
          wakeWordEnabled: payload.enabled,
          wakeWordPhrase: (payload.phrase as WakeWordPhrase) || "hey_voiceflow",
          wakeWordSensitivity: payload.sensitivity,
        });
      }
    }).catch(() => {});

    listen("wake-word:calibration-complete", () => {
      console.log("[SettingsStore] Calibration complete event received, refreshing enrollment info");
      useSettingsStore.getState().refreshEnrollment();
    }).catch(() => {});
  } catch {
    // Non-Tauri browser preview
  }

  // 5. Cross-window storage event fallback
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_MIC && e.newValue && e.newValue !== useSettingsStore.getState().selectedDeviceId) {
      useSettingsStore.setState({ selectedDeviceId: e.newValue });
    }
  });
}

const initialWw = loadInitialWakeWordState();

export const useSettingsStore = create<SettingsState>((set, get) => ({
  selectedDeviceId: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_MIC) || "default" : "default",
  availableDevices: [],
  telemetryEnabled: isTelemetryEnabled(),
  wakeWordEnabled: initialWw.enabled,
  wakeWordPhrase: initialWw.phrase,
  wakeWordSensitivity: initialWw.sensitivity,
  enrollmentInfo: {
    hasHeyVoiceflow: false,
    hasHeyFlow: false,
    heyVoiceflowUpdatedAt: 0,
    heyFlowUpdatedAt: 0,
  },

  setSelectedDeviceId: (id: string) => {
    localStorage.setItem(STORAGE_KEY_MIC, id);
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

  setWakeWordEnabled: async (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_WW_ENABLED, String(enabled));
    set({ wakeWordEnabled: enabled });
    const { wakeWordPhrase, wakeWordSensitivity } = get();
    await syncWakeWordToRust(enabled, wakeWordPhrase, wakeWordSensitivity);
  },

  setWakeWordPhrase: async (phrase: WakeWordPhrase) => {
    localStorage.setItem(STORAGE_KEY_WW_PHRASE, phrase);
    set({ wakeWordPhrase: phrase });
    const { wakeWordEnabled, wakeWordSensitivity } = get();
    await syncWakeWordToRust(wakeWordEnabled, phrase, wakeWordSensitivity);
  },

  setWakeWordSensitivity: async (sensitivity: number) => {
    localStorage.setItem(STORAGE_KEY_WW_SENSITIVITY, String(sensitivity));
    set({ wakeWordSensitivity: sensitivity });
    const { wakeWordEnabled, wakeWordPhrase } = get();
    await syncWakeWordToRust(wakeWordEnabled, wakeWordPhrase, sensitivity);
  },

  refreshEnrollment: async () => {
    try {
      const info = await invoke<EnrollmentInfo>("get_wake_word_enrollment");
      console.log("[SettingsStore] Loaded voice enrollment info:", info);
      set({ enrollmentInfo: info });
    } catch (err) {
      console.warn("[SettingsStore] Failed to fetch enrollment status:", err);
    }
  },

  resetEnrollment: async (phrase: string) => {
    try {
      await invoke("reset_wake_word_enrollment", { phrase });
      await get().refreshEnrollment();
      console.log("[SettingsStore] Reset voice profile for:", phrase);
    } catch (err) {
      console.error("[SettingsStore] Failed to reset voice profile:", err);
    }
  },

  refreshDevices: async () => {
    const devices = await getAudioInputDevices();
    const currentSelected = get().selectedDeviceId;

    const deviceStillExists =
      currentSelected === "default" ||
      devices.some((d) => d.deviceId === currentSelected);

    if (!deviceStillExists) {
      localStorage.setItem(STORAGE_KEY_MIC, "default");
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
