"use client";

import React from "react";
import { motion } from "framer-motion";
import { triggerDownloadToast } from "./DownloadToast";

function WindowsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0h256v256H0z" fill="none" />
      <path
        fill="#0078d4"
        d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z"
      />
    </svg>
  );
}

export default function Hero() {
  const downloadExeUrl =
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow-Setup.exe";

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
          and talk. VoiceFlow instantly types right at your cursor in any Windows app —
          100% offline, private, and lightning fast.
        </motion.p>

        {/* Tactile White CTA Button (High-Contrast Hero Action) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3"
        >
          <motion.a
            href={downloadExeUrl}
            download
            onClick={triggerDownloadToast}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-slate-100 px-8 py-4 text-sm sm:text-base font-bold text-[#111827] shadow-xl shadow-black/40 ring-1 ring-white/20 transition-all cursor-pointer"
          >
            <WindowsIcon className="h-4 w-4 shrink-0" />
            <span>Download for Windows</span>
          </motion.a>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            For Windows 11 &amp; 10
          </p>
        </motion.div>
      </div>
    </section>
  );
}
