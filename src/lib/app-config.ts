/**
 * Build-wide constants.
 *
 * `AS_OF` is the single clock for the whole prototype. Every age, deadline and
 * freshness mark is computed from it, never from the system clock, so the
 * screens read the same on any machine on any day.
 */
export const APP_NAME = 'Caseline';

export const APP_DESCRIPTION =
  'Case-management workbench prototype. All members and records are fictional.';

export const AS_OF = '2026-11-09T08:00:00-05:00';

export const TIMEZONE = 'America/New_York';

/** Business-day calendar holidays (ISO dates). Empty by design. */
export const HOLIDAYS: readonly string[] = [];

export const CASELOAD = 48;
