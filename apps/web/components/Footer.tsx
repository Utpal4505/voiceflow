import React from "react";
import Image from "next/image";
import { Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0E1018] py-12 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#514BFA]/20 border border-[#514BFA]/30">
            <Image src="/logo.svg" alt="VoiceFlow" width={22} height={22} />
          </div>
          <div>
            <span className="text-sm font-bold text-white">VoiceFlow</span>
            <p className="text-[11px] text-slate-400">100% Offline AI Voice Typing for Windows</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <a
            href="https://github.com/Utpal4505/voiceflow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </a>
          <a
            href="https://github.com/Utpal4505/voiceflow/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Release Notes
          </a>
          <a
            href="https://github.com/Utpal4505/voiceflow/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Report an Issue
          </a>
        </div>

        <div className="text-[11px] text-slate-400">
          Open-Source under MIT License • Built with Tauri & Whisper
        </div>
      </div>
    </footer>
  );
}
