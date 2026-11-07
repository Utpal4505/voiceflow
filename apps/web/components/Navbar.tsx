import React from "react";
import Image from "next/image";
import { Download, Github } from "lucide-react";

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
            <Github className="h-4 w-4" />
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
