import { spawn } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ITranscriptionAdapter, TranscriptionResult } from './transcription.adapter.js';
import { createWavBuffer } from '../wav.util.js';
import { HardwareService } from '../hardware.service.js';

export class WhisperCliAdapter implements ITranscriptionAdapter {
  readonly name = 'whisper-cli';

  constructor(private readonly hardwareService?: HardwareService) {}

  private getAppDataPath(...subpaths: string[]): string {
    const base =
      process.env.APPDATA ||
      (process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support')
        : path.join(os.homedir(), '.config'));
    return path.join(base, 'VoiceFlow', ...subpaths);
  }

  private findBinaryPath(): string | null {
    const scriptDir = process.argv[1] ? path.dirname(process.argv[1]) : '';
    const nodeDir = path.dirname(process.execPath);

    const candidatePaths = [
      path.join(nodeDir, 'whisper-cli.exe'),
      path.resolve(scriptDir, '..', 'bin', 'whisper-cli.exe'),
      path.resolve(scriptDir, 'bin', 'whisper-cli.exe'),
      this.getAppDataPath('bin', 'whisper-cli.exe'),
      this.getAppDataPath('bin', 'whisper-cli'),
      path.resolve(process.cwd(), 'bin', 'whisper-cli.exe'),
      path.resolve(process.cwd(), 'bin', 'whisper-cli'),
      path.resolve(process.cwd(), 'resources', 'bin', 'whisper-cli.exe'),
      path.resolve(process.cwd(), '..', 'bin', 'whisper-cli.exe'),
      path.resolve(process.cwd(), '..', '..', 'bin', 'whisper-cli.exe'),
      path.resolve(process.cwd(), '..', 'resources', 'bin', 'whisper-cli.exe'),
      path.resolve(nodeDir, 'resources', 'bin', 'whisper-cli.exe'),
      'D:\\whisper.cpp\\build\\bin\\Release\\whisper-cli.exe',
    ];

    for (const p of candidatePaths) {
      if (existsSync(p)) return p;
    }

    return null;
  }

  private findModelPath(modelId: string): string | null {
    const filename = `ggml-${modelId}.bin`;
    const candidatePaths = [
      this.getAppDataPath('models', filename),
      path.resolve(process.cwd(), 'models', filename),
      path.resolve(process.cwd(), '..', '..', 'models', filename),
    ];

    for (const p of candidatePaths) {
      if (existsSync(p)) return p;
    }

    return null;
  }

  async isAvailable(): Promise<boolean> {
    const binary = this.findBinaryPath();
    return binary !== null;
  }

  async transcribe(
    audioPcm: Buffer,
    sampleRate: number,
    modelId: string,
    signal?: AbortSignal,
  ): Promise<TranscriptionResult> {
    const binaryPath = this.findBinaryPath();
    const modelPath = this.findModelPath(modelId);

    if (!binaryPath || !modelPath) {
      throw new Error(`Whisper binary or model not found (${modelId})`);
    }

    const start = Date.now();
    const tempWav = path.join(
      os.tmpdir(),
      `voiceflow_${Date.now()}_${Math.random().toString(36).slice(2)}.wav`,
    );

    const wavBuffer = createWavBuffer(audioPcm, sampleRate);
    await fs.writeFile(tempWav, wavBuffer);

    const WATCHDOG_TIMEOUT_MS = 10_000;

    try {
      const text = await new Promise<string>((resolve, reject) => {
        let isSettled = false;
        const profile = this.hardwareService?.getHardwareProfile();
        const threadCount = (profile?.optimalThreads ?? Math.min(8, os.cpus().length || 4)).toString();
        const args = [
          '-m', modelPath,
          '-f', tempWav,
          '-t', threadCount,
          '-fa',
          '-nt',
          '-np',
          '-l', 'en',
          '-tp', '0.0',
          '-tpi', '0.2',
          '-nth', '0.45',
          '-bs', '1',
          '-sow',
          '-sns',
          '--prompt', 'Software engineering, coding, technical dictation in clear English with correct punctuation.',
        ];

        if (profile?.engineTier === 'gpu-cuda') {
          args.push('-dev', '0');
        } else {
          args.push('-ng');
        }

        const child = spawn(binaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

        let stdout = '';
        let stderr = '';

        const killChild = () => {
          try {
            if (!child.killed) {
              child.kill('SIGKILL');
            }
          } catch {
            // Ignore kill errors
          }
        };

        const timeoutId = setTimeout(() => {
          if (!isSettled) {
            isSettled = true;
            killChild();
            reject(new Error(`whisper-cli timed out after ${WATCHDOG_TIMEOUT_MS}ms`));
          }
        }, WATCHDOG_TIMEOUT_MS);

        const onAbort = () => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timeoutId);
            killChild();
            reject(new Error('Transcription aborted'));
          }
        };

        if (signal) {
          if (signal.aborted) {
            onAbort();
            return;
          }
          signal.addEventListener('abort', onAbort, { once: true });
        }

        child.stdout?.on('data', (d) => (stdout += d.toString()));
        child.stderr?.on('data', (d) => (stderr += d.toString()));

        child.on('close', (code) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeoutId);
          if (signal) {
            signal.removeEventListener('abort', onAbort);
          }

          if (code === 0) {
            const cleanText = stdout
              .replace(/\[\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\]/g, '')
              .replace(/\[_BEG_\]/g, '')
              .replace(/\r?\n+/g, ' ')
              .trim();
            resolve(cleanText);
          } else {
            reject(new Error(`whisper-cli failed (code ${code}): ${stderr}`));
          }
        });

        child.on('error', (err) => {
          if (isSettled) return;
          isSettled = true;
          clearTimeout(timeoutId);
          if (signal) {
            signal.removeEventListener('abort', onAbort);
          }
          reject(err);
        });
      });

      const inferenceDurationMs = Date.now() - start;
      const byteRate = (sampleRate * 16) / 8;
      const audioDurationMs = byteRate > 0 ? Math.round((audioPcm.byteLength / byteRate) * 1000) : 0;
      const rtf = audioDurationMs > 0 ? Number((inferenceDurationMs / audioDurationMs).toFixed(3)) : 0;
      const profile = this.hardwareService?.getHardwareProfile();

      return {
        text,
        durationMs: inferenceDurationMs,
        metrics: {
          audioDurationMs,
          inferenceDurationMs,
          rtf,
          engineTier: profile?.engineTier,
          modelId,
        },
      };
    } finally {
      await fs.unlink(tempWav).catch(() => {});
    }
  }
}
