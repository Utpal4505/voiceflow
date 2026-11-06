class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 8000;
    this.buffer = new Float32Array(this.bufferSize);
    this.bytesWritten = 0;
    this.sumSquares = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];

    for (let i = 0; i < channelData.length; i++) {
      const sample = channelData[i];
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
            type: "chunk",
            buffer: int16.buffer,
            volume,
          },
          [int16.buffer]
        );

        this.bytesWritten = 0;
        this.sumSquares = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
