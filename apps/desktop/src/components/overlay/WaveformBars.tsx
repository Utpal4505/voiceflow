interface Props {
  volume?: number;
  isRecording?: boolean;
}

const BAR_WEIGHTS = [0.4, 0.7, 0.9, 1.2, 1.0, 1.4, 1.1, 0.8, 0.5];

export default function WaveformBars({ volume = 0, isRecording = false }: Props) {
  return (
    <div className="flex h-6 items-center gap-1">
      {BAR_WEIGHTS.map((weight, i) => {
        const dynamicHeight = isRecording
          ? Math.max(15, Math.min(100, Math.round(volume * weight * 100)))
          : 15;

        return (
          <div
            key={i}
            className="w-1 rounded-full bg-indigo-500 transition-all duration-75 ease-out"
            style={{
              height: `${dynamicHeight}%`,
              opacity: isRecording ? Math.max(0.4, volume * 1.5) : 0.3,
            }}
          />
        );
      })}
    </div>
  );
}
