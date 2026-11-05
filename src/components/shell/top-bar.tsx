'use client';

import * as React from 'react';
import { Bell, Keyboard, Menu, Search } from 'lucide-react';
import { IconButton, Kbd, Popover, PopoverContent, PopoverTrigger, Select } from '@/components/ui';
import { PROGRAM_FILTERS } from '@/lib/navigation';
import { AsOfChip } from './as-of-chip';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme';
import { UserMenu } from './user-menu';

export interface TopBarProps {
  onOpenPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenDrawer: () => void;
}

export function TopBar({ onOpenPalette, onOpenShortcuts, onOpenDrawer }: TopBarProps) {
  const [program, setProgram] = React.useState<string>('all');

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6">
      <IconButton label="Open navigation" className="lg:hidden" onClick={onOpenDrawer}>
        <Menu />
      </IconButton>

      <div className="min-w-0 flex-1 lg:w-64 lg:flex-none">
        <Breadcrumbs />
      </div>

      <button
        type="button"
        onClick={onOpenPalette}
        className="hidden h-9 max-w-md min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs text-text-muted hover:text-text md:flex"
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search members and screens</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <IconButton
          label="Search members and screens"
          className="md:hidden"
          onClick={onOpenPalette}
        >
          <Search />
        </IconButton>

        <AsOfChip className="hidden md:inline-flex" />

        <Select
          label="Program filter"
          options={PROGRAM_FILTERS}
          value={program}
          onValueChange={setProgram}
          className="hidden lg:block [&>label]:sr-only"
        />

        <ThemeToggle />

        <IconButton
          label="Keyboard shortcuts"
          onClick={onOpenShortcuts}
          className="hidden sm:inline-flex"
        >
          <Keyboard />
        </IconButton>

        <Popover>
          <PopoverTrigger asChild>
            <IconButton label="Notifications">
              <Bell />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent align="end">
            <p className="text-sm font-medium text-text">Notifications</p>
            <p className="mt-1 text-xs text-text-muted">
              Static in this prototype. Discharge alerts, authorization decisions and failed
              outreach would land here; today they are read from the Today queue instead.
            </p>
          </PopoverContent>
        </Popover>

        <UserMenu />
      </div>
    </header>
  );
}
