interface Props {
  volume?: number;
  isRecording?: boolean;
  barCount?: number;
}

const DEFAULT_WEIGHTS = [
  0.35, 0.55, 0.85, 1.1, 1.35, 1.5, 1.3, 1.05, 0.85, 1.2, 1.4, 0.95, 0.6, 0.4
];

export default function WaveformBars({
  volume = 0,
  isRecording = false,
  barCount = 12,
}: Props) {
  const weights = DEFAULT_WEIGHTS.slice(0, barCount);

  return (
    <div className="flex h-5 items-center gap-1">
      {weights.map((weight, i) => {
        const dynamicHeight = isRecording
          ? Math.max(16, Math.min(100, Math.round(volume * weight * 120)))
          : 15;

        return (
          <div
            key={i}
            className={`w-[2.5px] rounded-full transition-all duration-75 ease-out ${
              isRecording
                ? "bg-[#FF6338] shadow-[0_0_6px_rgba(255,99,56,0.5)]"
                : "bg-slate-700/60"
            }`}
            style={{
              height: `${dynamicHeight}%`,
              opacity: isRecording ? Math.max(0.4, Math.min(1, volume * 1.6 + 0.35)) : 0.25,
            }}
          />
        );
      })}
    </div>
  );
}
