import { create } from "zustand";
import { AudioDevice, getAudioInputDevices, onAudioDeviceChange } from "../utils/audioDevices";
import { isTelemetryEnabled, setTelemetryEnabled } from "../lib/telemetry";

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

export const useSettingsStore = create<SettingsState>((set, get) => ({
  selectedDeviceId: localStorage.getItem(STORAGE_KEY) || "default",
  availableDevices: [],
  telemetryEnabled: isTelemetryEnabled(),

  setSelectedDeviceId: (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ selectedDeviceId: id });
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
    } else {
      set({ availableDevices: devices });
    }
  },

  initDeviceListener: () => {
    get().refreshDevices();
    return onAudioDeviceChange(() => {
      get().refreshDevices();
    });
  },
}));
