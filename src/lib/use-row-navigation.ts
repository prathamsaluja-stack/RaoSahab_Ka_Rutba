'use client';

import * as React from 'react';

/** Rows opt in by carrying this attribute and being focusable. */
export const ROW_ATTRIBUTE = 'data-row-nav';

function rowsIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(`[${ROW_ATTRIBUTE}]`));
}

/**
 * `j` and `k` move between rows and `Enter` opens the focused one (section 5).
 *
 * The handler is returned rather than bound to the document so two lists on
 * one page cannot fight over the same keystroke: only the list that holds
 * focus reacts.
 */
export function useRowNavigation<T extends HTMLElement = HTMLElement>() {
  const containerRef = React.useRef<T>(null);

  const onKeyDown = React.useCallback((event: React.KeyboardEvent<T>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const container = containerRef.current;
    if (!container) return;
    if (event.key !== 'j' && event.key !== 'k') return;

    const rows = rowsIn(container);
    if (rows.length === 0) return;

    const current = rows.findIndex(
      (row) => row === document.activeElement || row.contains(document.activeElement),
    );
    const delta = event.key === 'j' ? 1 : -1;
    const nextIndex =
      current === -1
        ? event.key === 'j'
          ? 0
          : rows.length - 1
        : (current + delta + rows.length) % rows.length;

    event.preventDefault();
    rows[nextIndex]?.focus();
  }, []);

  return { containerRef, onKeyDown };
}
