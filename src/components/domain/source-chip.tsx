'use client';

import * as React from 'react';
import { Database } from 'lucide-react';
import { Chip } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/** Feeds the plan receives. Task 4 derives the domain union from this list. */
export const SOURCE_LABELS = {
  eligibility: 'Eligibility',
  adt: 'ADT',
  pbm: 'PBM',
  claims: 'Claims',
  ccd: 'CCD',
  labs: 'Labs',
  um: 'UM',
  contact: 'Contact history',
  hra: 'HRA',
  risk: 'Risk model',
  measures: 'Quality measures',
  directory: 'Provider directory',
  appointments: 'Appointments',
  cm_record: 'CM record',
} as const;

export type SourceSystem = keyof typeof SOURCE_LABELS;

export interface SourceChipProps {
  source: SourceSystem;
  /** The record this fact came from, shown in monospace. */
  recordId?: string;
  /** When it happened clinically (ISO or already formatted). */
  eventTime?: string;
  /** When the plan received it. */
  receivedTime?: string;
  className?: string;
}

/** Names the feed a fact came from. Facts without a source are not shown. */
export function SourceChip({
  source,
  recordId,
  eventTime,
  receivedTime,
  className,
}: SourceChipProps) {
  const details = [
    `Source: ${SOURCE_LABELS[source]}`,
    recordId ? `Record ${recordId}` : null,
    eventTime ? `Event ${eventTime}` : null,
    receivedTime ? `Received ${receivedTime}` : null,
  ].filter(Boolean) as string[];

  return (
    <Tooltip content={<span className="block whitespace-pre-line">{details.join('\n')}</span>}>
      <Chip
        tone="info"
        tabIndex={0}
        aria-label={details.join('. ')}
        className={cn('font-medium', className)}
      >
        <Database aria-hidden="true" />
        {SOURCE_LABELS[source]}
        {recordId ? <span className="font-mono text-2xs opacity-80">{recordId}</span> : null}
      </Chip>
    </Tooltip>
  );
}
