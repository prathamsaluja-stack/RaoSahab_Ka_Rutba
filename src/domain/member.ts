import { z } from 'zod';
import { isoDate, isoDateTime, memberId, phoneNumber, timeOfDay } from '@/domain/primitives';
import { provenanceSchema } from '@/domain/provenance';

/** Who the member is, how they are covered, and how to reach them. */

export const sexSchema = z.enum(['F', 'M']);

export const addressSchema = z.object({
  /** Always a fictional street line; city and state stay realistic. */
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  postalCode: z.string().min(5),
  /** Set when mail to this address came back. */
  returnedMail: z.boolean().optional(),
});
export type Address = z.infer<typeof addressSchema>;

export const providerSchema = z.object({
  /** Fictional name; Synthea and directory names are scrubbed before import. */
  name: z.string().min(1),
  specialty: z.string().min(1),
  npi: z.string().optional(),
});
export type Provider = z.infer<typeof providerSchema>;

export const memberSchema = z.object({
  id: memberId,
  name: z.string().min(1),
  /** Hard-coded true on every record: nothing in this app is a real person. */
  isFictional: z.literal(true),
  dateOfBirth: isoDate,
  age: z.number().int().min(0).max(120),
  sex: sexSchema,
  preferredLanguage: z.string().min(1),
  address: addressSchema,
  pcp: providerSchema.nullable(),
  /** Short clinical or communication flags, e.g. "Hard of hearing". */
  flags: z.array(z.string().min(1)),
  /** Problem list as the plan has it coded, each with its own source. */
  conditions: z.array(
    z.object({
      label: z.string().min(1),
      code: z.string().min(1),
      codeSystem: z.enum(['ICD-10', 'SNOMED']),
      /** Set when another source disagrees; the app shows both, picks neither. */
      conflictsWith: z.string().optional(),
      provenance: provenanceSchema,
    }),
  ),
  /** IDs this person was known by before identity resolution merged them. */
  priorMemberIds: z.array(memberId),
  /** Present when this record is the resolved person behind two IDs. */
  mergedFrom: z
    .object({
      memberIds: z.array(memberId).min(1),
      mergedAt: isoDateTime,
      mergedBy: z.string().min(1),
      basis: z.string().min(1),
      undoable: z.boolean(),
    })
    .optional(),
  provenance: provenanceSchema,
});
export type Member = z.infer<typeof memberSchema>;

export const lineOfBusinessSchema = z.enum([
  'medicare_advantage',
  'medicaid',
  'medicaid_expansion',
  'dsnp',
]);
export type LineOfBusiness = z.infer<typeof lineOfBusinessSchema>;

export const coverageSchema = z.object({
  id: z.string().min(1),
  memberId,
  lineOfBusiness: lineOfBusinessSchema,
  planName: z.string().min(1),
  program: z.string().min(1),
  effectiveFrom: isoDate,
  /** Null while the coverage is open-ended. */
  effectiveTo: isoDate.nullable(),
  dualStatus: z.enum(['none', 'partial', 'full']),
  priorMemberIds: z.array(memberId),
  /** True for a span the member was not enrolled; refill math excludes it. */
  isLapse: z.boolean().optional(),
  provenance: provenanceSchema,
});
export type Coverage = z.infer<typeof coverageSchema>;

export const contactOwnerSchema = z.enum([
  'member',
  'spouse',
  'daughter',
  'son',
  'caregiver',
  'caseworker',
  'facility',
  'unknown',
]);
export type ContactOwner = z.infer<typeof contactOwnerSchema>;

export const contactValiditySchema = z.enum([
  'verified',
  'unverified',
  'wrong_number',
  'disconnected',
]);

export const contactPointSchema = z.object({
  id: z.string().min(1),
  memberId,
  number: phoneNumber,
  /** The label the source feed carries, which is often wrong about the owner. */
  label: z.string().min(1),
  /** Who actually answers this number. */
  owner: contactOwnerSchema,
  ownerName: z.string().min(1).optional(),
  validity: contactValiditySchema,
  isPrimaryOnFile: z.boolean(),
  lastOutcome: z
    .object({
      at: isoDateTime,
      outcome: z.string().min(1),
    })
    .nullable(),
  answerStats: z.object({
    attempts: z.number().int().min(0),
    answered: z.number().int().min(0),
    /** Free-text note on when it answers, e.g. "3 of 3 mornings". */
    note: z.string().min(1).optional(),
  }),
  bestWindow: z
    .object({
      start: timeOfDay,
      end: timeOfDay,
      /** Days of week the window applies to; empty means every day. */
      days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])),
      basis: z.string().min(1),
    })
    .nullable(),
  consent: z.object({
    calls: z.enum(['yes', 'no', 'unknown']),
    texts: z.enum(['yes', 'no', 'unknown']),
    voicemail: z.enum(['yes', 'no', 'unknown']),
    recordedOn: memberId.optional(),
    recordedAt: isoDateTime.optional(),
  }),
  language: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type ContactPoint = z.infer<typeof contactPointSchema>;
