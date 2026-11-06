import { ITranscriptionAdapter, TranscriptionResult } from './transcription.adapter.js';

export class MockTranscriptionAdapter implements ITranscriptionAdapter {
  readonly name = 'mock-adapter';

  private readonly samplePhrases = [
    'Create a function in TypeScript',
    'Create a function in TypeScript that checks if user exists',
    'Create a function in TypeScript that checks if user exists and returns the profile',
    'Create a function in TypeScript that checks if user exists and returns the profile or throws an error',
  ];

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async transcribe(
    audioPcm: Buffer,
    sampleRate: number,
    _modelId?: string,
    _signal?: AbortSignal,
  ): Promise<TranscriptionResult> {
    const start = Date.now();
    const durationSeconds = audioPcm.byteLength / (sampleRate * 2);

    const index = Math.min(
      this.samplePhrases.length - 1,
      Math.floor(durationSeconds / 1.5),
    );

    await new Promise((r) => setTimeout(r, 120));

    return {
      text: this.samplePhrases[index],
      durationMs: Date.now() - start,
    };
  }
}
