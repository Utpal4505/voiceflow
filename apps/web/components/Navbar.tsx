"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import { triggerDownloadToast } from "./DownloadToast";
import { VoiceFlowLogo } from "./VoiceFlowLogo";

function WindowsIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const downloadUrl =
    "https://github.com/Utpal4505/voiceflow-releases/releases/latest/download/VoiceFlow-Setup.exe";

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Comparison", href: "#comparison" },
    { label: "Security", href: "#smartscreen" },
    { label: "FAQ", href: "#faq" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "pt-2 sm:pt-3 pb-2" : "pt-3 sm:pt-4 pb-2"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Floating Glass Capsule Nav Container */}
        <div
          className={`flex items-center justify-between rounded-2xl border border-white/10 bg-[#181818]/90 backdrop-blur-xl px-4 sm:px-5 py-2.5 shadow-2xl transition-all duration-300 ${
            scrolled
              ? "shadow-[0_8px_32px_rgba(0,0,0,0.65)] border-white/15"
              : "shadow-xl"
          }`}
        >
          {/* Left: Brand Identity with Version Pill */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="transition-transform group-hover:scale-105 filter drop-shadow-md">
              <VoiceFlowLogo className="h-8 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white font-sans">
                VoiceFlow
              </span>
            </div>
          </a>

          {/* Center: Interactive Nav Links with Framer Motion Sliding Pill */}
          <nav
            onMouseLeave={() => setHoveredIdx(null)}
            className="hidden md:flex items-center gap-1 relative"
          >
            {navLinks.map((link, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className="relative px-3.5 py-1.5 text-xs font-medium transition-colors font-sans"
                >
                  {isHovered && (
                    <motion.div
                      layoutId="navbarHoverPill"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/10 shadow-xs"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      isHovered ? "text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {link.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Right: Tactile Download CTA Button */}
          <div className="hidden sm:flex items-center">
            <motion.a
              href={downloadUrl}
              download
              onClick={triggerDownloadToast}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-[#111827] shadow-[0_2px_12px_rgba(255,255,255,0.12)] transition-all cursor-pointer font-sans"
            >
              <WindowsIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Download for Windows</span>
            </motion.a>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <a
              href={downloadUrl}
              download
              onClick={triggerDownloadToast}
              className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#111827]"
            >
              <Download className="h-3 w-3" />
              <span>Get</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer (Clean floating dropdown) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-2xl border border-white/10 bg-[#181818]/95 backdrop-blur-xl sm:hidden p-4 space-y-2 shadow-2xl"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-white/10">
                <a
                  href={downloadUrl}
                  download
                  onClick={triggerDownloadToast}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-[#111827] shadow-sm font-sans"
                >
                  <WindowsIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Download for Windows (~25 MB)</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
