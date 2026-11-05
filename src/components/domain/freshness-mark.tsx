'use client';

import * as React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { describeFreshness, type FreshnessInput, type FreshnessLevel } from '@/lib/freshness';
import { cn } from '@/lib/utils';

const levelTone: Record<FreshnessLevel, string> = {
  filled: 'text-[var(--success)]',
  half: 'text-[var(--warning)]',
  open: 'text-[var(--text-muted)]',
};

function MarkGlyph({ level }: { level: FreshnessLevel }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {level === 'filled' ? <circle cx="8" cy="8" r="6" fill="currentColor" /> : null}
      {level === 'half' ? <path d="M8 2 A6 6 0 0 1 8 14 Z" fill="currentColor" /> : null}
    </svg>
  );
}

/**
 * Freshness the record states outright, for screens whose readings are
 * committed data rather than something derived at render time.
 */
export interface StatedFreshness {
  level: FreshnessLevel;
  /** Two or three words, e.g. "Sources disagree". */
  label: string;
  /** The sentence behind the mark, shown on hover. */
  description?: string;
}

export type FreshnessSource = FreshnessInput | StatedFreshness;

export type FreshnessMarkProps = FreshnessSource & {
  /** What the mark is about, e.g. "Discharge medication list". */
  subject?: string;
  /** Show the short label next to the glyph. */
  showLabel?: boolean;
  className?: string;
};

function resolveFreshness(source: FreshnessSource) {
  if ('level' in source) {
    return {
      level: source.level,
      label: source.label,
      description: source.description ?? source.label,
    };
  }
  return describeFreshness(source);
}

/**
 * Filled, half or open: how much weight a fact can carry right now.
 * The glyph is never the only signal; the label and tooltip say it in words.
 */
export function FreshnessMark({
  subject,
  showLabel = false,
  className,
  ...input
}: FreshnessMarkProps) {
  const freshness = resolveFreshness(input as FreshnessSource);
  const accessibleLabel = subject
    ? `${subject}. Freshness: ${freshness.label}. ${freshness.description}`
    : `Freshness: ${freshness.label}. ${freshness.description}`;

  return (
    <Tooltip content={<span>{accessibleLabel}</span>}>
      <span
        role="img"
        aria-label={accessibleLabel}
        tabIndex={0}
        data-level={freshness.level}
        className={cn(
          'inline-flex items-center gap-1 rounded-[var(--radius-input)] text-2xs',
          levelTone[freshness.level],
          className,
        )}
      >
        <MarkGlyph level={freshness.level} />
        {showLabel ? <span className="font-medium">{freshness.label}</span> : null}
      </span>
    </Tooltip>
  );
}
