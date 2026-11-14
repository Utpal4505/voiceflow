"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  RotateCcw,
  Check,
  Search,
  Files,
  GitBranch,
  Settings,
  Smile,
  Paperclip,
  AtSign,
  Send,
  Lock,
  Star,
  Share2,
} from "lucide-react";
import {
  trackDemoTabChanged,
  trackDemoDictationTriggered,
  trackHotkeyTested,
} from "../lib/analytics";

// ============================================================================
// AUTHENTIC BRAND & OS SVGS
// ============================================================================

function VSCodeLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className={className} fill="none" aria-hidden="true">
      <mask id="vscMsk3" width="128" height="128" x="0" y="0" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M90.767 127.126a7.97 7.97 0 0 0 6.35-.244l26.353-12.681a8 8 0 0 0 4.53-7.209V21.009a8 8 0 0 0-4.53-7.21L97.117 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026L15.6 32.013a5.33 5.33 0 0 0-6.807.302l-7.048 6.411a5.335 5.335 0 0 0-.006 7.888L20.796 64L1.74 81.387a5.336 5.336 0 0 0 .006 7.887l7.048 6.411a5.33 5.33 0 0 0 6.807.303l21.974-16.68l50.45 46.025a8 8 0 0 0 2.743 1.793Zm5.252-92.183L57.74 64l38.28 29.058V34.943Z"
          clipRule="evenodd"
        />
      </mask>
      <g mask="url(#vscMsk3)">
        <path fill="#0065a9" d="M123.471 13.82L97.097 1.12A7.97 7.97 0 0 0 88 2.668L1.662 81.387a5.333 5.333 0 0 0 .006 7.887l7.052 6.411a5.33 5.33 0 0 0 6.811.303l103.971-78.875c3.488-2.646 8.498-.158 8.498 4.22v-.306a8 8 0 0 0-4.529-7.208Z" />
        <path fill="#007acc" d="m123.471 114.181l-26.374 12.698A7.97 7.97 0 0 1 88 125.333L1.662 46.613a5.333 5.333 0 0 1 .006-7.887l7.052-6.411a5.33 5.33 0 0 1 6.811-.303l103.971 78.874c3.488 2.647 8.498.159 8.498-4.219v.306a8 8 0 0 1-4.529 7.208" />
        <path fill="#1f9cf0" d="M97.098 126.882A7.98 7.98 0 0 1 88 125.333c2.952 2.952 8 .861 8-3.314V5.98c0-4.175-5.048-6.266-8-3.313a7.98 7.98 0 0 1 9.098-1.549L123.467 13.8A8 8 0 0 1 128 21.01v85.982a8 8 0 0 1-4.533 7.21z" />
      </g>
    </svg>
  );
}

function SlackLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className={className} fill="none" aria-hidden="true">
      <path fill="#de1c59" d="M27.255 80.719c0 7.33-5.978 13.317-13.309 13.317S.63 88.049.63 80.719s5.987-13.317 13.317-13.317h13.309zm6.709 0c0-7.33 5.987-13.317 13.317-13.317s13.317 5.986 13.317 13.317v33.335c0 7.33-5.986 13.317-13.317 13.317c-7.33 0-13.317-5.987-13.317-13.317zm0 0" />
      <path fill="#35c5f0" d="M47.281 27.255c-7.33 0-13.317-5.978-13.309-13.309S39.951.63 47.281.63s13.317 5.987 13.317 13.317v13.309zm0 6.709c7.33 0 13.317 5.987 13.317 13.317s-5.986 13.317-13.317 13.317H13.946C6.616 60.598.63 54.612.63 47.281c0-7.33 5.987-13.317 13.317-13.317zm0 0" />
      <path fill="#2eb57d" d="M100.745 47.281c0-7.33 5.978-13.317 13.309-13.317s13.317 5.987 13.317 13.317s-5.987 13.317-13.317 13.317h-13.309zm-6.709 0c0 7.33-5.987 13.317-13.317 13.317s-13.317-5.986-13.317-13.317V13.946C67.402 6.616 73.388.63 80.719.63c7.33 0 13.317 5.987 13.317 13.317zm0 0" />
      <path fill="#ebb02e" d="M80.719 100.745c7.33 0 13.317 5.978 13.317 13.309s-5.987 13.317-13.317 13.317s-13.317-5.987-13.317-13.317v-13.309zm0-6.709c-7.33 0-13.317-5.987-13.317-13.317s5.986-13.317 13.317-13.317h33.335c7.33 0 13.317 5.986 13.317 13.317c0 7.33-5.987 13.317-13.317 13.317zm0 0" />
    </svg>
  );
}

