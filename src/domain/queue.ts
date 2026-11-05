import { z } from 'zod';
import { isoDate, isoDateTime, memberId } from '@/domain/primitives';
import { sourceSystemSchema } from '@/domain/provenance';
import { lineOfBusinessSchema } from '@/domain/member';

/**
 * The Today queue.
 *
 * Every row answers three questions at once: why this member is here, what
 * clock is running, and what to do next. A row without a reason or without a
 * suggested action is not allowed by the schema, because a priority list that
 * cannot say why it ordered itself is the thing this product replaces.
 *
 * The plan's cost-based risk band rides along as `riskNote` only: it is one
 * dated input, never the first column and never the ordering.
 */

export const queueTabSchema = z.enum([
  'due_today',
  'at_risk',
  'follow_ups_due',
  'waiting_on_others',
  'routine',
]);
export type QueueTab = z.infer<typeof queueTabSchema>;

/** The tier a row sits in before clocks break the tie. See section 9. */
export const queueTierSchema = z.enum([
  'safety',
  'transition',
  'access_barrier',
  'overdue_follow_up',
  'routine',
]);
export type QueueTier = z.infer<typeof queueTierSchema>;

export const freshnessLevelSchema = z.enum(['filled', 'half', 'open']);

export const reasonChipSchema = z.object({
  label: z.string().min(1),
  /** The sentence behind the chip, shown on hover and to screen readers. */
  detail: z.string().min(1),
  freshness: freshnessLevelSchema,
  /** Words, never colour alone: "Confirmed", "Single source", "Stale". */
  freshnessLabel: z.string().min(1),
  source: sourceSystemSchema,
  /** "ADT, received Fri 6 Nov 17:10" — the feed and when it arrived. */
  sourceLabel: z.string().min(1),
  /** The signal this chip came from, when one fired. */
  signalId: z.string().regex(/^S(10|[1-9])$/).optional(),
});
export type ReasonChip = z.infer<typeof reasonChipSchema>;

export const queueClockSchema = z.object({
  /** "2-business-day contact window after discharge". */
  label: z.string().min(1),
  /** The reading as it is printed: "1 business day elapsed". */
  reading: z.string().min(1),
  deadline: isoDateTime,
  /** "Tue 10 Nov 17:00" — the deadline as the row prints it. */
  deadlineLabel: z.string().min(1),
  state: z.enum(['ok', 'due_soon', 'overdue']),
});
export type QueueClock = z.infer<typeof queueClockSchema>;

export const suggestedActionSchema = z.object({
  label: z.string().min(1),
  channel: z.enum(['call', 'text', 'letter', 'portal', 'coordinate', 'review']),
  /** When to do it: "09:00-11:00 today", "after 18:00 today". */
  window: z.string().min(1),
  /** Why this channel, this number, this hour. */
  rationale: z.string().min(1),
});
export type SuggestedAction = z.infer<typeof suggestedActionSchema>;

export const queueRowSchema = z.object({
  rank: z.number().int().min(1),
  memberId,
  /** Denormalised so a row renders without a second lookup. */
  memberName: z.string().min(1),
  age: z.number().int().min(0).max(120),
  sex: z.enum(['F', 'M']),
  program: z.string().min(1),
  lineOfBusiness: lineOfBusinessSchema,
  tab: queueTabSchema,
  tier: queueTierSchema,
  tierLabel: z.string().min(1),
  /** One line stating what happened: "Discharged Friday, no contact yet". */
  headline: z.string().min(1),
  reasons: z.array(reasonChipSchema).min(1),
  clock: queueClockSchema.nullable(),
  nextAction: suggestedActionSchema,
  /** Set on "waiting on others" rows: whose desk it sits on. */
  waitingOn: z
    .object({
      team: z.string().min(1),
      since: isoDate,
      nextCheck: isoDate,
      state: z.string().min(1),
    })
    .nullable(),
  /** The plan's risk score as one dated input. Tie-break only. */
  riskNote: z.string().min(1).nullable(),
  /** Golden members open a full Member Story; background members do not. */
  isGolden: z.boolean(),
});
export type QueueRow = z.infer<typeof queueRowSchema>;

export const queueTabCountSchema = z.object({
  id: queueTabSchema.or(z.literal('all')),
  label: z.string().min(1),
  count: z.number().int().min(0),
  /** The rule the tab applies, in the words the tab header uses. */
  description: z.string().min(1),
});
export type QueueTabCount = z.infer<typeof queueTabCountSchema>;

export const queueSchema = z.object({
  asOf: isoDateTime,
  tabs: z.array(queueTabCountSchema).min(1),
  dischargeAlerts: z.object({
    count: z.number().int().min(0),
    label: z.string().min(1),
    since: isoDate,
    memberIds: z.array(memberId),
  }),
  /** The ordering rule, printed under the queue so it is never a mystery. */
  orderingNote: z.string().min(1),
  rows: z.array(queueRowSchema).min(1),
});
export type Queue = z.infer<typeof queueSchema>;
