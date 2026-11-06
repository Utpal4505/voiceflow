import { describe, it, expect, beforeEach } from 'vitest';
import { HardwareService } from './hardware.service.js';

describe('HardwareService', () => {
  let hardwareService: HardwareService;

  beforeEach(() => {
    hardwareService = new HardwareService();
  });

  it('should detect a valid hardware profile', () => {
    const profile = hardwareService.getHardwareProfile();

    expect(profile).toBeDefined();
    expect(typeof profile.hasGpu).toBe('boolean');
    expect(typeof profile.cpuModel).toBe('string');
    expect(profile.logicalCores).toBeGreaterThanOrEqual(1);
    expect(profile.physicalCores).toBeGreaterThanOrEqual(1);
    expect(profile.optimalThreads).toBeGreaterThanOrEqual(2);
    expect(['gpu-cuda', 'cpu-avx2', 'cpu-basic']).toContain(profile.engineTier);
    expect(typeof profile.statusLabel).toBe('string');
    expect(profile.statusLabel.length).toBeGreaterThan(0);
  });

  it('should cache hardware profile on subsequent calls', () => {
    const p1 = hardwareService.getHardwareProfile();
    const p2 = hardwareService.getHardwareProfile();

    expect(p1).toBe(p2);
  });
});
