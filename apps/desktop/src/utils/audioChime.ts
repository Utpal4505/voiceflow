/**
 * Synthesizes a crisp, elegant dual-tone wake earcon chime using the Web Audio API.
 * Requires 0 external audio files and incurs 0 network or disk latency.
 */
class ChimePlayer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a pleasant modern wake sound (two rising harmonics: 659Hz [E5] -> 880Hz [A5])
   */
  public playWakeChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, now);
      masterGain.connect(ctx.destination);

      // Note 1: E5 (659.25 Hz) - 80ms duration
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc1.connect(gain1);
      gain1.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.08);

      // Note 2: A5 (880.00 Hz) - 130ms duration
      const note2Start = now + 0.075;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, note2Start);

      gain2.gain.setValueAtTime(0.001, note2Start);
      gain2.gain.exponentialRampToValueAtTime(0.45, note2Start + 0.018);
      gain2.gain.exponentialRampToValueAtTime(0.001, note2Start + 0.14);

      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc2.start(note2Start);
      osc2.stop(note2Start + 0.14);
    } catch (e) {
      console.warn("[AudioChime] Failed to play wake chime:", e);
    }
  }
}

export const audioChime = new ChimePlayer();
