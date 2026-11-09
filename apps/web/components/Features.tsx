"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Activity,
  Sliders,
  Sparkles,
  Smile,
  Paperclip,
  Send,
} from "lucide-react";

// ============================================================================
// OFFICIAL BRAND SVGS (User-Provided Exact Vectors)
// ============================================================================

function VSCodeIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className={className} fill="none">
      <path fill="#0065a9" d="M123.471 13.82L97.097 1.12A7.97 7.97 0 0 0 88 2.668L1.662 81.387a5.333 5.333 0 0 0 .006 7.887l7.052 6.411a5.33 5.33 0 0 0 6.811.303l103.971-78.875c3.488-2.646 8.498-.158 8.498 4.22v-.306a8 8 0 0 0-4.529-7.208Z" />
      <path fill="#007acc" d="m123.471 114.181l-26.374 12.698A7.97 7.97 0 0 1 88 125.333L1.662 46.613a5.333 5.333 0 0 1 .006-7.887l7.052-6.411a5.33 5.33 0 0 1 6.811-.303l103.971 78.874c3.488 2.647 8.498.159 8.498-4.219v.306a8 8 0 0 1-4.529 7.208" />
      <path fill="#1f9cf0" d="M97.098 126.882A7.98 7.98 0 0 1 88 125.333c2.952 2.952 8 .861 8-3.314V5.98c0-4.175-5.048-6.266-8-3.313a7.98 7.98 0 0 1 9.098-1.549L123.467 13.8A8 8 0 0 1 128 21.01v85.982a8 8 0 0 1-4.533 7.21z" />
    </svg>
  );
}

function SlackIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className={className} fill="none">
      <path d="M0 0h128v128H0z" fill="none" />
      <path fill="#de1c59" d="M27.255 80.719c0 7.33-5.978 13.317-13.309 13.317S.63 88.049.63 80.719s5.987-13.317 13.317-13.317h13.309zm6.709 0c0-7.33 5.987-13.317 13.317-13.317s13.317 5.986 13.317 13.317v33.335c0 7.33-5.986 13.317-13.317 13.317c-7.33 0-13.317-5.987-13.317-13.317zm0 0" />
      <path fill="#35c5f0" d="M47.281 27.255c-7.33 0-13.317-5.978-13.317-13.309S39.951.63 47.281.63s13.317 5.987 13.317 13.317v13.309zm0 6.709c7.33 0 13.317 5.987 13.317 13.317s-5.986 13.317-13.317 13.317H13.946C6.616 60.598.63 54.612.63 47.281c0-7.33 5.987-13.317 13.317-13.317zm0 0" />
      <path fill="#2eb57d" d="M100.745 47.281c0-7.33 5.978-13.317 13.309-13.317s13.317 5.987 13.317 13.317s-5.987 13.317-13.317 13.317h-13.309zm-6.709 0c0 7.33-5.987 13.317-13.317 13.317s-13.317-5.986-13.317-13.317V13.946C67.402 6.616 73.388.63 80.719.63c7.33 0 13.317 5.987 13.317 13.317zm0 0" />
      <path fill="#ebb02e" d="M80.719 100.745c7.33 0 13.317 5.978 13.317 13.309s-5.987 13.317-13.317 13.317s-13.317-5.987-13.317-13.317v-13.309zm0-6.709c-7.33 0-13.317-5.987-13.317-13.317s5.986-13.317 13.317-13.317h33.335c7.33 0 13.317 5.986 13.317 13.317c0 7.33-5.987 13.317-13.317 13.317zm0 0" />
    </svg>
  );
}

function GoogleDocsIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} fill="none">
      <path fill="#3086f6" d="M407.3 512H104.7c-19.2 0-34.9-15.7-34.9-34.9V34.9C69.8 15.7 85.5 0 104.7 0h209.5l128 128v349.1c0 19.2-15.7 34.9-34.9 34.9" />
      <path fill="#0c67d6" d="m314.2 0l128 128h-128z" />
      <path fill="#fdffff" d="M360.7 226.9H151.3v-29.1h209.5v29.1zm0 40.7H151.3v29.1h209.5v-29.1zm-58.2 69.9H151.3v29.1h151.3v-29.1z" />
    </svg>
  );
}

function DiscordIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} fill="none">
      <path
        fill="#5865f2"
        d="M433.7 91a416.5 416.5 0 0 0-105.6-33.2c-4.6 8.2-9.9 19.3-13.5 28.1c-39.4-5.9-78.4-5.9-117.1 0c-3.7-8.8-9.1-19.9-13.7-28.1c-37.1 6.4-72.6 17.7-105.7 33.3c-66.8 101-85 199.5-75.9 296.6c44.3 33.1 87.3 53.2 129.6 66.4c10.4-14.4 19.7-29.6 27.7-45.7c-15.3-5.8-29.9-13-43.7-21.3c3.7-2.7 7.2-5.6 10.7-8.5c84.2 39.4 175.8 39.4 259 0c3.5 2.9 7.1 5.8 10.7 8.5c-13.9 8.3-28.5 15.5-43.8 21.3c8 16 17.3 31.3 27.7 45.7c42.3-13.2 85.3-33.3 129.6-66.4c10.8-112.5-18-210.1-76-296.7M170.9 328c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4s46.5 23.6 46 52.4c.1 28.8-20.2 52.4-46 52.4m170.2 0c-25.3 0-46-23.6-46-52.4s20.3-52.4 46-52.4s46.5 23.6 46 52.4c0 28.8-20.3 52.4-46 52.4"
      />
    </svg>
  );
}

