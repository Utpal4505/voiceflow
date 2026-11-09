interface Props {
  volume?: number;
  isRecording?: boolean;
  barCount?: number;
  accent?: "coral";
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
          ? Math.max(20, Math.min(100, Math.round(volume * weight * 130)))
          : 20;

        const activeGradient = "bg-gradient-to-t from-[#FF5722] via-[#FF6347] to-[#FFA07A] shadow-[0_0_6px_rgba(255,87,34,0.6)]";

        return (
          <div
            key={i}
            className={`w-[2.5px] rounded-full transition-all duration-75 ease-out ${
              isRecording ? activeGradient : "bg-white/20"
            }`}
            style={{
              height: `${dynamicHeight}%`,
              opacity: isRecording
                ? Math.max(0.5, Math.min(1, volume * 1.8 + 0.5))
                : 0.25,
            }}
          />
        );
      })}
    </div>
  );
}
