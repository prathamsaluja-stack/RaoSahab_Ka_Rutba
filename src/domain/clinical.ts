import { z } from 'zod';
import { isoDate, isoDateTime, memberId } from '@/domain/primitives';
import { provenanceSchema } from '@/domain/provenance';

/** Clinical and claims facts. Each one keeps its own source and both times. */

export const adtEventTypeSchema = z.enum([
  'admit',
  'discharge',
  'transfer',
  'ed_registration',
  'ed_discharge',
]);
export type AdtEventType = z.infer<typeof adtEventTypeSchema>;

export const adtEventSchema = z.object({
  id: z.string().min(1),
  memberId,
  type: adtEventTypeSchema,
  /** Fictional facility name; city and state are kept. */
  facility: z.string().min(1),
  eventTime: isoDateTime,
  /** Many real ADT feeds carry no diagnosis at all. Null means "not sent". */
  diagnosis: z.string().min(1).nullable(),
  disposition: z.string().min(1).nullable(),
  /** Set on the second copy of a duplicated message, never on the first. */
  duplicateOf: z.string().min(1).optional(),
  /** Registration contact captured at the facility, often newer than the file. */
  registrationPhone: z.string().min(1).optional(),
  registrationAddress: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type AdtEvent = z.infer<typeof adtEventSchema>;

export const fillStatusSchema = z.enum(['filled', 'reversed', 'partial']);

export const pharmacyFillSchema = z.object({
  id: z.string().min(1),
  memberId,
  drug: z.string().min(1),
  rxNorm: z.string().min(1),
  strength: z.string().min(1),
  daysSupply: z.number().int().positive(),
  fillDate: isoDate,
  refillsRemaining: z.number().int().min(0),
  /** Fictional prescriber and pharmacy names. */
  prescriber: z.string().min(1),
  pharmacy: z.string().min(1),
  status: fillStatusSchema,
  /** True for maintenance drugs, which are the ones refill gaps apply to. */
  isMaintenance: z.boolean(),
  copayQuoted: z.number().nonnegative().optional(),
  provenance: provenanceSchema,
});
export type PharmacyFill = z.infer<typeof pharmacyFillSchema>;

export const medicationSourceListSchema = z.enum([
  'discharge_list',
  'pbm',
  'claims_derived',
  'member_reported',
]);
export type MedicationSourceList = z.infer<typeof medicationSourceListSchema>;

/**
 * One row per drug **per source**. The matrix is never merged by software:
 * reconciling two sources is a clinician's act, recorded as such.
 */
export const medicationStatementSchema = z.object({
  id: z.string().min(1),
  memberId,
  drug: z.string().min(1),
  /** Ingredient key used to line rows up across sources. */
  ingredient: z.string().min(1),
  rxNorm: z.string().min(1),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  sourceList: medicationSourceListSchema,
  asOfDate: isoDate,
  /** Flagged on the discharge list when the hospital changed or started it. */
  change: z.enum(['new', 'changed', 'unchanged', 'stopped']).optional(),
  isHighRisk: z.boolean().optional(),
  drugClass: z.string().min(1).optional(),
  prescriber: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type MedicationStatement = z.infer<typeof medicationStatementSchema>;

export const claimSchema = z.object({
  id: z.string().min(1),
  memberId,
  type: z.enum(['professional', 'institutional', 'pharmacy']),
  serviceDate: isoDate,
  /** Claims lag by weeks: this is why a quiet month means missing data. */
  receivedDate: isoDate,
  codes: z.object({
    cpt: z.string().min(1).optional(),
    revenue: z.string().min(1).optional(),
    icd10: z.array(z.string().min(1)),
    ndc: z.string().min(1).optional(),
  }),
  status: z.enum(['paid', 'denied', 'pending']),
  provider: z.string().min(1),
  placeOfService: z.string().min(1),
  provenance: provenanceSchema,
});
export type Claim = z.infer<typeof claimSchema>;

export const documentStateSchema = z.enum(['received', 'requested_not_received', 'restricted']);
export type DocumentState = z.infer<typeof documentStateSchema>;

export const clinicalDocumentSchema = z.object({
  id: z.string().min(1),
  memberId,
  type: z.string().min(1),
  title: z.string().min(1),
  state: documentStateSchema,
  requestedAt: isoDateTime.nullable(),
  receivedAt: isoDateTime.nullable(),
  /** Why a restricted document is withheld; shown instead of a blank row. */
  restrictionBasis: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type ClinicalDocument = z.infer<typeof clinicalDocumentSchema>;

export const labResultSchema = z.object({
  id: z.string().min(1),
  memberId,
  loinc: z.string().min(1),
  name: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  specimenTime: isoDateTime,
  referenceRange: z.string().min(1).optional(),
  abnormalFlag: z.enum(['low', 'normal', 'high', 'critical']).optional(),
  /** Set when the value and the coded diagnosis disagree. Display both. */
  discrepancyNote: z.string().min(1).optional(),
  provenance: provenanceSchema,
});
export type LabResult = z.infer<typeof labResultSchema>;

/**
 * How far the claims feed is actually complete for this member. Claims are
 * history, not status: a quiet month after this date is missing data, not a
 * healthy member, and every claims-derived panel has to say so.
 */
export const claimsCompletenessSchema = z.object({
  memberId,
  completeThrough: isoDate,
  assessedAt: isoDateTime,
  basis: z.string().min(1),
});
export type ClaimsCompleteness = z.infer<typeof claimsCompletenessSchema>;
