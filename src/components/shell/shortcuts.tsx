'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, Kbd } from '@/components/ui';

export interface Shortcut {
  keys: string[];
  /** Written out, because a key cap on its own is not an instruction. */
  action: string;
  group: 'Navigate' | 'Find' | 'In a list';
}

export const SHORTCUTS: Shortcut[] = [
  { keys: ['g', 't'], action: 'Go to Today', group: 'Navigate' },
  { keys: ['g', 'm'], action: 'Go to Members', group: 'Navigate' },
  { keys: ['⌘', 'K'], action: 'Open the search palette', group: 'Find' },
  { keys: ['/'], action: 'Open the search palette', group: 'Find' },
  { keys: ['?'], action: 'Show this list', group: 'Find' },
  { keys: ['j'], action: 'Move down a row', group: 'In a list' },
  { keys: ['k'], action: 'Move up a row', group: 'In a list' },
  { keys: ['Enter'], action: 'Open the focused row', group: 'In a list' },
  { keys: ['Esc'], action: 'Close the palette or dialog', group: 'In a list' },
];

const GROUPS: Shortcut['group'][] = ['Navigate', 'Find', 'In a list'];

/** True when the keystroke belongs to whatever the user is typing in. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export interface GlobalShortcutHandlers {
  openPalette: () => void;
  openShortcuts: () => void;
}

/**
 * The shortcuts from section 5 that are global to the shell. Row movement
 * (`j`, `k`, `Enter`) is owned by whichever list has focus, so it lives in
 * `useRowNavigation` instead.
 */
export function useGlobalShortcuts({ openPalette, openShortcuts }: GlobalShortcutHandlers) {
  const router = useRouter();
  const pendingG = React.useRef(false);
  const pendingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    function clearPending() {
      pendingG.current = false;
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === 'k') {
          event.preventDefault();
          clearPending();
          openPalette();
        }
        return;
      }
      if (event.altKey || isTypingTarget(event.target)) return;

      if (pendingG.current) {
        const key = event.key.toLowerCase();
        if (key === 't' || key === 'm') {
          event.preventDefault();
          clearPending();
          router.push(key === 't' ? '/today' : '/members');
          return;
        }
        clearPending();
      }

      if (event.key === 'g') {
        pendingG.current = true;
        pendingTimer.current = setTimeout(clearPending, 1500);
        return;
      }
      if (event.key === '/') {
        event.preventDefault();
        openPalette();
        return;
      }
      if (event.key === '?') {
        event.preventDefault();
        openShortcuts();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearPending();
    };
  }, [openPalette, openShortcuts, router]);
}

export function ShortcutSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Keyboard shortcuts"
        description="Every shortcut also has a control on screen; none of them is the only way to do the thing."
      >
        <div className="flex flex-col gap-5">
          {GROUPS.map((group) => (
            <div key={group}>
              <h3 className="text-2xs font-medium tracking-wide text-text-muted uppercase">
                {group}
              </h3>
              <ul className="mt-2 flex flex-col gap-2">
                {SHORTCUTS.filter((shortcut) => shortcut.group === group).map((shortcut) => (
                  <li
                    key={`${group}-${shortcut.keys.join('')}-${shortcut.action}`}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span>{shortcut.action}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
