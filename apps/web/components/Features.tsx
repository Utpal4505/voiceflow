import React from "react";
import { Shield, Keyboard, Cpu, Power, Box, RefreshCw, Lock, CheckCircle2 } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-20 border-t border-white/[0.06] bg-[#07080D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#514BFA]/30 bg-[#514BFA]/10 px-3.5 py-1 text-xs font-semibold text-[#A5A0FF] mb-4">
            Engineered for Windows
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Why VoiceFlow is the Ultimate Dictation Tool
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Designed from the ground up to replace expensive cloud subscriptions with pure, local, private computing power.
          </p>
        </div>

        {/* Asymmetrical Bento Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento Card 1 (Hero Feature - Spans 2 Columns on Large Screens) */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0E101A] via-[#121422] to-[#0A0C14] p-8 shadow-xl hover:border-[#7772FF]/40 transition-all duration-300">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#514BFA]/15 blur-3xl" />

            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#514BFA]/20 border border-[#514BFA]/40 text-[#A5A0FF]">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    100% Private & Air-Gapped
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white tracking-tight">
                  Zero Cloud Audio Processing
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 max-w-xl">
                  All speech-to-text inference runs locally in memory on your PC using OpenAI Whisper. Zero audio recordings, zero transcripts, and zero telemetry ever leave your device.
                </p>

                {/* Privacy Safeguards List */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Works in Airplane Mode (No Wi-Fi)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Zero audio cached or saved to disk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Safe for healthcare & NDA work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>No accounts, passwords, or tracking</span>
                  </div>
                </div>
              </div>

              {/* Visual Airgap Diagram */}
              <div className="hidden sm:flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#07080D]/80 p-5 shrink-0 shadow-inner">
                <Lock className="h-8 w-8 text-emerald-400" />
                <span className="mt-2 font-mono text-[11px] font-semibold text-white">
                  Local Memory Only
                </span>
                <span className="text-[10px] text-slate-400">Zero Cloud Egress</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Global Ctrl + Space Hotkey */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E101A] p-8 shadow-lg hover:border-[#7772FF]/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  <Keyboard className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-300">
                  Everywhere
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                Global Ctrl + Space Hotkey
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                A seamless low-level Windows keyboard hook lets you dictate into any focused application: Notepad, Word, Slack, Chrome, VS Code, or WhatsApp.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2">
              <span className="keycap">Ctrl</span>
              <span className="text-slate-400 font-bold">+</span>
              <span className="keycap">Space</span>
              <span className="text-[11px] text-slate-400 ml-2">Invokes anywhere</span>
            </div>
          </div>

          {/* Bento Card 3: AVX2 CPU Vector Acceleration */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E101A] p-8 shadow-lg hover:border-[#7772FF]/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-300">
                  Zero GPU Needed
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                AVX2 CPU Acceleration
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                Compiled with AVX, AVX2, and FMA vector math instructions. Transcribes 3x faster than real-time speech on modern Intel & AMD CPUs without heavy GPU power drain.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-[#A5A0FF] font-medium">
              3x faster than real-time speech
            </div>
          </div>

          {/* Bento Card 4: Self-Contained Portable Runtime */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E101A] p-8 shadow-lg hover:border-[#7772FF]/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <Box className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-300">
                  ~25 MB Single File
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                Self-Contained Runtime
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                Requires zero developer tooling. No Node.js, Python, or Git needed on your laptop. Includes everything inside a single lightweight installer.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-emerald-400 font-medium">
              Zero configuration required
            </div>
          </div>

          {/* Bento Card 5: Silent Autostart & System Tray */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E101A] p-8 shadow-lg hover:border-[#7772FF]/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  <Power className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-300">
                  Native Windows
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                Silent Tray & Auto-Start
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                Closes silently to the Windows System Tray and registers with Windows Registry to start automatically on system boot with minimal RAM footprint (~80 MB idle).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-indigo-300 font-medium">
              Lightweight background process
            </div>
          </div>

          {/* Bento Card 6: Cryptographic Auto-Updater */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0E101A] p-8 shadow-lg hover:border-[#7772FF]/40 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-medium text-slate-300">
                  Minisign Verified
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white tracking-tight">
                Cryptographic Auto-Updater
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                Receive future models and improvements automatically. Signed cryptographically with Minisign and checked at most once every 12 hours from GitHub Releases.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-amber-300 font-medium">
              Secure 1-click update prompt
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
