'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  max?: number;
  label: string;
  /** Shown beside the bar so progress is never colour or length alone. */
  valueText?: string;
  className?: string;
}

export function Progress({ value, max = 100, label, valueText, className }: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3 text-2xs text-text-muted">
        <span>{label}</span>
        <span data-tabular>{valueText ?? `${value} of ${max}`}</span>
      </div>
      <ProgressPrimitive.Root
        value={value}
        max={max}
        aria-label={label}
        aria-valuetext={valueText}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]"
      >
        <ProgressPrimitive.Indicator
          className="h-full bg-[var(--brand)] transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
