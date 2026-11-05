import signalsJson from '@data/signals/signals.json';
import { signalsFileSchema, type FiredSignal, type SignalDefinition } from '@/domain';

/**
 * Signals S1-S10 as they stand at 08:00 on Mon 9 Nov.
 *
 * The catalog is every rule, including the ones that did not fire, because a
 * screen that only shows hits cannot tell you what was looked at. `fired` is
 * what actually fired for the five golden members, with the records behind
 * each one so any claim on screen can be followed back to its source.
 */

export const signals = signalsFileSchema.parse(signalsJson);

export const signalCatalog: readonly SignalDefinition[] = signals.catalog;

export const firedSignals: readonly FiredSignal[] = signals.fired;

export function signalsFor(memberId: string): readonly FiredSignal[] {
  return firedSignals.filter((signal) => signal.memberId === memberId);
}

export function signalDefinition(id: string): SignalDefinition | undefined {
  return signalCatalog.find((entry) => entry.id === id);
}
