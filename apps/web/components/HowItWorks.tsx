import React from "react";
import { DownloadCloud, Keyboard, CheckCircle, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: DownloadCloud,
    title: "Download & Launch",
    description:
      "Run the single setup wizard. VoiceFlow opens and automatically downloads the optimized 140 MB Whisper base model on first launch.",
    detail: "No Python or Node.js required",
  },
  {
    step: "02",
    icon: Keyboard,
    title: "Press Ctrl + Space",
    description:
      "Click into any application where you can type. Press Ctrl + Space and the dictation pill appears floating above your cursor.",
    detail: "Intercepts globally across Windows",
  },
  {
    step: "03",
    icon: CheckCircle,
    title: "Speak & Instant Insert",
    description:
      "Speak your thoughts naturally. Press Enter or wait for silence; VoiceFlow simulates instant keystrokes right where your cursor is blinking.",
    detail: "3x faster than real-time speech",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#07080D] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-4">
            Zero Learning Curve
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Up and Running in 3 Steps
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            No command-line setup, no configuration files, and no cloud accounts required.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E101A] p-8 shadow-md hover:border-[#7772FF]/40 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    {/* Step Number Watermark */}
                    <span className="font-mono text-3xl font-extrabold text-white/[0.12] group-hover:text-[#A5A0FF]/30 transition-colors select-none">
                      {item.step}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#514BFA]/10 border border-[#514BFA]/30 text-[#A5A0FF] group-hover:bg-[#514BFA]/20 group-hover:scale-105 transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                  <span>{item.detail}</span>
                  {i < 2 && (
                    <ArrowRight className="hidden md:block h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
