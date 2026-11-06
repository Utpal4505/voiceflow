import { Injectable, Logger } from '@nestjs/common';
import { ITranscriptionAdapter } from './adapters/transcription.adapter.js';
import { WhisperCliAdapter } from './adapters/whisper.adapter.js';
import { MockTranscriptionAdapter } from './adapters/mock.adapter.js';
import { HardwareService } from './hardware.service.js';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly whisperAdapter: WhisperCliAdapter;
  private readonly mockAdapter = new MockTranscriptionAdapter();

  private readonly processingLocks = new Set<string>();
  private readonly partialControllers = new Map<string, AbortController>();
  private readonly finalControllers = new Map<string, AbortController>();

  constructor(private readonly hardwareService: HardwareService) {
    this.whisperAdapter = new WhisperCliAdapter(this.hardwareService);
  }

  private async selectAdapter(): Promise<ITranscriptionAdapter> {
    if (await this.whisperAdapter.isAvailable()) {
      return this.whisperAdapter;
    }
    return this.mockAdapter;
  }

  cancelActivePartials(sessionId: string): void {
    const controller = this.partialControllers.get(sessionId);
    if (controller) {
      try {
        controller.abort();
      } catch {
        // ignore
      }
      this.partialControllers.delete(sessionId);
    }
  }

  cancelActiveFinal(sessionId: string): void {
    const controller = this.finalControllers.get(sessionId);
    if (controller) {
      try {
        controller.abort();
      } catch {
        // ignore
      }
      this.finalControllers.delete(sessionId);
    }
  }

  cancelAll(): void {
    for (const sessionId of Array.from(this.partialControllers.keys())) {
      this.cancelActivePartials(sessionId);
    }
    for (const sessionId of Array.from(this.finalControllers.keys())) {
      this.cancelActiveFinal(sessionId);
    }
    this.processingLocks.clear();
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

    // Cancel any previous in-flight partial for this session
    this.cancelActivePartials(sessionId);

    const controller = new AbortController();
    this.partialControllers.set(sessionId, controller);
    this.processingLocks.add(sessionId);

    try {
      const adapter = await this.selectAdapter();
      const combined = Buffer.concat(chunks);
      const result = await adapter.transcribe(combined, sampleRate, modelId, controller.signal);
      return result.text;
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return null;
      }
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Partial transcription failed: ${msg}`);
      return null;
    } finally {
      this.processingLocks.delete(sessionId);
      if (this.partialControllers.get(sessionId) === controller) {
        this.partialControllers.delete(sessionId);
      }
    }
  }

  async transcribeFinal(
    sessionId: string,
    chunks: Buffer[],
    sampleRate = 16000,
    modelId = 'base.en',
  ): Promise<string> {
    // Immediately cancel any in-flight partial or previous final process so whisper-cli is freed
    this.cancelActivePartials(sessionId);
    this.cancelActiveFinal(sessionId);

    const controller = new AbortController();
    this.finalControllers.set(sessionId, controller);
    this.processingLocks.add(sessionId);

    try {
      const adapter = await this.selectAdapter();
      const combined = Buffer.concat(chunks);
      const result = await adapter.transcribe(combined, sampleRate, modelId, controller.signal);
      this.logger.log(`Final transcript for ${sessionId} (${result.durationMs}ms): "${result.text}"`);
      return result.text;
    } finally {
      this.processingLocks.delete(sessionId);
      if (this.finalControllers.get(sessionId) === controller) {
        this.finalControllers.delete(sessionId);
      }
    }
  }

  cancel(sessionId: string): void {
    this.cancelActivePartials(sessionId);
    this.cancelActiveFinal(sessionId);
    this.processingLocks.delete(sessionId);
  }
}
