export interface AudioDevice {
  deviceId: string;
  label: string;
  groupId: string;
}

export async function getAudioInputDevices(): Promise<AudioDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  let devices = await navigator.mediaDevices.enumerateDevices();
  let audioInputs = devices.filter((d) => d.kind === "audioinput");

  const hasEmptyLabels = audioInputs.some((d) => !d.label);
  if (hasEmptyLabels) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      devices = await navigator.mediaDevices.enumerateDevices();
      audioInputs = devices.filter((d) => d.kind === "audioinput");
    } catch {
      // Permission denied or devices unavailable
    }
  }

  return audioInputs.map((d, index) => ({
    deviceId: d.deviceId,
    label: d.label || `Microphone ${index + 1}`,
    groupId: d.groupId,
  }));
}

export function onAudioDeviceChange(callback: () => void): () => void {
  if (!navigator.mediaDevices?.addEventListener) {
    return () => {};
  }

  navigator.mediaDevices.addEventListener("devicechange", callback);
  return () => {
    navigator.mediaDevices.removeEventListener("devicechange", callback);
  };
}
