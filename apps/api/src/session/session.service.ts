import { Injectable, Logger } from '@nestjs/common';

export interface RecordingSession {
  id: string;
  startTime: number;
  modelId: string;
  sampleRate: number;
  chunks: Buffer[];
  totalBytes: number;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessions = new Map<string, RecordingSession>();

  startSession(id: string, modelId = 'base.en', sampleRate = 16000): RecordingSession {
    const session: RecordingSession = {
      id,
      startTime: Date.now(),
      modelId,
      sampleRate,
      chunks: [],
      totalBytes: 0,
    };

    this.sessions.set(id, session);
    this.logger.log(`Session started: ${id} (sampleRate: ${sampleRate}Hz, model: ${modelId})`);
    return session;
  }

  addChunk(id: string, chunk: Buffer, seq: number): void {
    const session = this.sessions.get(id);
    if (!session) {
      return;
    }

    session.chunks.push(chunk);
    session.totalBytes += chunk.byteLength;

    if (seq % 10 === 0) {
      this.logger.debug(`Session ${id}: received chunk #${seq} (total buffer: ${session.totalBytes} bytes)`);
    }
  }

  stopSession(id: string): RecordingSession | null {
    const session = this.sessions.get(id);
    if (!session) {
      return null;
    }

    this.logger.log(`Session stopped: ${id} (chunks: ${session.chunks.length}, total bytes: ${session.totalBytes})`);
    this.sessions.delete(id);
    return session;
  }

  cancelSession(id: string): void {
    if (this.sessions.has(id)) {
      this.logger.log(`Session cancelled: ${id}`);
      this.sessions.delete(id);
    }
  }

  getSession(id: string): RecordingSession | undefined {
    return this.sessions.get(id);
  }
}
