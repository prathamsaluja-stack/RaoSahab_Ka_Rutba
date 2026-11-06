import { z } from 'zod';
import { isoDateTime, memberId } from '@/domain/primitives';
import { sourceSystemSchema } from '@/domain/provenance';

/**
 * The Call Workspace's stated content.
 *
 * The screen holds a conversation while the record writes itself, so every
 * word on it is a word a clinician would say or sign. The guide is a
 * checklist rather than a script, the note is a draft until it is signed,
 * and the inferred sentences carry their own warning. All of it is committed
 * here rather than generated at render time: the demo must read the same on
 * any machine, and a sentence that goes into a medical record should be one
 * somebody wrote on purpose.
 */

/** Where a guide question comes from, which is why it is on this call. */
export const guideOriginSchema = z.enum(['program', 'record_gap', 'red_flag', 'closing']);
export type GuideOrigin = z.infer<typeof guideOriginSchema>;

/** One answer the clinician can tap. Tapping it writes a sentence in the note. */
export const answerChipSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  tone: z.enum(['neutral', 'warning', 'urgent', 'success', 'info']).default('neutral'),
  /** The sentence this answer contributes to the note, in the note's voice. */
  feedsNote: z.string().min(1).nullable(),
});
export type AnswerChip = z.infer<typeof answerChipSchema>;

export const guideItemSchema = z.object({
  id: z.string().min(1),
  origin: guideOriginSchema,
  /** The question as the clinician would ask it out loud. */
  prompt: z.string().min(1),
  /** Why this question is on today's checklist. */
  because: z.string().min(1),
  source: sourceSystemSchema.nullable(),
  sourceLabel: z.string().min(1).nullable(),
  chips: z.array(answerChipSchema),
  /** The chip already tapped when the screen opens, for the worked example. */
  answeredChipId: z.string().min(1).nullable(),
  /** The escalation path for a red-flag item: clinician-led, always. */
  escalation: z.string().min(1).nullable(),
});
export type GuideItem = z.infer<typeof guideItemSchema>;

export const caregiverCandidateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  relation: z.string().min(1),
  number: z.string().min(1),
  consentLabel: z.string().min(1),
});
export type CaregiverCandidate = z.infer<typeof caregiverCandidateSchema>;

/** One of the forty structured fields, and how it got its value. */
export const assessmentFieldSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  state: z.enum(['prefilled', 'confirmed', 'remaining']),
  source: sourceSystemSchema.nullable(),
  sourceRecordId: z.string().min(1).nullable(),
  /** "HRA, 26 Apr" — the age of the value, spelled out. */
  dateLabel: z.string().min(1).nullable(),
});
export type AssessmentField = z.infer<typeof assessmentFieldSchema>;

export const structuredAssessmentSchema = z.object({
  instrument: z.string().min(1),
  total: z.number().int().positive(),
  prefilled: z.number().int().nonnegative(),
  confirmed: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
  note: z.string().min(1),
  fields: z.array(assessmentFieldSchema),
});
export type StructuredAssessment = z.infer<typeof structuredAssessmentSchema>;

/** Where a sentence in the draft came from. Nothing is unattributed. */
export const noteTagSchema = z.enum(['record', 'call', 'inferred']);
export type NoteTag = z.infer<typeof noteTagSchema>;

export const noteSentenceSchema = z.object({
  id: z.string().min(1),
  tag: noteTagSchema,
  text: z.string().min(1),
  source: sourceSystemSchema.nullable(),
  sourceLabel: z.string().min(1).nullable(),
  /** What the model matched on, for an inferred sentence. Never a percentage. */
  basis: z.string().min(1).nullable(),
});
export type NoteSentence = z.infer<typeof noteSentenceSchema>;

export const writeTargetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  destination: z.string().min(1),
  summary: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1),
  editable: z.boolean(),
});
export type WriteTarget = z.infer<typeof writeTargetSchema>;

export const outcomeCodeSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  /** What this code does to the contact record and to the ranking signal. */
  updates: z.string().min(1),
});
export type OutcomeCode = z.infer<typeof outcomeCodeSchema>;

export const callWorkspaceSchema = z.object({
  memberId,
  programLabel: z.string().min(1),
  summary: z.string().min(1),
  dialing: z.object({
    contactPointId: z.string().min(1),
    number: z.string().min(1),
    ownerLabel: z.string().min(1),
    note: z.string().min(1),
  }),
  timer: z.object({
    /** A stated reading, e.g. "07:42". Nothing on this screen ticks. */
    elapsed: z.string().min(1),
    connectedLabel: z.string().min(1),
  }),
  recordingConsent: z.object({
    state: z.enum(['asked', 'yes', 'no']),
    label: z.string().min(1),
    detail: z.string().min(1),
  }),
  clock: z
    .object({
      label: z.string().min(1),
      reading: z.string().min(1),
      deadline: isoDateTime,
      state: z.enum(['overdue', 'due_soon', 'upcoming']),
    })
    .nullable(),
  guide: z.object({
    note: z.string().min(1),
    items: z.array(guideItemSchema).min(1),
  }),
  caregiver: z.object({
    label: z.string().min(1),
    hint: z.string().min(1),
    candidates: z.array(caregiverCandidateSchema),
  }),
  assessment: structuredAssessmentSchema,
  note: z.object({
    header: z.string().min(1),
    byline: z.string().min(1),
    sentences: z.array(noteSentenceSchema).min(1),
  }),
  writes: z.array(writeTargetSchema).min(1),
  nextContact: z.object({
    label: z.string().min(1),
    at: isoDateTime,
    detail: z.string().min(1),
  }),
});
export type CallWorkspace = z.infer<typeof callWorkspaceSchema>;

export const callWorkspaceFileSchema = z.object({
  asOf: isoDateTime,
  signedBy: z.string().min(1),
  /** The line above the sign dialog's list: one signature, one set of writes. */
  signNote: z.string().min(1),
  outcomeCodes: z.array(outcomeCodeSchema).min(5),
  members: z.array(callWorkspaceSchema).min(1),
});
export type CallWorkspaceFile = z.infer<typeof callWorkspaceFileSchema>;
