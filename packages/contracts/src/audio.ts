import { z } from 'zod';

export const AudioChunkSchema = z.object({
  sessionId: z.string(),
  chunk: z.instanceof(Uint8Array),
  sequenceNumber: z.number(),
  timestamp: z.number(),
});

export type AudioChunk = z.infer<typeof AudioChunkSchema>;
