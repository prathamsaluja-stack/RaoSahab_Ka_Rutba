import { z } from 'zod';

/**
 * Shared leaf schemas.
 *
 * Fixtures are hand-authored JSON, so the parsing boundary is the only place
 * that may see `unknown`. Everything downstream works with the inferred types.
 */

/** An ISO instant with an explicit offset, e.g. `2026-11-06T16:45:00-05:00`. */
export const isoDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
    'expected an ISO date-time with an explicit UTC offset',
  )
  .refine((value) => !Number.isNaN(Date.parse(value)), 'not a real instant');

/** A calendar date with no time part, e.g. `2026-11-06`. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a YYYY-MM-DD calendar date')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'not a real date');

/** A wall-clock time of day in the plan timezone, e.g. `17:00`. */
export const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'expected HH:mm');

/** Every member ID in this prototype is obviously synthetic. */
export const memberId = z.string().regex(/^SYN-[A-Z0-9-]+$/, 'member IDs start with SYN-');

/** Only the reserved 555-01xx exchange is allowed anywhere in the app. */
export const phoneNumber = z
  .string()
  .regex(/^\(\d{3}\) 555-01\d{2}$/, 'phone numbers must use the reserved 555-01xx exchange');

export type IsoDateTime = z.infer<typeof isoDateTime>;
export type IsoDate = z.infer<typeof isoDate>;
export type TimeOfDay = z.infer<typeof timeOfDay>;
