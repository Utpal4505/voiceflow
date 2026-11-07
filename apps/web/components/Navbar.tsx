import React from "react";
import Image from "next/image";
import { Download } from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function Navbar() {
  const downloadUrl =
    "https://github.com/Utpal4505/voiceflow/releases/latest/download/VoiceFlow_0.1.0_x64-setup.exe";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0B0C12]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#514BFA]/20 border border-[#514BFA]/40 shadow-sm shadow-[#514BFA]/40 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.svg"
              alt="VoiceFlow Logo"
              width={26}
              height={26}
              className="rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white">VoiceFlow</span>
            <span className="rounded-md border border-[#514BFA]/30 bg-[#514BFA]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#A5A0FF]">
              v0.2.0
            </span>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#comparison" className="hover:text-white transition-colors">
            Comparison
          </a>
          <a href="#smartscreen" className="hover:text-white transition-colors">
            SmartScreen
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Utpal4505/voiceflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#121422] hover:bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <GithubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <a
            href={downloadUrl}
            download
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#514BFA] to-[#7772FF] hover:from-[#4338CA] hover:to-[#514BFA] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#514BFA]/30 hover:shadow-[#514BFA]/50 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </header>
  );
}
