import { Injectable, Logger } from '@nestjs/common';
import * as os from 'node:os';
import * as path from 'node:path';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { HardwareProfile, WhisperModelId } from '@voiceflow/contracts';

@Injectable()
export class HardwareService {
  private readonly logger = new Logger(HardwareService.name);
  private cachedProfile: HardwareProfile | null = null;

  getHardwareProfile(): HardwareProfile {
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model?.trim() || 'Generic Processor';
    const logicalCores = cpus.length || 4;
    // Estimate physical cores (Intel/AMD typical SMT factor of 2, minimum 2)
    const physicalCores = Math.max(2, Math.floor(logicalCores / 2));
    const optimalThreads = Math.max(2, Math.min(logicalCores, 8));

    const hasCudaBinary = [
      path.resolve(process.cwd(), 'bin', 'ggml-cuda.dll'),
      path.resolve(process.cwd(), '..', 'bin', 'ggml-cuda.dll'),
      path.resolve(process.cwd(), '..', '..', 'bin', 'ggml-cuda.dll'),
    ].some((p) => existsSync(p));

    let hasGpu = false;
    let gpuName: string | undefined;

    // Only query nvidia-smi if CUDA runtime DLLs actually exist.
    // This avoids waking up the dGPU from D3Cold sleep (which causes a 1-2s system hitch on hybrid laptops).
    if (hasCudaBinary) {
      try {
        const smiOutput = execSync('nvidia-smi --query-gpu=name --format=csv,noheader', {
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'],
          timeout: 2000,
        }).trim();

        if (smiOutput) {
          hasGpu = true;
          gpuName = smiOutput.split('\n')[0].trim();
        }
      } catch {
        hasGpu = false;
      }
    }

    let engineTier: 'gpu-cuda' | 'cpu-avx2' | 'cpu-basic';
    let recommendedModelId: WhisperModelId;
    let statusLabel: string;

    const shortCpu = cpuModel.replace(/\(R\)|\(TM\)/gi, '').replace(/\s+/g, ' ');

    if (hasGpu && gpuName && hasCudaBinary) {
      engineTier = 'gpu-cuda';
      recommendedModelId = 'base.en';
      statusLabel = `${gpuName} (CUDA Accelerated)`;
    } else if (logicalCores >= 6) {
      engineTier = 'cpu-avx2';
      recommendedModelId = 'base.en-q5_0';
      statusLabel = `${shortCpu} (AVX2 Engine · ${optimalThreads} Threads)`;
    } else {
      engineTier = 'cpu-basic';
      recommendedModelId = 'tiny.en';
      statusLabel = `CPU Engine (Power-Saving Mode)`;
    }

    this.cachedProfile = {
      hasGpu,
      gpuName,
      cpuModel,
      logicalCores,
      physicalCores,
      optimalThreads,
      engineTier,
      recommendedModelId,
      statusLabel,
    };

    this.logger.log(`Hardware Profile Detected: ${statusLabel}`);
    return this.cachedProfile;
  }
}
