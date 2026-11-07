import React from "react";
import Image from "next/image";
import { Download, ArrowRight, Shield } from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function Footer() {
  const downloadExeUrl =
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow_0.2.0_x64-setup.exe";

  return (
    <footer className="border-t border-white/[0.08] bg-[#07080D]">
      {/* Pre-footer Call to Action Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-[#514BFA]/40 bg-gradient-to-b from-[#121426] to-[#0A0C16] p-8 sm:p-12 text-center shadow-[0_0_60px_-15px_rgba(81,75,250,0.3)]">
          {/* Subtle Ambient Radial Highlight */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-[#514BFA]/20 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" />
              <span>100% Free & Open Source</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to type at the speed of thought?
            </h2>

            <p className="text-sm sm:text-base text-slate-300">
              Download VoiceFlow for Windows today. Zero cloud, zero subscriptions, and complete offline privacy.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={downloadExeUrl}
                download
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#514BFA] to-[#7772FF] hover:from-[#4338CA] hover:to-[#514BFA] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#514BFA]/30 hover:shadow-[#514BFA]/50 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download VoiceFlow (.exe)</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>

              <a
                href="https://github.com/Utpal4505/voiceflow"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <GithubIcon className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 pt-2">
              Windows 11 / 10 • Single installer (~25 MB) • No account needed
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="border-t border-white/[0.06] py-10 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#514BFA]/20 border border-[#514BFA]/30">
              <Image src="/logo.svg" alt="VoiceFlow" width={22} height={22} />
            </div>
            <div>
              <span className="text-sm font-bold text-white">VoiceFlow</span>
              <p className="text-[11px] text-slate-400">100% Offline AI Voice Typing for Windows</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <a
              href="https://github.com/Utpal4505/voiceflow"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://github.com/Utpal4505/voiceflow/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Releases
            </a>
            <a
              href="https://github.com/Utpal4505/voiceflow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Report Issue
            </a>
            <a
              href="https://github.com/Utpal4505/voiceflow/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              MIT License
            </a>
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            Open-Source under MIT License • Powered by Whisper C++
          </div>
        </div>
      </div>
    </footer>
  );
}
