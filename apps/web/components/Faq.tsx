"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { trackFaqToggled } from "../lib/analytics";

const FAQS = [
  {
    q: "Does VoiceFlow require an active internet connection?",
    a: "No! Once VoiceFlow initializes the lightweight base AI model (~140 MB) on your initial launch, it runs 100% offline. You can dictate seamlessly on airplanes, remote locations, or in high-security facilities with zero Wi-Fi.",
  },
  {
    q: "Which applications can I dictate into?",
    a: "Every single one! Because VoiceFlow simulates native keyboard keystrokes via low-level OS input hooks, you can dictate directly into Slack, VS Code, Notion, Discord, Google Docs, Chrome, Safari, Notes, Xcode, and terminal consoles on both Windows and macOS.",
  },
  {
    q: "Is my microphone audio or voice data ever stored or recorded?",
    a: "Never. Your microphone audio is processed strictly in volatile RAM by the local Whisper engine and is wiped immediately after transcription. No audio recordings or transcript logs are ever saved to external servers or your hard drive.",
  },
  {
    q: "What are the hardware and system requirements?",
    a: "VoiceFlow supports 64-bit Windows 10 & 11, as well as macOS 12+ (Monterey, Ventura, Sonoma, Sequoia) on both Apple Silicon (M1/M2/M3/M4) and Intel Macs. It runs in real-time on standard CPUs with 4 GB+ RAM — zero expensive GPU required.",
  },
  {
    q: "How does VoiceFlow avoid stealing window focus?",
    a: "VoiceFlow utilizes the native Windows WS_EX_NOACTIVATE window style. The stealth HUD floats right above your cursor without switching active window focus, minimizing full-screen apps, or interrupting your typing flow.",
  },
  {
    q: "Can I customize the hotkey and add technical vocabulary?",
    a: "By default, VoiceFlow uses Ctrl + Space because it is fast, ergonomic, and does not conflict with standard Windows shortcuts. You can also add proprietary acronyms, technical terms, and client names inside the Vocabulary manager for 100% spelling precision.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    const isOpening = openIndex !== i;
    setOpenIndex(isOpening ? i : null);
    if (isOpening && FAQS[i]) {
      trackFaqToggled(FAQS[i].q, true);
    }
  };

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-[#212121] relative overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-slate-300 mb-4 shadow-sm backdrop-blur-md">
            <HelpCircle className="h-3.5 w-3.5 text-[#FACC15]" />
            <span>Common Questions</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Frequently Asked{" "}
            <span className="relative inline-block">
              Questions.
              {/* Architectural Curiosity Accent (Handcrafted Gentle Floating Sparkle) */}
              <motion.span
                initial={{ opacity: 0, rotate: -25, scale: 0.5 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 340, damping: 16, delay: 0.25 }}
                className="inline-block ml-1.5 text-[#FACC15] select-none text-2xl sm:text-4xl align-middle"
              >
                ✦
              </motion.span>
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Everything you need to know about VoiceFlow privacy, offline AI, and performance.
          </p>
        </motion.div>

        <div className="mt-14 space-y-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] transition-all duration-200 hover:border-white/20 shadow-sm"
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-white transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 overflow-hidden"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
