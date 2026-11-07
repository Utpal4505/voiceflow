import React from "react";
import { ShieldCheck, Zap, Laptop, ArrowRight, Github } from "lucide-react";

export default function Hero() {
  const downloadExeUrl =
    "https://github.com/Utpal4505/voiceflow/releases/latest/download/VoiceFlow_0.1.0_x64-setup.exe";
  const downloadZipUrl =
    "https://github.com/Utpal4505/voiceflow/releases/latest/download/VoiceFlow_0.1.0_x64-setup.zip";

  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
      {/* Background Ambient Lighting Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-[#514BFA]/20 via-purple-600/10 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 h-96 w-96 rounded-full bg-[#7772FF]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 text-center">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#514BFA]/30 bg-[#121422]/90 px-4 py-1.5 shadow-inner backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            VoiceFlow Desktop v0.2.0 is Live
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-medium text-[#A5A0FF]">100% Offline AI</span>
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.12]">
          Type at the speed of thought.{" "}
          <span className="bg-gradient-to-r from-[#A5A0FF] via-[#7772FF] to-purple-400 bg-clip-text text-transparent">
            100% offline.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
          Press <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-sm font-semibold text-white">Ctrl + Space</kbd> anywhere on Windows—Chrome, Word, Notepad, Slack, or VS Code. Powered by CPU-accelerated OpenAI Whisper. Zero audio ever leaves your PC.
        </p>

        {/* Primary Download CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={downloadExeUrl}
            download
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#514BFA] to-[#7772FF] hover:from-[#4338CA] hover:to-[#514BFA] px-8 py-4 text-white shadow-[0_0_35px_rgba(81,75,250,0.4)] hover:shadow-[0_0_45px_rgba(81,75,250,0.6)] active:scale-95 transition-all cursor-pointer"
          >
            {/* Windows 4-Square Logo */}
            <svg className="h-6 w-6 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.802" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Direct Windows Installer
              </div>
              <div className="text-base font-bold leading-tight">
                Download for Windows (.exe)
              </div>
            </div>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="https://github.com/Utpal4505/voiceflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-[#121422] hover:bg-white/[0.05] px-6 py-4 text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Github className="h-5 w-5" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Small OS details & Alternative format */}
        <p className="mt-4 text-xs text-slate-400">
          Windows 10 / 11 (64-bit) • Single installer (~25 MB) •{" "}
          <a
            href={downloadZipUrl}
            download
            className="text-[#A5A0FF] hover:underline cursor-pointer"
          >
            Download as .zip
          </a>
        </p>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-white/[0.06] pt-8 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Private (No Cloud Server)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#A5A0FF]" />
            <span>AVX2 CPU Accelerated</span>
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-blue-400" />
            <span>Works in Any Windows App</span>
          </div>
        </div>
      </div>
    </section>
  );
}
