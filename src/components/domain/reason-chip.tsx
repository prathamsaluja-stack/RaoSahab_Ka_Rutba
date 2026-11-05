'use client';

import * as React from 'react';
import { Chip, type Tone } from '@/components/ui/badge';
import { FreshnessMark, type FreshnessSource } from '@/components/domain/freshness-mark';
import { cn } from '@/lib/utils';

export interface ReasonChipProps {
  /** Why this member is in the queue, in the clinician's words. */
  reason: string;
  tone?: Tone;
  /** Freshness of the fact behind the reason. */
  freshness?: FreshnessSource;
  className?: string;
}

/** One reason a member is on today's list, with the age of its evidence. */
export function ReasonChip({ reason, tone = 'neutral', freshness, className }: ReasonChipProps) {
  return (
    <Chip tone={tone} className={cn('max-w-full', className)}>
      <span className="truncate">{reason}</span>
      {freshness ? <FreshnessMark subject={reason} {...freshness} /> : null}
    </Chip>
  );
}
