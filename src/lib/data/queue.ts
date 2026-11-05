import queueJson from '@data/queue/queue.json';
import { queueSchema, type QueueRow, type QueueTab } from '@/domain';

/**
 * The Today queue, exactly as the screen shows it at 08:00 on Mon 9 Nov.
 *
 * The ordering, the clock readings and the tab counts are committed data, not
 * a computation: the prototype has to read the same on every machine on every
 * day, and the deck shows these numbers.
 */

export const queue = queueSchema.parse(queueJson);

export const queueRows: readonly QueueRow[] = queue.rows;

export const queueTabs = queue.tabs;

export function rowsForTab(tab: QueueTab | 'all'): readonly QueueRow[] {
  if (tab === 'all') return queueRows;
  return queueRows.filter((row) => row.tab === tab);
}

export function queueRowFor(memberId: string): QueueRow | undefined {
  return queueRows.find((row) => row.memberId === memberId);
}

/** The six discharge alerts that arrived over the weekend. */
export const dischargeAlerts = queue.dischargeAlerts;
