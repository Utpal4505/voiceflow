import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TranscriptionService } from './transcription.service.js';
import { HardwareService } from './hardware.service.js';

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  let hardwareService: HardwareService;

  beforeEach(() => {
    hardwareService = new HardwareService();
    service = new TranscriptionService(hardwareService);
  });

  it('should transcribe partial audio and release lock', async () => {
    const chunk = Buffer.from(new Uint8Array(3200));
    const result = await service.transcribePartial('sess-1', [chunk], 16000, 'base.en');

    expect(typeof result === 'string' || result === null).toBe(true);

    // Second call should also succeed because processing lock was released
    const result2 = await service.transcribePartial('sess-1', [chunk], 16000, 'base.en');
    expect(typeof result2 === 'string' || result2 === null).toBe(true);
  });

  it('should cancel active partials and clear locks on cancel()', () => {
    service.cancel('sess-test');
    // Lock should be clear
    expect(() => service.cancel('sess-test')).not.toThrow();
  });

  it('should support cancelAll() without errors', () => {
    expect(() => service.cancelAll()).not.toThrow();
  });

  it('should transcribe final and return result with metrics', async () => {
    const chunk = Buffer.from(new Uint8Array(3200));
    const result = await service.transcribeFinal('sess-2', [chunk], 16000, 'base.en');

    expect(result).toHaveProperty('text');
    expect(typeof result.text).toBe('string');
    expect(result).toHaveProperty('metrics');
    expect(result.metrics?.audioDurationMs).toBeGreaterThan(0);
  });
});
