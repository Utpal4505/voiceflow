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

  constructor(private readonly sessionService: SessionService) {}

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
  handleAudioChunk(
    @MessageBody() payload: AudioChunkPayload,
  ): void {
    const buf = Buffer.isBuffer(payload.buffer)
      ? payload.buffer
      : Buffer.from(payload.buffer);

    this.sessionService.addChunk(payload.sessionId, buf, payload.seq);
  }

  @SubscribeMessage('session_stop')
  handleSessionStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): void {
    const session = this.sessionService.stopSession(payload.sessionId);
    if (session) {
      client.emit('session_stopped', {
        sessionId: session.id,
        totalBytes: session.totalBytes,
        chunksCount: session.chunks.length,
      });
    }
  }

  @SubscribeMessage('session_cancel')
  handleSessionCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): void {
    this.sessionService.cancelSession(payload.sessionId);
    client.emit('session_cancelled', { sessionId: payload.sessionId });
  }
}
