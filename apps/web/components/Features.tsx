import React from "react";
import { Shield, Keyboard, Cpu, Power, Box, RefreshCw } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "100% Private & Offline",
    description:
      "All speech-to-text processing occurs strictly on your local CPU using OpenAI Whisper. Zero audio or transcripts ever touch an external server.",
    tag: "Zero Cloud",
  },
  {
    icon: Keyboard,
    title: "Global Ctrl + Space Hotkey",
    description:
      "A seamless low-level Windows keyboard hook lets you dictate into any focused application: Notepad, Word, Slack, Chrome, VS Code, or WhatsApp.",
    tag: "Everywhere",
  },
  {
    icon: Cpu,
    title: "AVX2 CPU Acceleration",
    description:
      "Compiled with AVX, AVX2, and FMA vector math instructions. Transcribes 3x faster than real-time speech without requiring a dedicated GPU.",
    tag: "Fast & Light",
  },
  {
    icon: Power,
    title: "Silent Autostart & System Tray",
    description:
      "Closes silently to the Windows System Tray and registers with Windows Registry to start automatically on system boot without annoying windows.",
    tag: "Native Windows",
  },
  {
    icon: Box,
    title: "Self-Contained Portable Runtime",
    description:
      "Requires zero developer tooling. No Node.js, Git, or Python needed on your laptop. Includes everything inside a single 25 MB installer.",
    tag: "No Setup",
  },
  {
    icon: RefreshCw,
    title: "Cryptographic Auto-Updater",
    description:
      "Receive future features, models, and improvements automatically. Signed with Minisign cryptography and checked at most once every 12 hours.",
    tag: "Seamless",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 border-t border-white/[0.06] bg-[#0A0B10]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#514BFA]/30 bg-[#514BFA]/10 px-3.5 py-1 text-xs font-semibold text-[#A5A0FF] mb-4">
            Engineered for Windows
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why VoiceFlow is the Ultimate Dictation Tool
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Designed from the ground up to replace expensive cloud subscriptions with pure, local, private computing power.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121422]/60 hover:bg-[#121422] p-8 shadow-lg hover:border-[#7772FF]/40 hover:shadow-[0_0_30px_rgba(81,75,250,0.15)] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#514BFA]/10 border border-[#514BFA]/20 text-[#A5A0FF] group-hover:bg-[#514BFA]/20 group-hover:scale-105 transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-400">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
