import { formatInTimeZone } from 'date-fns-tz';
import { AS_OF, TIMEZONE } from '@/lib/app-config';

/**
 * Clock arithmetic for deadlines (contact windows, follow-up visits,
 * authorization start-of-care checks).
 *
 * Everything is measured against `AS_OF`, never the system clock, so the
 * screens read identically on any machine on any day.
 */
export type ClockUrgency = 'overdue' | 'critical' | 'soon' | 'upcoming';

export interface ClockDescription {
  urgency: ClockUrgency;
  /** Minutes until the deadline; negative once it has passed. */
  remainingMinutes: number;
  /** Short label for the pill, e.g. "3 h 10 m left", "Overdue by 2 d". */
  text: string;
  /** The deadline itself, spelled out in the plan's timezone. */
  absolute: string;
  /** Pill text plus the absolute deadline, for assistive technology. */
  accessibleLabel: string;
}

/** Deadlines inside four hours are called critical; inside a day, soon. */
export const CRITICAL_MINUTES = 4 * 60;
export const SOON_MINUTES = 24 * 60;

const MINUTE = 60_000;

/** Largest two units, e.g. 185 -> "3 h 5 m", 3000 -> "2 d 2 h". */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const restMinutes = minutes % 60;
    return restMinutes === 0 ? `${hours} h` : `${hours} h ${restMinutes} m`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours === 0 ? `${days} d` : `${days} d ${restHours} h`;
}

/** The deadline in the plan's timezone, e.g. "Tue 10 Nov, 17:00 ET". */
export function formatDeadline(deadline: string): string {
  return formatInTimeZone(new Date(deadline), TIMEZONE, "EEE d MMM, HH:mm 'ET'");
}

export function urgencyFor(remainingMinutes: number): ClockUrgency {
  if (remainingMinutes < 0) return 'overdue';
  if (remainingMinutes <= CRITICAL_MINUTES) return 'critical';
  if (remainingMinutes <= SOON_MINUTES) return 'soon';
  return 'upcoming';
}

export function describeClock(
  deadline: string,
  options: { now?: string; label?: string } = {},
): ClockDescription {
  const now = options.now ?? AS_OF;
  const remainingMinutes = Math.round(
    (new Date(deadline).getTime() - new Date(now).getTime()) / MINUTE,
  );
  const urgency = urgencyFor(remainingMinutes);
  const duration = formatDuration(Math.abs(remainingMinutes));
  const text = urgency === 'overdue' ? `Overdue by ${duration}` : `${duration} left`;
  const absolute = formatDeadline(deadline);
  const prefix = options.label ? `${options.label}: ` : '';

  return {
    urgency,
    remainingMinutes,
    text,
    absolute,
    accessibleLabel: `${prefix}${text}. Due ${absolute}.`,
  };
}
