"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { triggerDownloadToast } from "./DownloadToast";
import { VoiceFlowLogo } from "./VoiceFlowLogo";
import { WindowsIcon, AppleIcon, DOWNLOAD_URLS, useDetectedOS } from "./PlatformIcons";
import { trackDownloadClicked, trackEvent } from "../lib/analytics";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const detectedOS = useDetectedOS();

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
          {/* Left: Brand Identity */}
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
                  onClick={() => trackEvent("nav_link_clicked", { label: link.label, href: link.href })}
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

          {/* Right: Tactile Auto-Detecting Single Download CTA Button */}
          <div className="hidden sm:flex items-center">
            <motion.a
              href={detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows}
              download
              onClick={() => {
                triggerDownloadToast(detectedOS);
                trackDownloadClicked({
                  platform: detectedOS,
                  location: "navbar",
                  url: detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows,
                });
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-[#111827] shadow-[0_2px_12px_rgba(255,255,255,0.12)] transition-all cursor-pointer font-sans"
            >
              {detectedOS === "mac" ? (
                <AppleIcon className="h-3.5 w-3.5 shrink-0 text-[#111827]" />
              ) : (
                <WindowsIcon className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {detectedOS === "mac" ? "Download for Mac" : "Download for Windows"}
              </span>
            </motion.a>
          </div>

          {/* Mobile Hamburger & Quick Get Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <a
              href={detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows}
              download
              onClick={() => {
                triggerDownloadToast(detectedOS);
                trackDownloadClicked({
                  platform: detectedOS,
                  location: "mobile_header",
                  url: detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows,
                });
              }}
              className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-[#111827]"
            >
              {detectedOS === "mac" ? (
                <AppleIcon className="h-3 w-3 shrink-0 text-[#111827]" />
              ) : (
                <WindowsIcon className="h-3 w-3 shrink-0" />
              )}
              <span>Download</span>
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
                  onClick={() => {
                    trackEvent("nav_link_clicked", { label: link.label, href: link.href, source: "mobile_drawer" });
                    setMobileMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <a
                  href={detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows}
                  download
                  onClick={() => {
                    triggerDownloadToast(detectedOS);
                    trackDownloadClicked({
                      platform: detectedOS,
                      location: "mobile_drawer",
                      url: detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows,
                    });
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-[#111827] shadow-sm font-sans"
                >
                  {detectedOS === "mac" ? (
                    <AppleIcon className="h-3.5 w-3.5 shrink-0 text-[#111827]" />
                  ) : (
                    <WindowsIcon className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    {detectedOS === "mac"
                      ? "Download for macOS (.dmg)"
                      : "Download for Windows (.exe)"}
                  </span>
                </a>
                <div className="text-center">
                  <a
                    href={detectedOS === "mac" ? DOWNLOAD_URLS.windows : DOWNLOAD_URLS.mac}
                    download
                    onClick={() => {
                      const altOS = detectedOS === "mac" ? "windows" : "mac";
                      triggerDownloadToast(altOS);
                      trackDownloadClicked({
                        platform: altOS,
                        location: "mobile_drawer",
                        url: altOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows,
                      });
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white underline underline-offset-2 decoration-white/20"
                  >
                    {detectedOS === "mac" ? (
                      <>
                        <WindowsIcon className="h-3 w-3 inline" />
                        <span>Looking for Windows (.exe)?</span>
                      </>
                    ) : (
                      <>
                        <AppleIcon className="h-3 w-3 inline" />
                        <span>Looking for macOS (.dmg)?</span>
                      </>
                    )}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
