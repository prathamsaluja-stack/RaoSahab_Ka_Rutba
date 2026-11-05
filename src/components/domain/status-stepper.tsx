import * as React from 'react';
import { Check, CircleDashed, CircleHelp, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusStep = 'requested' | 'approved' | 'started' | 'completed';

export const STATUS_STEPS: readonly StatusStep[] = [
  'requested',
  'approved',
  'started',
  'completed',
] as const;

const stepLabels: Record<StatusStep, string> = {
  requested: 'Requested',
  approved: 'Approved',
  started: 'Started',
  completed: 'Completed',
};

export interface StatusStepperProps {
  /** The furthest step confirmed, or 'unknown' when nobody has confirmed any. */
  current: StatusStep | 'unknown';
  /** Dates per step, e.g. { requested: '28 Oct', approved: '29 Oct' }. */
  dates?: Partial<Record<StatusStep, string>>;
  /** Steps after the current one that are explicitly unconfirmed, not just future. */
  unconfirmedNote?: string;
  className?: string;
}

/**
 * Approved is not done. The stepper keeps requested, approved, started and
 * completed apart, and says "unknown" when no one has confirmed a state.
 */
export function StatusStepper({ current, dates, unconfirmedNote, className }: StatusStepperProps) {
  const currentIndex = current === 'unknown' ? -1 : STATUS_STEPS.indexOf(current);
  const summary =
    current === 'unknown'
      ? 'Status unknown: no step confirmed'
      : `Status: ${stepLabels[current]}${unconfirmedNote ? `. ${unconfirmedNote}` : ''}`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <ol aria-label={summary} className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {STATUS_STEPS.map((step, index) => {
          const done = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={step} className="flex items-center gap-2">
              {index > 0 ? (
                <Dot aria-hidden="true" className="size-4 text-[var(--text-muted)]" />
              ) : null}
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'inline-flex items-center gap-1 text-2xs font-medium',
                  done ? 'text-[var(--success)]' : 'text-text-muted',
                )}
              >
                {done ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  <CircleDashed aria-hidden="true" className="size-3.5" />
                )}
                {stepLabels[step]}
                {done ? (
                  <span className="sr-only">confirmed</span>
                ) : (
                  <span className="sr-only">not confirmed</span>
                )}
                {dates?.[step] ? (
                  <span data-tabular className="font-normal opacity-80">
                    {dates[step]}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
      {current === 'unknown' ? (
        <p className="inline-flex items-center gap-1.5 text-2xs text-text-muted">
          <CircleHelp aria-hidden="true" className="size-3.5" />
          No step confirmed yet.
        </p>
      ) : null}
      {unconfirmedNote ? <p className="text-2xs text-[var(--warning)]">{unconfirmedNote}</p> : null}
    </div>
  );
}
