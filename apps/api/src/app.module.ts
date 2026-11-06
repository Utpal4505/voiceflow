import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AudioGateway } from './audio/audio.gateway.js';
import { SessionService } from './session/session.service.js';
import { TranscriptionService } from './transcription/transcription.service.js';
import { ModelsService } from './models/models.service.js';
import { HardwareService } from './transcription/hardware.service.js';

@Module({
  controllers: [AppController],
  providers: [AudioGateway, SessionService, TranscriptionService, ModelsService, HardwareService],
})
export class AppModule {}
