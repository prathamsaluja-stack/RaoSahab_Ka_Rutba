import { describe, expect, it } from 'vitest';
import { describeFreshness } from '@/lib/freshness';

const RECEIVED_FRIDAY_EVENING = '2026-11-06T19:30:00-05:00';

describe('describeFreshness', () => {
  it('fills the mark for a source-confirmed fact inside the feed SLA', () => {
    const freshness = describeFreshness({
      receivedTime: '2026-11-09T06:00:00-05:00',
      status: 'source_confirmed',
      slaHours: 24,
    });

    expect(freshness.level).toBe('filled');
    expect(freshness.label).toBe('Verified');
    expect(freshness.description).toContain('inside the 24 h feed SLA');
  });

  it('half-fills a confirmed fact that arrived after its feed SLA', () => {
    // Harold's discharge medication list: received Fri 19:30, read Mon 08:00.
    const freshness = describeFreshness({
      receivedTime: RECEIVED_FRIDAY_EVENING,
      status: 'source_confirmed',
      slaHours: 24,
    });

    expect(freshness.level).toBe('half');
    expect(freshness.label).toBe('Past feed SLA');
    expect(Math.round(freshness.ageHours)).toBe(61);
  });

  it('half-fills a fact only one source carries', () => {
    const freshness = describeFreshness({
      receivedTime: '2026-11-09T07:00:00-05:00',
      status: 'source_confirmed',
      singleSource: true,
    });

    expect(freshness.level).toBe('half');
    expect(freshness.label).toBe('Single source');
  });

  it('half-fills member-reported, inferred and unresolved facts', () => {
    for (const status of ['member_reported', 'inferred', 'unresolved'] as const) {
      const freshness = describeFreshness({
        receivedTime: '2026-11-09T07:00:00-05:00',
        status,
      });
      expect(freshness.level).toBe('half');
      expect(freshness.description).toContain('Not confirmed against a source feed');
    }
  });

  it('opens the mark past the staleness threshold, whatever the status', () => {
    // HRA assessed 26 April: far past 30 days, so it reads as unknown.
    const freshness = describeFreshness({
      receivedTime: '2026-04-26T10:00:00-04:00',
      status: 'source_confirmed',
    });

    expect(freshness.level).toBe('open');
    expect(freshness.label).toBe('Stale');
    expect(freshness.description).toContain('30-day staleness threshold');
    expect(Math.round(freshness.ageDays)).toBe(197);
  });

  it('honours a feed-specific staleness threshold', () => {
    const input = {
      receivedTime: '2026-10-25T09:00:00-04:00',
      status: 'source_confirmed',
    } as const;

    expect(describeFreshness({ ...input }).level).toBe('half');
    expect(describeFreshness({ ...input, stalenessDays: 7 }).level).toBe('open');
  });
});
