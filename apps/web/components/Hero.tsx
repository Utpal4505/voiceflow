"use client";

import React from "react";
import { motion } from "framer-motion";
import { triggerDownloadToast } from "./DownloadToast";
import { WindowsIcon, AppleIcon, DOWNLOAD_URLS, useDetectedOS } from "./PlatformIcons";

export default function Hero() {
  const detectedOS = useDetectedOS();

  return (
    <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-20 text-center text-white">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Bold Confident Headline with Living Animated Underline (0 to 100%) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.08]"
        >
          Stop typing. <br className="hidden sm:inline" />
          <span className="relative inline-block mt-1 sm:mt-2">
            Start speaking.
            <motion.svg
              className="absolute -bottom-2 sm:-bottom-3 left-0 w-full overflow-visible pointer-events-none"
              viewBox="0 0 320 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M3 11C75 4 240 3 317 10"
                stroke="#FF5722"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeInOut" }}
              />
            </motion.svg>
          </span>
        </motion.h1>

        {/* Clear Universal Subtitle (Clean & Balanced Typography with Tactile Keycaps) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-slate-400"
        >
          Just press{" "}
          <kbd className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs sm:text-sm font-semibold text-white shadow-xs align-baseline">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 font-mono text-xs sm:text-sm font-semibold text-white shadow-xs align-baseline">
            Space
          </kbd>{" "}
          and talk. VoiceFlow instantly types right at your cursor in any Windows or Mac app —
          100% offline, private, and lightning fast.
        </motion.p>

        {/* Tactile Auto-Detecting Single Download CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3.5"
        >
          {/* Main Primary Auto-Detected Download Button */}
          <motion.a
            href={detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows}
            download
            onClick={() => triggerDownloadToast(detectedOS)}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-slate-100 px-8 sm:px-10 py-4 text-base sm:text-lg font-bold text-[#111827] shadow-[0_8px_30px_rgba(255,255,255,0.18)] transition-all cursor-pointer ring-1 ring-white/20"
          >
            {detectedOS === "mac" ? (
              <AppleIcon className="h-5 w-5 shrink-0 text-[#111827]" />
            ) : (
              <WindowsIcon className="h-5 w-5 shrink-0" />
            )}
            <span>
              {detectedOS === "mac" ? "Download for macOS" : "Download for Windows"}
            </span>
            <span className="rounded-md bg-slate-900/10 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {detectedOS === "mac" ? ".dmg" : ".exe"}
            </span>
          </motion.a>

          {/* Alternate Platform Switcher Link */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{detectedOS === "mac" ? "Looking for Windows?" : "Looking for macOS?"}</span>
            <a
              href={detectedOS === "mac" ? DOWNLOAD_URLS.windows : DOWNLOAD_URLS.mac}
              download
              onClick={() => triggerDownloadToast(detectedOS === "mac" ? "windows" : "mac")}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors cursor-pointer font-medium"
            >
              {detectedOS === "mac" ? (
                <>
                  <WindowsIcon className="h-3 w-3 inline" />
                  <span>Download for Windows (.exe)</span>
                </>
              ) : (
                <>
                  <AppleIcon className="h-3 w-3 inline" />
                  <span>Download for macOS (.dmg)</span>
                </>
              )}
            </a>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Windows 11 &amp; 10 • macOS 12+ (Apple Silicon &amp; Intel) • 100% Offline
          </p>
        </motion.div>
      </div>
    </section>
  );
}
