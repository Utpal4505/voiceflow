interface Props {
  volume?: number;
  isRecording?: boolean;
  barCount?: number;
}

// Organic acoustic wave distribution
const WEIGHTS = [
  0.4, 0.65, 0.9, 1.15, 1.4, 1.55, 1.35, 1.1, 0.85, 1.25, 1.0, 0.55
];

export default function WaveformBars({
  volume = 0,
  isRecording = false,
  barCount = 12,
}: Props) {
  const weights = WEIGHTS.slice(0, barCount);

  return (
    <div className="flex h-5 items-center gap-[3px]">
      {weights.map((weight, i) => {
        // Compute dynamic height percentage
        const dynamicHeight = isRecording
          ? Math.max(18, Math.min(100, Math.round(volume * weight * 130)))
          : 18;

        return (
          <div
            key={i}
            className={`w-[2.5px] rounded-full transition-all duration-75 ease-out ${
              isRecording
                ? "bg-gradient-to-t from-[#514BFA] via-[#7772FF] to-[#A5A0FF] shadow-[0_0_6px_rgba(119,114,255,0.7)]"
                : "bg-slate-700/50"
            }`}
            style={{
              height: `${dynamicHeight}%`,
              opacity: isRecording
                ? Math.max(0.45, Math.min(1, volume * 1.8 + 0.4))
                : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
