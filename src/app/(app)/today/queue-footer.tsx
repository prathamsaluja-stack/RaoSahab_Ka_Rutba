'use client';

import * as React from 'react';
import { HelpCircle, Timer } from 'lucide-react';
import { Checkbox, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { FreshnessMark } from '@/components/domain';
import {
  queueCapacity,
  queueFreshnessLegend,
  queueOrderingExplanation,
  queueScoreBasis,
} from '@/lib/data/queue';

export interface QueueFooterProps {
  hideDismissed: boolean;
  onHideDismissedChange: (value: boolean) => void;
  dismissedCount: number;
}

/**
 * What the queue is willing to say about itself: how fresh its evidence is,
 * what ordered it, and how much of the day it is asking for.
 */
export function QueueFooter({
  hideDismissed,
  onHideDismissedChange,
  dismissedCount,
}: QueueFooterProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-2xs font-medium tracking-wide text-text-muted uppercase">
          Freshness
        </span>
        {queueFreshnessLegend.map((entry) => (
          <span key={entry.level} className="inline-flex items-center gap-1.5 text-xs text-text">
            <FreshnessMark
              level={entry.level}
              label={entry.label}
              description={entry.description}
              subject="Freshness key"
            />
            {entry.label}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-xs text-text-muted">
            <span className="font-medium text-text">Score basis:</span> {queueScoreBasis}
          </p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <Timer aria-hidden="true" className="size-4 shrink-0" />
            <span data-tabular>{queueCapacity.line}</span>
            <span className="rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-2xs font-medium text-text-muted">
              {queueCapacity.label}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-5">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-text hover:bg-[var(--surface-muted)]"
              >
                <HelpCircle aria-hidden="true" className="size-4 text-text-muted" />
                {queueOrderingExplanation.title}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" className="w-[26rem]">
              <h3 className="text-sm font-semibold text-text">{queueOrderingExplanation.title}</h3>
              <p className="mt-1.5 text-xs text-text-muted">{queueOrderingExplanation.intro}</p>
              <ol className="mt-3 flex flex-col gap-2.5">
                {queueOrderingExplanation.tiers.map((tier, index) => (
                  <li key={tier.tier} className="flex gap-2.5">
                    <span
                      data-tabular
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-2xs font-semibold text-[var(--brand)]"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-text">{tier.label}</span>
                      <span className="block text-2xs text-text-muted">{tier.description}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-[var(--border)] pt-3 text-2xs text-text-muted">
                {queueOrderingExplanation.tieBreak}
              </p>
              <p className="mt-2 text-2xs text-text-muted">{queueOrderingExplanation.guardrails}</p>
            </PopoverContent>
          </Popover>

          <Checkbox
            label="Hide dismissed"
            hint={
              dismissedCount === 0
                ? 'Nothing dismissed today'
                : `${dismissedCount} dismissed today, each with a recorded reason`
            }
            checked={hideDismissed}
            onCheckedChange={(value) => onHideDismissedChange(value === true)}
          />
        </div>
      </div>
    </div>
  );
}
