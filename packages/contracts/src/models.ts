import { z } from 'zod';

export const WhisperModelIdSchema = z.enum([
  'tiny.en',
  'tiny',
  'base.en',
  'base',
  'small.en',
  'small',
  'medium.en',
  'medium',
  'large-v3',
]);

export type WhisperModelId = z.infer<typeof WhisperModelIdSchema>;

export const ModelInfoSchema = z.object({
  id: WhisperModelIdSchema,
  name: z.string(),
  sizeMb: z.number(),
  languages: z.enum(['english-only', 'multilingual']),
  installed: z.boolean(),
  active: z.boolean(),
});

export type ModelInfo = z.infer<typeof ModelInfoSchema>;

export const MODEL_CATALOG: Omit<ModelInfo, 'installed' | 'active'>[] = [
  { id: 'tiny.en',    name: 'Tiny (English)',    sizeMb: 75,   languages: 'english-only' },
  { id: 'tiny',       name: 'Tiny',              sizeMb: 75,   languages: 'multilingual' },
  { id: 'base.en',    name: 'Base (English)',     sizeMb: 140,  languages: 'english-only' },
  { id: 'base',       name: 'Base',              sizeMb: 140,  languages: 'multilingual' },
  { id: 'small.en',   name: 'Small (English)',    sizeMb: 460,  languages: 'english-only' },
  { id: 'small',      name: 'Small',             sizeMb: 460,  languages: 'multilingual' },
  { id: 'medium.en',  name: 'Medium (English)',   sizeMb: 1500, languages: 'english-only' },
  { id: 'medium',     name: 'Medium',            sizeMb: 1500, languages: 'multilingual' },
  { id: 'large-v3',   name: 'Large v3',          sizeMb: 3100, languages: 'multilingual' },
];
