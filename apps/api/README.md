# @voiceflow/api

High-performance local background daemon for **VoiceFlow**, built on **NestJS**, **WebSockets (Socket.IO)**, and native **whisper.cpp**.

## Overview

The API package runs as a silent local background service on `http://localhost:3001` (or embedded directly by the desktop app via `node.exe`). It is responsible for:
- **Audio Ingestion Gateway (`audio.gateway.ts`)**: Accepts chunked raw 16kHz PCM audio streams from the desktop app via WebSockets with sequencing and watchdog timeouts.
- **Real-Time Streaming Transcription**: Provides throttled partial transcripts (~1200ms debounce) for live visual feedback during dictation.
- **Native Whisper.cpp Execution (`whisper.adapter.ts`)**: Spawns `whisper-cli.exe` with AVX2 vector math, thread auto-tuning, and CUDA hardware acceleration.
- **Hardware Profiling (`hardware.service.ts`)**: Dynamically inspects CPU cores, instruction sets, and NVIDIA CUDA DLL availability without waking sleeping discrete laptop GPUs.
- **Model Downloader (`models.service.ts`)**: Manages downloading, activation, and removal of Hugging Face GGML Whisper models with byte-level progress reporting.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com) with `@nestjs/websockets` (Socket.IO)
- **Engine**: [whisper.cpp](https://github.com/ggerganov/whisper.cpp) C++ inference engine
- **Contracts**: Shared TypeScript definitions and Zod schemas via `@voiceflow/contracts`

## Development

```bash
# Start API in watch mode
pnpm dev

# Build production bundle to dist/
pnpm build

# Run unit tests
pnpm test
```

## WebSocket Protocol

### Client to Server Messages
- `session_start`: Initializes a new dictation session with specified sample rate and model ID.
- `audio_chunk`: Streams binary audio chunk with sequence number and buffer.
- `session_stop`: Concludes dictation and requests final high-accuracy transcription.
- `session_cancel`: Aborts transcription and frees active session memory.
- `get_hardware_profile`: Requests CPU/GPU hardware profile.
- `get_models`: Lists installed and available models in catalog.
- `download_model`: Requests downloading a model from the official Hugging Face repository.
- `set_active_model`: Sets the default Whisper model for upcoming sessions.
- `delete_model`: Removes a downloaded model from local storage.

### Server to Client Events
- `session_started`: Confirms session creation.
- `partial_transcript`: Emits intermediate transcription text (`isFinal: false`).
- `final_transcript`: Emits final transcription result with RTF and latency metrics (`isFinal: true`).
- `model_download_progress`: Reports download percentage, bytes downloaded, and total bytes.
- `models_updated`: Broadcasts latest model states.
- `hardware_profile`: Broadcasts hardware capability profile.
