'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'value'> {
  label: string;
  value: React.ReactNode;
  /** One line saying what the number means or where it came from. */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  /** Stat cards double as queue filters, so they carry a pressed state. */
  selected?: boolean;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  selected = false,
  className,
  ...props
}: StatCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'flex w-full flex-col items-start gap-1 rounded-[var(--radius-card)] border px-5 py-4 text-left transition-colors',
        selected
          ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]',
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-2 text-xs font-medium text-text-muted">
        {icon}
        {label}
      </span>
      <span data-tabular className="text-xl font-semibold text-text">
        {value}
      </span>
      {hint ? <span className="text-2xs text-text-muted">{hint}</span> : null}
    </button>
  );
}
