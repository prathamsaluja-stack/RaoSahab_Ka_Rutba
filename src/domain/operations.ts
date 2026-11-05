import { z } from 'zod';
import { isoDate, isoDateTime, memberId, phoneNumber, timeOfDay } from '@/domain/primitives';
import { provenanceSchema } from '@/domain/provenance';

/** Operational facts: authorizations, outreach, assessments, gaps, work. */

export const authStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'started',
  'completed',
  'cancelled',
]);
export type AuthStatus = z.infer<typeof authStatusSchema>;

export const authRequestSchema = z.object({
  id: z.string().min(1),
  memberId,
  service: z.string().min(1),
  status: authStatusSchema,
  requestedAt: isoDateTime,
  decisionTime: isoDateTime.nullable(),
  ownerTeam: z.string().min(1),
  vendor: z.string().min(1).nullable(),
  /** "Approved" is not "started", and neither is "delivered". */
  startOfCareConfirmed: z.boolean(),
  startOfCareAt: isoDateTime.nullable(),
  provenance: provenanceSchema,
});
export type AuthRequest = z.infer<typeof authRequestSchema>;

export const outreachOutcomeSchema = z.enum([
  'answered',
  'no_answer',
  'voicemail',
  'wrong_number',
  'disconnected',
  'reached_other_person',
  'returned_mail',
  'text_delivered',
  'text_failed',
]);
export type OutreachOutcome = z.infer<typeof outreachOutcomeSchema>;

export const outreachAttemptSchema = z.object({
  id: z.string().min(1),
  memberId,
  contactPointId: z.string().min(1).nullable(),
  number: phoneNumber.nullable(),
  at: isoDateTime,
  channel: z.enum(['call', 'text', 'letter', 'portal']),
  outcome: outreachOutcomeSchema,
  note: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type OutreachAttempt = z.infer<typeof outreachAttemptSchema>;

export const assessmentSchema = z.object({
  id: z.string().min(1),
  memberId,
  instrument: z.enum(['HRA', 'SDOH', 'PHQ-9', 'falls_risk']),
  item: z.string().min(1),
  /** Null whenever the item was never put to the member. */
  value: z.string().min(1).nullable(),
  state: z.enum(['answered', 'not_asked', 'declined']),
  assessedDate: isoDate,
  /** Set when the answer lives under a prior member ID. */
  recordedUnderMemberId: memberId.optional(),
  provenance: provenanceSchema,
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const riskScoreSchema = z.object({
  id: z.string().min(1),
  memberId,
  value: z.number(),
  model: z.string().min(1),
  /** Cost-based models carry documented bias; the UI says so. */
  basis: z.enum(['cost', 'utilization', 'clinical']),
  band: z.enum(['low', 'medium', 'high']),
  scoredDate: isoDate,
  provenance: provenanceSchema,
});
export type RiskScore = z.infer<typeof riskScoreSchema>;

export const careGapStateSchema = z.enum([
  'open',
  'closed',
  'pending_claim',
  'excluded',
  'unknown',
]);
export type CareGapState = z.infer<typeof careGapStateSchema>;

export const careGapSchema = z.object({
  id: z.string().min(1),
  memberId,
  measure: z.string().min(1),
  measureCode: z.string().min(1),
  windowOpen: isoDate,
  windowClose: isoDate,
  state: careGapStateSchema,
  /** Never auto-closed: a gap closes when a clinician or a claim says so. */
  note: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type CareGap = z.infer<typeof careGapSchema>;

export const appointmentStateSchema = z.enum([
  'booked',
  'canceled',
  'completed',
  'no_show',
  'unknown',
]);
export type AppointmentState = z.infer<typeof appointmentStateSchema>;

export const appointmentSchema = z.object({
  id: z.string().min(1),
  memberId,
  provider: z.string().min(1),
  specialty: z.string().min(1),
  scheduledFor: isoDateTime,
  state: appointmentStateSchema,
  /** True when nothing downstream of the booking ever confirmed the outcome. */
  outcomeUnconfirmed: z.boolean().optional(),
  provenance: provenanceSchema,
});
export type Appointment = z.infer<typeof appointmentSchema>;

export const taskStepperKindSchema = z.enum(['referral', 'authorization', 'simple']);

export const taskStateSchema = z.enum([
  'open',
  'in_progress',
  'waiting_on_others',
  'completed',
  'referral_sent',
  'referral_accepted',
  'scheduled',
  'delivered',
  'requested',
  'approved',
  'started',
]);
export type TaskState = z.infer<typeof taskStateSchema>;

export const taskSchema = z.object({
  id: z.string().min(1),
  memberId,
  title: z.string().min(1),
  owner: z.string().min(1),
  ownerTeam: z.string().min(1),
  /** True when the work sits with another team and we are only chasing it. */
  waitingOnOthers: z.boolean(),
  due: isoDateTime,
  nextCheck: isoDateTime.nullable(),
  stepperKind: taskStepperKindSchema,
  state: taskStateSchema,
  provenance: provenanceSchema,
});
export type Task = z.infer<typeof taskSchema>;

export const noteSchema = z.object({
  id: z.string().min(1),
  memberId,
  type: z.enum(['call', 'clinical', 'coordination', 'free_text']),
  authorName: z.string().min(1),
  authorRole: z.string().min(1),
  createdAt: isoDateTime,
  text: z.string().min(1),
  signed: z.boolean(),
  signedAt: isoDateTime.nullable(),
  provenance: provenanceSchema,
});
export type Note = z.infer<typeof noteSchema>;

export const auditActionSchema = z.enum([
  'suggestion_shown',
  'confirmed',
  'dismissed',
  'edited',
  'merged',
  'undone',
  'signed',
  'requested',
  'snoozed',
]);
export type AuditAction = z.infer<typeof auditActionSchema>;

export const auditEventSchema = z.object({
  id: z.string().min(1),
  at: isoDateTime,
  actor: z.string().min(1),
  actorRole: z.string().min(1),
  action: auditActionSchema,
  subject: z.string().min(1),
  memberId: memberId.nullable(),
  /** Dismissals always carry one; the UI refuses to submit without it. */
  reason: z.string().min(1).nullable(),
  detail: z.string().min(1).optional(),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;

/** Where a planted data imperfection must become visible in the UI. */
export const imperfectionSchema = z.object({
  id: z.string().regex(/^IMP-\d{2}$/),
  memberId: memberId.nullable(),
  dataset: z.string().min(1),
  description: z.string().min(1),
  /** The concrete UI element that has to expose it. */
  exposedBy: z.string().min(1),
  route: z.string().min(1),
});
export type Imperfection = z.infer<typeof imperfectionSchema>;

/** A contact window expressed as a time of day in the plan's timezone. */
export const contactWindowSchema = z.object({
  start: timeOfDay,
  end: timeOfDay,
});
export type ContactWindow = z.infer<typeof contactWindowSchema>;
