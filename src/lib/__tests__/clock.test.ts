import { describe, expect, it } from 'vitest';
import { AS_OF } from '@/lib/app-config';
import { describeClock, formatDeadline, formatDuration, urgencyFor } from '@/lib/clock';

describe('formatDuration', () => {
  it('shows minutes under an hour', () => {
    expect(formatDuration(45)).toBe('45 m');
  });

  it('shows hours and minutes under a day', () => {
    expect(formatDuration(185)).toBe('3 h 5 m');
    expect(formatDuration(180)).toBe('3 h');
  });

  it('shows days and hours beyond a day', () => {
    expect(formatDuration(33 * 60)).toBe('1 d 9 h');
    expect(formatDuration(48 * 60)).toBe('2 d');
  });
});

describe('urgencyFor', () => {
  it('separates overdue, critical, soon and upcoming', () => {
    expect(urgencyFor(-1)).toBe('overdue');
    expect(urgencyFor(0)).toBe('critical');
    expect(urgencyFor(4 * 60)).toBe('critical');
    expect(urgencyFor(4 * 60 + 1)).toBe('soon');
    expect(urgencyFor(24 * 60)).toBe('soon');
    expect(urgencyFor(24 * 60 + 1)).toBe('upcoming');
  });
});

describe('describeClock', () => {
  it("counts down to Harold's contact window from the pinned AS_OF", () => {
    // Window ends Tue 10 Nov 17:00 ET; AS_OF is Mon 9 Nov 08:00 ET.
    const clock = describeClock('2026-11-10T17:00:00-05:00', { label: 'Contact window' });

    expect(clock.remainingMinutes).toBe(33 * 60);
    expect(clock.urgency).toBe('upcoming');
    expect(clock.text).toBe('1 d 9 h left');
    expect(clock.absolute).toBe('Tue 10 Nov, 17:00 ET');
    expect(clock.accessibleLabel).toBe('Contact window: 1 d 9 h left. Due Tue 10 Nov, 17:00 ET.');
  });

  it('says how long a deadline has been overdue', () => {
    const clock = describeClock('2026-11-03T08:00:00-05:00');

    expect(clock.urgency).toBe('overdue');
    expect(clock.remainingMinutes).toBe(-6 * 24 * 60);
    expect(clock.text).toBe('Overdue by 6 d');
  });

  it('is critical inside four hours', () => {
    expect(describeClock('2026-11-09T11:30:00-05:00').urgency).toBe('critical');
    expect(describeClock('2026-11-09T11:30:00-05:00').text).toBe('3 h 30 m left');
  });

  it('accepts an explicit now so tests never read the system clock', () => {
    const clock = describeClock('2026-11-09T09:00:00-05:00', { now: AS_OF });
    expect(clock.text).toBe('1 h left');
  });

  it('formats deadlines in the plan timezone', () => {
    expect(formatDeadline('2026-11-13T23:59:00-05:00')).toBe('Fri 13 Nov, 23:59 ET');
  });
});
