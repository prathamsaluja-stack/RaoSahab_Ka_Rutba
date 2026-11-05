import * as React from 'react';
import { cn } from '@/lib/utils';

/** A keyboard key. Shortcut sheets pair these with a written action. */
export function Kbd({ className, ...props }: React.ComponentPropsWithoutRef<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 font-mono text-2xs text-text-muted',
        className,
      )}
      {...props}
    />
  );
}
