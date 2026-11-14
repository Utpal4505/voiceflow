"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, ArrowDown, ShieldCheck } from "lucide-react";
import { VoiceFlowLogo } from "./VoiceFlowLogo";
import { trackGuideOpened } from "../lib/analytics";

export type DownloadPlatform = "windows" | "mac";

export function triggerDownloadToast(platform: DownloadPlatform = "windows") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("voiceflow:download", { detail: { platform } }));
  }
}

export default function DownloadToast() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<DownloadPlatform>("windows");
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let autoDismissTimer: NodeJS.Timeout | undefined;

    const handleDownloadEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ platform?: DownloadPlatform }>;
      const targetPlatform = customEvent.detail?.platform || "windows";
      setPlatform(targetPlatform);
      setVisible(true);
      setDownloadProgress(0);

      // Simulate download progress bar from 0 to 100% over ~2.5 seconds
      let p = 0;
      clearInterval(progressInterval);
      clearTimeout(autoDismissTimer);

      progressInterval = setInterval(() => {
        p += 5;
        if (p <= 100) {
          setDownloadProgress(p);
        } else {
          clearInterval(progressInterval);
        }
      }, 120);

      // Auto dismiss toast after 9 seconds
      autoDismissTimer = setTimeout(() => {
        setVisible(false);
      }, 9000);
    };

    window.addEventListener("voiceflow:download", handleDownloadEvent);

    return () => {
      window.removeEventListener("voiceflow:download", handleDownloadEvent);
      clearInterval(progressInterval);
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleScrollToGuide = () => {
    trackGuideOpened("smartscreen");
    const el = document.getElementById("smartscreen");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isMac = platform === "mac";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-5 right-5 z-50 w-full max-w-sm sm:max-w-md select-none font-sans"
        >
          <div className="rounded-2xl border border-white/15 bg-[#181818]/95 backdrop-blur-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white relative overflow-hidden">
            {/* Top Row: Icon + Filename + Close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <VoiceFlowLogo className="h-9 w-9 rounded-xl shadow-md" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                    <Download className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {isMac ? "VoiceFlow.dmg" : "VoiceFlow-Setup.exe"}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                      {isMac ? "~35 MB" : "~25 MB"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {downloadProgress < 100
                      ? `Downloading for ${isMac ? "macOS" : "Windows"}... ${downloadProgress}%`
                      : "Download complete • Ready to run"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss Notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${downloadProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>

            {/* Platform Installation Reassurance Tip */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                {isMac ? (
                  <p className="text-xs text-slate-300 leading-snug">
                    <span className="font-semibold text-white">macOS Installation:</span> Open the{" "}
                    <code className="text-white font-mono text-[11px] bg-white/10 px-1 py-0.5 rounded">.dmg</code> and drag
                    VoiceFlow into your Applications folder. Universal binary for Apple Silicon (M1/M2/M3/M4) &amp; Intel.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-slate-300 leading-snug">
                      <span className="font-semibold text-white">First time launching?</span> If
                      Windows Defender SmartScreen appears, click{" "}
                      <span className="underline font-semibold text-blue-300">More info</span> →{" "}
                      <span className="font-semibold text-white">Run anyway</span>.
                    </p>
                    <button
                      type="button"
                      onClick={handleScrollToGuide}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      <span>View 2-Click Launch Guide</span>
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
