import { AS_OF } from '@/lib/app-config';

/**
 * Freshness is a statement about a fact's provenance, not a colour.
 *
 *   filled  the fact is source-confirmed and arrived inside its feed's SLA
 *   half    one source only, member-reported, inferred, unresolved, or a
 *           confirmed fact that arrived after its feed's SLA
 *   open    older than the staleness threshold, so treat it as unknown
 *
 * Every level ships with a sentence, because the brief forbids conveying
 * status by colour or shape alone.
 */
export type FreshnessStatus = 'source_confirmed' | 'member_reported' | 'inferred' | 'unresolved';

export type FreshnessLevel = 'filled' | 'half' | 'open';

export interface FreshnessInput {
  /** When the plan received the record (ISO). */
  receivedTime: string;
  status: FreshnessStatus;
  /** Feed SLA in hours. Beyond it, a confirmed fact is only half filled. */
  slaHours?: number;
  /** Older than this many days and the fact reads as unknown. */
  stalenessDays?: number;
  /** Only one source carries this fact. */
  singleSource?: boolean;
  now?: string;
}

export interface FreshnessDescription {
  level: FreshnessLevel;
  /** Two or three words for the chip, e.g. "Single source". */
  label: string;
  /** A sentence naming the age and why the level was chosen. */
  description: string;
  ageHours: number;
  ageDays: number;
}

export const DEFAULT_STALENESS_DAYS = 30;
export const DEFAULT_SLA_HOURS = 24;

const HOUR = 3_600_000;

const statusLabels: Record<FreshnessStatus, string> = {
  source_confirmed: 'Source confirmed',
  member_reported: 'Member reported',
  inferred: 'Inferred',
  unresolved: 'Unresolved',
};

function formatAge(ageHours: number): string {
  if (ageHours < 1) return 'less than an hour ago';
  if (ageHours < 48) return `${Math.round(ageHours)} h ago`;
  return `${Math.round(ageHours / 24)} d ago`;
}

export function describeFreshness(input: FreshnessInput): FreshnessDescription {
  const {
    receivedTime,
    status,
    slaHours = DEFAULT_SLA_HOURS,
    stalenessDays = DEFAULT_STALENESS_DAYS,
    singleSource = false,
    now = AS_OF,
  } = input;

  const ageHours = (new Date(now).getTime() - new Date(receivedTime).getTime()) / HOUR;
  const ageDays = ageHours / 24;
  const age = formatAge(ageHours);
  const statusLabel = statusLabels[status];

  if (ageDays > stalenessDays) {
    return {
      level: 'open',
      label: 'Stale',
      description: `${statusLabel}, received ${age}, older than the ${stalenessDays}-day staleness threshold. Verify before use.`,
      ageHours,
      ageDays,
    };
  }

  if (status !== 'source_confirmed') {
    return {
      level: 'half',
      label: statusLabel,
      description: `${statusLabel}, received ${age}. Not confirmed against a source feed.`,
      ageHours,
      ageDays,
    };
  }

  if (singleSource) {
    return {
      level: 'half',
      label: 'Single source',
      description: `${statusLabel}, received ${age}. Only one source carries this fact.`,
      ageHours,
      ageDays,
    };
  }

  if (ageHours > slaHours) {
    return {
      level: 'half',
      label: 'Past feed SLA',
      description: `${statusLabel}, received ${age}, later than the ${slaHours} h feed SLA.`,
      ageHours,
      ageDays,
    };
  }

  return {
    level: 'filled',
    label: 'Verified',
    description: `${statusLabel}, received ${age}, inside the ${slaHours} h feed SLA.`,
    ageHours,
    ageDays,
  };
}