function TerminalIcon({ className = "w-4 h-4 shrink-0" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className={className} fill="none">
      <linearGradient
        id="termGrad1_dark"
        x1="96.306"
        x2="25.454"
        y1="35.144"
        y2="98.431"
        gradientTransform="matrix(1 0 0 -1 0 128)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#a9c8ff" />
        <stop offset="1" stopColor="#c7e6ff" />
      </linearGradient>
      <path
        fill="url(#termGrad1_dark)"
        fillRule="evenodd"
        d="M7.2 110.5c-1.7 0-3.1-.7-4.1-1.9s-1.3-2.9-.9-4.6l18.6-80.5c.8-3.4 4-6 7.4-6h92.6c1.7 0 3.1.7 4.1 1.9s1.3 2.9.9 4.6l-18.6 80.5c-.8 3.4-4 6-7.4 6z"
        clipRule="evenodd"
        opacity=".8"
      />
      <linearGradient
        id="termGrad2_dark"
        x1="25.336"
        x2="94.569"
        y1="98.33"
        y2="36.847"
        gradientTransform="matrix(1 0 0 -1 0 128)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#2d4664" />
        <stop offset=".169" stopColor="#29405b" />
        <stop offset=".445" stopColor="#1e2f43" />
        <stop offset=".79" stopColor="#0c131b" />
        <stop offset="1" />
      </linearGradient>
      <path
        fill="url(#termGrad2_dark)"
        fillRule="evenodd"
        d="M120.3 18.5H28.5c-2.9 0-5.7 2.3-6.4 5.2L3.7 104.3c-.7 2.9 1.1 5.2 4 5.2h91.8c2.9 0 5.7-2.3 6.4-5.2l18.4-80.5c.7-2.9-1.1-5.3-4-5.3"
        clipRule="evenodd"
      />
      <path
        fill="#2c5591"
        fillRule="evenodd"
        d="M64.2 88.3h22.3c2.6 0 4.7 2.2 4.7 4.9s-2.1 4.9-4.7 4.9H64.2c-2.6 0-4.7-2.2-4.7-4.9s2.1-4.9 4.7-4.9m14.5-21.8c-.4.8-1.2 1.6-2.6 2.6L34.6 98.9c-2.3 1.6-5.5 1-7.3-1.4c-1.7-2.4-1.3-5.7.9-7.3l37.4-27.1v-.6l-23.5-25c-1.9-2-1.7-5.3.4-7.4c2.2-2 5.5-2 7.4 0l28.2 30c1.7 1.9 1.8 4.5.6 6.4"
        clipRule="evenodd"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M77.6 65.5c-.4.8-1.2 1.6-2.6 2.6L33.6 97.9c-2.3 1.6-5.5 1-7.3-1.4c-1.7-2.4-1.3-5.7.9-7.3l37.4-27.1v-.6l-23.5-25c-1.9-2-1.7-5.3.4-7.4c2.2-2 5.5-2 7.4 0l28.2 30c1.7 1.8 1.8 4.4.5 6.4M63.5 87.8h22.3c2.6 0 4.7 2.1 4.7 4.6c0 2.6-2.1 4.6-4.7 4.6H63.5c-2.6 0-4.7-2.1-4.7-4.6c0-2.6 2.1-4.6 4.7-4.6"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Features() {
  // Card 1 state: active app index
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const [isAppHovered, setIsAppHovered] = useState(false);

  // Card 1 5-phase choreography lifecycle:
  // "idle" -> "hotkey" -> "speaking" -> "injected" -> "complete"
  type Card1Phase = "idle" | "hotkey" | "speaking" | "injected" | "complete";
  const [card1Phase, setCard1Phase] = useState<Card1Phase>("idle");
  const [hudSpeechText, setHudSpeechText] = useState("");
  const [injectedText, setInjectedText] = useState("");

  // Card 5 state: auto-cycling shorthand expansions
  const [shorthandIndex, setShorthandIndex] = useState(0);

  // Card 6 state: 1-click copy feedback
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Animation cycle ref to clear on tab switch
  const cycleTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Card 1: Authentic multi-app definitions with official SVGs
  const apps = [
    {
      name: "VS Code",
      icon: VSCodeIcon,
      targetLabel: "apps/desktop/src/main.rs",
      dictationStream: "const pipeline = await voiceFlow.transcribe({ mode: 'zero-latency' });",
      category: "Code Editor",
      syntaxColor: "text-[#9CDCFE]",
    },
    {
      name: "Slack",
      icon: SlackIcon,
      targetLabel: "#product-launch",
      dictationStream: "@team Shipping the new low-latency local build right now. Audio stays in RAM!",
      category: "Team Chat",
      syntaxColor: "text-slate-100",
    },
    {
      name: "Google Docs",
      icon: GoogleDocsIcon,
      targetLabel: "Strategic Reading Roadmap.gdoc",
      dictationStream: "The contemporary software landscape requires zero-cloud privacy by architectural design.",
      category: "Document",
      syntaxColor: "text-slate-100",
    },
    {
      name: "Discord",
      icon: DiscordIcon,
      targetLabel: "#dev-voice-chat",
      dictationStream: "Testing the global hotkey Ctrl+Space. The overlay pops up over the game without minimizing!",
      category: "Community",
      syntaxColor: "text-[#DBDEE1]",
    },
    {
      name: "Terminal",
      icon: TerminalIcon,
      targetLabel: "pwsh 7.4.2 — VoiceFlow",
      dictationStream: "git commit -m \"feat(audio): vector-accelerated AVX2 inference pipeline\"",
      category: "CLI & Tools",
      syntaxColor: "text-emerald-400 font-mono",
    },
  ];

  const currentApp = apps[activeAppIndex];

  const clearCard1Timers = () => {
    cycleTimeouts.current.forEach((t) => clearTimeout(t));
    cycleTimeouts.current = [];
  };

  const handleSelectApp = (idx: number) => {
    clearCard1Timers();
    setActiveAppIndex(idx);
    setCard1Phase("idle");
    setHudSpeechText("");
    setInjectedText("");
  };

  // Card 1: The 5-Phase Buttery-Smooth Animation Engine
  useEffect(() => {
    let isMounted = true;
    let typeTimer: NodeJS.Timeout | undefined;
    clearCard1Timers();

    const fullText = currentApp.dictationStream;

    // Phase 1: Idle (0.4s) -> Phase 2: Hotkey press (0.6s)
    const tHotkey = setTimeout(() => {
      if (!isMounted) return;
      setCard1Phase("hotkey");

      // Phase 3: Hotkey releases -> HUD Springs In! (0.5s after hotkey)
      const tHUD = setTimeout(() => {
        if (!isMounted) return;
        setCard1Phase("speaking");

        let charIdx = 0;
        typeTimer = setInterval(() => {
          if (!isMounted) return;
          if (charIdx <= fullText.length) {
            setHudSpeechText(fullText.slice(0, charIdx));
            charIdx += 4;
          } else {
            if (typeTimer) clearInterval(typeTimer);

            // Phase 4: Speech completes -> Enter Flashes & Injects (0.5s pause)
            const tInject = setTimeout(() => {
              if (!isMounted) return;
              setCard1Phase("injected");

              // Natural Typewriter stream into the editor/app
              let injectIdx = 0;
              const injectTimer = setInterval(() => {
                if (!isMounted) return;
                if (injectIdx <= fullText.length) {
                  setInjectedText(fullText.slice(0, injectIdx));
                  injectIdx += 3;
                } else {
                  clearInterval(injectTimer);
                  setInjectedText(fullText);

                  // Phase 5: Complete & Appreciate (2.2s calm rest)
                  const tComplete = setTimeout(() => {
                    if (!isMounted) return;
                    setCard1Phase("complete");

                    const tNext = setTimeout(() => {
                      if (!isMounted) return;
                      if (!isAppHovered) {
                        setCard1Phase("idle");
                        setHudSpeechText("");
                        setInjectedText("");
                        setActiveAppIndex((prev) => (prev + 1) % apps.length);
                      }
                    }, 2000);
                    cycleTimeouts.current.push(tNext);
                  }, 400);
                  cycleTimeouts.current.push(tComplete);
                }
              }, 22);
            }, 600);
            cycleTimeouts.current.push(tInject);
          }
        }, 32);
      }, 550);
      cycleTimeouts.current.push(tHUD);
    }, 450);
    cycleTimeouts.current.push(tHotkey);

    return () => {
      isMounted = false;
      clearCard1Timers();
      if (typeTimer) clearInterval(typeTimer);
    };
  }, [activeAppIndex, currentApp.dictationStream, isAppHovered, apps.length]);

  // Card 2: Auto-playable speed benchmark cycle (Calm 5.6s Loop)
  const [benchmarkKey, setBenchmarkKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const tLoop = setTimeout(() => {
      if (!isMounted) return;
      setBenchmarkKey((k) => k + 1);
    }, 5600);

    return () => {
      isMounted = false;
      clearTimeout(tLoop);
    };
  }, [benchmarkKey]);

  // Card 5: Auto-cycling personal vocabulary & snippet expansions
  const vocabularyList = [
    {
      tag: "Names",
      spoken: "dr sarah jenkins",
      full: "Dr. Sarah Jenkins",
      output: "Meeting confirmed with Dr. Sarah Jenkins",
      badge: "Proper Name",
    },
    {
      tag: "Brand",
      spoken: "voice flow desktop",
      full: "VoiceFlow Desktop",
      output: "Downloaded VoiceFlow Desktop",
      badge: "Brand Casing",
    },
    {
      tag: "Snippets",
      spoken: "send over the doc asap",
      full: "as soon as possible",
      output: "send over the doc as soon as possible",
      badge: "Text Expansion",
    },
    {
      tag: "Tech",
      spoken: "deploy to k eight s",
      full: "Kubernetes",
      output: "deploy cluster to Kubernetes",
      badge: "Code Syntax",
    },
  ];

  // Card 3: Live Audio-to-Vault & Memory Purge lifecycle (Calm 6.8s Loop)
  type VaultPhase = "speaking" | "locking" | "purged";
  const [vaultPhase, setVaultPhase] = useState<VaultPhase>("speaking");

  useEffect(() => {
    let isMounted = true;
    let tLock: NodeJS.Timeout;
    let tPurge: NodeJS.Timeout;

    const startVaultCycle = () => {
      if (!isMounted) return;
      setVaultPhase("speaking");

      // Speaking for 2.4s: dynamic acoustic equalizer & lifted shackle
      tLock = setTimeout(() => {
        if (!isMounted) return;
        setVaultPhase("locking");

        // Mechanical lock down for 1.4s
        tPurge = setTimeout(() => {
          if (!isMounted) return;
          setVaultPhase("purged");
          // Stays in purged "Audio Cleared from Memory" for 3.0s calm hold
        }, 1400);
      }, 2400);
    };

    startVaultCycle();
    const vaultInterval = setInterval(startVaultCycle, 6800);

    return () => {
      isMounted = false;
      clearTimeout(tLock);
      clearTimeout(tPurge);
      clearInterval(vaultInterval);
    };
  }, []);

  // Card 4: Live Zero-Interruption Typewriter in message draft (Calm 7.4s Loop)
  type FocusPhase = "idle" | "hud" | "typing" | "complete" | "fade";
  const [focusPhase, setFocusPhase] = useState<FocusPhase>("idle");
  const [focusTypedText, setFocusTypedText] = useState("");

  const fullFocusText = "Sending the final draft over now.";

  useEffect(() => {
    let isMounted = true;
    let typeTimer: NodeJS.Timeout | undefined;
    const focusTimeouts: NodeJS.Timeout[] = [];

    const runFocusCycle = () => {
      if (!isMounted) return;
      setFocusPhase("idle");
      setFocusTypedText("");

      // Phase 1: Pre-state with blinking cursor (0.9s) -> Stealth HUD Entrance
      const tHUD = setTimeout(() => {
        if (!isMounted) return;
        setFocusPhase("hud");

        // Phase 2: Stealth HUD settled (1.1s) -> Natural human typing begins
        const tInject = setTimeout(() => {
          if (!isMounted) return;
          setFocusPhase("typing");

          let charIdx = 0;
          typeTimer = setInterval(() => {
            if (!isMounted) return;
            if (charIdx <= fullFocusText.length) {
              setFocusTypedText(fullFocusText.slice(0, charIdx));
              charIdx += 1; // Smooth character-by-character cadence
            } else {
              if (typeTimer) clearInterval(typeTimer);
              setFocusTypedText(fullFocusText);
              setFocusPhase("complete");

              // Phase 3: Hold complete text for 2.6s so the user can comfortably read it
              const tFade = setTimeout(() => {
                if (!isMounted) return;
                setFocusPhase("fade");

                // Reset smoothly before next cycle
                const tReset = setTimeout(() => {
                  if (!isMounted) return;
                  setFocusTypedText("");
                  setFocusPhase("idle");
                }, 500);
                focusTimeouts.push(tReset);
              }, 2600);
              focusTimeouts.push(tFade);
            }
          }, 45); // 45ms per character = ~1.5s natural human voice typing stream
        }, 1100);
        focusTimeouts.push(tInject);
      }, 900);
      focusTimeouts.push(tHUD);
    };

    runFocusCycle();
    const focusInterval = setInterval(runFocusCycle, 7400);

    return () => {
      isMounted = false;
      if (typeTimer) clearInterval(typeTimer);
      clearInterval(focusInterval);
      focusTimeouts.forEach(clearTimeout);
    };
  }, [fullFocusText]);

  // Card 5: Auto-cycling personal vocabulary & snippet expansions (Calm 6.5s Loop)
  type VocabPhase = "speaking" | "morphing" | "expanded";
  const [vocabPhase, setVocabPhase] = useState<VocabPhase>("speaking");

  useEffect(() => {
    let isMounted = true;
    let tMorph: NodeJS.Timeout;
    let tExp: NodeJS.Timeout;

    const startCycle = () => {
      setVocabPhase("speaking");

      tMorph = setTimeout(() => {
        if (!isMounted) return;
        setVocabPhase("morphing");

        tExp = setTimeout(() => {
          if (!isMounted) return;
          setVocabPhase("expanded");
        }, 900);
      }, 1600);
    };

    startCycle();

    const interval = setInterval(() => {
      if (!isMounted) return;
      setShorthandIndex((prev) => (prev + 1) % vocabularyList.length);
      startCycle();
    }, 6500);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(tMorph);
      clearTimeout(tExp);
    };
  }, [vocabularyList.length]);

  // Card 6: Human-centric past dictations
  const pastDictations = [
    {
      id: 1,
      time: "Just now",
      text: "Review the final product roadmap and draft quarterly milestones.",
      app: "Slack",
      keyword: "roadmap",
    },
    {
      id: 2,
      time: "2m ago",
      text: "Meeting notes with Dr. Sarah Jenkins on UI motion design.",
      app: "Google Docs",
      keyword: "Sarah",
    },
    {
      id: 3,
      time: "12m ago",
      text: "Send the signed partnership contract over to legal.",
      app: "Notion",
      keyword: "contract",
    },
  ];

  // Card 6: Live Interactive Search & 1-Click Copy Cycle (8.4s Loop)
  type HistoryPhase = "idle" | "typing" | "matched" | "copied" | "fade";
  const [historyPhase, setHistoryPhase] = useState<HistoryPhase>("idle");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyCopiedId, setHistoryCopiedId] = useState<number | null>(null);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);

  const targetHistoryQuery = "roadmap";

  useEffect(() => {
    let isMounted = true;
    let typeTimer: NodeJS.Timeout | undefined;
    const historyTimeouts: NodeJS.Timeout[] = [];

    const runHistoryCycle = () => {
      if (!isMounted || isHistoryHovered) return;
      setHistoryPhase("idle");
      setHistorySearchQuery("");
      setHistoryCopiedId(null);

      // Phase 1: Idle (1.8s) -> Live simulated typing begins
      const tStartTyping = setTimeout(() => {
        if (!isMounted || isHistoryHovered) return;
        setHistoryPhase("typing");

        let charIdx = 0;
        typeTimer = setInterval(() => {
          if (!isMounted || isHistoryHovered) return;
          if (charIdx <= targetHistoryQuery.length) {
            setHistorySearchQuery(targetHistoryQuery.slice(0, charIdx));
            charIdx += 1;
          } else {
            if (typeTimer) clearInterval(typeTimer);
            setHistorySearchQuery(targetHistoryQuery);
            setHistoryPhase("matched");

            // Phase 2: Matched & Highlighted (1.2s pause) -> Auto-Copy Triggered
            const tCopy = setTimeout(() => {
              if (!isMounted || isHistoryHovered) return;
              setHistoryPhase("copied");
              setHistoryCopiedId(1); // Item #1 ("roadmap") is copied

              // Phase 3: Hold complete state for 3.0s so visitor reads everything
              const tFade = setTimeout(() => {
                if (!isMounted || isHistoryHovered) return;
                setHistoryPhase("fade");

                // Reset smoothly
                const tReset = setTimeout(() => {
                  if (!isMounted || isHistoryHovered) return;
                  setHistorySearchQuery("");
                  setHistoryCopiedId(null);
                  setHistoryPhase("idle");
                }, 500);
                historyTimeouts.push(tReset);
              }, 3000);
              historyTimeouts.push(tFade);
            }, 1200);
            historyTimeouts.push(tCopy);
          }
        }, 110);
      }, 1800);
      historyTimeouts.push(tStartTyping);
    };

    runHistoryCycle();
    const historyInterval = setInterval(runHistoryCycle, 8400);

    return () => {
      isMounted = false;
      if (typeTimer) clearInterval(typeTimer);
      clearInterval(historyInterval);
      historyTimeouts.forEach(clearTimeout);
    };
  }, [isHistoryHovered]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const miniBars = [6, 12, 16, 10, 14, 18, 11, 7, 15, 9, 13, 5];

  return (
    <section
      id="features"
      className="py-20 sm:py-28 bg-[#212121] relative overflow-hidden text-white"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Live Acoustic Speech Stream */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Everything you need for{" "}
            <span className="inline-flex flex-wrap items-center justify-center gap-3">
              <span>effortless speech.</span>
              {/* Live Acoustic Frequency Waveform Capsule */}
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs shadow-sm align-middle select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5722] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5722]" />
                </span>
                <span className="flex items-center gap-[2.5px] h-3.5 px-0.5">
                  {[8, 14, 20, 12, 18, 10, 16].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        height: [3, h * 0.75, 2, h, 3],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.55 + (i % 3) * 0.12,
                        ease: "easeInOut",
                      }}
                      className="w-[2px] rounded-full bg-gradient-to-t from-[#FF5722] to-[#FACC15]"
                      style={{ height: `${h * 0.65}px` }}
                    />
                  ))}
                </span>
              </span>
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            Engineered natively for ultra-fast local dictation without external cloud dependencies.
          </p>
        </div>

        {/* The Bento Grid (Architectural #212121 Palette) */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ========================================================= */}
          {/* CARD 1: Universal Direct Injection (The Living Canvas)    */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onMouseEnter={() => setIsAppHovered(true)}
            onMouseLeave={() => setIsAppHovered(false)}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-9 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div>
              {/* Unified Workspace Header: Segmented App Switcher Dock & Tactile Hotkey */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 select-none">
                {/* Segmented App Switcher Dock with Framer layoutId */}
                <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-white/[0.04] border border-white/10">
                  {apps.map((app, idx) => {
                    const Icon = app.icon;
                    const isActive = activeAppIndex === idx;
                    return (
                      <button
                        key={app.name}
                        onClick={() => handleSelectApp(idx)}
                        className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? "text-[#111827]"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeAppPill"
                            className="absolute inset-0 rounded-xl bg-white shadow-md"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{app.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tactile Hotkey Indicator ([ Ctrl ] + [ Space ]) */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="text-[10px] text-slate-500 font-mono">Press:</span>
                  <motion.div
                    animate={{
                      scale: card1Phase === "hotkey" ? 0.92 : 1,
                      borderColor: card1Phase === "hotkey" ? "#FF5722" : "rgba(255,255,255,0.15)",
                      backgroundColor: card1Phase === "hotkey" ? "rgba(255,87,34,0.15)" : "rgba(255,255,255,0.05)",
                    }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono font-bold text-slate-300 shadow-sm"
                  >
                    <span className={card1Phase === "hotkey" ? "text-[#FF5722]" : "text-white"}>Ctrl</span>
                    <span className="text-slate-600">+</span>
                    <span className={card1Phase === "hotkey" ? "text-[#FF5722]" : "text-white"}>Space</span>
                  </motion.div>
                </div>
              </div>

              {/* Deep Native Studio Canvas with Real Window Controls & Absolute Floating HUD */}
              <div
                className={`rounded-2xl border transition-all duration-300 relative min-h-[200px] sm:min-h-[220px] flex flex-col justify-between overflow-hidden shadow-inner p-4 sm:p-5 ${
                  currentApp.name === "VS Code"
                    ? "bg-[#1E1E1E] border-white/10"
                    : currentApp.name === "Slack"
                    ? "bg-[#1A1D21] border-white/10"
                    : currentApp.name === "Google Docs"
                    ? "bg-[#F0F4F9] border-slate-300 text-slate-900"
                    : currentApp.name === "Discord"
                    ? "bg-[#313338] border-[#202225]"
                    : "bg-[#0C0C0C] border-white/10"
                }`}
              >
                {/* Studio Window Controls Bar */}
                <div
                  className={`flex items-center justify-between text-xs pb-2.5 border-b font-sans ${
                    currentApp.name === "Google Docs"
                      ? "border-slate-300/80 text-slate-600"
                      : "border-white/10 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Window Controls Dots */}
                    <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                    </div>
                    <span
                      className={`font-semibold font-mono text-[11px] ${
                        currentApp.name === "Google Docs" ? "text-slate-800" : "text-slate-200"
                      }`}
                    >
                      {currentApp.targetLabel}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-medium hidden sm:inline ${
                      currentApp.name === "Google Docs" ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {currentApp.category}
                  </span>
                </div>

                {/* THE TYPING STAGE: Fixed baseline to eliminate ALL layout shift */}
                <div className="relative pt-6 pb-2 min-h-[105px] flex flex-col justify-center">
                  {/* FLOATING ABSOLUTE HUD: Zero layout shifting */}
                  <AnimatePresence>
                    {(card1Phase === "speaking" || card1Phase === "injected") && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.94 }}
                        animate={{
                          opacity: card1Phase === "speaking" ? 1 : [1, 0],
                          y: card1Phase === "speaking" ? 0 : -8,
                          scale: card1Phase === "speaking" ? 1 : 0.96,
                        }}
                        exit={{ opacity: 0, y: -8, scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 420, damping: 28 }}
                        className="absolute -top-3 left-2 z-30 pointer-events-none"
                      >
                        <div className="flex items-center gap-3 rounded-full border border-white/20 bg-[#0E101D] px-4 py-1.5 shadow-2xl shadow-black/80 backdrop-blur-2xl text-white">
                          {/* Glowing Coral Mic */}
                          <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF5722] to-[#FF7043] shadow-sm shadow-[#FF5722]/50">
                            <Mic className="h-3 w-3 text-white" />
                            <span className="absolute inset-0 rounded-full bg-[#FF5722] animate-ping opacity-40" />
                          </div>

                          {/* Soundwave Bars */}
                          <div className="flex items-center gap-[2px] h-3.5 px-0.5">
                            {miniBars.slice(0, 8).map((h, i) => (
                              <motion.span
                                key={i}
                                animate={{
                                  height: [3, h * 0.75, 2, h, 3],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.5 + (i % 3) * 0.12,
                                  ease: "easeInOut",
                                }}
                                className="w-[2px] rounded-full bg-[#7772FF]"
                                style={{ height: `${h * 0.75}px` }}
                              />
                            ))}
                          </div>

                          {/* Live Speech Stream */}
                          <div className="text-xs font-semibold text-white max-w-[200px] sm:max-w-md truncate">
                            {hudSpeechText || "Listening..."}
                          </div>

                          {/* Enter Pill */}
                          <div
                            className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                              card1Phase === "injected"
                                ? "bg-emerald-500 text-white font-bold"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {card1Phase === "injected" ? "✓ Injected" : "Enter ↵"}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ============================================================= */}
                  {/* REALISTIC APP-SPECIFIC SHELLS                                */}
                  {/* ============================================================= */}

                  {/* 1. VS CODE SHELL */}
                  {currentApp.name === "VS Code" && (
                    <div className="flex flex-col gap-1 font-mono text-xs sm:text-[13px] leading-relaxed">
                      <div className="flex items-center gap-3 text-slate-600 select-none">
                        <span className="w-4 text-right">1</span>
                        <span className="text-[#C586C0]">async function</span>{" "}
                        <span className="text-[#DCDCAA]">initPipeline</span>() &#123;
                      </div>
                      <div className="flex items-center gap-3 bg-white/[0.04] -mx-2 px-2 py-0.5 rounded">
                        <span className="w-4 text-right text-slate-500 select-none">2</span>
                        <div className="pl-2 flex-1 text-[#9CDCFE] truncate">
                          {injectedText ? (
                            <span>{injectedText}</span>
                          ) : (
                            <span className="text-slate-500 italic">
                              {card1Phase === "speaking" ? "Transcribing speech..." : "// Dictate code with Ctrl + Space..."}
                            </span>
                          )}
                          <span className="inline-block w-1.5 h-3.5 bg-[#FF5722] animate-pulse align-middle ml-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 select-none">
                        <span className="w-4 text-right">3</span>
                        <span>&#125;</span>
                      </div>
                    </div>
                  )}

                  {/* 2. SLACK SHELL */}
                  {currentApp.name === "Slack" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <div className="h-4 w-4 rounded bg-[#E01E5A] text-white font-bold flex items-center justify-center text-[9px]">
                          #
                        </div>
                        <span className="font-semibold text-slate-300">product-launch</span>
                        <span className="text-slate-600">• Channel</span>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#222529] p-2 sm:p-2.5">
                        <div className="text-xs text-white min-h-[22px]">
                          {injectedText ? (
                            <span>{injectedText}</span>
                          ) : (
                            <span className="text-slate-400 italic">
                              {card1Phase === "speaking" ? "Transcribing speech..." : "Message #product-launch..."}
                            </span>
                          )}
                          <span className="inline-block w-1.5 h-3 bg-[#FF5722] animate-pulse align-middle ml-1" />
                        </div>
                        <div className="flex items-center justify-between pt-1 text-slate-500 border-t border-white/5 mt-1">
                          <div className="flex items-center gap-2 text-[10px]">
                            <Paperclip className="h-3 w-3 hover:text-white cursor-pointer" />
                            <Smile className="h-3 w-3 hover:text-white cursor-pointer" />
                          </div>
                          <Send className={`h-3 w-3 ${injectedText ? "text-emerald-400" : "text-slate-600"}`} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. GOOGLE DOCS SHELL */}
                  {currentApp.name === "Google Docs" && (
                    <div className="bg-white rounded-lg p-3 shadow-xs border border-slate-200 text-slate-900 font-sans">
                      <div className="text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
                        <span>Strategic Reading Roadmap</span>
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                          Saved
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 leading-relaxed min-h-[24px]">
                        {injectedText ? (
                          <span>{injectedText}</span>
                        ) : (
                          <span className="text-slate-400 italic">
                            {card1Phase === "speaking" ? "Transcribing speech into document..." : "Type or dictate with Ctrl + Space..."}
                          </span>
                        )}
                        <span className="inline-block w-1.5 h-3 bg-[#FF5722] animate-pulse align-middle ml-1" />
                      </div>
                    </div>
                  )}

                  {/* 4. DISCORD SHELL */}
                  {currentApp.name === "Discord" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300 font-sans">
                        <span className="text-slate-500 font-bold">#</span>
                        <span className="font-semibold text-white">general</span>
                        <span className="text-slate-500 text-[10px] hidden sm:inline">• We write code</span>
                      </div>
                      <div className="rounded-lg bg-[#383A40] border border-white/5 px-3 py-2 flex items-center justify-between text-xs text-white">
                        <div className="flex-1 truncate">
                          {injectedText ? (
                            <span>{injectedText}</span>
                          ) : (
                            <span className="text-slate-400 italic">
                              {card1Phase === "speaking" ? "Capturing audio..." : "Message #general..."}
                            </span>
                          )}
                          <span className="inline-block w-1.5 h-3 bg-[#FF5722] animate-pulse align-middle ml-1" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 ml-2">
                          <Smile className="h-3 w-3 hover:text-white cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. TERMINAL SHELL */}
                  {currentApp.name === "Terminal" && (
                    <div className="flex flex-col gap-1 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-200">
                      <div className="text-slate-500 text-[10px] select-none">
                        Windows PowerShell 7.4.2
                      </div>
                      <div className="flex items-start gap-1.5 flex-wrap">
                        <span className="text-cyan-400 font-bold select-none">PS C:\Users\Utpal\VoiceFlow&gt;</span>
                        <span className="text-emerald-400">
                          {injectedText ? (
                            <span>{injectedText}</span>
                          ) : (
                            <span className="text-slate-500 italic font-sans text-xs">
                              {card1Phase === "speaking" ? "Transcribing speech..." : "speak command with Ctrl + Space..."}
                            </span>
                          )}
                          <span className="inline-block w-2 h-3.5 bg-emerald-400 animate-pulse align-middle ml-1" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Types into any app. Right at your cursor.
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Click into your code editor, document, browser, or terminal. Press{" "}
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white border border-white/10">
                  Ctrl
                </span>{" "}
                +{" "}
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white border border-white/10">
                  Space
                </span>{" "}
                and VoiceFlow injects text directly at your cursor without plugins, browser extensions, or copy-pasting.
              </p>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* CARD 2: Sub-200ms Latency Benchmark (Auto-Playable Speed Gauge) */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-9 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              {/* Hero Metric & Subhead */}
              <div className="flex items-baseline justify-between">
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-white font-sans">
                  3.2x
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm font-sans">
                  <Zap className="h-3 w-3 fill-white text-white" />
                  160+ WPM
                </span>
              </div>

              {/* Minimalist Latency Comparison Bars */}
              <div className="mt-7 space-y-4">
                {/* VoiceFlow Bar (Green) */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-white mb-1.5 font-sans">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span>VoiceFlow (Local AVX2)</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">180ms</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden relative p-[2px]">
                    <motion.div
                      key={`vf-${benchmarkKey}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                    />
                  </div>
                </div>

                {/* Cloud APIs (Yellow) */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-300 mb-1 font-sans">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                      <span>Cloud APIs (Network Roundtrip)</span>
                    </span>
                    <span className="font-mono text-amber-400 font-medium">1,250ms</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      key={`cloud-${benchmarkKey}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "45%" }}
                      transition={{ duration: 1.4, delay: 0.15, ease: "easeInOut" }}
                      className="h-full rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                    />
                  </div>
                </div>

                {/* Manual Typing (Red) */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1 font-sans">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]" />
                      <span>Manual Typing Average</span>
                    </span>
                    <span className="font-mono text-rose-400 font-medium">3,800ms</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      key={`manual-${benchmarkKey}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "16%" }}
                      transition={{ duration: 1.8, delay: 0.15, ease: "easeInOut" }}
                      className="h-full rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-bold tracking-tight text-white">
                Faster than you can think.
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Vector-accelerated AVX2 inference runs instantaneously on standard Intel and AMD CPUs
                with zero network latency or cloud queuing.
              </p>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* CARD 3: Private by Design (Live Audio-to-Vault Lifecycle) */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-9 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                  <ShieldCheck className="h-4 w-4 text-slate-300" />
                  Private by Design
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    vaultPhase === "speaking"
                      ? "bg-orange-400 animate-pulse"
                      : vaultPhase === "locking"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`} />
                  100% On-Device
                </span>
              </div>

              {/* Centerpiece: Dynamic Mechanical Vault Chamber */}
              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[148px]">
                {/* Acoustic Soundwave / Equalizer while speaking */}
                <div className="h-6 flex items-center justify-center mb-1">
                  <AnimatePresence mode="wait">
                    {vaultPhase === "speaking" ? (
                      <motion.div
                        key="speaking-wave"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="flex items-center gap-1.5"
                      >
                        <Mic className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                        <div className="flex items-center gap-1 h-5">
                          {[10, 18, 8, 22, 14, 19, 11].map((h, i) => (
                            <motion.span
                              key={i}
                              animate={{ height: [4, h, 6, h + 2, 4] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                              className="w-1 bg-amber-400 rounded-full"
                            />
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="purged-text"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="text-[10px] font-mono text-slate-500 uppercase tracking-widest"
                      >
                        {vaultPhase === "locking" ? "Securing Audio Buffer" : "Volatile Buffer Purged"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative flex items-center justify-center py-1">
                  {/* Dark Metallic Padlock Housing */}
                  <motion.div
                    animate={{
                      scale: vaultPhase === "locking" ? [1, 0.96, 1.01, 1] : 1,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-[#252525] to-[#141414] border border-white/15 shadow-2xl"
                  >
                    {/* Mechanical Shackle that locks down */}
                    <motion.div
                      animate={{
                        y: vaultPhase === "speaking" ? -8 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 180, damping: 20, mass: 0.9 }}
                      className="absolute -top-3"
                    >
                      <svg width="28" height="22" viewBox="0 0 34 26" fill="none">
                        <path
                          d="M4 24V11C4 5.47715 8.47715 1 14 1H20C25.5228 1 30 5.47715 30 11V24"
                          stroke="#383838"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4 24V11C4 5.47715 8.47715 1 14 1H20C25.5228 1 30 5.47715 30 11V24"
                          stroke={vaultPhase === "speaking" ? "#a8a29e" : "#f5f5f4"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.div>

                    {/* Padlock Core & Amber Keyhole */}
                    <div className="relative flex items-center justify-center mt-1">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                        vaultPhase === "purged"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-amber-400/20 border-amber-400/30 text-amber-300"
                      }`}>
                        <Lock className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    </div>

                    <div className="text-[7px] font-mono font-bold tracking-wider text-slate-400 uppercase mt-0.5">
                      {vaultPhase === "purged" ? "Clean" : "Vault"}
                    </div>
                  </motion.div>
                </div>

                {/* Sub-badge: Real human status transition */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-sans font-medium text-slate-300 min-h-[26px]">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                    vaultPhase === "speaking"
                      ? "bg-orange-400 animate-pulse"
                      : vaultPhase === "locking"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`} />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={vaultPhase}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.25 }}
                    >
                      {vaultPhase === "speaking"
                        ? "Listening locally in RAM..."
                        : vaultPhase === "locking"
                        ? "🔒 Locked to Device"
                        : "✓ Audio Cleared from Memory"}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Compact 3-Badge Spec Row (Universal Human Language) */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center font-sans">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[11px] font-bold text-white">No Cloud</span>
                  <span className="text-[10px] text-slate-400">On-device only</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[11px] font-bold text-white">Zero Saved</span>
                  <span className="text-[10px] text-slate-400">Audio discarded</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[11px] font-bold text-white">100% Offline</span>
                  <span className="text-[10px] text-slate-400">No Wi-Fi needed</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-bold tracking-tight text-white">
                Your voice stays in your room.
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                VoiceFlow transcribes speech locally on your computer and wipes audio the instant you finish speaking. No recordings, no cloud uploads, zero tracking.
              </p>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* CARD 4: Focus Lock (Live Zero-Interruption Typewriter)    */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-9 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                  <Sliders className="h-4 w-4 text-slate-300" />
                  Focus Lock
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Zero Interruption
                </span>
              </div>

              {/* Universal Workspace Window: Live Typewriter Simulation */}
              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-3.5 font-sans relative overflow-hidden shadow-inner min-h-[148px] flex flex-col justify-between">
                <div>
                  {/* Window Titlebar */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                      <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                      <span className="ml-1.5 text-slate-300 font-medium truncate text-[11px]">
                        Draft Message — Active Window
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Focused
                    </span>
                  </div>

                  {/* Relatable Message Text Field with Live Typing Stream */}
                  <div className="text-xs text-slate-200 font-sans space-y-1 py-0.5 leading-relaxed">
                    <div className="text-[11px] text-slate-400">
                      To: <span className="text-slate-200 font-medium">Sarah Jenkins</span>
                    </div>
                    <motion.div
                      animate={{ opacity: focusPhase === "fade" ? 0 : 1 }}
                      transition={{ duration: 0.45 }}
                      className="text-slate-100 flex items-center flex-wrap pt-0.5"
                    >
                      <span>&ldquo;Just finished reviewing the proposal.&nbsp;</span>
                      <span className="text-white font-medium">{focusTypedText}</span>
                      <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-0.5 animate-pulse" />
                      <span>&rdquo;</span>
                    </motion.div>
                  </div>
                </div>

                {/* Floating Stealth HUD Overlay (Never steals focus) */}
                <div className="mt-2 min-h-[38px] flex items-center">
                  <AnimatePresence>
                    {(focusPhase === "hud" || focusPhase === "typing") && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full p-2 rounded-xl bg-[#222]/95 border border-white/15 shadow-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5722]" />
                          </span>
                          <span className="text-xs text-slate-200 font-sans truncate">
                            🎙️ &ldquo;Sending the final draft over now&rdquo;
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors shrink-0 ml-2 ${
                          focusPhase === "typing"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-white/10 text-slate-400 border-white/10"
                        }`}>
                          Enter ↵
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Compact 2-Metric Row */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 text-center font-sans">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[11px] font-bold text-white">Never Tabs Out</span>
                  <span className="text-[10px] text-slate-400">Games &amp; apps stay active</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="block text-[11px] font-bold text-white">Zero Cursor Steal</span>
                  <span className="text-[10px] text-slate-400">Keystrokes 100% kept</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-bold tracking-tight text-white">
                Never interrupts your flow.
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                VoiceFlow floats weightlessly beside your cursor without minimizing full-screen apps, dropping keystrokes, or stealing typing focus.
              </p>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* CARD 5: Custom Vocabulary (Personal Dictionary & Snippets) */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-9 shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                  <Layers className="h-4 w-4 text-slate-300" />
                  Custom Vocabulary
                </span>
                <span className="inline-flex items-center gap-1 text-slate-300 font-medium bg-white/5 text-[11px] px-2.5 py-0.5 rounded-full border border-white/10 font-sans">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Instant Formatting
                </span>
              </div>

              {/* Compact Morphing Container */}
              <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-3.5 shadow-inner min-h-[148px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={shorthandIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-2.5 flex-1 flex flex-col justify-between"
                  >
                    {/* Spoken Input */}
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-2 truncate text-slate-400">
                        <Mic className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                          vocabPhase === "speaking" ? "text-orange-400 animate-pulse" : "text-slate-500"
                        }`} />
                        <span className="font-medium text-slate-400">You say:</span>
                        <span className="text-slate-200 italic font-mono truncate">
                          &ldquo;{vocabularyList[shorthandIndex].spoken}&rdquo;
                        </span>
                      </div>
                    </div>

                    {/* Expansion Bridge with Animated Gradient Sweep */}
                    <div className="flex items-center gap-2 text-[10px] font-sans text-slate-400 font-medium">
                      <span className="h-px bg-white/10 flex-1" />
                      <motion.span
                        animate={{
                          scale: vocabPhase === "expanded" ? [1, 1.04, 1] : 1,
                        }}
                        transition={{ duration: 0.4 }}
                        className={`px-2.5 py-0.5 rounded-full border transition-all duration-300 ${
                          vocabPhase === "expanded"
                            ? "bg-white/15 text-white border-white/30 shadow-xs"
                            : "bg-white/5 text-slate-400 border-white/10"
                        }`}
                      >
                        ➔ {vocabularyList[shorthandIndex].badge}
                      </motion.span>
                      <span className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Formatted Output with Spring Highlight */}
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="truncate text-white">
                        <span className="text-slate-400 mr-1.5 font-medium">Types:</span>
                        <span>{vocabularyList[shorthandIndex].output.split(vocabularyList[shorthandIndex].full)[0]}</span>
                        <motion.span
                          key={`${shorthandIndex}-${vocabPhase === "expanded"}`}
                          initial={{ scale: 0.94, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 22 }}
                          className={`font-bold px-1.5 py-0.5 rounded border shadow-xs inline-block transition-colors duration-300 ${
                            vocabPhase === "expanded"
                              ? "bg-white/20 text-white border-white/30"
                              : "bg-white/10 text-slate-300 border-white/10"
                          }`}
                        >
                          {vocabularyList[shorthandIndex].full}
                        </motion.span>
                        <span>{vocabularyList[shorthandIndex].output.split(vocabularyList[shorthandIndex].full)[1]}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Compact Quick-Tag Selector Row with Animated Sliding Highlight */}
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-center font-sans">
                {vocabularyList.map((item, idx) => {
                  const isActive = shorthandIndex === idx;
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => {
                        setShorthandIndex(idx);
                        setVocabPhase("speaking");
                        setTimeout(() => setVocabPhase("morphing"), 1400);
                        setTimeout(() => setVocabPhase("expanded"), 2200);
                      }}
                      className="relative py-1.5 px-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer truncate"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeVocabTab"
                          className="absolute inset-0 bg-white rounded-xl shadow-sm"
                          transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        />
                      )}
                      <span className={`relative z-10 transition-colors ${
                        isActive ? "text-[#111827] font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}>
                        {item.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-bold tracking-tight text-white">
                Learns your unique vocabulary.
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Add custom names, brand terms, and personal shortcuts so VoiceFlow types your words with 100% accuracy every single time.
              </p>
            </div>
          </motion.div>

          {/* ========================================================= */}
          {/* CARD 6: Local History Vault (Obsidian Graphite Surface)   */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onMouseEnter={() => setIsHistoryHovered(true)}
            onMouseLeave={() => setIsHistoryHovered(false)}
            className="lg:col-span-3 rounded-3xl border border-white/10 bg-[#181818] p-7 sm:p-9 shadow-2xl hover:border-white/20 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 overflow-hidden relative"
          >
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 border border-white/10 mb-3 shadow-2xs font-sans">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </span>
                <span>On-Device SQLite Vault</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                Local history. Always at your fingertips.
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed font-sans">
                Search, browse, and 1-click copy past dictations whenever you need them. All
                records are stored strictly on your local SSD with zero cloud telemetry.
              </p>
            </div>

            {/* Desktop Clipboard Manager on Dark Graphite */}
            <div className="w-full lg:w-auto lg:min-w-[460px] rounded-2xl border border-white/10 bg-[#111111] p-4 text-xs font-mono shadow-inner relative">
              {/* Search Bar with Live Simulated Typewriter */}
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs transition-colors duration-300 min-h-[40px]">
                <Search className={`h-4 w-4 shrink-0 transition-colors ${
                  historySearchQuery ? "text-amber-400" : "text-slate-500"
                }`} />
                <div className="flex items-center flex-1 font-sans">
                  {historySearchQuery ? (
                    <span className="text-white font-medium">
                      {historySearchQuery}
                      <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-0.5 animate-pulse align-middle" />
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Search past dictations...
                      <span className="inline-block w-1.5 h-3.5 bg-white/40 ml-0.5 animate-pulse align-middle" />
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {historyPhase === "matched" || historyPhase === "copied" ? (
                    <motion.span
                      key="match-tag"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-sans font-semibold shrink-0"
                    >
                      1 match (&lt; 1ms)
                    </motion.span>
                  ) : (
                    <motion.span
                      key="ctrl-f"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 border border-white/10 shrink-0 font-sans"
                    >
                      Ctrl+F
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Past Dictations List */}
              <div className="mt-3 space-y-2">
                {pastDictations.map((item) => {
                  const isMatching = (historyPhase === "matched" || historyPhase === "copied") && item.id === 1;
                  const isNonMatching = (historyPhase === "matched" || historyPhase === "copied") && item.id !== 1;
                  const isCopied = copiedId === item.id || historyCopiedId === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      animate={{
                        opacity: isNonMatching ? 0.35 : 1,
                        scale: isMatching ? 1.01 : isNonMatching ? 0.99 : 1,
                        borderColor: isMatching ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.05)",
                      }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className={`rounded-xl p-3 border flex items-center justify-between gap-3 transition-colors ${
                        isMatching ? "bg-white/[0.08]" : "bg-white/5"
                      }`}
                    >
                      <div className="truncate pr-2 flex-1">
                        <div className="text-slate-200 text-xs truncate font-sans font-medium">
                          &ldquo;
                          {item.id === 1 && (historyPhase === "matched" || historyPhase === "copied") ? (
                            <>
                              Review the final product{" "}
                              <mark className="bg-amber-400/25 text-amber-200 px-1 py-0.5 rounded border border-amber-400/30 font-semibold inline">
                                roadmap
                              </mark>{" "}
                              and draft quarterly milestones.
                            </>
                          ) : (
                            item.text
                          )}
                          &rdquo;
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {item.time} • {item.app}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(item.id, item.text)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
                          isCopied
                            ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105"
                            : "bg-white/10 hover:bg-white/15 text-slate-200"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Toast and Status Footer */}
              <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-white/5 font-sans min-h-[28px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="h-3 w-3 text-emerald-400" />
                  <span className="font-mono text-emerald-400 font-bold">&lt; 1ms</span> local disk query
                </span>

                <AnimatePresence>
                  {historyCopiedId || copiedId ? (
                    <motion.span
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                    >
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Copied to Clipboard
                    </motion.span>
                  ) : (
                    <span className="text-slate-400 font-mono">0 KB Cloud Egress • 100% Offline</span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
