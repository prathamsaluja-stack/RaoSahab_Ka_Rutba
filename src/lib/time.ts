import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { AS_OF, HOLIDAYS, TIMEZONE } from '@/lib/app-config';

/**
 * Time arithmetic for the whole prototype, anchored to `AS_OF`.
 *
 * Three rules hold everywhere:
 *  - the plan's wall clock is `TIMEZONE`, so a "day" is a New York day;
 *  - nothing reads the system clock, so every screen is reproducible;
 *  - business days skip weekends and the `HOLIDAYS` calendar, which is empty
 *    by default so the clocks match the case solution.
 */

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

const WEEKDAYS: readonly Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** The pinned instant every clock is measured from. */
export function asOf(): Date {
  return new Date(AS_OF);
}

/** The calendar date of an instant in the plan's timezone, as `YYYY-MM-DD`. */
export function localDate(instant: string | Date = AS_OF): string {
  return formatInTimeZone(toDate(instant), TIMEZONE, 'yyyy-MM-dd');
}

/** The weekday of an instant or calendar date in the plan's timezone. */
export function weekdayOf(value: string | Date): Weekday {
  const index = Number(formatInTimeZone(toDate(value), TIMEZONE, 'i')) % 7;
  return WEEKDAYS[index] ?? 'sun';
}

/** Turn a calendar date plus a wall-clock time into an instant with offset. */
export function atLocalTime(date: string, time = '00:00'): string {
  return fromZonedTime(`${date}T${time}:00`, TIMEZONE).toISOString();
}

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  // A bare calendar date is read as local midnight in the plan's timezone,
  // not as UTC midnight, which would land on the previous evening.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(atLocalTime(value)) : new Date(value);
}

/**
 * Add whole calendar days to a date, staying in `YYYY-MM-DD`. The arithmetic
 * runs on UTC midnights of the plan's calendar date, so a daylight-saving
 * boundary can never shift a day.
 */
export function addDays(date: string | Date, days: number): string {
  const base = new Date(`${localDate(date)}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`, by calendar date in the plan's timezone. */
export function daysBetween(from: string | Date, to: string | Date = AS_OF): number {
  const a = Date.parse(`${localDate(from)}T00:00:00Z`);
  const b = Date.parse(`${localDate(to)}T00:00:00Z`);
  return Math.round((b - a) / DAY_MS);
}

/** Fractional hours between two instants; negative when `to` is earlier. */
export function hoursBetween(from: string | Date, to: string | Date = AS_OF): number {
  return (toDate(to).getTime() - toDate(from).getTime()) / HOUR_MS;
}

export function isHoliday(date: string): boolean {
  return HOLIDAYS.includes(date);
}

export function isBusinessDay(value: string | Date): boolean {
  const day = weekdayOf(value);
  if (day === 'sat' || day === 'sun') return false;
  return !isHoliday(localDate(value));
}

/**
 * Business days elapsed between two moments, counting each business day that
 * has started after the start date. Friday to Monday is one business day.
 */
export function businessDaysBetween(from: string | Date, to: string | Date = AS_OF): number {
  const start = localDate(from);
  const end = localDate(to);
  if (end <= start) return 0;

  let count = 0;
  let cursor = addDays(start, 1);
  while (cursor <= end) {
    if (isBusinessDay(cursor)) count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
}

/** The calendar date `n` business days after `date`, skipping the start day. */
export function addBusinessDays(date: string | Date, businessDays: number): string {
  let cursor = localDate(date);
  let remaining = businessDays;
  while (remaining > 0) {
    cursor = addDays(cursor, 1);
    if (isBusinessDay(cursor)) remaining -= 1;
  }
  return cursor;
}

/**
 * A deadline expressed as "n business days after the event, by HH:mm local",
 * e.g. the two-business-day post-discharge contact window.
 */
export function businessDayDeadline(
  event: string | Date,
  businessDays: number,
  endOfDay = '17:00',
): string {
  return atLocalTime(addBusinessDays(event, businessDays), endOfDay);
}

/** A deadline expressed as "n calendar days after the event, by HH:mm local". */
export function calendarDayDeadline(
  event: string | Date,
  days: number,
  endOfDay = '23:59',
): string {
  return atLocalTime(addDays(localDate(event), days), endOfDay);
}

export interface RefillCoverage {
  /** Last date the dispensed supply still covers. */
  coveredThrough: string;
  /** First date a refill is needed; no gap may be claimed before it. */
  nextDue: string;
  /** Days past `nextDue` at `now`; zero or less means still covered. */
  daysPastRunOut: number;
  /** Days past run-out once excluded spans (coverage lapses) are removed. */
  adjustedDaysPastRunOut: number;
  inGap: boolean;
}

export interface ExcludedSpan {
  from: string;
  to: string;
  reason: string;
}

/** Days of an excluded span that fall inside `[from, to]`, inclusive. */
function excludedDaysWithin(span: ExcludedSpan, from: string, to: string): number {
  const start = span.from > from ? span.from : from;
  const end = span.to < to ? span.to : to;
  if (end < start) return 0;
  return daysBetween(start, end) + 1;
}

/**
 * Refill arithmetic. A 90-day supply filled 3 Aug covers through 31 Oct and
 * the next supply is due 1 Nov: the fill date is day one, so a gap cannot be
 * asserted on 31 Oct. Coverage lapses are excluded, because days a member was
 * not enrolled are not days they failed to fill.
 */
export function refillCoverage(
  fillDate: string,
  daysSupply: number,
  options: { now?: string | Date; graceDays?: number; excluded?: readonly ExcludedSpan[] } = {},
): RefillCoverage {
  const { now = AS_OF, graceDays = 0, excluded = [] } = options;
  const coveredThrough = addDays(fillDate, daysSupply - 1);
  const nextDue = addDays(fillDate, daysSupply);
  const today = localDate(now);

  const rawPast = Math.max(0, daysBetween(nextDue, today));
  const excludedDays = excluded.reduce(
    (total, span) => total + excludedDaysWithin(span, nextDue, today),
    0,
  );
  const adjusted = Math.max(0, rawPast - excludedDays);

  return {
    coveredThrough,
    nextDue,
    daysPastRunOut: rawPast,
    adjustedDaysPastRunOut: adjusted,
    inGap: adjusted > graceDays,
  };
}

/** "Mon 9 Nov, 08:00 ET" — the spelling used by the as-of chip and tooltips. */
export function formatInstant(value: string | Date, pattern = "EEE d MMM, HH:mm 'ET'"): string {
  return formatInTimeZone(toDate(value), TIMEZONE, pattern);
}

/** "Fri 6 Nov" — dates without a meaningful time of day. */
export function formatDate(value: string | Date, pattern = 'EEE d MMM'): string {
  return formatInTimeZone(toDate(value), TIMEZONE, pattern);
}
