import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AudioGateway } from './audio/audio.gateway.js';
import { SessionService } from './session/session.service.js';

@Module({
  controllers: [AppController],
  providers: [AudioGateway, SessionService],
})
export class AppModule {}
