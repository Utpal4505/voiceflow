import { z } from 'zod';
import { WhisperModelIdSchema } from './models.js';

export const SettingsSchema = z.object({
  globalShortcut: z.string().default('CmdOrCtrl+Space'),
  activeModelId: WhisperModelIdSchema.default('base.en'),
  microphoneDeviceId: z.string().default('default'),
});

export type Settings = z.infer<typeof SettingsSchema>;
