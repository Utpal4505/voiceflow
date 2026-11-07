import React from "react";
import { ShieldAlert, CheckCircle2, ExternalLink } from "lucide-react";

export default function SmartScreenGuide() {
  return (
    <section id="smartscreen" className="py-20 bg-[#07080D] border-t border-white/[0.06]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-500/30 bg-[#0E1326] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Seeing &quot;Windows protected your PC&quot;?
                </h3>
                <span className="rounded-md border border-blue-400/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                  Standard Windows SmartScreen
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When installing VoiceFlow on Windows 10 or 11, Microsoft Defender SmartScreen may display a blue warning screen. 
                This happens with all newly published open-source tools because Microsoft requires indie developers to purchase a costly <strong>$300-$500/year</strong> EV Code Signing certificate. VoiceFlow is 100% free and community-driven, so we have not purchased an enterprise certificate yet.
              </p>

              {/* Windows SmartScreen Mockup UI Box */}
              <div className="rounded-xl border border-blue-400/20 bg-[#070A14] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-200">
                  <span>How to install in 2 clicks:</span>
                  <span className="font-mono text-[11px] text-slate-400">Windows Defender</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-blue-300 font-bold text-xs">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-white">Click &quot;More info&quot;</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Click the small underlined text beneath the paragraph.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600/30 text-emerald-300 font-bold text-xs">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-white">Click &quot;Run anyway&quot;</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        A new button will appear at the bottom right. Click it to launch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Guarantee Callout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-400 font-medium pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>100% open-source under MIT License. Clean, audited, and virus-free.</span>
                </div>
                <a
                  href="https://github.com/Utpal4505/voiceflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-white underline cursor-pointer"
                >
                  <span>Inspect Code on GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
