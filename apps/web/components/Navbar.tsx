"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Menu, X, Star } from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      style={{ width: "16px", height: "16px" }}
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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const downloadUrl =
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow-Setup.exe";

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Comparison", href: "#comparison" },
    { label: "SmartScreen", href: "#smartscreen" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07080E]/85 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#514BFA]/30 to-[#7772FF]/10 border border-[#514BFA]/40 shadow-sm shadow-[#514BFA]/30 transition-transform"
          >
            <Image
              src="/logo.svg"
              alt="VoiceFlow Logo"
              width={22}
              height={22}
              style={{ width: "22px", height: "22px" }}
              className="rounded-md"
              priority
            />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-slate-100 transition-colors">
              VoiceFlow
            </span>
            <span className="inline-flex items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              v0.2.0
            </span>
          </div>
        </a>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors relative group py-1 text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-slate-100"
            >
              {link.label}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#514BFA] scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
            </a>
          ))}
        </nav>

        {/* Right Action CTAs (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <motion.a
            href="https://github.com/Utpal4505/voiceflow"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#0E101D] hover:bg-white/[0.08] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <GithubIcon className="h-4 w-4" />
            <span>GitHub</span>
            <span className="flex items-center text-[10px] text-amber-300/90 ml-0.5">
              <Star className="h-3 w-3 fill-amber-300/80 mr-0.5" />
              Star
            </span>
          </motion.a>

          <motion.a
            href={downloadUrl}
            download
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#514BFA] to-[#7772FF] hover:from-[#4338CA] hover:to-[#514BFA] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#514BFA]/30 hover:shadow-[#514BFA]/50 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </motion.a>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <a
            href={downloadUrl}
            download
            className="flex items-center gap-1.5 rounded-lg bg-[#514BFA] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Get</span>
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E101D] text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-b border-white/[0.08] bg-[#07080E]/95 px-6 py-5 backdrop-blur-2xl overflow-hidden"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-slate-200 hover:text-white py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
                <a
                  href="https://github.com/Utpal4505/voiceflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0E101D] py-2.5 text-xs font-semibold text-slate-200"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href={downloadUrl}
                  download
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#514BFA] py-2.5 text-xs font-semibold text-white"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .exe</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
