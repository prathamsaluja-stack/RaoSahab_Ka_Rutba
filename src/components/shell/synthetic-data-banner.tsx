'use client';

import * as React from 'react';
import { FlaskConical, X } from 'lucide-react';
import { IconButton } from '@/components/ui';

const STORAGE_KEY = 'caseline.synthetic-banner-dismissed';
const DISMISS_EVENT = 'caseline:synthetic-banner';

function subscribe(onChange: () => void) {
  window.addEventListener(DISMISS_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(DISMISS_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // Storage being unavailable just means the banner stays.
    return false;
  }
}

/**
 * Rule 2.1.4: the shell always states that the data is fake. It is dismissible
 * so it does not sit in every screenshot, and the statement is repeated on
 * /about-data and in each Member Story header, so dismissing it cannot hide
 * the fact.
 */
export function SyntheticDataBanner() {
  const dismissed = React.useSyncExternalStore(subscribe, isDismissed, () => false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--info)_10%,var(--surface))] px-4 py-2 text-xs text-text lg:px-8"
    >
      <FlaskConical aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--info)]" />
      <p className="flex-1">
        All members and records are fictional. This prototype uses synthetic data only; no real
        patient information appears anywhere in it.
      </p>
      <IconButton
        size="sm"
        label="Dismiss the synthetic data notice"
        onClick={() => {
          try {
            localStorage.setItem(STORAGE_KEY, 'true');
          } catch {
            // Nothing to recover from; the banner simply returns next visit.
          }
          window.dispatchEvent(new Event(DISMISS_EVENT));
        }}
      >
        <X />
      </IconButton>
    </div>
  );
}
