'use client';

import * as React from 'react';
import { GitCompareArrows } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ConflictBadgeProps {
  /** Plain-language statement of what disagrees, with both values. */
  reason: string;
  className?: string;
}

/**
 * Two sources disagree. Caseline shows both and merges neither; resolving a
 * conflict is the clinician's act.
 */
export function ConflictBadge({ reason, className }: ConflictBadgeProps) {
  return (
    <Tooltip content={<span>{reason}</span>}>
      <Badge
        tone="warning"
        tabIndex={0}
        aria-label={`Conflict: ${reason}`}
        className={cn('cursor-default', className)}
      >
        <GitCompareArrows aria-hidden="true" />
        Conflict
      </Badge>
    </Tooltip>
  );
}
