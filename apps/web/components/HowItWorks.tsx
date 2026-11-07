import React from "react";
import { DownloadCloud, Keyboard, CheckCircle } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: DownloadCloud,
    title: "Download & Launch",
    description:
      "Run the single setup wizard. VoiceFlow opens and automatically downloads the optimized 140 MB Whisper base model on first launch.",
  },
  {
    step: "02",
    icon: Keyboard,
    title: "Press Ctrl + Space",
    description:
      "Click anywhere you can type: a code editor, email, browser, or chat. Press Ctrl + Space and the dictation pill appears floating above your cursor.",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Speak & Instant Insert",
    description:
      "Speak your thoughts naturally. Press Enter (or wait for silence) and VoiceFlow simulates instant keystrokes right where your cursor is blinking.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#0B0C12] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-4">
            Zero Learning Curve
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Up and Running in 3 Steps
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            No command-line setup, no configuration files, and no cloud accounts required.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#121422]/50 p-8 shadow-md"
              >
                {/* Step Number Watermark */}
                <span className="font-mono text-3xl font-bold text-white/[0.08] select-none">
                  {item.step}
                </span>

                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#514BFA]/10 border border-[#514BFA]/30 text-[#A5A0FF]">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
