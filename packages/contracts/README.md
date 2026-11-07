# @voiceflow/contracts

Shared TypeScript interfaces, Zod runtime schemas, and WebSocket data transfer contracts across the **VoiceFlow** monorepo.

## Modules

- **`models.ts`**: Whisper model definitions (`tiny`, `base`, `small`, `medium`, `large-v3`, quantized variants), catalog metadata, and hardware capability profiles.
- **`audio.ts`**: PCM chunk streaming interfaces, sequence contracts, and sample rate validations.
- **`transcription.ts`**: Performance metrics (`rtf`, latency) and transcript event schemas.
- **`session.ts`**: Active session states (`idle`, `recording`, `transcribing`, `done`, `error`).
- **`settings.ts`**: Application configuration schemas (hotkeys, active model, audio device, telemetry toggle).

## Usage

```typescript
import { WhisperModelId, HardwareProfile, TranscriptEvent } from '@voiceflow/contracts';
```
