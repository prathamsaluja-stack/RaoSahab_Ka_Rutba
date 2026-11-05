'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, User } from 'lucide-react';
import { Dialog, Kbd } from '@/components/ui';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { DIRECTORY_MEMBERS, PLANNED_CASELOAD, searchMembers } from '@/lib/member-directory';
import { ALL_NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: 'Members' | 'Go to';
}

const ROUTE_COMMANDS: CommandItem[] = ALL_NAV_ITEMS.map((item) => ({
  id: `route:${item.href}`,
  label: item.label,
  hint: item.description,
  href: item.href,
  group: 'Go to',
}));

const MEMBER_COMMANDS: CommandItem[] = DIRECTORY_MEMBERS.map((member) => ({
  id: `member:${member.id}`,
  label: `${member.name} (fictional)`,
  hint: `${member.id} · ${member.age} ${member.sex} · ${member.program} · ${member.plan}`,
  href: `/members/${member.id}`,
  group: 'Members',
}));

/** Members first: the palette is a way to reach a person, not a menu. */
export function commandsFor(query: string): CommandItem[] {
  const needle = query.trim().toLowerCase();
  const members = searchMembers(query).flatMap((member) => {
    const command = MEMBER_COMMANDS.find((entry) => entry.id === `member:${member.id}`);
    return command ? [command] : [];
  });
  const routes = needle
    ? ROUTE_COMMANDS.filter((command) =>
        `${command.label} ${command.hint} ${command.href}`.toLowerCase().includes(needle),
      )
    : ROUTE_COMMANDS;
  return [...members, ...routes];
}

/**
 * Mounted only while the palette is open, so the query and the highlighted
 * row reset on every open without an effect reaching for setState.
 */
function PaletteBody({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const listId = React.useId();

  const results = React.useMemo(() => commandsFor(query), [query]);
  const active = results[Math.min(activeIndex, results.length - 1)];

  function go(item: CommandItem | undefined) {
    if (!item) return;
    onOpenChange(false);
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length === 0 ? 0 : (index - 1 + results.length) % results.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(active);
    }
  }

  const groups: { name: CommandItem['group']; items: CommandItem[] }[] = [];
  for (const item of results) {
    const last = groups.at(-1);
    if (last && last.name === item.group) last.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content
        aria-label="Search members and screens"
        className="fixed top-24 left-1/2 z-50 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-overlay)]"
      >
        <DialogPrimitive.Title className="sr-only">
          Search members and screens
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          Type to filter. Use the up and down arrows to move, Enter to open, Escape to close.
        </DialogPrimitive.Description>

        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
            aria-label="Search members and screens"
            placeholder="Search members or screens"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            className="h-12 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          />
          <Kbd>Esc</Kbd>
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-label="Results"
          className="max-h-80 overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <li role="presentation" className="px-3 py-6 text-center text-xs text-text-muted">
              Nothing matches &ldquo;{query}&rdquo;.
            </li>
          ) : (
            groups.map((group) => (
              <li key={group.name} role="presentation">
                <p
                  aria-hidden="true"
                  className="px-3 pt-3 pb-1 text-2xs font-medium tracking-wide text-text-muted uppercase"
                >
                  {group.name}
                </p>
                <ul role="group" aria-label={group.name}>
                  {group.items.map((item) => {
                    const isActive = active?.id === item.id;
                    return (
                      <li
                        key={item.id}
                        id={`${listId}-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(results.indexOf(item))}
                        onClick={() => go(item)}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-[var(--radius-input)] px-3 py-2',
                          isActive && 'bg-[var(--brand-soft)]',
                        )}
                      >
                        {item.group === 'Members' ? (
                          <User aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
                        ) : (
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-text-muted"
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-text">{item.label}</span>
                          <span className="block truncate text-2xs text-text-muted">
                            {item.hint}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <p className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-2xs text-text-muted">
          Searching the {DIRECTORY_MEMBERS.length} golden members. The remaining{' '}
          {PLANNED_CASELOAD - DIRECTORY_MEMBERS.length} background members join this list when the
          caseload fixtures land.
        </p>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <PaletteBody onOpenChange={onOpenChange} /> : null}
    </Dialog>
  );
}
