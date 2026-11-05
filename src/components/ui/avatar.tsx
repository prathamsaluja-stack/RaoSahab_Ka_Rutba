import * as React from 'react';
import { cn } from '@/lib/utils';

/** Initials from a display name. No photos of people anywhere in Caseline. */
export function initialsFor(name: string): string {
  const parts = name
    .replace(/\(fictional\)/gi, '')
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export interface AvatarProps extends React.ComponentPropsWithoutRef<'span'> {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, size = 'md', className, ...props }: AvatarProps) {
  const sizes = { sm: 'size-6 text-2xs', md: 'size-8 text-xs', lg: 'size-10 text-sm' } as const;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] font-semibold text-[var(--brand)]',
        sizes[size],
        className,
      )}
      {...props}
    >
      {initialsFor(name)}
    </span>
  );
}
