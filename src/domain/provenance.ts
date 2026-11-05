import { z } from 'zod';
import { isoDateTime } from '@/domain/primitives';

/**
 * Provenance is the spine of the product: no clinical or operational fact is
 * displayed without the feed it came from, when it happened clinically, when
 * the plan received it, and how confident we are in it. Clinical time and
 * received time are kept apart on purpose, because a late claim for an old
 * event must never look newer than a fresh ADT message.
 */

export const sourceSystems = [
  'eligibility',
  'adt',
  'pbm',
  'claims',
  'ccd',
  'labs',
  'um',
  'contact',
  'hra',
  'risk',
  'measures',
  'directory',
  'appointments',
  'cm_record',
] as const;

export const sourceSystemSchema = z.enum(sourceSystems);
export type SourceSystem = z.infer<typeof sourceSystemSchema>;

export const provenanceStatuses = [
  'source_confirmed',
  'member_reported',
  'inferred',
  'unresolved',
] as const;

export const provenanceStatusSchema = z.enum(provenanceStatuses);
export type ProvenanceStatus = z.infer<typeof provenanceStatusSchema>;

export const provenanceHistoryEntrySchema = z.object({
  at: isoDateTime,
  by: z.string().min(1),
  change: z.string().min(1),
});
export type ProvenanceHistoryEntry = z.infer<typeof provenanceHistoryEntrySchema>;

export const provenanceSchema = z.object({
  source: sourceSystemSchema,
  sourceRecordId: z.string().min(1),
  /** When it happened clinically. */
  eventTime: isoDateTime,
  /** When the plan received it. Never assume it equals `eventTime`. */
  receivedTime: isoDateTime,
  status: provenanceStatusSchema,
  reviewer: z.string().min(1).optional(),
  history: z.array(provenanceHistoryEntrySchema).optional(),
});
export type Provenance = z.infer<typeof provenanceSchema>;

/** A pointer back to one source record, used by signals to show their inputs. */
export const sourceRefSchema = z.object({
  source: sourceSystemSchema,
  sourceRecordId: z.string().min(1),
  label: z.string().min(1),
  eventTime: isoDateTime.optional(),
  receivedTime: isoDateTime.optional(),
});
export type SourceRef = z.infer<typeof sourceRefSchema>;

/** The source ref a fact carries, derived from its own provenance. */
export function toSourceRef(provenance: Provenance, label: string): SourceRef {
  return {
    source: provenance.source,
    sourceRecordId: provenance.sourceRecordId,
    label,
    eventTime: provenance.eventTime,
    receivedTime: provenance.receivedTime,
  };
}
