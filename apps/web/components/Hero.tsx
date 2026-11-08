"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  PlaneTakeoff,
  Mic,
  Lock,
  Sparkles,
  Copy,
  Check,
  Cpu,
  Sliders,
} from "lucide-react";

function GithubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ width: "20px", height: "20px" }}
      width={20}
      height={20}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function WindowsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ width: "20px", height: "20px" }}
      width={20}
      height={20}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.802" />
    </svg>
  );
}

export default function Hero() {
  const [copiedWinget, setCopiedWinget] = useState(false);

  const downloadExeUrl =
    "https://github.com/Utpal4505/voiceflow/releases/latest/download/VoiceFlow_0.2.0_x64-setup.exe";
  const downloadZipUrl =
    "https://github.com/Utpal4505/voiceflow/releases/latest/download/VoiceFlow_0.2.0_x64-setup.zip";

  const wingetCmd = "winget install Utpal.VoiceFlow";

  const handleCopyWinget = () => {
    navigator.clipboard.writeText(wingetCmd);
    setCopiedWinget(true);
    setTimeout(() => setCopiedWinget(false), 2200);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      {/* Subtle Dot Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-30 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_35%,#000_60%,transparent_100%)]" />

      {/* Atmospheric Glow Mesh */}
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 h-[520px] w-[950px] rounded-full bg-gradient-to-tr from-[#514BFA]/20 via-purple-600/15 to-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Floating Interactive Micro-Stickers (Inspired by stickitupx.vercel.app) */}
        <div className="hidden xl:block pointer-events-none">
          {/* Sticker 1: Top Left - Hotkey */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: -30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="absolute top-4 -left-6"
          >
            <motion.div
              animate={{ y: [-5, 6, -5] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.14] bg-[#0E101D]/90 px-3.5 py-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#514BFA]/20 text-[#A5A0FF]">
                <Mic className="h-3.5 w-3.5" />
              </div>
              <div className="text-left font-mono text-[11px]">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <span className="keycap text-[10px] py-0 px-1.5">Ctrl</span>
                  <span>+</span>
                  <span className="keycap text-[10px] py-0 px-1.5">Space</span>
                </div>
                <div className="text-slate-400 text-[10px]">Instant Dictation</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sticker 2: Top Right - Air-Gapped Privacy */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: 30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="absolute top-6 -right-6"
          >
            <motion.div
              animate={{ y: [6, -5, 6] }}
              transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-[#0E101D]/90 px-3.5 py-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <div className="text-left font-mono text-[11px]">
                <div className="text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0ms Cloud Latency
                </div>
                <div className="text-slate-400 text-[10px]">100% Air-Gapped CPU</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sticker 3: Mid Left - Hardware Speed */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: -30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="absolute top-48 -left-10"
          >
            <motion.div
              animate={{ y: [4, -6, 4] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-cyan-500/30 bg-[#0E101D]/90 px-3.5 py-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                <Cpu className="h-3.5 w-3.5" />
              </div>
              <div className="text-left font-mono text-[11px]">
                <div className="text-cyan-300 font-semibold">AVX2 Vector Math</div>
                <div className="text-slate-400 text-[10px]">3x Realtime Whisper</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sticker 4: Mid Right - Active Mic Routing */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: 30 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="absolute top-52 -right-8"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4.6, ease: "easeInOut" }}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-indigo-500/30 bg-[#0E101D]/90 px-3.5 py-2 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                <Sliders className="h-3.5 w-3.5" />
              </div>
              <div className="text-left font-mono text-[11px]">
                <div className="text-indigo-300 font-semibold">Active Mic Synced</div>
                <div className="text-slate-400 text-[10px]">Bluetooth & USB Ready</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Top Eyebrow Release Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-[#0D0F1C]/90 px-4 py-1.5 shadow-lg shadow-indigo-500/10 backdrop-blur-md mb-6 hover:border-indigo-500/50 transition-colors"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            VoiceFlow Desktop v0.2.0 is Live
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs font-medium text-cyan-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            100% Offline AI
          </span>
        </motion.div>

        {/* Massive Bold Headline (Inspired by vidyst.com & stickitupx.vercel.app) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]"
        >
          Type at the speed of thought.{" "}
          <span className="inline-block mt-1 sm:mt-0">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.2)] align-middle">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              100% offline.
            </span>
          </span>
        </motion.h1>

        {/* Crisp Subtitle with Inline Branded Micro-Badges */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300"
        >
          Press <span className="keycap">Ctrl</span> + <span className="keycap">Space</span> anywhere on Windows. Dictate into{" "}
          <span className="text-indigo-300 font-semibold">VS Code</span>,{" "}
          <span className="text-sky-300 font-semibold">Slack</span>,{" "}
          <span className="text-amber-300 font-semibold">Word</span>, or{" "}
          <span className="text-emerald-300 font-semibold">Chrome</span> powered by CPU-accelerated OpenAI Whisper. Zero audio ever leaves your PC.
        </motion.p>

        {/* Modern Dual Action Bar: Winget Command + Direct Download (stickitupx & vidyst style) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary High-Converting CTA Button */}
          <motion.a
            href={downloadExeUrl}
            download
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#514BFA] via-[#635BFF] to-[#7772FF] px-7 py-4 text-white shadow-[0_0_35px_rgba(81,75,250,0.45)] hover:shadow-[0_0_55px_rgba(81,75,250,0.7)] transition-all cursor-pointer"
          >
            <WindowsIcon className="h-5 w-5 fill-current shrink-0" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Direct Windows Installer
              </div>
              <div className="text-base font-bold leading-tight">
                Download for Windows (.exe)
              </div>
            </div>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1.5 transition-transform" />
          </motion.a>

          {/* Interactive 1-Click Winget Copy Pill (like npm i in stickitupx) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyWinget}
            className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-2xl border border-white/[0.14] bg-[#0E101D] hover:bg-white/[0.06] px-5 py-4 text-sm font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg group"
            title="Click to copy winget command"
          >
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-bold">$</span>
              <span className="text-slate-200 font-medium select-all">{wingetCmd}</span>
            </div>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.08] group-hover:bg-[#514BFA]/30 text-slate-300 group-hover:text-cyan-300 transition-colors ml-2"
              aria-label="Copy command"
            >
              {copiedWinget ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </motion.div>

          {/* Star on GitHub */}
          <motion.a
            href="https://github.com/Utpal4505/voiceflow"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-[#0E101D] hover:bg-white/[0.06] px-5 py-4 text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-lg"
          >
            <GithubIcon className="h-5 w-5" />
            <span>GitHub</span>
          </motion.a>
        </motion.div>

        {/* Copied Toast Indicator */}
        <div className="h-5 mt-2">
          {copiedWinget && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-emerald-400 flex items-center justify-center gap-1"
            >
              <Check className="h-3 w-3" /> Copied to clipboard! Run in Windows Terminal or PowerShell.
            </motion.p>
          )}
        </div>

        {/* Small OS Reassurance & Portable Alternative */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-2 text-xs text-slate-400"
        >
          Windows 11 / 10 (64-bit) • Single installer (~25 MB) •{" "}
          <a
            href={downloadZipUrl}
            download
            className="text-cyan-300 hover:underline cursor-pointer font-medium"
          >
            Download portable .zip
          </a>
        </motion.p>

        {/* Social Proof Avatar Stack (Inspired by stickitupx.vercel.app) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-md"
        >
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#07080E] bg-gradient-to-tr from-purple-500 to-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
              JD
            </div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#07080E] bg-gradient-to-tr from-cyan-500 to-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
              AK
            </div>
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#07080E] bg-gradient-to-tr from-emerald-500 to-teal-500 text-[10px] font-bold text-white flex items-center justify-center">
              US
            </div>
          </div>
          <span className="text-xs font-medium text-slate-300">
            Trusted by <strong className="text-white font-semibold">1,200+</strong> developers, researchers & privacy-first writers
          </span>
        </motion.div>

        {/* 4 Trust Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E101D]/60 py-2.5 px-3 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="truncate">100% Private (Zero Cloud)</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E101D]/60 py-2.5 px-3 text-xs text-slate-300">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="truncate">AVX2 Vector Accelerated</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E101D]/60 py-2.5 px-3 text-xs text-slate-300">
            <WindowsIcon className="h-3.5 w-3.5 text-[#514BFA] shrink-0" />
            <span className="truncate">Works in Any Windows App</span>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E101D]/60 py-2.5 px-3 text-xs text-slate-300">
            <PlaneTakeoff className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="truncate">Airplane Mode Ready</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
