'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, Stethoscope } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { APP_NAME } from '@/lib/app-config';
import { isActiveRoute, NAV_SECTIONS, NAV_STUBS, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';

/**
 * How a label behaves in the rail: always visible in the drawer, never in a
 * collapsed rail, and from 1280px up in an expanded one (section 4.3).
 */
export type LabelVisibility = 'always' | 'never' | 'wide-only';

const LABEL_CLASS: Record<LabelVisibility, string> = {
  always: '',
  never: 'sr-only',
  'wide-only': 'sr-only xl:not-sr-only',
};

function NavLink({
  item,
  labels,
  active,
  onNavigate,
}: {
  item: NavItem;
  labels: LabelVisibility;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        title={labels === 'never' ? item.label : undefined}
        className={cn(
          'relative flex h-9 items-center gap-3 rounded-[var(--radius-input)] px-3 text-sm transition-colors',
          active
            ? 'bg-[var(--brand-soft)] font-medium text-[var(--brand)]'
            : 'text-text-muted hover:bg-[var(--surface-muted)] hover:text-text',
        )}
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 -left-0.5 w-0.5 rounded-full bg-[var(--brand)]"
          />
        ) : null}
        <Icon aria-hidden="true" className="size-[18px] shrink-0" />
        <span className={cn('truncate', LABEL_CLASS[labels])}>{item.label}</span>
        {item.muted ? <span className="sr-only">(not in this prototype)</span> : null}
      </Link>
    </li>
  );
}

export function SidebarNav({
  labels = 'always',
  onNavigate,
}: {
  labels?: LabelVisibility;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.id} className="flex flex-col gap-1">
          <h2
            className={cn(
              'px-3 pb-1 text-2xs font-medium tracking-wide text-text-muted uppercase',
              LABEL_CLASS[labels],
            )}
          >
            {section.label}
          </h2>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                labels={labels}
                active={isActiveRoute(pathname, item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--border)] pt-4">
        <ul className="flex flex-col gap-0.5">
          {NAV_STUBS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              labels={labels}
              active={isActiveRoute(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function AppMark({ labels = 'always' }: { labels?: LabelVisibility }) {
  return (
    <Link
      href="/today"
      className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-4 text-text"
    >
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--brand)] text-[var(--on-accent)]"
      >
        <Stethoscope className="size-4" />
      </span>
      <span className={cn('text-base font-semibold', LABEL_CLASS[labels])}>{APP_NAME}</span>
    </Link>
  );
}

/**
 * The fixed rail: 248px wide on a full desktop, 64px between 1024px and
 * 1279px, hidden below 1024px where the top bar offers it as a drawer.
 */
export function Sidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const labels: LabelVisibility = collapsed ? 'never' : 'wide-only';

  return (
    <aside
      data-testid="sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] lg:flex',
        collapsed ? 'w-16' : 'w-16 xl:w-[248px]',
      )}
    >
      <AppMark labels={labels} />
      <SidebarNav labels={labels} />
      <div className="hidden shrink-0 border-t border-[var(--border)] p-2 xl:block">
        <IconButton
          label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </IconButton>
      </div>
    </aside>
  );
}