function GoogleDocsLogo({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} fill="none" aria-hidden="true">
      <path fill="#3086f6" d="M407.3 512H104.7c-19.2 0-34.9-15.7-34.9-34.9V34.9C69.8 15.7 85.5 0 104.7 0h209.5l128 128v349.1c0 19.2-15.7 34.9-34.9 34.9" />
      <path fill="#0c67d6" d="m314.2 0l128 128h-128z" />
      <path fill="#fdffff" d="M360.7 226.9H151.3v-29.1h209.5v29.1zm0 40.7H151.3v29.1h209.5v-29.1zm-58.2 69.9H151.3v29.1h151.3v-29.1z" />
    </svg>
  );
}

// Windows 11 Native Min/Max/Close Control Buttons
function WindowsControls() {
  return (
    <div className="flex items-center select-none">
      <button
        type="button"
        className="w-10 h-8 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="Minimize"
      >
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
          <rect width="10" height="1" />
        </svg>
      </button>
      <button
        type="button"
        className="w-10 h-8 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="Maximize"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="0.5" y="0.5" width="9" height="9" />
        </svg>
      </button>
      <button
        type="button"
        className="w-10 h-8 flex items-center justify-center text-slate-400 hover:bg-[#E81123] hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M1 1l8 8m0-8L1 9" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// WORKSPACE PRESETS (Pixel-Matched to Real Screenshots)
// ============================================================================

interface AppPreset {
  id: "vscode" | "slack" | "docs";
  appName: string;
  tabLabel: string;
  windowTitle: string;
  dictatedText: string;
}

const APPS: AppPreset[] = [
  {
    id: "vscode",
    appName: "VS Code",
    tabLabel: "VS Code",
    windowTitle: "retrieve.ts — learn-RAG (Visual Studio Code)",
    dictatedText:
      "// 1. Embed query with OpenAI and retrieve vector chunks via Qdrant.",
  },
  {
    id: "slack",
    appName: "Slack",
    tabLabel: "Slack",
    windowTitle: "Acme Inc. — #culture | Slack",
    dictatedText:
      "@channel Just pushed the new release binary to staging with AVX2 acceleration enabled. Please run regression tests on Windows 11.",
  },
  {
    id: "docs",
    appName: "Google Docs",
    tabLabel: "Google Docs",
    windowTitle: "AI Software Architect Book Roadmap — Google Docs",
    dictatedText:
      "To lead this shift, engineering leaders must prioritize foundational distributed systems over transient framework churn.",
  },
];

const BAR_HEIGHTS = [6, 14, 18, 10, 16, 22, 14, 9, 18, 12, 8, 5];

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState<"vscode" | "slack" | "docs">("vscode");
  const [step, setStep] = useState<"standby" | "listening" | "committed">("standby");
  const [hudText, setHudText] = useState("");
  const [insertedText, setInsertedText] = useState("");
  const [userPressedHotkey, setUserPressedHotkey] = useState(false);
  const [isAutoTour, setIsAutoTour] = useState(true);
  const [tourCycle, setTourCycle] = useState(0);

  const currentApp = APPS.find((a) => a.id === activeTab) || APPS[0];
  const idleResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Manual Trigger: User takes over via Ctrl + Space or click
  const triggerManualDictation = useCallback(() => {
    // Pause auto tour immediately
    setIsAutoTour(false);
    if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);

    // Tactile physical feedback for 400ms on the test hotkey button
    setUserPressedHotkey(true);
    setTimeout(() => setUserPressedHotkey(false), 400);

    setInsertedText("");
    setHudText("");
    setStep("listening");

    const fullText = currentApp.dictatedText;
    let charIdx = 0;

    const interval = setInterval(() => {
      if (charIdx <= fullText.length) {
        setHudText(fullText.slice(0, charIdx));
        charIdx += 2;
      } else {
        clearInterval(interval);
        setInsertedText(fullText);
        setStep("committed");

        // Resume auto-tour after 14s of inactivity
        idleResumeTimerRef.current = setTimeout(() => {
          setIsAutoTour(true);
        }, 14000);
      }
    }, 30);
  }, [currentApp.dictatedText]);

  // Global physical hotkey listener: Ctrl + Space (or Cmd + Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
        trackHotkeyTested("keyboard_shortcut");
        trackDemoDictationTriggered(activeTab, "hotkey");
        triggerManualDictation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerManualDictation, activeTab]);

  // Manual Tab Click
  const handleSwitchTab = (tabId: "vscode" | "slack" | "docs") => {
    setIsAutoTour(false);
    if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);

    trackDemoTabChanged(tabId);
    setActiveTab(tabId);
    setStep("standby");
    setHudText("");
    setInsertedText("");

    // After 14s of inactivity, resume auto tour
    idleResumeTimerRef.current = setTimeout(() => {
      setIsAutoTour(true);
    }, 14000);
  };

  // Auto-Tour Engine: Smoothly cycles through VS Code -> Slack -> Google Docs
  useEffect(() => {
    if (!isAutoTour) return;

    let isMounted = true;
    let charInterval: NodeJS.Timeout | undefined;
    const timers: NodeJS.Timeout[] = [];
    const pushTimer = (t: NodeJS.Timeout) => timers.push(t);

    // Phase 1: Pause on tab (0.8s) -> Summon HUD & Start Dictation
    pushTimer(
      setTimeout(() => {
        if (!isMounted) return;
        setStep("listening");
        setInsertedText("");
        setHudText("");

        const fullText = currentApp.dictatedText;
        let charIdx = 0;

        charInterval = setInterval(() => {
          if (!isMounted) return;
          if (charIdx <= fullText.length) {
            setHudText(fullText.slice(0, charIdx));
            charIdx += 2;
          } else {
            if (charInterval) clearInterval(charInterval);
            setInsertedText(fullText);
            setStep("committed");

            // Phase 2: Hold complete state (2.6s) -> Reset & Advance to next tab
            pushTimer(
              setTimeout(() => {
                if (!isMounted) return;
                setStep("standby");
                setInsertedText("");
                setHudText("");
                setActiveTab((prev) => {
                  if (prev === "vscode") return "slack";
                  if (prev === "slack") return "docs";
                  return "vscode";
                });
                setTourCycle((c) => c + 1);
              }, 2600)
            );
          }
        }, 30);
      }, 800)
    );

    return () => {
      isMounted = false;
      if (charInterval) clearInterval(charInterval);
      timers.forEach(clearTimeout);
    };
  }, [isAutoTour, currentApp.dictatedText, tourCycle]);

  return (
    <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 select-none">
      {/* ========================================================================= */}
      {/* 1. UNIFIED STUDIO OS DOCK: WORKSPACE TABS & PLAYBACK / HOTKEY CONTROLS   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5 select-none">
        {/* Left: External Workspace Segmented Switcher Dock */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#13151B] border border-white/[0.08] shadow-inner backdrop-blur-md">
          {APPS.map((app) => {
            const isActive = activeTab === app.id;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSwitchTab(app.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/[0.12] text-white border border-white/20 shadow-sm font-semibold"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 border border-transparent"
                }`}
              >
                {app.id === "vscode" && <VSCodeLogo className="h-3.5 w-3.5" />}
                {app.id === "slack" && <SlackLogo className="h-3.5 w-3.5" />}
                {app.id === "docs" && <GoogleDocsLogo className="h-3.5 w-3.5" />}
                <span>{app.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Live Auto-Tour Status Toggle & Tactile Hotkey Test Button */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Live Auto-Tour Status Pill (Interactive Play/Pause) */}
          <button
            type="button"
            onClick={() => setIsAutoTour((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
              isAutoTour
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-white/[0.05] border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
            title={isAutoTour ? "Click to pause auto-tour" : "Click to resume auto-tour"}
          >
            <span className="relative flex h-2 w-2">
              {isAutoTour && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAutoTour ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </span>
            <span className="font-medium text-slate-200">
              {isAutoTour ? "Auto-Tour Playing" : "Tour Paused"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              {isAutoTour ? "(pause)" : "(play)"}
            </span>
          </button>

          {/* Tactile Hotkey Test Button (Calm by default, highlights only on user press) */}
          <button
            type="button"
            onClick={() => {
              trackHotkeyTested("header_pill");
              trackDemoDictationTriggered(activeTab, "button");
              triggerManualDictation();
            }}
            className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-md transition-all cursor-pointer ${
              userPressedHotkey
                ? "bg-[#FF5722] border-[#FF5722] text-white scale-95 shadow-[0_0_15px_rgba(255,87,34,0.5)]"
                : "bg-[#16181F] border-white/15 text-slate-200 hover:border-[#FF5722]/50 hover:text-white hover:bg-[#1E212B]"
            }`}
          >
            <Mic className="h-3.5 w-3.5 text-[#FF5722] group-hover:scale-110 transition-transform" />
            <span>Test Hotkey:</span>
            <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">
              Ctrl + Space
            </kbd>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AUTHENTIC APPLICATION WINDOW CANVAS                                   */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.14] bg-[#12151B] shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col">
        {/* ======================================================================= */}
        {/* WINDOW 1: VS CODE (learn-RAG / retrieve.ts with LangChain & Qdrant)     */}
        {/* ======================================================================= */}
        {activeTab === "vscode" && (
          <div className="flex flex-col flex-1 bg-[#12151B]">
            {/* Authentic Windows 11 VS Code Title Bar */}
            <div className="h-9 bg-[#0C0E13] border-b border-white/[0.08] flex items-center justify-between px-3 select-none text-xs text-slate-300">
              {/* Left: VS Code Icon + Menu Items */}
              <div className="flex items-center gap-3">
                <VSCodeLogo className="h-4 w-4" />
                <div className="hidden md:flex items-center gap-2.5 text-[11px] text-slate-400">
                  <span className="hover:text-white cursor-pointer">File</span>
                  <span className="hover:text-white cursor-pointer">Edit</span>
                  <span className="hover:text-white cursor-pointer">Selection</span>
                  <span className="hover:text-white cursor-pointer">View</span>
                  <span className="hover:text-white cursor-pointer">Go</span>
                  <span className="hover:text-white cursor-pointer">Run</span>
                  <span className="hover:text-white cursor-pointer">Terminal</span>
                  <span className="hover:text-white cursor-pointer">Help</span>
                </div>
              </div>

              {/* Center: Command Palette Pill (Exact Windows 11 VS Code) */}
              <div className="flex items-center gap-2 bg-[#1C1F28] border border-white/10 rounded-md px-3 py-1 text-[11px] text-slate-300 max-w-xs w-64 justify-center">
                <Search className="h-3 w-3 text-slate-400" />
                <span className="truncate">learn-RAG</span>
              </div>

              {/* Right: Windows 11 Fluent Window Controls */}
              <WindowsControls />
            </div>

            {/* VS Code Workspace Body */}
            <div className="flex flex-1 overflow-hidden min-h-[380px] sm:min-h-[420px]">
              {/* Activity Bar on Left */}
              <div className="w-11 sm:w-12 bg-[#0C0E13] border-r border-white/5 flex flex-col items-center justify-between py-2 select-none">
                <div className="flex flex-col items-center gap-4 text-slate-500">
                  <div className="border-l-2 border-white pl-1 text-white">
                    <Files className="h-4 w-4" />
                  </div>
                  <Search className="h-4 w-4 hover:text-slate-300 cursor-pointer" />
                  <GitBranch className="h-4 w-4 hover:text-slate-300 cursor-pointer" />
                </div>
                <Settings className="h-4 w-4 text-slate-500 hover:text-slate-300 cursor-pointer" />
              </div>

              {/* File Tree Explorer Sidebar */}
              <div className="w-44 sm:w-48 hidden sm:flex flex-col bg-[#0F1117] border-r border-white/5 text-xs text-slate-400 p-2.5 select-none font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                  Explorer
                </span>
                <div className="flex items-center gap-1 text-slate-200 font-semibold mb-1 text-[11px]">
                  <span>▾ learn-RAG</span>
                </div>
                <div className="pl-3 flex flex-col gap-1 text-[11px] text-slate-400">
                  <span>▸ data</span>
                  <span>▸ node_modules</span>
                  <span>.env</span>
                  <span>basic_ingestion.ts</span>
                  <span>package.json</span>
                  <div className="flex items-center gap-1.5 text-white font-medium bg-[#161922] px-1.5 py-0.5 rounded border border-[#007acc]/40">
                    <span className="text-[#3178C6] font-bold text-[10px]">TS</span>
                    <span>retrieve.ts</span>
                  </div>
                </div>
              </div>

              {/* Editor Pane */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#12151B]">
                {/* Editor Tabstrip */}
                <div className="flex items-center bg-[#0F1117] border-b border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 bg-[#12151B] border-t-2 border-[#0078d4] text-white px-3 py-1.5 font-mono text-[11px]">
                    <span className="text-[#3178C6] font-bold text-[10px]">TS</span>
                    <span>retrieve.ts</span>
                    <span className="text-slate-500 hover:text-white cursor-pointer ml-1">✕</span>
                  </div>
                  <span className="px-3 py-1.5 text-[11px] text-slate-500 hidden md:inline">
                    package.json
                  </span>
                  <span className="px-3 py-1.5 text-[11px] text-slate-500 hidden lg:inline">
                    basic_ingestion.ts
                  </span>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 px-4 py-1 bg-[#12151B] border-b border-white/5 text-[11px] font-mono text-slate-500">
                  <span>learn-RAG</span>
                  <span>›</span>
                  <span>retrieve.ts</span>
                  <span>›</span>
                  <span className="text-slate-300">main</span>
                </div>

                {/* Code Body with Gutter */}
                <div className="p-3 sm:p-4 font-mono text-[11px] sm:text-[13px] leading-relaxed overflow-x-auto relative flex-1">
                  {/* Line 1 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">1</span>
                    <span>
                      <span className="text-[#C678DD]">import</span>{" "}
                      <span className="text-[#98C379]">&quot;dotenv/config&quot;</span>;
                    </span>
                  </div>

                  {/* Line 2 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">2</span>
                    <span>
                      <span className="text-[#C678DD]">import</span> &#123;{" "}
                      <span className="text-[#E5C07B]">ChatOpenAI</span>,{" "}
                      <span className="text-[#E5C07B]">OpenAIEmbeddings</span> &#125;{" "}
                      <span className="text-[#C678DD]">from</span>{" "}
                      <span className="text-[#98C379]">&quot;@langchain/openai&quot;</span>;
                    </span>
                  </div>

                  {/* Line 3 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">3</span>
                    <span>
                      <span className="text-[#C678DD]">import</span> &#123;{" "}
                      <span className="text-[#E5C07B]">QdrantVectorStore</span> &#125;{" "}
                      <span className="text-[#C678DD]">from</span>{" "}
                      <span className="text-[#98C379]">&quot;@langchain/qdrant&quot;</span>;
                    </span>
                  </div>

                  {/* Line 4 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">4</span>
                    <span>
                      <span className="text-[#C678DD]">async function</span>{" "}
                      <span className="text-[#61AFEF]">main</span>() &#123;
                    </span>
                  </div>

                  {/* Line 5 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">5</span>
                    <span className="pl-4">
                      <span className="text-[#C678DD]">const</span> query = process.argv.slice(2).join(&quot; &quot;);
                    </span>
                  </div>

                  {/* Line 6: Dictation Target Line (Subtle Editor Line Highlight) */}
                  <div
                    onClick={triggerManualDictation}
                    className="flex gap-3 bg-white/[0.04] -mx-2 px-2 py-0.5 rounded cursor-pointer hover:bg-white/[0.07] transition-colors relative my-0.5"
                  >
                    <span className="text-slate-500 select-none w-6 text-right">6</span>
                    <div className="pl-4 flex-1">
                      {insertedText ? (
                        <span className="text-[#6A9955] font-normal">{insertedText}</span>
                      ) : (
                        <span className="text-[#5A7B54] italic">
                          {"// Click here or press Ctrl + Space to dictate live docstring..."}
                        </span>
                      )}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="inline-block w-0.5 h-4 bg-[#FF5722] ml-1 align-middle"
                      />
                    </div>
                  </div>

                  {/* Line 7 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">7</span>
                    <span className="pl-4">
                      <span className="text-[#C678DD]">const</span> embeddings ={" "}
                      <span className="text-[#C678DD]">new</span>{" "}
                      <span className="text-[#E5C07B]">OpenAIEmbeddings</span>(&#123; model: &quot;text-embedding-3-small&quot; &#125;);
                    </span>
                  </div>

                  {/* Line 8 */}
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none w-6 text-right">8</span>
                    <span className="pl-4">
                      <span className="text-[#C678DD]">const</span> vectorStore ={" "}
                      <span className="text-[#C678DD]">await</span>{" "}
                      <span className="text-[#E5C07B]">QdrantVectorStore</span>.fromExistingCollection(embeddings, &#123; url: &quot;http://localhost:6333&quot; &#125;);
                    </span>
                  </div>
                </div>

                {/* Sleek Dark Status Bar (Matching User's Screenshot Palette) */}
                <div className="mt-auto h-6 bg-[#0E1015] border-t border-white/5 text-slate-400 flex items-center justify-between px-3 text-[10px] font-mono select-none">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sky-400 font-semibold">
                      <GitBranch className="h-3 w-3" /> main*
                    </span>
                    <span>0 0</span>
                    <span>Postgresql locus</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>UTF-8</span>
                    <span>CRLF</span>
                    <span>TypeScript</span>
                    <span>Prettier</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WINDOW 2: SLACK (Acme Inc. / #culture)                                  */}
        {/* ======================================================================= */}
        {activeTab === "slack" && (
          <div className="flex flex-col flex-1 bg-[#1A1D21]">
            {/* Slack Window Title Bar */}
            <div className="h-9 bg-[#121417] border-b border-white/[0.08] flex items-center justify-between px-3 select-none text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <SlackLogo className="h-4 w-4" />
                <span className="font-semibold text-slate-200">Acme Inc. — #culture</span>
              </div>
              <WindowsControls />
            </div>

            <div className="flex flex-1 overflow-hidden min-h-[380px] sm:min-h-[420px]">
              {/* Slack Leftmost Workspace Rail */}
              <div className="w-11 sm:w-12 bg-[#121417] border-r border-white/5 flex flex-col items-center py-3 gap-3 select-none">
                <div className="h-7 w-7 rounded-lg bg-[#E01E5A] text-white font-bold flex items-center justify-center text-xs shadow-md">
                  A
                </div>
                <div className="h-7 w-7 rounded-lg bg-white/10 text-slate-400 flex items-center justify-center text-xs hover:bg-white/20 cursor-pointer">
                  +
                </div>
              </div>

              {/* Slack Channel Directory Sidebar */}
              <div className="w-44 sm:w-48 hidden sm:flex flex-col bg-[#191B1F] border-r border-white/5 text-xs text-slate-400 p-3 select-none">
                <div className="flex items-center justify-between text-white font-bold text-sm mb-3">
                  <span>Acme Inc. ▾</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Channels
                </span>
                <div className="flex flex-col gap-0.5 text-[12px]">
                  <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer"># brainstorming</span>
                  <span className="px-2 py-1 rounded bg-[#1164A3] text-white font-semibold"># culture</span>
                  <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer"># marketing</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-4 mb-1">
                  Direct Messages
                </span>
                <div className="flex flex-col gap-1 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Brandon Velestuk
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Tina Chen
                  </span>
                </div>
              </div>

              {/* Slack Message Feed & Composer */}
              <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">#culture</span>
                    <span className="text-slate-500 text-[11px]">👥 25 members</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 font-sans text-xs overflow-y-auto mb-3">
                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                      TC
                    </div>
                    <div>
                      <span className="font-bold text-white">Tina Chen</span>{" "}
                      <span className="text-[10px] text-slate-500">12:47 AM</span>
                      <p className="text-slate-300 mt-0.5">I must decline for secret reasons.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="h-7 w-7 rounded bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                      LC
                    </div>
                    <div>
                      <span className="font-bold text-white">Lane Collins</span>{" "}
                      <span className="text-[10px] text-slate-500">11:50 AM</span>
                      <p className="text-slate-300 mt-0.5">
                        Really need to give some kudos to @julie for helping out with the new influx of tweets yesterday.
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300">❤️ 1</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300">👏 2</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300">✌️ 1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slack Composer Box */}
                <div
                  onClick={triggerManualDictation}
                  className="rounded-lg border border-white/10 bg-[#222529] p-2.5 cursor-pointer hover:border-[#FF5722]/50 transition-colors"
                >
                  <div className="min-h-[38px] text-xs font-sans">
                    {insertedText ? (
                      <span className="text-white font-medium">{insertedText}</span>
                    ) : (
                      <span className="text-slate-400 italic">
                        Message #culture (Click or press Ctrl + Space to dictate)...
                      </span>
                    )}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="inline-block w-1.5 h-3 bg-[#FF5722] ml-1 align-middle"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 hover:text-white" />
                      <Smile className="h-3.5 w-3.5 hover:text-white" />
                      <AtSign className="h-3.5 w-3.5 hover:text-white" />
                    </div>
                    <button
                      type="button"
                      className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
                        insertedText ? "bg-[#007A5A] text-white shadow-sm" : "bg-white/10 text-slate-500"
                      }`}
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WINDOW 3: GOOGLE DOCS (AI Software Architect Book Roadmap)              */}
        {/* ======================================================================= */}
        {activeTab === "docs" && (
          <div className="flex flex-col flex-1 bg-[#F8F9FA]">
            {/* Chrome Window Title Bar */}
            <div className="h-9 bg-[#1E1E1E] border-b border-white/[0.08] flex items-center justify-between px-3 select-none text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <GoogleDocsLogo className="h-4 w-4" />
                <span className="font-semibold text-slate-200">AI Software Architect Book Roadmap — Google Docs</span>
              </div>
              <WindowsControls />
            </div>

            {/* Chrome Navigation & URL Bar */}
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[#EFEFEF] border-b border-slate-300 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>←</span>
                <span>→</span>
                <span>↻</span>
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-300 rounded-full px-3 py-0.5 text-[11px] text-slate-700 truncate">
                <Lock className="h-2.5 w-2.5 text-emerald-600" />
                <span>docs.google.com/document/d/1IQ1StvkLRiOFCKO0_PhQwywzh-uYfc7DYGV8LPRStYY</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-3 w-3 text-slate-400" />
              </div>
            </div>

            {/* Docs Menu & Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <GoogleDocsLogo className="h-5 w-5" />
                <div>
                  <span className="font-bold text-slate-900 text-sm">
                    AI Software Architect Book Roadmap
                  </span>
                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Insert</span>
                    <span>Format</span>
                    <span>Tools</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#C2E7FF] text-[#001D35] px-3 py-1 rounded-full text-xs font-semibold">
                  <Share2 className="h-3 w-3" /> Share
                </span>
              </div>
            </div>

            {/* White Document Paper */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F0F4F9] flex justify-center min-h-[380px] sm:min-h-[420px]">
              <div
                onClick={triggerManualDictation}
                className="w-full max-w-2xl bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8 cursor-pointer hover:border-orange-400 transition-colors"
              >
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans mb-3">
                  Strategic Reading Roadmap for the Modern Software Architect
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans mb-4">
                  The contemporary software engineering landscape sits at an unprecedented inflection point. The traditional boundaries separating application development, distributed systems, and artificial intelligence have dissolved.
                </p>

                {/* Dictation Target Paragraph */}
                <div className="p-3 rounded bg-orange-500/10 border-l-2 border-[#FF5722] text-xs sm:text-sm font-sans text-slate-900">
                  {insertedText ? (
                    <span className="font-medium text-slate-900">{insertedText}</span>
                  ) : (
                    <span className="text-slate-400 italic">
                      Click here or press Ctrl + Space to dictate architecture strategy...
                    </span>
                  )}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-1.5 h-3.5 bg-[#FF5722] ml-1 align-middle"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. STEALTH VOICEFLOW FLOATING HUD OVERLAY                               */}
        {/* ======================================================================= */}
        <AnimatePresence>
          {step === "listening" && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`absolute z-50 pointer-events-none transition-all duration-300 ${
                activeTab === "vscode"
                  ? "top-[38%] left-1/2 -translate-x-1/2"
                  : activeTab === "slack"
                  ? "bottom-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0"
                  : "top-[48%] left-1/2 -translate-x-1/2"
              }`}
            >
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-[#16171D]/95 px-4 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl max-w-md sm:max-w-xl">
                {/* Glowing Coral Mic Badge */}
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF5722] text-white shadow-[0_0_15px_rgba(255,87,34,0.7)]">
                  <Mic className="h-4 w-4" />
                  <span className="absolute inset-0 rounded-full bg-[#FF5722] animate-ping opacity-30" />
                </div>

                {/* Audio Waveform Bars */}
                <div className="flex items-center gap-0.5 shrink-0 px-1">
                  {BAR_HEIGHTS.map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: [4, h, 6] }}
                      transition={{ repeat: Infinity, duration: 0.65, delay: i * 0.05 }}
                      className="w-0.5 rounded-full bg-[#FF5722]"
                    />
                  ))}
                </div>

                {/* Streaming Dictated Speech */}
                <span className="truncate text-xs font-medium text-slate-100">
                  {hudText || "Transcribing speech in volatile CPU RAM..."}
                </span>

                {/* Commit Indicator */}
                <span className="ml-auto flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300 shrink-0">
                  ↵ Enter
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======================================================================= */}
        {/* 4. TECHNICAL METRIC FOOTER BAR                                         */}
        {/* ======================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0E1015] px-4 py-2.5 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            {step === "committed" ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="h-3.5 w-3.5" />
                Keystrokes committed directly into {currentApp.appName} without stealing window focus!
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                <span>AVX2 CPU Engine</span>
                <span>•</span>
                <span>0 KB Cloud Egress</span>
                <span>•</span>
                <span>100% Volatile RAM</span>
                <span className="hidden md:inline">• Focus Preserved (WS_EX_NOACTIVATE)</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                trackDemoDictationTriggered(activeTab, "button");
                triggerManualDictation();
              }}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white px-2.5 py-1 text-slate-300 transition-colors cursor-pointer text-[11px] font-medium"
              title="Test manual dictation in active tab"
            >
              <RotateCcw className="h-3 w-3 text-slate-400" />
              <span>{step === "committed" ? "Dictate Again" : "Replay"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
