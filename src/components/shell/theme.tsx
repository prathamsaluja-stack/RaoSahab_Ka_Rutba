'use client';

import * as React from 'react';
import { Moon, Sun, SunMoon } from 'lucide-react';
import { IconButton } from '@/components/ui';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'caseline.theme';

/**
 * Applied before first paint by the inline script in the root layout, so a
 * pinned dark theme never flashes light. Kept in one place because the script
 * and the toggle have to agree on the key and the attribute.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

const THEME_EVENT = 'caseline:theme-change';

function resolveTheme(): Theme {
  const pinned = document.documentElement.dataset.theme;
  if (pinned === 'light' || pinned === 'dark') return pinned;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener('change', onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

/**
 * Reads the pinned theme, falling back to the operating system preference.
 *
 * The theme lives on the document element rather than in React state: the
 * inline boot script writes it before first paint, so React has to read it
 * from there instead of owning it. On the server it is unknown, which is why
 * the toggle renders a neutral icon until it mounts.
 */
export function useTheme() {
  const theme = React.useSyncExternalStore<Theme | null>(subscribe, resolveTheme, () => null);

  const setTheme = React.useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // A blocked storage API only costs the preference between visits.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, setTheme };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <IconButton
      className={className}
      label={theme ? `Switch to ${next} theme` : 'Switch theme'}
      aria-live="polite"
      onClick={() => setTheme(next)}
    >
      {theme === 'dark' ? <Moon /> : theme === 'light' ? <Sun /> : <SunMoon />}
    </IconButton>
  );
}
