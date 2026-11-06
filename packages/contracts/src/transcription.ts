import { z } from 'zod';

export const TranscriptEventSchema = z.object({
  sessionId: z.string(),
  text: z.string(),
  isFinal: z.boolean(),
});

export type TranscriptEvent = z.infer<typeof TranscriptEventSchema>;
