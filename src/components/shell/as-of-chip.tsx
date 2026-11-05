'use client';

import { CalendarClock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { Chip, Tooltip } from '@/components/ui';
import { AS_OF, TIMEZONE } from '@/lib/app-config';
import { cn } from '@/lib/utils';

/** "Mon 9 Nov, 08:00 ET" — the one clock every screen is read against. */
export const AS_OF_LABEL = formatInTimeZone(new Date(AS_OF), TIMEZONE, "EEE d MMM, HH:mm 'ET'");

export function AsOfChip({ className }: { className?: string }) {
  return (
    <Tooltip
      content={
        <span className="flex flex-col gap-1">
          <span>
            Every clock, age and freshness mark on these screens is measured from this moment, not
            from your computer&rsquo;s clock.
          </span>
          <span className="font-mono">{AS_OF}</span>
        </span>
      }
    >
      <Chip tone="neutral" data-tabular tabIndex={0} className={cn('whitespace-nowrap', className)}>
        <CalendarClock aria-hidden="true" />
        <span>
          Data as of <time dateTime={AS_OF}>{AS_OF_LABEL}</time>
        </span>
      </Chip>
    </Tooltip>
  );
}
