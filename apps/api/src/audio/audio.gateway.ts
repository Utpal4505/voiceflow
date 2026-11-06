import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SessionService } from '../session/session.service.js';
import { TranscriptionService } from '../transcription/transcription.service.js';

interface SessionStartPayload {
  sessionId: string;
  modelId?: string;
  sampleRate?: number;
}

interface AudioChunkPayload {
  sessionId: string;
  seq: number;
  buffer: Buffer | ArrayBuffer;
}

interface SessionActionPayload {
  sessionId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e7,
})
export class AudioGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AudioGateway.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Desktop client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Desktop client disconnected: ${client.id}`);
  }

  @SubscribeMessage('session_start')
  handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionStartPayload,
  ): void {
    const session = this.sessionService.startSession(
      payload.sessionId,
      payload.modelId,
      payload.sampleRate,
    );

    client.emit('session_started', {
      sessionId: session.id,
      timestamp: session.startTime,
    });
  }

  @SubscribeMessage('audio_chunk')
  async handleAudioChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AudioChunkPayload,
  ): Promise<void> {
    const buf = Buffer.isBuffer(payload.buffer)
      ? payload.buffer
      : Buffer.from(payload.buffer);

    this.sessionService.addChunk(payload.sessionId, buf, payload.seq);

    // Run partial recognition every 4 chunks (~2s)
    if (payload.seq > 0 && payload.seq % 4 === 0) {
      const session = this.sessionService.getSession(payload.sessionId);
      if (session && session.chunks.length > 0) {
        const text = await this.transcriptionService.transcribePartial(
          session.id,
          session.chunks,
          session.sampleRate,
          session.modelId,
        );

        if (text) {
          client.emit('partial_transcript', {
            sessionId: session.id,
            text,
            isFinal: false,
          });
        }
      }
    }
  }

  @SubscribeMessage('session_stop')
  async handleSessionStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): Promise<void> {
    const session = this.sessionService.getSession(payload.sessionId);
    if (!session) return;

    try {
      const text = await this.transcriptionService.transcribeFinal(
        session.id,
        session.chunks,
        session.sampleRate,
        session.modelId,
      );

      client.emit('final_transcript', {
        sessionId: session.id,
        text,
        isFinal: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Session finalization failed: ${msg}`);
      client.emit('session_error', {
        sessionId: session.id,
        error: msg,
      });
    } finally {
      this.sessionService.stopSession(payload.sessionId);
    }
  }

  @SubscribeMessage('session_cancel')
  handleSessionCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): void {
    this.transcriptionService.cancel(payload.sessionId);
    this.sessionService.cancelSession(payload.sessionId);
    client.emit('session_cancelled', { sessionId: payload.sessionId });
  }
}
