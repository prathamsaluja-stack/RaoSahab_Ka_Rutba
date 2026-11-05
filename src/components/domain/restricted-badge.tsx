'use client';

import * as React from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface RestrictedBadgeProps {
  /** The rule that restricts the record. */
  basis?: string;
  className?: string;
}

/**
 * A record exists but may not be displayed. The badge says so; the space is
 * never left blank, which would read as "nothing here".
 */
export function RestrictedBadge({ basis = '42 CFR Part 2', className }: RestrictedBadgeProps) {
  const text = `Restricted record. Not displayed under ${basis}. A record exists.`;
  return (
    <Tooltip content={<span>{text}</span>}>
      <Badge
        tone="neutral"
        tabIndex={0}
        aria-label={text}
        className={cn('cursor-default', className)}
      >
        <Lock aria-hidden="true" />
        Restricted
      </Badge>
    </Tooltip>
  );
}
