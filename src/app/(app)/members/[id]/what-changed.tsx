'use client';

import * as React from 'react';
import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { FreshnessMark, SourceChip } from '@/components/domain';
import { formatInstant } from '@/lib/time';
import { changeWindowLabel } from '@/lib/data/member-story';
import type { ChangeEntry } from '@/domain';
import { cn } from '@/lib/utils';
import { toneBorder, toneDot } from './story-parts';

/**
 * What changed in the last 72 hours.
 *
 * Each line names the record that changed, when it happened and when the plan
 * received it, because the two are not the same and the difference is usually
 * the story.
 */
export function WhatChanged({ entries }: { entries: readonly ChangeEntry[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="What changed (72 h)"
        subtitle={`${changeWindowLabel} · ${entries.length} records`}
        actions={<Badge tone="neutral">Clinical time, then received time</Badge>}
      />
      <CardBody className="flex-1 px-0 py-0">
        <ol className="divide-y divide-[var(--border)]">
          {entries.map((entry) => (
            <li key={entry.id} className={cn('border-l-2 px-6 py-3.5', toneBorder[entry.tone])}>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('size-1.5 rounded-full', toneDot[entry.tone])}
                />
                <time dateTime={entry.at} data-tabular className="text-2xs text-text-muted">
                  {formatInstant(entry.at)}
                </time>
                <FreshnessMark
                  level={entry.freshness.level}
                  label={entry.freshness.label}
                  description={entry.freshness.description}
                  subject={entry.title}
                  showLabel
                />
              </div>
              <p className="mt-1 text-xs font-medium text-text">{entry.title}</p>
              <p className="mt-1 max-w-prose text-2xs text-text-muted">{entry.detail}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <SourceChip
                  source={entry.source}
                  recordId={entry.sourceRecordId}
                  receivedTime={entry.receivedLabel}
                />
                <span className="text-2xs text-text-muted">{entry.receivedLabel}</span>
              </div>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}
