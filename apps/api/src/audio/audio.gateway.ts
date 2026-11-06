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

    if (payload.seq > 0 && payload.seq % 20 === 0 && !this.activePartials.has(payload.sessionId)) {
      const session = this.sessionService.getSession(payload.sessionId);
      if (session && session.chunks.length > 0) {
        this.activePartials.add(payload.sessionId);
        this.transcriptionService
          .transcribePartial(
            session.id,
            session.chunks,
            session.sampleRate,
            session.modelId,
          )
          .then((text) => {
            if (text) {
              client.emit('partial_transcript', {
                sessionId: session.id,
                text,
                isFinal: false,
              });
            }
          })
          .catch(() => {})
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
      this.activePartials.delete(payload.sessionId);
      this.sessionService.stopSession(payload.sessionId);
    }
  }

  @SubscribeMessage('session_cancel')
  handleSessionCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SessionActionPayload,
  ): void {
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
