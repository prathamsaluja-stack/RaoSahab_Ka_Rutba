'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Tone of a line of record: what it is, never decoration. */
export type StoryTone = 'urgent' | 'warning' | 'info' | 'neutral' | 'success';

export const toneText: Record<StoryTone, string> = {
  urgent: 'text-[var(--urgent)]',
  warning: 'text-[var(--warning)]',
  info: 'text-[var(--info)]',
  neutral: 'text-text-muted',
  success: 'text-[var(--success)]',
};

export const toneBorder: Record<StoryTone, string> = {
  urgent: 'border-l-[var(--urgent)]',
  warning: 'border-l-[var(--warning)]',
  info: 'border-l-[var(--info)]',
  neutral: 'border-l-[var(--border)]',
  success: 'border-l-[var(--success)]',
};

export const toneDot: Record<StoryTone, string> = {
  urgent: 'bg-[var(--urgent)]',
  warning: 'bg-[var(--warning)]',
  info: 'bg-[var(--info)]',
  neutral: 'bg-[var(--text-muted)]',
  success: 'bg-[var(--success)]',
};

/** A labelled fact in a definition list. */
export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-2xs font-medium tracking-wide text-text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-xs text-text">{children}</dd>
    </div>
  );
}

/** A quiet well for a sentence that explains the panel above it. */
export function Explainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'rounded-[var(--radius-input)] bg-[var(--surface-muted)] px-3 py-2 text-2xs text-text-muted',
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Section heading inside a tab panel. */
export function SectionTitle({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {hint ? <p className="mt-0.5 text-2xs text-text-muted">{hint}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** The table shell the record tabs share: hairlines, muted header, dense rows. */
export function RecordTable({
  head,
  children,
  caption,
  className,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]',
        className,
      )}
    >
      <table className="w-full min-w-[720px] border-collapse text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--surface-muted)] text-2xs font-medium tracking-wide text-text-muted uppercase">
          {head}
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ className, ...props }: React.ComponentPropsWithoutRef<'th'>) {
  return (
    <th
      scope="col"
      className={cn('border-b border-[var(--border)] px-3 py-2 font-medium', className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.ComponentPropsWithoutRef<'td'>) {
  return (
    <td
      className={cn('border-b border-[var(--border)] px-3 py-2 align-top text-text', className)}
      {...props}
    />
  );
}

/** Monospace identifier, as the raw-record views print it. */
export function RecordId({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-2xs text-text-muted">{children}</span>;
}

export function consentWord(value: 'yes' | 'no' | 'unknown'): string {
  return value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'Not recorded';
}

export const consentTone: Record<'yes' | 'no' | 'unknown', 'success' | 'urgent' | 'neutral'> = {
  yes: 'success',
  no: 'urgent',
  unknown: 'neutral',
};
