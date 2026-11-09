"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DownloadCloud,
  Check,
  ArrowRight,
  Mic,
  Zap,
} from "lucide-react";

export default function HowItWorks() {
  // --------------------------------------------------------------------------
  // STEP 1: Live Animated Downloading Progress Bar (6.4s Cycle)
  // --------------------------------------------------------------------------
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | undefined;

    const runDownloadCycle = () => {
      if (!isMounted) return;
      setDownloadProgress(0);
      setIsDownloadComplete(false);

      let current = 0;
      timer = setInterval(() => {
        if (!isMounted) return;
        current += 3;
        if (current >= 100) {
          if (timer) clearInterval(timer);
          setDownloadProgress(100);
          setIsDownloadComplete(true);
        } else {
          setDownloadProgress(current);
        }
      }, 45); // ~1.5s download duration
    };

    runDownloadCycle();
    const cycleInterval = setInterval(runDownloadCycle, 6400);

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
      clearInterval(cycleInterval);
    };
  }, []);

  // --------------------------------------------------------------------------
  // STEP 2: Tactile Keycap Press & Floating HUD Animation (3.4s Cycle)
  // --------------------------------------------------------------------------
  const [isKeyPressed, setIsKeyPressed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const keyInterval = setInterval(() => {
      if (!isMounted) return;
      setIsKeyPressed(true);
      setTimeout(() => {
        if (isMounted) setIsKeyPressed(false);
      }, 1400);
    }, 3400);

    return () => {
      isMounted = false;
      clearInterval(keyInterval);
    };
  }, []);

  // --------------------------------------------------------------------------
  // STEP 3: Live Character Typewriter Stream (Human Workplace Dictations)
  // --------------------------------------------------------------------------
  const sampleTranscripts = [
    "Schedule the architecture review for Thursday at 10 AM.",
    "Send the finalized quarterly proposal over to Sarah.",
    "Draft meeting action items and sync with the product team.",
  ];

  const [activeTranscriptIdx, setActiveTranscriptIdx] = useState(0);
  const [typedTranscriptText, setTypedTranscriptText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const currentTranscript = sampleTranscripts[activeTranscriptIdx];

  useEffect(() => {
    let isMounted = true;
    let typeTimer: NodeJS.Timeout | undefined;

    let charIdx = 0;
    // Initial short pause before typing begins
    const startTimeout = setTimeout(() => {
      if (!isMounted) return;
      setTypedTranscriptText("");
      setIsTypingComplete(false);

      typeTimer = setInterval(() => {
        if (!isMounted) return;
        if (charIdx <= currentTranscript.length) {
          setTypedTranscriptText(currentTranscript.slice(0, charIdx));
          charIdx += 1;
        } else {
          if (typeTimer) clearInterval(typeTimer);
          setTypedTranscriptText(currentTranscript);
          setIsTypingComplete(true);

          // Hold completed sentence for 2.4s before advancing
          setTimeout(() => {
            if (!isMounted) return;
            setActiveTranscriptIdx((prev) => (prev + 1) % sampleTranscripts.length);
          }, 2400);
        }
      }, 38);
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      if (typeTimer) clearInterval(typeTimer);
    };
  }, [activeTranscriptIdx, currentTranscript, sampleTranscripts.length]);

  const soundBars = [6, 12, 16, 9, 14, 18, 10, 7];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-[#212121] text-white relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header without the AI-generated 'Zero Learning Curve' badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Up and running in{" "}
            <span className="relative inline-flex flex-wrap items-center justify-center gap-2">
              <span>three simple steps.</span>
              {/* Sequential Stepper Badge (01 → 02 → 03) */}
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full shadow-inner align-middle select-none"
              >
                <span className="text-amber-400">01</span>
                <span className="text-slate-600">→</span>
                <span className="text-orange-400">02</span>
                <span className="text-slate-600">→</span>
                <span className="text-emerald-400">03</span>
              </motion.span>
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed font-sans">
            No Python setup, no complex terminal configurations, and no cloud accounts required.
          </p>
        </motion.div>

        {/* 3 Connected Step Cards */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* ========================================================= */}
          {/* STEP 1: Download & Launch (Live Downloading Progress)    */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-8 shadow-2xl hover:border-amber-400/30 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Step Header Badge */}
              <div className="flex items-center justify-between pb-5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/25 font-sans">
                  Step 01
                </span>
                <span className="text-xs font-medium text-slate-400 font-sans">1-Click Setup</span>
              </div>

              {/* Visual Mockup: Windows Setup Package with Live Progress Bar */}
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 text-xs font-mono shadow-inner min-h-[148px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-300">
                        <DownloadCloud className={`h-4 w-4 ${!isDownloadComplete ? "animate-bounce" : ""}`} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-xs font-sans">
                          VoiceFlow-Setup.exe
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {isDownloadComplete ? "24.8 MB Single Binary" : `${(downloadProgress * 0.248).toFixed(1)} MB / 24.8 MB`}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {isDownloadComplete ? (
                        <motion.span
                          key="verified"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 shadow-xs"
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                          Ready
                        </motion.span>
                      ) : (
                        <motion.span
                          key="downloading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono"
                        >
                          {downloadProgress}%
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Animated Fluid Progress Bar */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-sans font-medium">
                      <span>{isDownloadComplete ? "Local Inference Engine" : "Streaming Binary..."}</span>
                      <span className="font-mono font-bold text-amber-300">{downloadProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden relative p-[1px]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 relative"
                        style={{ width: `${downloadProgress}%` }}
                        transition={{ ease: "easeOut" }}
                      >
                        <span className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>Tray status:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      isDownloadComplete ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`} />
                    {isDownloadComplete ? "Quiet in background" : "Verifying binary..."}
                  </span>
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-white font-sans">
                Download &amp; Launch
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Run the single lightweight setup. VoiceFlow opens immediately in your system tray
                without requiring Python, Node.js, or complex runtime dependencies.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-sans">
              <span className="font-medium text-slate-400">Zero configuration needed</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* STEP 2: Press Ctrl + Space (Tactile Mechanical Depress)   */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-8 shadow-2xl hover:border-orange-400/30 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Step Header Badge */}
              <div className="flex items-center justify-between pb-5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full border border-orange-400/25 font-sans">
                  Step 02
                </span>
                <span className="text-xs font-medium text-slate-400 font-sans">Global Shortcut</span>
              </div>

              {/* Visual Mockup: Tactile Keycaps + Floating HUD */}
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 flex flex-col items-center justify-between min-h-[148px] shadow-inner relative overflow-hidden">
                {/* 3D Mechanical Keycaps with Tactile Depress Animation */}
                <div className="flex items-center gap-2 my-auto">
                  <motion.span
                    animate={{
                      y: isKeyPressed ? 3 : 0,
                      scale: isKeyPressed ? 0.96 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-mono font-bold shadow-sm transition-colors duration-200 ${
                      isKeyPressed
                        ? "bg-orange-500/20 text-orange-300 border-orange-400/40 shadow-[0_0_12px_rgba(255,87,34,0.3)]"
                        : "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    Ctrl
                  </motion.span>
                  <span className="text-slate-500 font-bold text-xs">+</span>
                  <motion.span
                    animate={{
                      y: isKeyPressed ? 3 : 0,
                      scale: isKeyPressed ? 0.96 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`inline-flex items-center rounded-xl border px-4 py-1.5 text-xs font-mono font-bold shadow-sm transition-colors duration-200 ${
                      isKeyPressed
                        ? "bg-orange-500/20 text-orange-300 border-orange-400/40 shadow-[0_0_12px_rgba(255,87,34,0.3)]"
                        : "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    Space
                  </motion.span>
                </div>

                {/* Floating Miniature VoiceFlow HUD */}
                <motion.div
                  animate={{
                    scale: isKeyPressed ? [1, 1.05, 1] : 1,
                    borderColor: isKeyPressed ? "rgba(255, 87, 34, 0.4)" : "rgba(255, 255, 255, 0.15)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 rounded-full border bg-[#1c1c1c] px-3 py-1.5 shadow-lg shadow-black/40 text-white"
                >
                  <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5722] to-[#FF7043] shadow-[0_0_8px_rgba(255,87,34,0.5)]">
                    <Mic className="h-2.5 w-2.5 text-white" />
                  </div>

                  <div className="flex items-center gap-[2.5px] h-3">
                    {soundBars.map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{ height: isKeyPressed ? [3, h * 0.8, 3] : [3, 4, 3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6 + (i % 3) * 0.12,
                          ease: "easeInOut",
                        }}
                        className="w-[1.5px] rounded-full bg-orange-400"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] font-semibold text-white px-1 font-sans">
                    {isKeyPressed ? "Listening..." : "Ready"}
                  </span>
                </motion.div>

                <div className="mt-2 text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1.5 pt-1">
                  <Check className="h-3 w-3 stroke-[3] text-emerald-400" />
                  <span className="font-sans">Summons weightlessly above cursor</span>
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-white font-sans">
                Press Ctrl + Space
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Click into any application where you can type — Slack, VS Code, Notion, or your
                browser. Hit the shortcut and the stealth HUD summons instantly above your cursor.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-sans">
              <span className="font-medium text-slate-400">Customizable in Settings</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* STEP 3: Speak & Instant Keystrokes (Live Stream)          */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-8 shadow-2xl hover:border-emerald-400/30 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Step Header Badge */}
              <div className="flex items-center justify-between pb-5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/25 font-sans">
                  Step 03
                </span>
                <span className="text-xs font-medium text-slate-400 font-sans">Instant Keystrokes</span>
              </div>

              {/* Visual Mockup: Live Keystroke Stream Canvas */}
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 text-xs font-mono shadow-inner min-h-[148px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Zap className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                      Live Stream
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">160+ WPM</span>
                  </div>

                  <div className="mt-2.5 text-slate-200 text-xs font-medium leading-relaxed font-sans min-h-[44px]">
                    &ldquo;{typedTranscriptText}&rdquo;
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle rounded-xs" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-sans">Trigger:</span>
                  <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded border transition-colors duration-300 font-sans ${
                    isTypingComplete
                      ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/30"
                      : "text-slate-300 bg-white/5 border-white/10"
                  }`}>
                    Enter ↵ or Silence
                  </span>
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold tracking-tight text-white font-sans">
                Speak &amp; Release
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Speak your thoughts naturally. Press Enter or release your shortcut; VoiceFlow
                injects clean, formatted text right at your cursor — 3x faster than typing.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-sans">
              <span className="font-medium text-slate-400">Zero network lag</span>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
