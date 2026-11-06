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
  speed: z.enum(['Instant', 'Fast', 'Good', 'Moderate', 'Slow']),
  accuracy: z.number().min(1).max(5),
  installed: z.boolean(),
  active: z.boolean(),
  downloadProgress: z.number().optional(),
});

export type ModelInfo = z.infer<typeof ModelInfoSchema>;

export const MODEL_CATALOG: Omit<ModelInfo, 'installed' | 'active'>[] = [
  { id: 'tiny.en',   name: 'Tiny (English)',   sizeMb: 75,   languages: 'english-only', speed: 'Instant',  accuracy: 2 },
  { id: 'tiny',      name: 'Tiny',             sizeMb: 75,   languages: 'multilingual', speed: 'Instant',  accuracy: 2 },
  { id: 'base.en',   name: 'Base (English)',    sizeMb: 140,  languages: 'english-only', speed: 'Fast',     accuracy: 3 },
  { id: 'base',      name: 'Base',             sizeMb: 140,  languages: 'multilingual', speed: 'Fast',     accuracy: 3 },
  { id: 'small.en',  name: 'Small (English)',   sizeMb: 460,  languages: 'english-only', speed: 'Good',     accuracy: 4 },
  { id: 'small',     name: 'Small',            sizeMb: 460,  languages: 'multilingual', speed: 'Good',     accuracy: 4 },
  { id: 'medium.en', name: 'Medium (English)',  sizeMb: 1500, languages: 'english-only', speed: 'Moderate', accuracy: 5 },
  { id: 'medium',    name: 'Medium',           sizeMb: 1500, languages: 'multilingual', speed: 'Moderate', accuracy: 5 },
  { id: 'large-v3',  name: 'Large v3',         sizeMb: 3100, languages: 'multilingual', speed: 'Slow',     accuracy: 5 },
];
