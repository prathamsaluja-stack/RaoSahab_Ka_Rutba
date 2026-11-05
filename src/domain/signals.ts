import { z } from 'zod';
import { isoDateTime, memberId } from '@/domain/primitives';
import { sourceRefSchema } from '@/domain/provenance';
import { suggestedActionSchema } from '@/domain/queue';

/**
 * Signals S1-S10.
 *
 * A signal is a sentence a case manager could have written: what the records
 * say, which records they are, and how much weight to put on it. Confidence
 * is a word, never a percentage, because a number implies a calibration this
 * has not got. Nothing here acts on its own - every signal ends in a
 * suggested action that a named clinician has to confirm.
 */

export const signalIdSchema = z.enum(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']);
export type SignalId = z.infer<typeof signalIdSchema>;

export const confidenceSchema = z.enum(['high', 'medium', 'low']);
export type Confidence = z.infer<typeof confidenceSchema>;

export const signalDefinitionSchema = z.object({
  id: signalIdSchema,
  name: z.string().min(1),
  /** The rule in plain language, as the design-system page prints it. */
  rule: z.string().min(1),
  /** What raises or lowers confidence for this signal. */
  confidenceBasis: z.string().min(1),
});
export type SignalDefinition = z.infer<typeof signalDefinitionSchema>;

export const firedSignalSchema = z.object({
  id: signalIdSchema,
  memberId,
  name: z.string().min(1),
  /** The headline value: "63 h", "51 days", "11 medications". */
  value: z.string().min(1),
  /** Why it fired, written for a clinician to read aloud on a call. */
  reason: z.string().min(1),
  /** The records behind it, so the claim can always be checked. */
  inputs: z.array(sourceRefSchema).min(1),
  confidence: confidenceSchema,
  /** Why that word and not a stronger one. */
  confidenceReason: z.string().min(1),
  actions: z.array(suggestedActionSchema).min(1),
});
export type FiredSignal = z.infer<typeof firedSignalSchema>;

export const signalsFileSchema = z.object({
  asOf: isoDateTime,
  catalog: z.array(signalDefinitionSchema).length(10),
  fired: z.array(firedSignalSchema).min(1),
});
export type SignalsFile = z.infer<typeof signalsFileSchema>;
