import React from "react";
import { Info, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function SmartScreenGuide() {
  return (
    <section id="smartscreen" className="py-20 bg-[#0B0C12] border-t border-white/[0.06]">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="rounded-2xl border border-blue-500/30 bg-[#12162A] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Info className="h-5 w-5" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Seeing "Windows protected your PC"? Here's why:
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When installing VoiceFlow on Windows 10 or 11, Microsoft Defender SmartScreen may display a blue warning screen. 
                This happens with all new open-source software because Microsoft charges indie developers <strong>$300-$500/year</strong> for an EV Code Signing certificate. VoiceFlow is free and community-driven, so we haven't purchased one yet.
              </p>

              {/* Steps Box */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0A0D18] p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                  How to install in 2 clicks:
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/30 text-blue-300 font-bold text-[11px]">
                      1
                    </span>
                    <span>Click on the small underlined text: <strong>"More info"</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600/30 text-emerald-300 font-bold text-[11px]">
                      2
                    </span>
                    <span>Click the button: <strong>"Run anyway"</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>VoiceFlow is 100% open-source and virus-free. You can inspect all source code on GitHub.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
