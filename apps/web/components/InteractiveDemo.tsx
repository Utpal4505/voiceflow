"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Sparkles, Play, RotateCcw, Code, MessageSquare, FileText } from "lucide-react";

interface AppPreset {
  id: string;
  appName: string;
  icon: typeof Code;
  fileName: string;
  contextHeader: string;
  textToType: string;
}

const APPS: AppPreset[] = [
  {
    id: "vscode",
    appName: "VS Code / Cursor",
    icon: Code,
    fileName: "audio_engine.rs",
    contextHeader: "fn process_voice_stream(audio: &[f32]) {",
    textToType: "  // AVX2 accelerated inference: transcribed 100% locally on CPU without external cloud APIs",
  },
  {
    id: "slack",
    appName: "Slack / Teams",
    icon: MessageSquare,
    fileName: "#engineering-updates",
    contextHeader: "Utpal [10:45 AM]:",
    textToType: "Hey team, the Windows background hotkey (Ctrl + Space) is silky smooth. Zero audio leaves the laptop!",
  },
  {
    id: "notepad",
    appName: "Notepad / Word",
    icon: FileText,
    fileName: "HIPAA_Privacy_Review.txt",
    contextHeader: "SECTION 4: DATA RETENTION & SECURITY COMPLIANCE",
    textToType: "VoiceFlow operates completely air-gapped. No voice recordings or text logs are uploaded to any third party.",
  },
];

export default function InteractiveDemo() {
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [tick, setTick] = useState(0);
  const [resetCount, setResetCount] = useState(0);

  const currentApp = APPS[activeAppIndex];
  const fullText = currentApp.textToType;

  // Soundwave animation tick
  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, [isTyping]);

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
    }, 35);

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
      {/* Outer Window Container (Simulated Windows 11 App Window) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0A0C14] shadow-[0_20px_70px_rgba(0,0,0,0.85)]">
        {/* Windows 11 Window Titlebar */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#0E101A] px-4">
          <div className="flex items-center gap-3">
            {/* Windows 11 Window Controls */}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 hover:opacity-100 transition-opacity" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
            </div>

            {/* App Tab Pills */}
            <div className="hidden sm:flex items-center gap-1 ml-3">
              {APPS.map((app, idx) => {
                const Icon = app.icon;
                const isActive = activeAppIndex === idx;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleRestart(idx)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-white/[0.08] text-white border border-white/[0.1]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{app.appName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-[#514BFA]/10 border border-[#514BFA]/25 px-2 py-0.5 font-mono text-[10px] text-[#A5A0FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              AVX2 Realtime CPU
            </span>
          </div>
        </div>

        {/* Text Document / Application Canvas */}
        <div className="relative p-6 sm:p-10 min-h-[300px] sm:min-h-[330px] flex flex-col justify-between bg-gradient-to-b from-[#0A0C14] to-[#07080D]">
          {/* Simulated App Context */}
          <div className="font-mono text-xs text-slate-400 select-none pb-2 border-b border-white/[0.04]">
            <span className="text-[#A5A0FF]">{currentApp.fileName}</span> — {currentApp.contextHeader}
          </div>

          {/* Simulated Document Typing Line */}
          <div className="my-auto font-sans text-base sm:text-xl text-slate-100 leading-relaxed max-w-3xl">
            <span className="text-slate-400 mr-3 select-none font-mono text-sm">▶</span>
            <span>{displayedText}</span>
            <span className="inline-block h-5 w-0.5 bg-[#7772FF] ml-1 animate-pulse" />
          </div>

          {/* Floating VoiceFlow Dictation Pill (Exact Desktop Overlay Replica) */}
          <div className="mx-auto mt-6 flex items-center gap-3.5 rounded-2xl border border-[#7772FF]/40 bg-[#121422]/95 px-5 py-3 shadow-[0_0_40px_rgba(81,75,250,0.35)] backdrop-blur-2xl">
            {/* Logo */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#514BFA]/20 border border-[#514BFA]/30">
              <Image src="/logo.svg" alt="VoiceFlow" width={18} height={18} />
            </div>

            {/* State Indicator */}
            {isTyping ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-red-300">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Listening...</span>
              </div>
            ) : isFinished ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Check className="h-4 w-4" />
                <span>Inserted</span>
              </div>
            ) : null}

            {/* Animated Equalizer Waveform */}
            <div className="flex items-center gap-1 h-6 px-1">
              {[35, 75, 50, 90, 65, 30, 85, 55, 95, 45, 70, 40].map((baseHeight, i) => {
                const waveHeight = isTyping
                  ? Math.max(20, (baseHeight * (0.6 + 0.4 * Math.sin(tick * 0.4 + i))) % 100)
                  : 20;
                return (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-[#514BFA] to-[#A5A0FF] transition-all duration-150"
                    style={{
                      height: `${waveHeight}%`,
                      opacity: isTyping ? 1 : 0.35,
                    }}
                  />
                );
              })}
            </div>

            {/* Hint Badge */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] font-mono text-slate-300">
              <span>Enter to finish</span>
            </div>
          </div>
        </div>

        {/* Demo Preset Switcher Bar */}
        <div className="border-t border-white/[0.08] bg-[#0E101A] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-[#A5A0FF]" />
            <span className="font-semibold text-white">Switch Application:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {APPS.map((app, i) => (
              <button
                key={app.id}
                onClick={() => handleRestart(i)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeAppIndex === i
                    ? "bg-[#514BFA] text-white shadow-sm shadow-[#514BFA]/40"
                    : "border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white"
                }`}
              >
                <Play className="h-3 w-3" />
                <span>{app.appName}</span>
              </button>
            ))}

            <button
              onClick={() => handleRestart(activeAppIndex)}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
              title="Restart current dictation"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Replay</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
