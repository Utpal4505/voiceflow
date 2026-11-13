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
import { ModelsService } from '../models/models.service.js';
import { HardwareService } from '../transcription/hardware.service.js';
import { WhisperModelId } from '@voiceflow/contracts';

interface SessionStartPayload {
  sessionId: string;
  modelId?: WhisperModelId;
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

interface ModelActionPayload {
  modelId: WhisperModelId;
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
  private readonly activePartials = new Set<string>();
  private readonly clientSessionMap = new Map<string, string>();
  private readonly lastPartialTimeMap = new Map<string, number>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly transcriptionService: TranscriptionService,
    private readonly modelsService: ModelsService,
    private readonly hardwareService: HardwareService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Desktop client connected: ${client.id}`);
    client.emit('models_updated', this.modelsService.getModels());
    client.emit('hardware_profile', this.hardwareService.getHardwareProfile());
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Desktop client disconnected: ${client.id}`);
    const activeSessionId = this.clientSessionMap.get(client.id);
    if (activeSessionId) {
      this.activePartials.delete(activeSessionId);
      this.transcriptionService.cancel(activeSessionId);
      this.sessionService.cancelSession(activeSessionId);
      this.clientSessionMap.delete(client.id);
    }
  }

  @SubscribeMessage('get_hardware_profile')
  handleGetHardwareProfile(@ConnectedSocket() client: Socket): void {
    client.emit('hardware_profile', this.hardwareService.getHardwareProfile());
  }

  @SubscribeMessage('session_start')
  handleSessionStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionStartPayload,
  ): void {
    // Purge any lingering state from earlier sessions for this client
    const previousSessionId = this.clientSessionMap.get(client.id);
    if (previousSessionId && previousSessionId !== payload.sessionId) {
      this.activePartials.delete(previousSessionId);
      this.transcriptionService.cancel(previousSessionId);
      this.sessionService.cancelSession(previousSessionId);
    }
    this.clientSessionMap.set(client.id, payload.sessionId);

    this.activePartials.delete(payload.sessionId);
    this.transcriptionService.cancel(payload.sessionId);

    const activeModel = payload.modelId || this.modelsService.getActiveModelId();

    const session = this.sessionService.startSession(
      payload.sessionId,
      activeModel,
      payload.sampleRate,
    );

    client.emit('session_started', {
      sessionId: session.id,
      timestamp: session.startTime,
      modelId: activeModel,
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

    const lastPartialTime = this.lastPartialTimeMap.get(payload.sessionId) || 0;
    const now = Date.now();

    // Partial streaming: start after at least 8 chunks (~800ms) and throttle to 1200ms intervals
    if (
      payload.seq >= 8 &&
      now - lastPartialTime >= 1200 &&
      !this.activePartials.has(payload.sessionId)
    ) {
      const session = this.sessionService.getSession(payload.sessionId);
      if (session && session.chunks.length > 0) {
        this.activePartials.add(payload.sessionId);
        this.lastPartialTimeMap.set(payload.sessionId, now);

        this.transcriptionService
          .transcribePartial(
            session.id,
            session.chunks,
            session.sampleRate,
            session.modelId,
          )
          .then((text) => {
            if (text && text.trim().length > 0) {
              this.logger.log(`[Partial] Session ${session.id}: "${text.trim()}"`);
              client.emit('partial_transcript', {
                sessionId: session.id,
                text: text.trim(),
                isFinal: false,
              });
            }
          })
          .catch((err) => {
            this.logger.warn(`[Partial] Error for ${session.id}: ${err}`);
          })
          .finally(() => {
            this.activePartials.delete(payload.sessionId);
          });
      }
    }
  }

  @SubscribeMessage('session_stop')
  async handleSessionStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): Promise<void> {
    this.logger.log(`[SessionStop] Requested for ${payload.sessionId}`);
    this.lastPartialTimeMap.delete(payload.sessionId);

    // Immediately stop and retrieve session to prevent concurrent duplicate finalizations
    const session = this.sessionService.stopSession(payload.sessionId);
    if (!session) {
      this.logger.warn(`[SessionStop] No session found for ${payload.sessionId}`);
      return;
    }

    this.activePartials.delete(payload.sessionId);
    this.transcriptionService.cancelActivePartials(payload.sessionId);

    // Guard against 0-chunk or micro-short audio payloads (e.g. mic permission denied, instant click)
    if (!session.chunks || session.chunks.length === 0 || session.totalBytes < 3200) {
      this.logger.log(
        `[Finalize] Session ${session.id} stopped with ${session.chunks?.length ?? 0} chunks (${session.totalBytes} bytes). Gracefully skipping Whisper inference.`,
      );
      client.emit('final_transcript', {
        sessionId: session.id,
        text: '',
        isFinal: true,
      });
      return;
    }

    try {
      this.logger.log(`[Finalize] Processing final audio (${session.chunks.length} chunks)...`);
      const result = await this.transcriptionService.transcribeFinal(
        session.id,
        session.chunks,
        session.sampleRate,
        session.modelId,
      );

      this.logger.log(`[Finalize] Done for ${session.id}: "${result.text}" (RTF: ${result.metrics?.rtf ?? 'N/A'})`);
      client.emit('final_transcript', {
        sessionId: session.id,
        text: result.text,
        isFinal: true,
        metrics: result.metrics,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('abort')) {
        this.logger.error(`Session finalization failed: ${msg}`);
        client.emit('session_error', {
          sessionId: session.id,
          error: msg,
        });
      }
    } finally {
      this.activePartials.delete(payload.sessionId);
      this.lastPartialTimeMap.delete(payload.sessionId);
    }
  }

  @SubscribeMessage('session_reset')
  handleSessionReset(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): void {
    this.clientSessionMap.delete(client.id);
    this.activePartials.delete(payload.sessionId);
    this.transcriptionService.cancel(payload.sessionId);
    this.sessionService.cancelSession(payload.sessionId);
    this.logger.log(`Session reset: ${payload.sessionId}`);
    client.emit('session_reset_complete', { sessionId: payload.sessionId });
  }

  @SubscribeMessage('session_cancel')
  handleSessionCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): void {
    this.clientSessionMap.delete(client.id);
    this.activePartials.delete(payload.sessionId);
    this.transcriptionService.cancel(payload.sessionId);
    this.sessionService.cancelSession(payload.sessionId);
    client.emit('session_cancelled', { sessionId: payload.sessionId });
  }

  // Model Management Endpoints
  @SubscribeMessage('get_models')
  handleGetModels(@ConnectedSocket() client: Socket): void {
    client.emit('models_updated', this.modelsService.getModels());
  }

  @SubscribeMessage('set_active_model')
  handleSetActiveModel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ModelActionPayload,
  ): void {
    this.modelsService.setActiveModel(payload.modelId);
    this.server.emit('models_updated', this.modelsService.getModels());
  }

  @SubscribeMessage('delete_model')
  async handleDeleteModel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ModelActionPayload,
  ): Promise<void> {
    await this.modelsService.deleteModel(payload.modelId);
    this.server.emit('models_updated', this.modelsService.getModels());
  }

  @SubscribeMessage('download_model')
  async handleDownloadModel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ModelActionPayload,
  ): Promise<void> {
    try {
      await this.modelsService.downloadModel(payload.modelId, (progress, downloaded, total) => {
        client.emit('model_download_progress', {
          modelId: payload.modelId,
          progress,
          downloaded,
          total,
        });
      });

      this.server.emit('model_download_complete', { modelId: payload.modelId });
      this.server.emit('models_updated', this.modelsService.getModels());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      client.emit('model_download_error', {
        modelId: payload.modelId,
        error: msg,
      });
    }
  }
}
