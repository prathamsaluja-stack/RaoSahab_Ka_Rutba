'use client';

import * as React from 'react';
import { Sheet, SheetContent, ToastProvider } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CommandPalette } from './command-palette';
import { Sidebar, SidebarNav } from './sidebar';
import { ShortcutSheet, useGlobalShortcuts } from './shortcuts';
import { SyntheticDataBanner } from './synthetic-data-banner';
import { TopBar } from './top-bar';

/**
 * The frame every screen sits in: rail, top bar, synthetic-data notice and
 * the two overlays the shortcuts open (section 4.3).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  const openPalette = React.useCallback(() => setPaletteOpen(true), []);
  const openShortcuts = React.useCallback(() => setShortcutsOpen(true), []);
  useGlobalShortcuts({ openPalette, openShortcuts });

  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-[var(--radius-input)] focus:border focus:border-[var(--border)] focus:bg-[var(--surface)] focus:px-3 focus:py-2 focus:text-sm focus:text-text"
        >
          Skip to content
        </a>
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />

        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side="left"
            title="Caseline"
            description="Jump to a screen."
            className="w-[280px] p-0 [&>div:last-child]:px-0 [&>div:last-child]:py-0"
          >
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            'flex min-h-dvh flex-col',
            collapsed ? 'lg:pl-16' : 'lg:pl-16 xl:pl-[248px]',
          )}
        >
          <TopBar
            onOpenPalette={openPalette}
            onOpenShortcuts={openShortcuts}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
          <SyntheticDataBanner />
          <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6 xl:px-8">
            {children}
          </main>
        </div>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <ShortcutSheet open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </div>
    </ToastProvider>
  );
}
