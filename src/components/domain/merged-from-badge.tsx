'use client';

import * as React from 'react';
import { Merge, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface MergedFromBadgeProps {
  /** The member IDs folded into this view. */
  mergedFrom: readonly string[];
  /** Undoing identity resolution is always available to the clinician. */
  onUndo?: () => void;
  className?: string;
}

/**
 * Identity resolution is visible and reversible: the view says which IDs it
 * combined and offers an undo.
 */
export function MergedFromBadge({ mergedFrom, onUndo, className }: MergedFromBadgeProps) {
  const text = `Merged from ${mergedFrom.join(' and ')}`;
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Tooltip
        content={
          <span>
            Records from {mergedFrom.join(' and ')} are shown as one person. Undo to see each ID on
            its own.
          </span>
        }
      >
        <Badge tone="info" tabIndex={0} aria-label={text} className="cursor-default">
          <Merge aria-hidden="true" />
          {text}
        </Badge>
      </Tooltip>
      {onUndo ? (
        <Button variant="link" size="sm" onClick={onUndo} className="text-2xs">
          <Undo2 aria-hidden="true" className="size-3.5" />
          Undo merge
        </Button>
      ) : null}
    </span>
  );
}
