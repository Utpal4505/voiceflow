"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Mic, Check, Sparkles, Play, RotateCcw } from "lucide-react";

const DEMO_PRESETS = [
  "VoiceFlow is running completely offline with local Whisper AI.",
  "Refactored the core audio processing engine to use AVX2 vector instructions.",
  "Meeting scheduled for tomorrow at 10 AM to review the desktop release.",
];

export default function InteractiveDemo() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [tick, setTick] = useState(0);

  const fullText = DEMO_PRESETS[activePresetIndex];

  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 150);
    return () => clearInterval(interval);
  }, [isTyping]);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setIsFinished(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setIsFinished(true);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [activePresetIndex, fullText]);

  const handleRestart = (index: number) => {
    setActivePresetIndex(index);
  };

  return (
    <section className="relative mx-auto max-w-5xl px-6 sm:px-8 pb-20">
      {/* Outer Window Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0E1018] shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
        {/* Title Bar */}
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#121422] px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-slate-400">
              VoiceFlow Dictation Simulator • Ctrl + Space
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-slate-400">
              AVX2 Local CPU
            </span>
          </div>
        </div>

        {/* Text Editor Area */}
        <div className="relative p-8 sm:p-12 min-h-[300px] sm:min-h-[340px] flex flex-col justify-between bg-gradient-to-b from-[#0E1018] to-[#0A0B10]">
          {/* Simulated Text Document */}
          <div className="font-sans text-base sm:text-xl text-slate-200 leading-relaxed max-w-2xl">
            <span className="text-slate-500 mr-2 select-none">1</span>
            <span>{displayedText}</span>
            <span className="inline-block h-5 w-0.5 bg-[#7772FF] ml-1 animate-pulse" />
          </div>

          {/* Floating Dictation Overlay Pill (Exact Desktop Replica) */}
          <div className="mx-auto mt-12 flex items-center gap-4 rounded-2xl border border-[#7772FF]/40 bg-[#121422]/95 px-5 py-3 shadow-[0_0_40px_rgba(81,75,250,0.35)] backdrop-blur-2xl">
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

            {/* Live Audio Waveform Simulation */}
            <div className="flex items-center gap-1 h-5 px-2">
              {[40, 80, 55, 95, 70, 30, 85, 60, 100, 45, 75, 50].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-gradient-to-t from-[#514BFA] to-[#A5A0FF] transition-all duration-150"
                  style={{
                    height: isTyping ? `${Math.max(15, (h * Math.sin(tick + i)) % 100)}%` : "20%",
                    opacity: isTyping ? 1 : 0.4,
                  }}
                />
              ))}
            </div>

            {/* Hint Badge */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] font-mono text-slate-400">
              <span>Enter to Finish</span>
            </div>
          </div>
        </div>

        {/* Demo Preset Switcher */}
        <div className="border-t border-white/[0.08] bg-[#121422] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-[#A5A0FF]" />
            <span className="font-semibold text-white">Try Example Sentences:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEMO_PRESETS.map((_, i) => (
              <button
                key={i}
                onClick={() => handleRestart(i)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activePresetIndex === i
                    ? "bg-[#514BFA] text-white shadow-sm"
                    : "border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                <Play className="h-3 w-3" />
                <span>Example {i + 1}</span>
              </button>
            ))}

            <button
              onClick={() => handleRestart(activePresetIndex)}
              className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              title="Replay animation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
