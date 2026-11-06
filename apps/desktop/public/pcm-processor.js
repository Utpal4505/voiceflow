class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 1600 samples = 100ms at 16kHz for responsive streaming
    this.bufferSize = 1600;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
    this.sumSquares = 0;

    // 300ms rolling circular buffer (4800 samples @ 16kHz)
    // Guarantees zero missed syllables when human starts speaking as shortcut is pressed
    this.preRollSize = 4800;
    this.preRoll = new Float32Array(this.preRollSize);
    this.preRollIndex = 0;
    this.isPreRollFull = false;

    this.isRecording = false;

    this.port.onmessage = (e) => {
      if (e.data && e.data.type === 'START') {
        this.isRecording = true;
        this.bytesWritten = 0;
        this.sumSquares = 0;

        // Immediately flush pre-roll buffer as initial chunk
        if (this.isPreRollFull || this.preRollIndex > 0) {
          const count = this.isPreRollFull ? this.preRollSize : this.preRollIndex;
          const int16 = new Int16Array(count);
          for (let i = 0; i < count; i++) {
            const idx = this.isPreRollFull
              ? (this.preRollIndex + i) % this.preRollSize
              : i;
            const s = Math.max(-1, Math.min(1, this.preRoll[idx]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          this.port.postMessage(
            {
              type: 'chunk',
              buffer: int16.buffer,
              volume: 0.05,
              isPreRoll: true,
            },
            [int16.buffer]
          );
        }
      } else if (e.data && e.data.type === 'STOP') {
        this.isRecording = false;
        this.bytesWritten = 0;
        this.sumSquares = 0;
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];

    for (let i = 0; i < channelData.length; i++) {
      const sample = channelData[i];

      // Always maintain rolling 300ms pre-roll window
      this.preRoll[this.preRollIndex] = sample;
      this.preRollIndex = (this.preRollIndex + 1) % this.preRollSize;
      if (this.preRollIndex === 0) {
        this.isPreRollFull = true;
      }

      if (this.isRecording) {
        this.sumSquares += sample * sample;
        this.buffer[this.bytesWritten] = sample;
        this.bytesWritten++;

        if (this.bytesWritten >= this.bufferSize) {
          const int16 = new Int16Array(this.bufferSize);
          for (let j = 0; j < this.bufferSize; j++) {
            const s = Math.max(-1, Math.min(1, this.buffer[j]));
            int16[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          const rms = Math.sqrt(this.sumSquares / this.bufferSize);
          const volume = Math.min(1, rms * 4);

          this.port.postMessage(
            {
              type: 'chunk',
              buffer: int16.buffer,
              volume,
            },
            [int16.buffer]
          );

          this.bytesWritten = 0;
          this.sumSquares = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
