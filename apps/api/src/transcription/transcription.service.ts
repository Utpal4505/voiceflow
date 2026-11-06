import { Injectable, Logger } from '@nestjs/common';
import { ITranscriptionAdapter } from './adapters/transcription.adapter.js';
import { WhisperCliAdapter } from './adapters/whisper.adapter.js';
import { MockTranscriptionAdapter } from './adapters/mock.adapter.js';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly whisperAdapter = new WhisperCliAdapter();
  private readonly mockAdapter = new MockTranscriptionAdapter();

  private readonly processingLocks = new Set<string>();

  private async selectAdapter(): Promise<ITranscriptionAdapter> {
    if (await this.whisperAdapter.isAvailable()) {
      return this.whisperAdapter;
    }
    return this.mockAdapter;
  }

  async transcribePartial(
    sessionId: string,
    chunks: Buffer[],
    sampleRate = 16000,
    modelId = 'base.en',
  ): Promise<string | null> {
    if (this.processingLocks.has(sessionId) || chunks.length === 0) {
      return null;
    }

    this.processingLocks.add(sessionId);

    try {
      const adapter = await this.selectAdapter();
      const combined = Buffer.concat(chunks);
      const result = await adapter.transcribe(combined, sampleRate, modelId);
      return result.text;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Partial transcription failed: ${msg}`);
      return null;
    } finally {
      this.processingLocks.delete(sessionId);
    }
  }

  async transcribeFinal(
    sessionId: string,
    chunks: Buffer[],
    sampleRate = 16000,
    modelId = 'base.en',
  ): Promise<string> {
    this.processingLocks.add(sessionId);

    try {
      const adapter = await this.selectAdapter();
      const combined = Buffer.concat(chunks);
      const result = await adapter.transcribe(combined, sampleRate, modelId);
      this.logger.log(`Final transcript for ${sessionId} (${result.durationMs}ms): "${result.text}"`);
      return result.text;
    } finally {
      this.processingLocks.delete(sessionId);
    }
  }

  cancel(sessionId: string): void {
    this.processingLocks.delete(sessionId);
  }
}
