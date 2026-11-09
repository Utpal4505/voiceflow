"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";

function WindowsLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0h256v256H0z" fill="none" />
      <path
        fill="#0078d4"
        d="M0 0h121.329v121.329H0zm134.671 0H256v121.329H134.671zM0 134.671h121.329V256H0zm134.671 0H256V256H134.671z"
      />
    </svg>
  );
}

export default function SmartScreenGuide() {
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  return (
    <section
      id="smartscreen"
      className="py-16 sm:py-24 bg-[#212121] text-white relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
        <div className="rounded-3xl border border-white/10 bg-[#181818] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Reassuring Step-by-Step Instructions */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 font-sans mb-3 shadow-2xs">
                  <WindowsLogo className="w-3.5 h-3.5 shrink-0" />
                  <span>Windows SmartScreen Notice</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                  How to launch VoiceFlow
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                  Because VoiceFlow is a newly released independent application, Microsoft Defender displays
                  a standard informational prompt on first launch until reputation builds with Windows.
                </p>
              </div>

              {/* Clickable Step Selector Cards */}
              <div className="space-y-2.5 font-sans">
                {/* Step 1 Selector */}
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`w-full text-left flex items-start gap-3.5 rounded-2xl p-4 border transition-all cursor-pointer ${
                    activeStep === 1
                      ? "bg-white/10 border-blue-400/40 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-slate-400 hover:border-white/15"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-xs font-mono transition-colors ${
                      activeStep === 1 ? "bg-[#0078D7] text-white" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    1
                  </span>
                  <div>
                    <p className="font-bold text-sm text-white">Click &ldquo;More info&rdquo;</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Click the underlined link on the blue Windows Defender dialog.
                    </p>
                  </div>
                </button>

                {/* Step 2 Selector */}
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`w-full text-left flex items-start gap-3.5 rounded-2xl p-4 border transition-all cursor-pointer ${
                    activeStep === 2
                      ? "bg-white/10 border-emerald-400/40 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-slate-400 hover:border-white/15"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold text-xs font-mono transition-colors ${
                      activeStep === 2 ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    2
                  </span>
                  <div>
                    <p className="font-bold text-sm text-white">Click &ldquo;Run anyway&rdquo;</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      The action button unlocks at the bottom right. VoiceFlow launches instantly.
                    </p>
                  </div>
                </button>
              </div>

              {/* Verified Security Proof Checklist */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-300 pt-2 border-t border-white/5 font-sans">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                  100% VirusTotal Clean
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                  Zero External Telemetry
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  ~25 MB Native Binary
                </span>
              </div>
            </div>

            {/* Right: Exact Windows Defender SmartScreen Dialog (Pixel-matched to Windows) */}
            <div className="lg:col-span-6 w-full flex justify-center">
              <div className="w-full max-w-[420px] rounded-lg bg-[#004e8c] text-white p-6 sm:p-7 shadow-2xl relative font-sans border border-blue-400/20 select-none">
                {/* Authentic Windows Close Button (White square top-right) */}
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep === 1 ? 2 : 1)}
                  className="absolute top-0 right-0 w-8 h-7 bg-white text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Dialog Header */}
                <h4 className="text-xl sm:text-2xl font-light text-white tracking-normal font-sans pt-1">
                  Windows protected your PC
                </h4>

                {/* Dialog Body Text */}
                <p className="mt-3 text-xs sm:text-sm text-white/95 leading-relaxed font-sans">
                  Windows Defender SmartScreen prevented an unrecognized app from starting. Running this app
                  might put your PC at risk.
                </p>

                {/* State 1 vs State 2 conditional rendering */}
                {activeStep === 1 ? (
                  /* Screen 1: Initial Warning Screen */
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="text-xs sm:text-sm text-white underline underline-offset-2 hover:text-blue-100 cursor-pointer font-sans"
                    >
                      More info
                    </button>

                    <div className="h-16" />

                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="bg-white text-slate-900 px-6 py-2 text-xs font-semibold shadow-xs hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Don&apos;t run
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Screen 2: Expanded Screen revealing 'Run anyway' */
                  <div className="mt-3">
                    <div className="text-xs sm:text-sm text-white/95 space-y-1 font-sans">
                      <div>
                        App: <span className="font-semibold text-white">VoiceFlow-Setup.exe</span>
                      </div>
                      <div>
                        Publisher: <span className="font-semibold text-white">Unknown publisher</span>
                      </div>
                    </div>

                    <div className="h-10" />

                    <div className="flex justify-end items-center gap-3 pt-3">
                      <button
                        type="button"
                        className="border border-white text-white bg-white/10 hover:bg-white/20 px-5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        Run anyway
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="border border-white text-white hover:bg-white/10 px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Don&apos;t run
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
