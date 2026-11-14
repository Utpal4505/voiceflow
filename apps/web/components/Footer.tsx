"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { triggerDownloadToast } from "./DownloadToast";
import { VoiceFlowLogo } from "./VoiceFlowLogo";
import { WindowsIcon, AppleIcon, DOWNLOAD_URLS, useDetectedOS } from "./PlatformIcons";
import { trackDownloadClicked, trackEvent, trackExternalLinkClicked } from "../lib/analytics";

export default function Footer() {
  const detectedOS = useDetectedOS();

  return (
    <footer className="bg-[#212121]">
      {/* Pre-footer Call to Action Banner (Architectural Dark Graphite) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141414] p-8 sm:p-14 text-center shadow-2xl"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified Native Desktop Software (Windows &amp; macOS)</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
              Ready to type at the speed of thought?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              Download VoiceFlow for Windows or macOS today. Instant on-device speech recognition with complete
              offline privacy.
            </p>

            <div className="pt-4 flex flex-col items-center justify-center gap-3">
              <motion.a
                href={detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows}
                download
                onClick={() => {
                  triggerDownloadToast(detectedOS);
                  trackDownloadClicked({
                    platform: detectedOS,
                    location: "footer",
                    url: detectedOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows,
                  });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-white hover:bg-slate-100 px-8 py-4 text-sm sm:text-base font-bold text-[#111827] shadow-xl transition-all cursor-pointer ring-1 ring-white/20"
              >
                {detectedOS === "mac" ? (
                  <AppleIcon className="h-4 w-4 shrink-0 text-[#111827]" />
                ) : (
                  <WindowsIcon className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {detectedOS === "mac"
                    ? "Download VoiceFlow for macOS (.dmg)"
                    : "Download VoiceFlow for Windows (.exe)"}
                </span>
                <ArrowRight className="h-4 w-4 ml-1 opacity-70" />
              </motion.a>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>{detectedOS === "mac" ? "Looking for Windows?" : "Looking for macOS?"}</span>
                <a
                  href={detectedOS === "mac" ? DOWNLOAD_URLS.windows : DOWNLOAD_URLS.mac}
                  download
                  onClick={() => {
                    const altOS = detectedOS === "mac" ? "windows" : "mac";
                    triggerDownloadToast(altOS);
                    trackDownloadClicked({
                      platform: altOS,
                      location: "footer",
                      url: altOS === "mac" ? DOWNLOAD_URLS.mac : DOWNLOAD_URLS.windows,
                    });
                  }}
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors cursor-pointer font-medium"
                >
                  {detectedOS === "mac" ? (
                    <>
                      <WindowsIcon className="h-3 w-3 inline" />
                      <span>Download for Windows (.exe)</span>
                    </>
                  ) : (
                    <>
                      <AppleIcon className="h-3 w-3 inline" />
                      <span>Download for macOS (.dmg)</span>
                    </>
                  )}
                </a>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 font-mono">
              Windows 11 &amp; 10 • macOS 12+ (Apple Silicon &amp; Intel) • Single installer (~25–35 MB) • No account required
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="border-t border-white/10 py-10 text-slate-400 text-xs bg-[#181818]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <VoiceFlowLogo className="h-8 w-8 filter drop-shadow-sm" />
            <div>
              <span className="text-sm font-bold text-white">VoiceFlow</span>
              <p className="text-[11px] text-slate-400">100% Offline AI Voice Typing for Windows &amp; Mac</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <a
              href="#features"
              onClick={() => trackEvent("footer_link_clicked", { label: "Features" })}
              className="hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => trackEvent("footer_link_clicked", { label: "How It Works" })}
              className="hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#comparison"
              onClick={() => trackEvent("footer_link_clicked", { label: "Comparison" })}
              className="hover:text-white transition-colors"
            >
              Comparison
            </a>
            <a
              href="#smartscreen"
              onClick={() => trackEvent("footer_link_clicked", { label: "SmartScreen Guide" })}
              className="hover:text-white transition-colors"
            >
              SmartScreen Guide
            </a>
            <a
              href="#faq"
              onClick={() => trackEvent("footer_link_clicked", { label: "FAQ" })}
              className="hover:text-white transition-colors"
            >
              FAQ
            </a>
            <a
              href="https://github.com/Utpal4505/voiceflow-releases/releases"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackExternalLinkClicked("Releases", "https://github.com/Utpal4505/voiceflow-releases/releases")
              }
              className="hover:text-white transition-colors"
            >
              Releases
            </a>
          </div>

          <div className="text-[11px] text-slate-500 text-center sm:text-right font-mono">
            Native Desktop Software • Built with Rust &amp; Whisper C++
          </div>
        </div>
      </div>
    </footer>
  );
}
