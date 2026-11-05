'use client';

import * as React from 'react';
import { AlarmClock, AlertTriangle, Clock } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { describeClock, type ClockUrgency } from '@/lib/clock';
import { cn } from '@/lib/utils';

const urgencyStyles: Record<ClockUrgency, string> = {
  overdue:
    'text-[var(--urgent)] bg-[color-mix(in_srgb,var(--urgent)_12%,var(--surface))] border-[color-mix(in_srgb,var(--urgent)_28%,var(--surface))]',
  critical:
    'text-[var(--urgent)] bg-[color-mix(in_srgb,var(--urgent)_12%,var(--surface))] border-[color-mix(in_srgb,var(--urgent)_28%,var(--surface))]',
  soon: 'text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))] border-[color-mix(in_srgb,var(--warning)_28%,var(--surface))]',
  upcoming: 'text-text-muted bg-[var(--surface-muted)] border-[var(--border)]',
};

const urgencyIcon: Record<ClockUrgency, typeof Clock> = {
  overdue: AlertTriangle,
  critical: AlarmClock,
  soon: AlarmClock,
  upcoming: Clock,
};

export interface ClockPillProps {
  /** ISO deadline: contact window, visit due date, start-of-care check. */
  deadline: string;
  /** What the clock is counting down to, e.g. "Contact window". */
  label?: string;
  /** Override the pinned AS_OF clock. Tests use this. */
  now?: string;
  /**
   * The reading as the record prints it, e.g. "1 business day elapsed".
   * Business-day and calendar-day readings are stated by the record rather
   * than counted down in hours; the tooltip still carries the deadline.
   */
  reading?: string;
  /** Force the urgency colour when the record states it. */
  urgency?: ClockUrgency;
  className?: string;
}

/**
 * Time remaining against a deadline, with the absolute deadline in the
 * tooltip. Overdue reads as overdue in words, not only in red.
 */
export function ClockPill({ deadline, label, now, reading, urgency, className }: ClockPillProps) {
  const clock = describeClock(deadline, { now, label });
  const resolvedUrgency = urgency ?? clock.urgency;
  const text = reading ?? clock.text;
  const accessibleLabel = reading
    ? `${label ? `${label}: ` : ''}${reading}. Due ${clock.absolute}.`
    : clock.accessibleLabel;
  const Icon = urgencyIcon[resolvedUrgency];

  return (
    <Tooltip
      content={
        <span>
          {label ? `${label}. ` : null}
          Due {clock.absolute}
        </span>
      }
    >
      <span
        data-urgency={resolvedUrgency}
        data-tabular
        tabIndex={0}
        aria-label={accessibleLabel}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border px-2 py-0.5 text-2xs font-medium whitespace-nowrap',
          urgencyStyles[resolvedUrgency],
          className,
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{text}</span>
      </span>
    </Tooltip>
  );
}
