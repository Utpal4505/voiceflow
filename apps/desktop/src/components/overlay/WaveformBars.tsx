const BARS = [3, 5, 8, 6, 9, 7, 4, 6, 8, 5, 3];

export default function WaveformBars() {
  return (
    <div className="flex h-6 items-center gap-0.5">
      {BARS.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-indigo-500 opacity-80"
          style={{
            height: `${h * 10}%`,
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}
