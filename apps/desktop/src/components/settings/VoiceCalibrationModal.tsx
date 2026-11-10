import { useState, useEffect } from "react";
import { X, Mic, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { audioChime } from "../../utils/audioChime";
import { WakeWordPhrase } from "../../stores/settingsStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phrase: WakeWordPhrase;
  onCalibrationSuccess: () => void;
}

export default function VoiceCalibrationModal({
  isOpen,
  onClose,
  phrase,
  onCalibrationSuccess,
}: Props) {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1, 2, 3
  const [status, setStatus] = useState<"ready" | "listening" | "captured" | "error" | "complete">("ready");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const targetPhrase = phrase === "hey_flow" ? "hey_flow" : "hey_voiceflow";
  const displayPhrase = targetPhrase === "hey_flow" ? "Hey Flow" : "Hey VoiceFlow";

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setStatus("ready");
      setErrorMessage("");
      invoke("cancel_wake_word_calibration").catch(() => {});
      return;
    }

    // Start fresh calibration session on open
    invoke("start_wake_word_calibration", { phrase: targetPhrase }).catch((err) => {
      console.warn("[Calibration] start error:", err);
    });
  }, [isOpen, targetPhrase]);

  if (!isOpen) return null;

  const handleRecordStep = async () => {
    if (status === "listening") return;
    setStatus("listening");
    setErrorMessage("");

    try {
      console.log(`[Calibration] Recording step #${currentStep}...`);
      const result = await invoke<{ step: number; isComplete: boolean; phrase: string }>(
        "record_wake_word_calibration_step",
        {
          phrase: targetPhrase,
          stepIndex: currentStep,
        }
      );

      console.log("[Calibration] Step result:", result);
      audioChime.playWakeChime();

      if (result.isComplete) {
        setStatus("complete");
        onCalibrationSuccess();
      } else {
        setStatus("captured");
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setStatus("ready");
        }, 1200);
      }
    } catch (err) {
      console.warn("[Calibration] Step error:", err);
      setStatus("error");
      setErrorMessage(typeof err === "string" ? err : "No speech detected. Please speak clearly.");
    }
  };

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
          {status !== "complete" ? (
            <>
              {/* Step Counter Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((stepNum) => {
                  const isDone = currentStep > stepNum || (currentStep === stepNum && status === "captured");
                  const isCurrent = currentStep === stepNum && status !== "captured";
                  return (
                    <div
                      key={stepNum}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isDone
                          ? "w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                          : isCurrent
                          ? "w-8 bg-[#FF5722] shadow-[0_0_10px_rgba(255,87,34,0.5)]"
                          : "w-3 bg-white/[0.12]"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Centerpiece Status Visual */}
              <div className="relative flex items-center justify-center my-1">
                {status === "listening" && (
                  <div className="absolute h-24 w-24 rounded-full bg-[#FF5722]/15 animate-ping" />
                )}
                <div
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full border transition-all duration-300 ${
                    status === "listening"
                      ? "border-[#FF5722] bg-[#FF5722]/20 text-[#FF5722] shadow-[0_0_25px_rgba(255,87,34,0.45)] scale-105"
                      : status === "captured"
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                      : status === "error"
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-white/[0.1] bg-white/[0.04] text-slate-300"
                  }`}
                >
                  {status === "captured" ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-in zoom-in-50" />
                  ) : status === "error" ? (
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  ) : (
                    <Mic className={`h-8 w-8 ${status === "listening" ? "animate-pulse" : ""}`} />
                  )}
                </div>
              </div>

              {/* Current Prompt */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF5722]">
                  Exercise {currentStep} of 3
                </span>
                <h4 className="text-sm font-semibold text-white px-2">
                  {status === "captured"
                    ? "Sample Captured! Excellent."
                    : stepPrompts[currentStep - 1]}
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  {status === "listening"
                    ? "Listening for your voice... speak now!"
                    : status === "error"
                    ? errorMessage
                    : "Tap the button below and speak at your natural volume."}
                </p>
              </div>

              {/* Action Button */}
              {status !== "captured" && (
                <button
                  onClick={handleRecordStep}
                  disabled={status === "listening"}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-md ${
                    status === "listening"
                      ? "bg-white/[0.08] text-slate-400 border border-white/[0.08] cursor-not-allowed"
                      : status === "error"
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40"
                      : "bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-[#FF5722]/30"
                  }`}
                >
                  {status === "listening" ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-[#FF5722] animate-ping" />
                      <span>Listening... Speak Now</span>
                    </>
                  ) : status === "error" ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Try Step {currentStep} Again</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" />
                      <span>Tap to Speak Step {currentStep}</span>
                    </>
                  )}
                </button>
              )}
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
