import { create } from "zustand";
import { AudioDevice, getAudioInputDevices, onAudioDeviceChange } from "../utils/audioDevices";

interface SettingsState {
  selectedDeviceId: string;
  availableDevices: AudioDevice[];
  setSelectedDeviceId: (id: string) => void;
  refreshDevices: () => Promise<void>;
  initDeviceListener: () => () => void;
}

const STORAGE_KEY = "voiceflow_selected_mic";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  selectedDeviceId: localStorage.getItem(STORAGE_KEY) || "default",
  availableDevices: [],

  setSelectedDeviceId: (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ selectedDeviceId: id });
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
