import { z } from 'zod';
import { isoDateTime, memberId } from '@/domain/primitives';
import { sourceSystemSchema } from '@/domain/provenance';

/**
 * The Member Story's stated readings.
 *
 * Everything in this file is a sentence a clinician would say out loud: what
 * arrived in the last 72 hours, which number actually answers, why two rows
 * of a medication matrix disagree, and how far the claims feed is honest.
 * The readings are committed rather than derived, so the screen says the same
 * thing on any machine, and so the number on screen is always a number
 * somebody wrote down on purpose.
 */

export const freshnessStampSchema = z.object({
  level: z.enum(['filled', 'half', 'open']),
  /** Two or three words, e.g. "Single source". */
  label: z.string().min(1),
  /** The sentence behind the mark. */
  description: z.string().min(1),
});
export type FreshnessStamp = z.infer<typeof freshnessStampSchema>;

/** One line of "What changed", with the record that changed it. */
export const changeEntrySchema = z.object({
  id: z.string().min(1),
  at: isoDateTime,
  title: z.string().min(1),
  detail: z.string().min(1),
  source: sourceSystemSchema,
  sourceRecordId: z.string().min(1),
  /** "Received Fri 6 Nov, 17:38 ET" — spelled out, never a bare timestamp. */
  receivedLabel: z.string().min(1),
  freshness: freshnessStampSchema,
  tone: z.enum(['urgent', 'warning', 'info', 'neutral', 'success']),
});
export type ChangeEntry = z.infer<typeof changeEntrySchema>;

/**
 * The reach line. Which number answers, whose it is, and what the plan is
 * proposing to change about it — proposing, because promoting a number is a
 * clinician's act like every other write in this product.
 */
export const reachLineSchema = z.object({
  bestContactPointId: z.string().min(1),
  headline: z.string().min(1),
  note: z.string().min(1),
  promoted: z
    .object({
      fromContactPointId: z.string().min(1),
      toContactPointId: z.string().min(1),
      reason: z.string().min(1),
      state: z.string().min(1),
    })
    .nullable(),
  /** Numbers the record has given up on, shown struck through, never hidden. */
  deadContactPointIds: z.array(z.string().min(1)),
});
export type ReachLine = z.infer<typeof reachLineSchema>;

export const medicationConflictSchema = z.object({
  /** Lines up with `MedicationStatement.ingredient`. */
  ingredient: z.string().min(1),
  severity: z.enum(['conflict', 'missing', 'single_source']),
  reason: z.string().min(1),
});
export type MedicationConflict = z.infer<typeof medicationConflictSchema>;

export const memberStorySchema = z.object({
  memberId,
  /** One line under the name: what this record is actually about today. */
  summary: z.string().min(1),
  reach: reachLineSchema,
  whatChanged: z.array(changeEntrySchema).min(1),
  medications: z.object({
    note: z.string().min(1),
    conflicts: z.array(medicationConflictSchema),
  }),
  riskNote: z.string().min(1),
  /** Set when the score predates the event it is being read against. */
  riskWarning: z.string().min(1).nullable(),
  claimsNote: z.string().min(1),
  timelineNote: z.string().min(1),
});
export type MemberStory = z.infer<typeof memberStorySchema>;

/** A choice in the reconciliation dialog. The clinician picks one per row. */
export const reconcileDecisionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  hint: z.string().min(1),
});
export type ReconcileDecision = z.infer<typeof reconcileDecisionSchema>;

export const memberStoryFileSchema = z.object({
  asOf: isoDateTime,
  /** "Since Fri 6 Nov, 08:00" — the 72-hour window the panel covers. */
  changeWindowLabel: z.string().min(1),
  reconcileDecisions: z.array(reconcileDecisionSchema).min(2),
  members: z.array(memberStorySchema).min(1),
});
export type MemberStoryFile = z.infer<typeof memberStoryFileSchema>;
