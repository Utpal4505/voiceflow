"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Does VoiceFlow require an active internet connection?",
    a: "No! Once VoiceFlow downloads the lightweight base AI model (~140 MB) on your initial launch, it works 100% offline. You can dictate seamlessly on airplanes, trains, or in high-security facilities with zero Wi-Fi.",
  },
  {
    q: "Which Windows applications can I dictate into?",
    a: "Every single one! Because VoiceFlow simulates native Windows keyboard keystrokes using a low-level hook, you can dictate into Notepad, Google Chrome, Microsoft Word, Slack, VS Code, Cursor, Discord, WhatsApp Desktop, Notion, and PowerShell terminal consoles.",
  },
  {
    q: "Is my microphone audio or voice data ever stored or recorded?",
    a: "Never. Your microphone audio is processed strictly in RAM by local OpenAI Whisper and immediately discarded after transcription. No audio files or transcript logs are saved to your drive, and zero bytes leave your computer.",
  },
  {
    q: "What are the hardware and system requirements?",
    a: "VoiceFlow runs on 64-bit Windows 10 or Windows 11 with at least 4 GB of RAM. Any modern Intel or AMD CPU with AVX/AVX2 support (manufactured after 2013) will run VoiceFlow smoothly without requiring a dedicated GPU.",
  },
  {
    q: "How do in-app updates work?",
    a: "VoiceFlow features an automated, cryptographically signed updater. It checks your GitHub Releases repository in the background at most once every 12 hours. When an update is published, a small prompt lets you update and restart with a single click.",
  },
  {
    q: "Can I customize the hotkey shortcut?",
    a: "By default, VoiceFlow uses Ctrl + Space because it is fast, ergonomic, and does not conflict with standard Windows shortcuts. Custom hotkey rebinding is scheduled for an upcoming release.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-24 bg-[#090A10] border-t border-white/[0.08]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-xs font-semibold text-slate-300 mb-4">
            <HelpCircle className="h-3.5 w-3.5 text-cyan-300" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Everything you need to know about VoiceFlow privacy, offline AI, and performance.
          </p>
        </motion.div>

        <div className="mt-14 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E101D] transition-all duration-200 hover:border-white/[0.15]"
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-cyan-300" : ""
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
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3 overflow-hidden"
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
