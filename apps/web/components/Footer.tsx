import React from "react";
import Image from "next/image";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

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
            <GithubIcon className="h-4 w-4" />
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
