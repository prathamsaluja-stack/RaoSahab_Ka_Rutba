'use client';

import { ChevronDown } from 'lucide-react';
import { Avatar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { cn } from '@/lib/utils';

export const CURRENT_USER = {
  name: 'Maria R., RN',
  role: 'Case manager · Complex care team',
} as const;

/**
 * Static in the prototype. It is here because every clinical action in this
 * product is attributed to a named clinician, and the shell should show whose
 * name would be on it.
 */
export function UserMenu({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'flex h-9 items-center gap-2 rounded-[var(--radius-input)] border border-transparent px-1.5 text-sm text-text hover:bg-[var(--surface-muted)]',
          className,
        )}
      >
        <Avatar name={CURRENT_USER.name} size="sm" />
        <span className="sr-only">User menu for</span>
        <span className="hidden xl:inline">{CURRENT_USER.name}</span>
        <span className="sr-only xl:hidden">{CURRENT_USER.name}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-text-muted" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <p className="text-sm font-medium text-text">{CURRENT_USER.name}</p>
        <p className="mt-1 text-xs text-text-muted">{CURRENT_USER.role}</p>
        <p className="mt-3 border-t border-[var(--border)] pt-3 text-2xs text-text-muted">
          Signing a note in this prototype records this name and the pinned date. Nothing leaves
          your browser.
        </p>
      </PopoverContent>
    </Popover>
  );
}
