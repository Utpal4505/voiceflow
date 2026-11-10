import React, { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useDetectedOS(): "windows" | "mac" {
  return useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "mac" : "windows"),
    () => "windows"
  );
}

export function WindowsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} fill="none" aria-hidden="true">
      <path fill="#0078d4" d="M0 36.635L102.502 22.4v100.865H0zm102.449 95.839v101.07L0 219.42V132.474zm15.423-112.56L256 0v123.265H117.872zm138.128 112.56V256l-138.128-19.78v-103.746z" />
    </svg>
  );
}

export function AppleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" fill="currentColor" className={className} aria-hidden="true">
      <path d="M0 0h26v26H0z" fill="none" />
      <path d="M23.934 18.947c-.598 1.324-.884 1.916-1.652 3.086c-1.073 1.634-2.588 3.673-4.461 3.687c-1.666.014-2.096-1.087-4.357-1.069c-2.261.011-2.732 1.089-4.4 1.072c-1.873-.017-3.307-1.854-4.381-3.485c-3.003-4.575-3.32-9.937-1.464-12.79C4.532 7.425 6.61 6.237 8.561 6.237c1.987 0 3.236 1.092 4.879 1.092c1.594 0 2.565-1.095 4.863-1.095c1.738 0 3.576.947 4.889 2.581c-4.296 2.354-3.598 8.49.742 10.132M16.559 4.408c.836-1.073 1.47-2.587 1.24-4.131c-1.364.093-2.959.964-3.891 2.092c-.844 1.027-1.544 2.553-1.271 4.029c1.488.048 3.028-.839 3.922-1.99" />
    </svg>
  );
}

export const DOWNLOAD_URLS = {
  windows: "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow-Setup.exe",
  mac: "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow.dmg",
};
