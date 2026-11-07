import { z } from 'zod';

export const PerformanceMetricsSchema = z.object({
  audioDurationMs: z.number(),
  inferenceDurationMs: z.number(),
  rtf: z.number(),
  engineTier: z.string().optional(),
  modelId: z.string().optional(),
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

export const TranscriptEventSchema = z.object({
  sessionId: z.string(),
  text: z.string(),
  isFinal: z.boolean(),
  metrics: PerformanceMetricsSchema.optional(),
});

export type TranscriptEvent = z.infer<typeof TranscriptEventSchema>;
