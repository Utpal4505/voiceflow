import { PerformanceMetrics } from '@voiceflow/contracts';

export interface TranscriptionResult {
  text: string;
  durationMs: number;
  language?: string;
  metrics?: PerformanceMetrics;
}

export interface ITranscriptionAdapter {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  transcribe(
    audioPcm: Buffer,
    sampleRate: number,
    modelId: string,
    signal?: AbortSignal,
  ): Promise<TranscriptionResult>;
}
