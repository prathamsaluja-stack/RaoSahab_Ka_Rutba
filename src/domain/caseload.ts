import { z } from 'zod';
import { isoDate, isoDateTime, phoneNumber } from '@/domain/primitives';
import { lineOfBusinessSchema } from '@/domain/member';

/**
 * The background caseload.
 *
 * Forty-three invented members stand behind the five golden ones so the lists
 * and counts read as a real 48-case load. They are list scenery: they carry
 * only what the members list and the queue rows put on screen, and nothing
 * clinical, because no screen ever opens one.
 */

export const backgroundMemberSchema = z.object({
  id: z.string().regex(/^SYN-BG-\d{3}$/, 'background IDs run SYN-BG-001 to SYN-BG-043'),
  name: z.string().min(1),
  isFictional: z.literal(true),
  age: z.number().int().min(18).max(120),
  sex: z.enum(['F', 'M']),
  program: z.string().min(1),
  lineOfBusiness: lineOfBusinessSchema,
  planName: z.string().min(1),
  conditions: z.array(z.string().min(1)).min(1),
  primaryPhone: phoneNumber,
  phoneValidity: z.enum(['verified', 'unverified', 'wrong_number']),
  address: z.object({
    line1: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    postalCode: z.string().min(5),
  }),
  enrolledSince: isoDate,
  /** Null when nobody has reached this member yet. */
  lastContactAt: isoDate.nullable(),
  /** The plan's cost-based band: one dated input, never the first column. */
  riskBand: z.enum(['low', 'medium', 'high']),
  openTasks: z.number().int().min(0),
});
export type BackgroundMember = z.infer<typeof backgroundMemberSchema>;

export const caseloadManifestSchema = z.object({
  generator: z.literal('deterministic'),
  seed: z.number().int(),
  asOf: isoDateTime,
  count: z.number().int(),
  caseload: z.number().int(),
  script: z.string().min(1),
  notes: z.array(z.string().min(1)),
});
export type CaseloadManifest = z.infer<typeof caseloadManifestSchema>;

/** One row of the caseload list, golden and background members alike. */
export interface CaseloadRow {
  id: string;
  name: string;
  age: number;
  sex: 'F' | 'M';
  program: string;
  lineOfBusiness: z.infer<typeof lineOfBusinessSchema>;
  planName: string;
  primaryPhone: string;
  phoneValidity: 'verified' | 'unverified' | 'wrong_number' | 'disconnected';
  lastContactAt: string | null;
  riskBand: 'low' | 'medium' | 'high';
  openTasks: number;
  /** Golden members have a built Member Story; background members do not. */
  isGolden: boolean;
}
