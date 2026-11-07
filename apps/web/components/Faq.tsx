"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Does VoiceFlow require an internet connection?",
    a: "No! Once VoiceFlow downloads the lightweight base AI model (~140 MB) on your first launch, it works 100% offline. You can dictate while on airplanes, trains, or in locations with zero Wi-Fi.",
  },
  {
    q: "Which Windows applications can I dictate into?",
    a: "Every single one! Because VoiceFlow simulates native Windows keyboard inputs, you can dictate into Notepad, Google Chrome, Microsoft Word, Slack, VS Code, Discord, WhatsApp Desktop, Notion, and terminal consoles.",
  },
  {
    q: "Is my microphone audio or speech recorded?",
    a: "Never. Your microphone audio is processed in memory on your CPU by OpenAI Whisper and immediately discarded after transcription. No audio files are saved to your drive, and zero bytes leave your computer.",
  },
  {
    q: "What are the hardware requirements?",
    a: "VoiceFlow runs on any 64-bit Windows 10 or Windows 11 machine with at least 4 GB of RAM. Any Intel or AMD CPU with AVX/AVX2 support (manufactured after 2013) will run VoiceFlow smoothly.",
  },
  {
    q: "How do in-app updates work?",
    a: "VoiceFlow features an automated, cryptographically signed updater. It checks your GitHub Releases repository in the background at most once every 12 hours. When an update is published, a small prompt lets you update and restart with a single click.",
  },
  {
    q: "Can I customize the hotkey?",
    a: "By default, VoiceFlow uses Ctrl + Space because it is fast, ergonomic, and does not conflict with standard Windows shortcuts. We are adding custom hotkey rebinding in an upcoming release.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-20 bg-[#0A0B10] border-t border-white/[0.06]">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1 text-xs font-semibold text-slate-300 mb-4">
            Common Questions
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#121422] transition-colors"
              >
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white hover:text-[#A5A0FF] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#A5A0FF]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
