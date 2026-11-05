import { z } from 'zod';
import adtEventsJson from '@data/golden/adt-events.json';
import appointmentsJson from '@data/golden/appointments.json';
import assessmentsJson from '@data/golden/assessments.json';
import auditEventsJson from '@data/golden/audit-events.json';
import authRequestsJson from '@data/golden/auth-requests.json';
import careGapsJson from '@data/golden/care-gaps.json';
import claimsCompletenessJson from '@data/golden/claims-completeness.json';
import claimsJson from '@data/golden/claims.json';
import clinicalDocumentsJson from '@data/golden/clinical-documents.json';
import contactPointsJson from '@data/golden/contact-points.json';
import coverageJson from '@data/golden/coverage.json';
import imperfectionsJson from '@data/golden/imperfections.json';
import labResultsJson from '@data/golden/lab-results.json';
import medicationStatementsJson from '@data/golden/medication-statements.json';
import membersJson from '@data/golden/members.json';
import notesJson from '@data/golden/notes.json';
import outreachAttemptsJson from '@data/golden/outreach-attempts.json';
import pharmacyFillsJson from '@data/golden/pharmacy-fills.json';
import riskScoresJson from '@data/golden/risk-scores.json';
import tasksJson from '@data/golden/tasks.json';
import {
  adtEventSchema,
  appointmentSchema,
  assessmentSchema,
  auditEventSchema,
  authRequestSchema,
  careGapSchema,
  claimSchema,
  claimsCompletenessSchema,
  clinicalDocumentSchema,
  contactPointSchema,
  coverageSchema,
  imperfectionSchema,
  labResultSchema,
  medicationStatementSchema,
  memberSchema,
  noteSchema,
  outreachAttemptSchema,
  pharmacyFillSchema,
  riskScoreSchema,
  taskSchema,
} from '@/domain';

/**
 * The committed golden fixtures, parsed once through their zod schemas.
 *
 * JSON is the only place in the app where `unknown` is allowed in, which is
 * why every dataset passes through `parseDataset` before anything reads it.
 * A malformed fixture fails loudly at import time rather than half-rendering
 * a screen that a clinician would then trust.
 */

export class FixtureError extends Error {
  constructor(
    readonly dataset: string,
    readonly issues: string[],
  ) {
    super(`Golden fixture "${dataset}" failed validation:\n${issues.join('\n')}`);
    this.name = 'FixtureError';
  }
}

export function parseDataset<Schema extends z.ZodType>(
  dataset: string,
  schema: Schema,
  rows: unknown,
): z.infer<Schema>[] {
  const result = z.array(schema).safeParse(rows);
  if (!result.success) {
    throw new FixtureError(
      dataset,
      result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`),
    );
  }
  return result.data;
}

export const goldenDatasets = {
  members: parseDataset('members', memberSchema, membersJson),
  coverage: parseDataset('coverage', coverageSchema, coverageJson),
  contactPoints: parseDataset('contact-points', contactPointSchema, contactPointsJson),
  adtEvents: parseDataset('adt-events', adtEventSchema, adtEventsJson),
  pharmacyFills: parseDataset('pharmacy-fills', pharmacyFillSchema, pharmacyFillsJson),
  medicationStatements: parseDataset(
    'medication-statements',
    medicationStatementSchema,
    medicationStatementsJson,
  ),
  claims: parseDataset('claims', claimSchema, claimsJson),
  claimsCompleteness: parseDataset(
    'claims-completeness',
    claimsCompletenessSchema,
    claimsCompletenessJson,
  ),
  clinicalDocuments: parseDataset(
    'clinical-documents',
    clinicalDocumentSchema,
    clinicalDocumentsJson,
  ),
  labResults: parseDataset('lab-results', labResultSchema, labResultsJson),
  authRequests: parseDataset('auth-requests', authRequestSchema, authRequestsJson),
  outreachAttempts: parseDataset('outreach-attempts', outreachAttemptSchema, outreachAttemptsJson),
  assessments: parseDataset('assessments', assessmentSchema, assessmentsJson),
  riskScores: parseDataset('risk-scores', riskScoreSchema, riskScoresJson),
  careGaps: parseDataset('care-gaps', careGapSchema, careGapsJson),
  appointments: parseDataset('appointments', appointmentSchema, appointmentsJson),
  tasks: parseDataset('tasks', taskSchema, tasksJson),
  notes: parseDataset('notes', noteSchema, notesJson),
  auditEvents: parseDataset('audit-events', auditEventSchema, auditEventsJson),
  imperfections: parseDataset('imperfections', imperfectionSchema, imperfectionsJson),
} as const;

export type GoldenDatasets = typeof goldenDatasets;
export type GoldenDatasetName = keyof GoldenDatasets;

/** The raw JSON, by dataset name, for tests that assert every file parses. */
export const rawGoldenDatasets: Record<string, { schema: z.ZodType; rows: unknown }> = {
  members: { schema: memberSchema, rows: membersJson },
  coverage: { schema: coverageSchema, rows: coverageJson },
  'contact-points': { schema: contactPointSchema, rows: contactPointsJson },
  'adt-events': { schema: adtEventSchema, rows: adtEventsJson },
  'pharmacy-fills': { schema: pharmacyFillSchema, rows: pharmacyFillsJson },
  'medication-statements': { schema: medicationStatementSchema, rows: medicationStatementsJson },
  claims: { schema: claimSchema, rows: claimsJson },
  'claims-completeness': { schema: claimsCompletenessSchema, rows: claimsCompletenessJson },
  'clinical-documents': { schema: clinicalDocumentSchema, rows: clinicalDocumentsJson },
  'lab-results': { schema: labResultSchema, rows: labResultsJson },
  'auth-requests': { schema: authRequestSchema, rows: authRequestsJson },
  'outreach-attempts': { schema: outreachAttemptSchema, rows: outreachAttemptsJson },
  assessments: { schema: assessmentSchema, rows: assessmentsJson },
  'risk-scores': { schema: riskScoreSchema, rows: riskScoresJson },
  'care-gaps': { schema: careGapSchema, rows: careGapsJson },
  appointments: { schema: appointmentSchema, rows: appointmentsJson },
  tasks: { schema: taskSchema, rows: tasksJson },
  notes: { schema: noteSchema, rows: notesJson },
  'audit-events': { schema: auditEventSchema, rows: auditEventsJson },
  imperfections: { schema: imperfectionSchema, rows: imperfectionsJson },
};
