export interface TranscriptionResult {
  text: string;
  durationMs: number;
  language?: string;
}

export interface ITranscriptionAdapter {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  transcribe(
    audioPcm: Buffer,
    sampleRate: number,
    modelId: string,
  ): Promise<TranscriptionResult>;
}
