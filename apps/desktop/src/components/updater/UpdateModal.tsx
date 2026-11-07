import { useState, useEffect, useCallback, useRef } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { listen } from "@tauri-apps/api/event";
import {
  Sparkles,
  Download,
  RefreshCw,
  CheckCircle2,
  X,
  ArrowRight,
  AlertCircle,
  Laptop,
} from "lucide-react";

export interface UpdateModalProps {
  currentVersion?: string;
  triggerCheckRef?: React.MutableRefObject<(() => void) | null>;
}

export default function UpdateModal({ currentVersion = "v0.1.0", triggerCheckRef }: UpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "downloading" | "ready" | "up-to-date" | "error"
  >("idle");
  const [availableUpdate, setAvailableUpdate] = useState<Update | null>(null);
  const [downloadPercent, setDownloadPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const downloadedBytesRef = useRef(0);
  const totalBytesRef = useRef(0);

  const UPDATE_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000; // Check once every 12 hours

  const performCheck = useCallback(async (manual = false) => {
    // If background check, enforce 12-hour throttling
    if (!manual) {
      try {
        const lastCheck = Number(localStorage.getItem("voiceflow_last_update_check") || 0);
        if (Date.now() - lastCheck < UPDATE_CHECK_INTERVAL_MS) {
          return;
        }
      } catch {
        // Fall through
      }
    }

    try {
      setStatus("checking");
      setErrorMessage(null);

      const update = await check();
      try {
        localStorage.setItem("voiceflow_last_update_check", String(Date.now()));
      } catch {}

      if (update?.available) {
        setAvailableUpdate(update);
        setStatus("available");
        setIsOpen(true);
      } else {
        setStatus("up-to-date");
        setAvailableUpdate(null);
        if (manual) {
          setIsToastVisible(true);
          setTimeout(() => setIsToastVisible(false), 3500);
        }
      }
    } catch (err) {
      console.warn("[Updater] Check failed:", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : String(err));
      if (manual) {
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 4000);
      }
    }
  }, []);

  // Expose manual check function
  useEffect(() => {
    if (triggerCheckRef) {
      triggerCheckRef.current = () => performCheck(true);
    }
  }, [triggerCheckRef, performCheck]);

  // Listen for tray check-for-updates event and run initial background check
  useEffect(() => {
    const handlePreview = () => {
      setAvailableUpdate({
        version: "0.2.0",
        body: "• Added Performance Analytics & Hardware Diagnostics\n• Improved Whisper speech recognition latency by 25%\n• Enhanced System Tray and autostart integrations",
        date: new Date().toISOString(),
      } as unknown as Update);
      setStatus("available");
      setIsOpen(true);
    };

    window.addEventListener("voiceflow:preview-update", handlePreview);

    let unlisten: (() => void) | undefined;
    listen("check-for-updates", () => {
      performCheck(true);
    }).then((fn) => {
      unlisten = fn;
    }).catch(() => {});

    // Silent background check on launch (delayed slightly so app boots cleanly)
    const timer = setTimeout(() => {
      performCheck(false);
    }, 4000);

    // Periodic background check once every 12 hours
    const interval = setInterval(() => {
      performCheck(false);
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("voiceflow:preview-update", handlePreview);
      clearTimeout(timer);
      clearInterval(interval);
      unlisten?.();
    };
  }, [performCheck]);

  const handleStartUpdate = async () => {
    if (!availableUpdate) return;

    try {
      setStatus("downloading");
      setDownloadPercent(0);
      downloadedBytesRef.current = 0;
      totalBytesRef.current = 0;

      // In preview/testing mode, animate simulation
      if (typeof availableUpdate.downloadAndInstall !== "function") {
        for (let i = 1; i <= 10; i++) {
          await new Promise((r) => setTimeout(r, 180));
          setDownloadPercent(i * 10);
        }
        setStatus("ready");
        return;
      }

      await availableUpdate.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            totalBytesRef.current = event.data.contentLength || 0;
            break;
          case "Progress":
            downloadedBytesRef.current += event.data.chunkLength;
            if (totalBytesRef.current > 0) {
              const pct = Math.round(
                (downloadedBytesRef.current / totalBytesRef.current) * 100
              );
              setDownloadPercent(Math.min(pct, 100));
            }
            break;
          case "Finished":
            setStatus("ready");
            break;
        }
      });

      // Relaunch the desktop application with new version
      setStatus("ready");
      setTimeout(async () => {
        try {
          await relaunch();
        } catch (e) {
          console.error("Failed to relaunch:", e);
        }
      }, 1200);
    } catch (err) {
      console.error("[Updater] Download failed:", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to download update");
    }
  };

  return (
    <>
      {/* Toast Notification for manual "Up to date" or transient error */}
      {isToastVisible && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-white/[0.1] bg-[#121422]/95 px-4 py-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {status === "up-to-date" ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">VoiceFlow is up to date</p>
                <p className="text-[11px] text-slate-400">You are on the latest version ({currentVersion})</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Update Check</p>
                <p className="text-[11px] text-slate-400">
                  {errorMessage || "No update found or server unreachable"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Update Modal Dialog */}
      {isOpen && availableUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#7772FF]/30 bg-[#121422] shadow-[0_0_50px_rgba(81,75,250,0.15)]">
            {/* Ambient Violet Glow */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[#514BFA]/20 blur-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#514BFA]/20 text-[#A5A0FF] border border-[#514BFA]/30 shadow-inner">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Update Available</h3>
                  <p className="text-[11px] text-slate-400">A new version of VoiceFlow is ready</p>
                </div>
              </div>
              {status !== "downloading" && status !== "ready" && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4">
              {/* Version Comparison Card */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0A0B10] p-3.5">
                <div className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-slate-500" />
                  <span className="text-xs text-slate-400">Current:</span>
                  <span className="font-mono text-xs font-medium text-slate-300">{currentVersion}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">New:</span>
                  <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    v{availableUpdate.version}
                  </span>
                </div>
              </div>

              {/* Release Notes */}
              {availableUpdate.body && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0A0B10] p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    What's New
                  </p>
                  <div className="max-h-28 overflow-y-auto text-xs text-slate-300 space-y-1 pr-1 font-sans leading-relaxed whitespace-pre-wrap">
                    {availableUpdate.body}
                  </div>
                </div>
              )}

              {/* Download Progress Bar */}
              {status === "downloading" && (
                <div className="space-y-2 rounded-xl border border-[#514BFA]/20 bg-[#514BFA]/5 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#A5A0FF] flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Downloading update package...
                    </span>
                    <span className="font-mono font-semibold text-white">{downloadPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full bg-gradient-to-r from-[#514BFA] to-purple-500 transition-all duration-200"
                      style={{ width: `${downloadPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ready / Restarting State */}
              {status === "ready" && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold">Update installed successfully!</p>
                    <p className="text-[11px] text-emerald-200/80">Restarting VoiceFlow in a moment...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {status === "error" && errorMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-[11px]">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.08] bg-[#0E1018] p-4">
              {status !== "downloading" && status !== "ready" && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
                >
                  Later
                </button>
              )}

              {status !== "ready" && (
                <button
                  onClick={handleStartUpdate}
                  disabled={status === "downloading"}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#514BFA] to-[#7772FF] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#514BFA]/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                >
                  {status === "downloading" ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>Update & Restart</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
