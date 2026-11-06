import { spawn } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { ITranscriptionAdapter, TranscriptionResult } from './transcription.adapter.js';
import { createWavBuffer } from '../wav.util.js';

export class WhisperCliAdapter implements ITranscriptionAdapter {
  readonly name = 'whisper-cli';

  private getAppDataPath(...subpaths: string[]): string {
    const base =
      process.env.APPDATA ||
      (process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support')
        : path.join(os.homedir(), '.config'));
    return path.join(base, 'VoiceFlow', ...subpaths);
  }

  private findBinaryPath(): string | null {
    const candidatePaths = [
      this.getAppDataPath('bin', 'whisper-cli.exe'),
      this.getAppDataPath('bin', 'whisper-cli'),
      path.resolve(process.cwd(), 'bin', 'whisper-cli.exe'),
      path.resolve(process.cwd(), 'bin', 'whisper-cli'),
      path.resolve(process.cwd(), '..', '..', 'bin', 'whisper-cli.exe'),
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

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const child = spawn(
          binaryPath,
          ['-m', modelPath, '-f', tempWav, '--no-timestamps', '-nt'],
          { stdio: ['ignore', 'pipe', 'pipe'] },
        );

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (d) => (stdout += d.toString()));
        child.stderr.on('data', (d) => (stderr += d.toString()));

        child.on('close', (code) => {
          if (code === 0) {
            const cleanText = stdout
              .replace(/\[\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\]/g, '')
              .replace(/\r?\n+/g, ' ')
              .trim();
            resolve(cleanText);
          } else {
            reject(new Error(`whisper-cli failed (code ${code}): ${stderr}`));
          }
        });

        child.on('error', reject);
      });

      return {
        text,
        durationMs: Date.now() - start,
      };
    } finally {
      await fs.unlink(tempWav).catch(() => {});
    }
  }
}
