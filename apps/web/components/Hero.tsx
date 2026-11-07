import React from "react";
import { ShieldCheck, Zap, Laptop, ArrowRight, PlaneTakeoff } from "lucide-react";

function GithubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
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

export default function Hero() {
  const downloadExeUrl =
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow_0.2.0_x64-setup.exe";
  const downloadZipUrl =
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow_0.2.0_x64-setup.zip";

  return (
    <section className="relative overflow-hidden pt-16 pb-14 lg:pt-24 lg:pb-20">
      {/* Background Ambient Lighting Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[850px] rounded-full bg-gradient-to-tr from-[#514BFA]/20 via-purple-600/10 to-transparent blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 h-80 w-80 rounded-full bg-[#7772FF]/10 blur-[110px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
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

        {/* Subtitle with Realistic Keycaps */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
          Press <span className="keycap">Ctrl</span> + <span className="keycap">Space</span> anywhere on Windows—Chrome, Word, Notepad, Slack, or VS Code. Powered by local CPU-accelerated OpenAI Whisper. Zero audio ever leaves your PC.
        </p>

        {/* Primary Download CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={downloadExeUrl}
            download
            className="group relative flex w-full sm:w-auto items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-[#514BFA] to-[#7772FF] hover:from-[#4338CA] hover:to-[#514BFA] px-7 py-4 text-white shadow-[0_0_35px_rgba(81,75,250,0.4)] hover:shadow-[0_0_50px_rgba(81,75,250,0.65)] active:scale-95 transition-all cursor-pointer"
          >
            {/* Windows 4-Square Logo */}
            <svg
              className="h-6 w-6 fill-current shrink-0"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="https://github.com/Utpal4505/voiceflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-[#121422] hover:bg-white/[0.06] px-6 py-4 text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <GithubIcon className="h-5 w-5" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Small OS details & Alternative format */}
        <p className="mt-4 text-xs text-slate-400">
          Windows 11 / 10 (64-bit) • Single installer (~25 MB) •{" "}
          <a
            href={downloadZipUrl}
            download
            className="text-[#A5A0FF] hover:underline cursor-pointer font-medium"
          >
            Download as .zip
          </a>
        </p>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-white/[0.06] pt-8 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>100% Private (Zero Cloud)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#A5A0FF]" />
            <span>AVX2 CPU Vector Accelerated</span>
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-blue-400" />
            <span>Works in Any Windows App</span>
          </div>
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="h-4 w-4 text-amber-300" />
            <span>Airplane Mode Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
