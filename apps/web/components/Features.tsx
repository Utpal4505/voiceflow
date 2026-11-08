"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Cpu,
  Sliders,
  CheckCircle2,
  HardDrive,
  Power,
  Radio,
  Lock,
} from "lucide-react";

const bentoVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

export default function Features() {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const supportedApps = [
    "VS Code",
    "Slack",
    "Notepad",
    "Chrome",
    "MS Word",
    "Discord",
    "WhatsApp",
    "Obsidian",
  ];

  return (
    <section id="features" className="py-24 border-t border-white/[0.08] bg-[#07080E] relative">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300 mb-4">
            Engineered for Windows 10 & 11
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Designed for Speed,{" "}
            <span className="bg-gradient-to-r from-[#A5A0FF] via-[#7772FF] to-cyan-300 bg-clip-text text-transparent">
              Built for Privacy
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Everything expensive cloud dictation services do, executed 100% locally on your CPU with zero subscriptions and zero data egress.
          </p>
        </motion.div>

        {/* The Modern Bento Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Large 2-Column Hero Card (Zero Cloud & Air-Gapped) */}
          <motion.div
            custom={0}
            variants={bentoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-[#0F1122] via-[#12142B] to-[#0A0C16] p-8 sm:p-10 shadow-2xl hover:border-indigo-500/40 transition-all duration-300 group"
          >
            {/* Subtle Gradient Backlight */}
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-colors" />

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-inner">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    100% Air-Gapped Architecture
                  </span>
                </div>

                <h3 className="mt-6 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Zero Cloud Audio Egress
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-xl">
                  Unlike cloud solutions that send your voice to remote servers, VoiceFlow processes speech directly inside local CPU RAM. Transcripts never touch an external server or disk cache.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Works completely offline without Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Zero audio cached or saved to disk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Safe for medical, legal & NDA dictation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>No accounts, passwords or telemetry</span>
                  </div>
                </div>
              </div>

              {/* Visual Air-Gapped Architecture Pill Box */}
              <div className="w-full lg:w-64 rounded-2xl border border-white/[0.1] bg-[#07080E]/80 p-4 shadow-xl backdrop-blur-xl">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Data Flow Pipeline</span>
                  <span className="text-emerald-400 font-bold">AIR-GAPPED</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-2 border border-white/[0.06]">
                    <span className="text-slate-300">🎤 Mic Input</span>
                    <span className="text-emerald-300 font-semibold">Local RAM</span>
                  </div>
                  <div className="flex items-center justify-center text-slate-500">
                    <span className="text-xs">↓</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-indigo-500/10 p-2 border border-indigo-500/30">
                    <span className="text-indigo-200">⚡ Whisper.cpp</span>
                    <span className="text-cyan-300 font-semibold">AVX2 CPU</span>
                  </div>
                  <div className="flex items-center justify-center text-slate-500">
                    <span className="text-xs">↓</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-2 border border-white/[0.06]">
                    <span className="text-slate-300">⌨️ Keystroke</span>
                    <span className="text-emerald-300 font-semibold">Focused App</span>
                  </div>

                  {/* Blocked Cloud Row */}
                  <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-red-400">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" /> External Cloud
                    </span>
                    <span className="font-bold">0 BYTES (BLOCKED)</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Global Ctrl + Space Hotkey */}
          <motion.div
            custom={1}
            variants={bentoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0E101D] p-8 shadow-2xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#514BFA]/15 border border-[#514BFA]/30 text-[#A5A0FF]">
                  <Radio className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-mono text-slate-400">
                  Everywhere
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                Global Ctrl + Space Hotkey
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                A seamless low-level Windows keyboard hook lets you dictate directly into any focused window without manual switching.
              </p>
            </div>

            {/* Interactive 3D Mechanical Keycaps */}
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#07080E]/70 p-4 text-center">
              <div className="text-[11px] text-slate-400 mb-2 font-mono">
                Click keycaps to test feel:
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setPressedKey("ctrl")}
                  onMouseUp={() => setPressedKey(null)}
                  className={`keycap text-xs py-1.5 px-3 cursor-pointer ${
                    pressedKey === "ctrl" ? "translate-y-0.5 border-b" : ""
                  }`}
                >
                  Ctrl
                </button>
                <span className="text-slate-500 font-bold">+</span>
                <button
                  type="button"
                  onMouseDown={() => setPressedKey("space")}
                  onMouseUp={() => setPressedKey(null)}
                  className={`keycap text-xs py-1.5 px-6 cursor-pointer ${
                    pressedKey === "space" ? "translate-y-0.5 border-b" : ""
                  }`}
                >
                  Space
                </button>
              </div>

              {/* Supported App Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {supportedApps.slice(0, 5).map((app) => (
                  <span
                    key={app}
                    className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400 font-mono"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bento Card 3: AVX2 CPU Vector Acceleration */}
          <motion.div
            custom={2}
            variants={bentoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0E101D] p-8 shadow-2xl hover:border-cyan-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-300">
                Zero GPU Needed
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
              AVX2 CPU Acceleration
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Native C++ Whisper inference compiled with Intel & AMD AVX, AVX2, and FMA vector math instructions. Transcribes 3x faster than real-time speech.
            </p>

            {/* Performance Benchmark Bar */}
            <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#07080E]/70 p-3 font-mono text-xs space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>VoiceFlow (AVX2 CPU)</span>
                  <span className="text-cyan-300 font-bold">~3x Realtime</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-cyan-400 to-[#514BFA]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Cloud API Latency (Dragon / Otter)</span>
                  <span className="text-amber-400">~1.2x (Laggy)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full w-[45%] rounded-full bg-amber-400/60" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 4: Active Microphone Auto-Routing (New Feature Spotlight) */}
          <motion.div
            custom={3}
            variants={bentoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0E101D] p-8 shadow-2xl hover:border-indigo-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Sliders className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono text-indigo-300">
                Hot-Plug Ready
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
              Active Microphone Auto-Routing
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Connect your Bluetooth headset, USB condenser mic, or wireless earbuds. VoiceFlow syncs the selected mic across all windows without app restarts.
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#07080E]/70 p-3 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Selected: Bluetooth Mic</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Synced
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Cross-webview Tauri sync with constraint fallback
              </div>
            </div>
          </motion.div>

          {/* Bento Card 5: Standalone Single Binary */}
          <motion.div
            custom={4}
            variants={bentoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0E101D] p-8 shadow-2xl hover:border-emerald-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <HardDrive className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-mono text-slate-400">
                ~25 MB Single File
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
              Self-Contained Standalone Runtime
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Requires zero developer tooling. No Node.js, Python, or PyTorch downloads required. Everything is packed inside a single lightweight installer.
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#07080E]/70 p-3 text-xs font-mono text-slate-400">
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span>RAM Idle Usage</span>
                <span className="text-emerald-300 font-bold">~80 MB</span>
              </div>
              <div className="flex justify-between py-1 pt-1.5">
                <span>Electron Competitors</span>
                <span className="text-red-400 font-bold">1,200+ MB</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 6: Silent System Tray & Auto-Start */}
          <motion.div
            custom={5}
            variants={bentoVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0E101D] p-8 shadow-2xl hover:border-indigo-500/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#514BFA]/15 border border-[#514BFA]/30 text-[#A5A0FF]">
                <Power className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-mono text-slate-400">
                Native Windows
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
              Silent Tray & Auto-Start
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Closes silently to the Windows System Tray and can start automatically on boot. Consumes negligible background CPU while idle.
            </p>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#07080E]/70 p-3 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Background Idle: 0% CPU
              </span>
              <span className="text-indigo-400 font-bold">Instant Wake</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
