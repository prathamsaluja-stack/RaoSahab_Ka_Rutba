import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-pulse rounded-[var(--radius-input)] bg-[var(--surface-muted)]',
        className,
      )}
      {...props}
    />
  );
}
