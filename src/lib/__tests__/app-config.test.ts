import { describe, expect, it } from 'vitest';
import { APP_NAME, AS_OF, CASELOAD, HOLIDAYS, TIMEZONE } from '@/lib/app-config';

describe('app config', () => {
  it('names the product', () => {
    expect(APP_NAME).toBe('Caseline');
  });

  it('pins a single as-of instant rather than the system clock', () => {
    const asOf = new Date(AS_OF);
    expect(Number.isNaN(asOf.getTime())).toBe(false);
    // Monday 9 November 2026, 08:00 America/New_York === 13:00 UTC.
    expect(asOf.toISOString()).toBe('2026-11-09T13:00:00.000Z');
  });

  it('carries the case configuration', () => {
    expect(TIMEZONE).toBe('America/New_York');
    expect(CASELOAD).toBe(48);
    expect(HOLIDAYS).toHaveLength(0);
  });
});
