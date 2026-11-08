"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Code,
  MessageSquare,
  FileText,
  Minus,
  Square,
  X,
  RotateCcw,
  Sparkles,
  Globe,
} from "lucide-react";

interface AppPreset {
  id: string;
  appName: string;
  icon: typeof Code;
  fileName: string;
  appTitle: string;
  contextHeader: string;
  textToType: string;
}

const APPS: AppPreset[] = [
  {
    id: "vscode",
    appName: "VS Code / Cursor",
    icon: Code,
    fileName: "audio_engine.rs",
    appTitle: "audio_engine.rs — VoiceFlow Desktop (Visual Studio Code)",
    contextHeader: "fn process_voice_stream(audio: &[f32]) {",
    textToType: "  // AVX2 accelerated inference: transcribed 100% locally on CPU without external cloud APIs",
  },
  {
    id: "slack",
    appName: "Slack / Teams",
    icon: MessageSquare,
    fileName: "#engineering-sprint",
    appTitle: "#engineering-sprint — Slack Workspace",
    contextHeader: "Utpal Singh [10:48 AM]:",
    textToType: "Just pressed Ctrl + Space to dictate this entire technical brief in real-time. Offline AI is insanely snappy!",
  },
  {
    id: "notepad",
    appName: "Notepad / Word",
    icon: FileText,
    fileName: "Security_Audit.txt",
    appTitle: "Security_Audit.txt — Notepad (Windows 11)",
    contextHeader: "ENTERPRISE AIR-GAPPED VERIFICATION:",
    textToType: "Zero external network egress detected. VoiceFlow operates fully air-gapped with zero telemetry and zero cloud storage.",
  },
  {
    id: "whatsapp",
    appName: "WhatsApp / Chrome",
    icon: Globe,
    fileName: "web.whatsapp.com",
    appTitle: "WhatsApp Web — Google Chrome",
    contextHeader: "Message to Dev Team:",
    textToType: "Hey team! Dictating this straight into WhatsApp via VoiceFlow's global hook. No focus leaks or lag!",
  },
];

export default function InteractiveDemo() {
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  const currentApp = APPS[activeAppIndex];
  const fullText = currentApp.textToType;

  // Typing simulator effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setIsFinished(true);
      }
    }, 28);

    return () => clearInterval(typingInterval);
  }, [activeAppIndex, fullText, resetCount]);

  const handleRestart = (index: number) => {
    setActiveAppIndex(index);
    setDisplayedText("");
    setIsTyping(true);
    setIsFinished(false);
    setResetCount((c) => c + 1);
  };

  return (
    <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
      {/* Outer Windows 11 Fluent App Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0A0C16] shadow-[0_25px_80px_rgba(0,0,0,0.85)]"
      >
        {/* Title Bar */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#0E101D] px-4 select-none">
          {/* Windows 4-Square Logo & App Title */}
          <div className="flex items-center gap-2.5">
            <svg
              className="h-3.5 w-3.5 fill-[#514BFA]"
              style={{ width: "14px", height: "14px" }}
              width={14}
              height={14}
              viewBox="0 0 24 24"
            >
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.802" />
            </svg>
            <span className="text-xs font-medium text-slate-300 truncate max-w-[280px] sm:max-w-md">
              {currentApp.appTitle}
            </span>
          </div>

          {/* Realtime Status Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-[#514BFA]/10 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AVX2 Realtime CPU
            </span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center">
            <button className="flex h-8 w-10 items-center justify-center text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors">
              <Minus className="h-3 w-3" />
            </button>
            <button className="flex h-8 w-10 items-center justify-center text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors">
              <Square className="h-2.5 w-2.5" />
            </button>
            <button className="flex h-8 w-10 items-center justify-center text-slate-400 hover:bg-red-500/80 hover:text-white transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Header */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-[#0A0C16] px-4 py-2.5">
          {APPS.map((app, index) => {
            const Icon = app.icon;
            const isActive = activeAppIndex === index;
            return (
              <button
                key={app.id}
                onClick={() => handleRestart(index)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#514BFA]/20 border border-[#514BFA]/40 text-white shadow-sm shadow-[#514BFA]/20"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-300" : "text-slate-400"}`} />
                <span>{app.appName}</span>
              </button>
            );
          })}
        </div>

        {/* Editor / Canvas Viewport */}
        <div className="relative p-6 sm:p-10 font-mono text-sm leading-relaxed min-h-[220px] sm:min-h-[260px] bg-[#07080E]/70">
          {/* File Header */}
          <div className="text-slate-500 text-xs mb-4 flex items-center gap-2 select-none">
            <span className="text-indigo-400 font-semibold">{currentApp.fileName}</span>
            <span>—</span>
            <span>{currentApp.contextHeader}</span>
          </div>

          {/* Dictated Text with Animated Typing Caret */}
          <div className="text-slate-100 whitespace-pre-wrap font-mono text-sm sm:text-base">
            <span className="text-[#514BFA] mr-2">▶</span>
            {displayedText}
            <span
              className={`inline-block w-2 h-4 sm:h-5 ml-1 bg-[#514BFA] align-middle ${
                isTyping ? "animate-pulse" : "opacity-0"
              }`}
            />
          </div>

          {/* VoiceFlow Floating Overlay Pill (Authentic Windows Overlay Simulation) */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{
              opacity: isFinished ? 1 : isTyping ? 0.9 : 0,
              y: 0,
              scale: 1,
            }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full border border-indigo-500/40 bg-[#0E101D]/95 px-4 py-2 shadow-[0_0_30px_rgba(81,75,250,0.35)] backdrop-blur-xl">
              {/* App Icon */}
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#514BFA]/20 text-cyan-300 border border-[#514BFA]/40">
                <Image
                  src="/logo.svg"
                  alt="VoiceFlow"
                  width={14}
                  height={14}
                  style={{ width: "14px", height: "14px" }}
                />
              </div>

              {/* Status Message */}
              {isFinished ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Inserted into {currentApp.appName.split(" ")[0]}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  {/* Mini Sound Wave Bars */}
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-cyan-400 animate-pulse rounded-full" />
                    <span className="w-0.5 h-2 bg-cyan-400 animate-pulse delay-75 rounded-full" />
                    <span className="w-0.5 h-3.5 bg-cyan-400 animate-pulse delay-150 rounded-full" />
                    <span className="w-0.5 h-2 bg-cyan-400 animate-pulse delay-200 rounded-full" />
                  </div>
                  <span>Transcribing speech locally...</span>
                </div>
              )}

              {/* Finish Hint */}
              <span className="text-[10px] font-mono text-slate-400 border-l border-white/[0.1] pl-2.5">
                Enter to finish
              </span>
            </div>
          </motion.div>
        </div>

        {/* Footer Bar with Replay & Switch Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0E101D] px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Interactive Simulator: Click any tab to test live dictation</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRestart(activeAppIndex)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-slate-200 hover:text-white transition-all cursor-pointer font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Replay Simulation</span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
