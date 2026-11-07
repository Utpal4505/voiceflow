import React from "react";
import { Check, X } from "lucide-react";

export default function Comparison() {
  const rows = [
    {
      feature: "Audio Processing",
      voiceflow: "100% Local CPU (Zero Cloud)",
      cloud: "Streamed to Remote Cloud Servers",
      winner: true,
    },
    {
      feature: "Pricing & License",
      voiceflow: "100% Free & Open Source (MIT)",
      cloud: "$12 - $30 / month recurring fee",
      winner: true,
    },
    {
      feature: "Works Without Internet",
      voiceflow: "Yes (Airplane Mode Ready)",
      cloud: "No (Fails immediately with no Wi-Fi)",
      winner: true,
    },
    {
      feature: "Privacy & Data Retention",
      voiceflow: "Zero audio kept or logged to disk",
      cloud: "Voice data retained & used for training",
      winner: true,
    },
    {
      feature: "System-Wide Windows Hotkey",
      voiceflow: "Ctrl + Space (Any active app)",
      cloud: "Restricted to browser or custom app",
      winner: true,
    },
    {
      feature: "AI Model Transparency",
      voiceflow: "OpenAI Whisper (Auditable)",
      cloud: "Proprietary black-box cloud APIs",
      winner: true,
    },
  ];

  return (
    <section id="comparison" className="py-20 border-t border-white/[0.06] bg-[#07080D]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-4">
            The Better Choice
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            VoiceFlow vs. Cloud Dictation Services
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Why pay monthly subscription fees to companies that listen to your private audio when your CPU can do it for free?
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E101A] shadow-2xl">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header Row */}
              <div className="grid grid-cols-12 border-b border-white/[0.08] bg-[#121422] p-4 sm:p-5 text-xs sm:text-sm font-semibold">
                <div className="col-span-5 text-slate-300">Feature</div>
                <div className="col-span-4 text-[#A5A0FF] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#514BFA]" />
                  <span>VoiceFlow</span>
                  <span className="rounded bg-[#514BFA]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#A5A0FF]">
                    Recommended
                  </span>
                </div>
                <div className="col-span-3 text-slate-400">Cloud Dictation SaaS</div>
              </div>

              {/* Data Rows */}
              <div className="divide-y divide-white/[0.06] text-xs sm:text-sm">
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="col-span-5 font-medium text-slate-200">
                      {row.feature}
                    </div>
                    <div className="col-span-4 text-emerald-300 font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{row.voiceflow}</span>
                    </div>
                    <div className="col-span-3 text-slate-400 flex items-center gap-2">
                      <X className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{row.cloud}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
