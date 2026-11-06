import { Injectable, Logger } from '@nestjs/common';
import { existsSync, createWriteStream, promises as fs } from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import * as os from 'node:os';
import * as path from 'node:path';
import { MODEL_CATALOG, ModelInfo, WhisperModelId } from '@voiceflow/contracts';

@Injectable()
export class ModelsService {
  private readonly logger = new Logger(ModelsService.name);
  private activeModelId: WhisperModelId = 'base.en';
  private readonly downloadingModels = new Map<string, number>();

  getModelsDir(): string {
    const base =
      process.env.APPDATA ||
      (process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support')
        : path.join(os.homedir(), '.config'));
    const dir = path.join(base, 'VoiceFlow', 'models');
    if (!existsSync(dir)) {
      fs.mkdir(dir, { recursive: true }).catch(() => {});
    }
    return dir;
  }

  getActiveModelId(): WhisperModelId {
    return this.activeModelId;
  }

  setActiveModel(modelId: WhisperModelId): void {
    this.activeModelId = modelId;
    this.logger.log(`Active model changed to: ${modelId}`);
  }

  getModels(): ModelInfo[] {
    const dir = this.getModelsDir();

    return MODEL_CATALOG.map((cat) => {
      const filePath = path.join(dir, `ggml-${cat.id}.bin`);
      const installed = existsSync(filePath);
      const downloadProgress = this.downloadingModels.get(cat.id);

      return {
        ...cat,
        installed,
        active: cat.id === this.activeModelId,
        downloadProgress,
      };
    });
  }

  async deleteModel(modelId: WhisperModelId): Promise<void> {
    const filePath = path.join(this.getModelsDir(), `ggml-${modelId}.bin`);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      this.logger.log(`Deleted model: ${modelId}`);

      if (this.activeModelId === modelId) {
        const remaining = this.getModels().find((m) => m.installed);
        this.activeModelId = remaining ? remaining.id : 'base.en';
      }
    }
  }

  async downloadModel(
    modelId: WhisperModelId,
    onProgress: (progress: number, downloadedBytes: number, totalBytes: number) => void,
  ): Promise<void> {
    if (this.downloadingModels.has(modelId)) {
      return;
    }

    const dir = this.getModelsDir();
    const finalPath = path.join(dir, `ggml-${modelId}.bin`);
    const partPath = `${finalPath}.part`;
    const url = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${modelId}.bin`;

    this.downloadingModels.set(modelId, 0);
    this.logger.log(`Starting download for ${modelId} from ${url}`);

    try {
      await this.downloadWithRedirect(url, partPath, (downloaded, total) => {
        const percent = total > 0 ? Math.round((downloaded / total) * 100) : 0;
        this.downloadingModels.set(modelId, percent);
        onProgress(percent, downloaded, total);
      });

      await fs.rename(partPath, finalPath);
      this.logger.log(`Successfully downloaded model: ${modelId}`);

      if (!this.getModels().some((m) => m.installed && m.id === this.activeModelId)) {
        this.activeModelId = modelId;
      }
    } finally {
      this.downloadingModels.delete(modelId);
    }
  }

  private downloadWithRedirect(
    url: string,
    destPath: string,
    onProgress: (downloaded: number, total: number) => void,
    redirectCount = 0,
  ): Promise<void> {
    if (redirectCount > 5) {
      return Promise.reject(new Error('Too many redirects while downloading model'));
    }

    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;

      client
        .get(url, (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return resolve(
              this.downloadWithRedirect(res.headers.location, destPath, onProgress, redirectCount + 1),
            );
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`Failed to download model (HTTP ${res.statusCode})`));
          }

          const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
          let downloadedBytes = 0;
          const fileStream = createWriteStream(destPath);

          res.on('data', (chunk: Buffer) => {
            downloadedBytes += chunk.length;
            onProgress(downloadedBytes, totalBytes);
          });

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });

          fileStream.on('error', (err) => {
            fs.unlink(destPath).catch(() => {});
            reject(err);
          });
        })
        .on('error', reject);
    });
  }
}
