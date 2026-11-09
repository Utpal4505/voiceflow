"use client";

import React from "react";
import { Check, X } from "lucide-react";

export default function Comparison() {
  const rows = [
    {
      feature: "Audio Privacy",
      voiceflow: "100% On-Device (Never leaves RAM)",
      cloud: "Sent to remote cloud servers",
    },
    {
      feature: "Offline Access",
      voiceflow: "Works 100% offline without Wi-Fi",
      cloud: "Requires constant internet connection",
    },
    {
      feature: "Latency & Speed",
      voiceflow: "< 200ms instant local response",
      cloud: "600ms – 2,000ms network roundtrip lag",
    },
    {
      feature: "App Compatibility",
      voiceflow: "Works in every Windows application",
      cloud: "Restricted to web browser or specific apps",
    },
    {
      feature: "Window Focus",
      voiceflow: "Never steals focus or interrupts typing",
      cloud: "Popups interrupt active window focus",
    },
    {
      feature: "System Footprint",
      voiceflow: "~25 MB lightweight native binary",
      cloud: "500+ MB heavy Electron wrapper",
    },
    {
      feature: "Data Logging",
      voiceflow: "Zero tracking, zero cloud telemetry",
      cloud: "Voice recordings logged remotely",
    },
  ];

  return (
    <section
      id="comparison"
      className="py-20 sm:py-28 bg-[#212121] text-white relative overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Why native on-device wins every time.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans">
            Compare local on-device transcription against traditional cloud services.
          </p>
        </div>

        {/* Clean, Simple, Normal Comparison Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#181818] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                  <th scope="col" className="py-4 px-6 w-2/5">
                    Feature
                  </th>
                  <th scope="col" className="py-4 px-6 w-3/10 text-white">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>VoiceFlow</span>
                    </span>
                  </th>
                  <th scope="col" className="py-4 px-6 w-3/10 text-slate-400">
                    Cloud Dictation SaaS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-sans">
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-white">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span>{row.voiceflow}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <div className="flex items-center gap-2.5">
                        <X className="h-4 w-4 text-slate-500 shrink-0 stroke-[2]" />
                        <span>{row.cloud}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
