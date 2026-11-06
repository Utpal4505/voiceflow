import { z } from 'zod';

export const SessionStateSchema = z.enum([
  'idle',
  'recording',
  'processing',
  'done',
  'error',
]);

export type SessionState = z.infer<typeof SessionStateSchema>;

export const SessionEventSchema = z.object({
  sessionId: z.string(),
  state: SessionStateSchema,
  error: z.string().optional(),
});

export type SessionEvent = z.infer<typeof SessionEventSchema>;
