import { useState, useEffect } from "react";
import { X, Mic, CheckCircle2, Sparkles } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { audioChime } from "../../utils/audioChime";
import { WakeWordPhrase } from "../../stores/settingsStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phrase: WakeWordPhrase;
  onCalibrationSuccess: () => void;
}

interface StepPayload {
  step: number;
  maxSteps: number;
  phrase: string;
}

export default function VoiceCalibrationModal({
  isOpen,
  onClose,
  phrase,
  onCalibrationSuccess,
}: Props) {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = ready to speak, 1 = captured 1, 2 = captured 2, 3 = complete
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const displayPhrase =
    phrase === "hey_flow"
      ? "Hey Flow"
      : "Hey VoiceFlow";

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
      return;
    }

    let unlistenStep: (() => void) | undefined;
    let unlistenDone: (() => void) | undefined;

    async function initCalibration() {
      try {
        console.log("[Calibration] Initializing voice training for:", phrase);
        setCurrentStep(0);
        setIsCompleted(false);

        unlistenStep = await listen<StepPayload>("wake-word:calibration-step", (event) => {
          console.log("[Calibration] Step captured:", event.payload);
          audioChime.playWakeChime();
          setCurrentStep(event.payload.step);
        });

        unlistenDone = await listen<{ phrase: string; success: boolean }>(
          "wake-word:calibration-complete",
          (event) => {
            console.log("[Calibration] Calibration fully completed:", event.payload);
            audioChime.playWakeChime();
            setIsCompleted(true);
            onCalibrationSuccess();
          }
        );

        await invoke("start_wake_word_calibration", {
          phrase: phrase === "both" ? "hey_voiceflow" : phrase,
        });
      } catch (err) {
        console.error("[Calibration] Failed to start voice calibration:", err);
      }
    }

    initCalibration();

    return () => {
      unlistenStep?.();
      unlistenDone?.();
      invoke("cancel_wake_word_calibration").catch(() => {});
    };
  }, [isOpen, phrase, onCalibrationSuccess]);

  if (!isOpen) return null;

  const stepPrompts = [
    `Say "${displayPhrase}" clearly into your microphone`,
    `Great! Now say "${displayPhrase}" again`,
    `One last time: say "${displayPhrase}"`,
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#161616] shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden font-sans">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-36 w-64 rounded-full bg-[#FF5722]/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-[#121212] relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF5722]/15 text-[#FF5722] border border-[#FF5722]/25">
              <Mic className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-tight">Voice Enrollment</h3>
              <p className="text-[10px] text-slate-400">Personalized voice match training</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center gap-5 relative z-10">
          {!isCompleted ? (
            <>
              {/* Step Counter Indicator */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => {
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isDone
                          ? "w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                          : isCurrent
                          ? "w-8 bg-[#FF5722] animate-pulse shadow-[0_0_10px_rgba(255,87,34,0.5)]"
                          : "w-3 bg-white/[0.12]"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Pulsing Visual Wave Centerpiece */}
              <div className="relative flex items-center justify-center my-2">
                <div className="absolute h-24 w-24 rounded-full bg-[#FF5722]/10 animate-ping" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#FF5722]/40 bg-[#FF5722]/15 text-[#FF5722] shadow-[0_0_20px_rgba(255,87,34,0.35)]">
                  <Mic className="h-8 w-8 animate-pulse" />
                </div>
              </div>

              {/* Current Prompt */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF5722]">
                  Exercise {Math.min(currentStep + 1, 3)} of 3
                </span>
                <h4 className="text-sm font-semibold text-white px-2">
                  {stepPrompts[Math.min(currentStep, 2)]}
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Speak at your natural pace and normal distance from your microphone.
                </p>
              </div>

              {/* Live Listening Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Listening for speech...</span>
              </div>
            </>
          ) : (
            <>
              {/* Success Screen */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] my-2 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Profile Created!</span>
                </div>
                <h4 className="text-sm font-semibold text-white">Voice Model Enrolled</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  VoiceFlow has calibrated against your unique acoustic tract. Hands-free wake word recognition is now active.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-xl bg-[#FF5722] hover:bg-[#E64A19] py-2 text-xs font-semibold text-white shadow-md shadow-[#FF5722]/30 transition cursor-pointer active:scale-95 mt-2"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
