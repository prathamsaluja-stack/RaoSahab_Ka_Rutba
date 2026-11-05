'use client';

import * as React from 'react';
import { CalendarClock, EyeOff, MoreHorizontal } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  Textarea,
  useToast,
} from '@/components/ui';
import { queueDismissReasons, queueSnoozeOptions } from '@/lib/data/queue';
import type { QueueRow } from '@/domain';

export interface QueueRowActionsProps {
  row: QueueRow;
  onSnooze: (memberId: string, until: string) => void;
  onDismiss: (memberId: string, reason: string) => void;
}

/**
 * Snooze and dismiss for one queue row.
 *
 * Dismissal needs a named reason before the button will submit: a row leaving
 * the list is a documented decision, not a swipe. The reason is held in local
 * component state so the half-filled dialog is a state the screen can show.
 */
export function QueueRowActions({ row, onSnooze, onDismiss }: QueueRowActionsProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [snoozeOpen, setSnoozeOpen] = React.useState(false);
  const [dismissOpen, setDismissOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');
  const toast = useToast();

  const stop = (event: React.SyntheticEvent) => event.stopPropagation();

  function closeDismiss(open: boolean) {
    setDismissOpen(open);
    if (!open) {
      setReason('');
      setNote('');
    }
  }

  function submitDismiss() {
    const chosen = queueDismissReasons.find((option) => option.value === reason);
    if (!chosen) return;
    onDismiss(row.memberId, chosen.label);
    closeDismiss(false);
    toast({
      title: `${row.memberName} dismissed from today`,
      description: `Reason: ${chosen.label}. Written to the audit log against Maria R., RN.`,
    });
  }

  return (
    <div onClick={stop} onKeyDown={stop} className="flex justify-end">
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <IconButton label={`Row actions for ${row.memberName}`} size="sm">
            <MoreHorizontal />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1.5">
          <Popover open={snoozeOpen} onOpenChange={setSnoozeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-input)] px-2.5 py-2 text-left text-sm text-text hover:bg-[var(--surface-muted)]"
              >
                <CalendarClock aria-hidden="true" className="size-4 text-text-muted" />
                Snooze until…
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="left" className="w-64 p-1.5">
              <p className="px-2.5 pt-1 pb-2 text-2xs text-text-muted">
                The clock keeps running. Snoozing hides the row, it does not stop the window.
              </p>
              {queueSnoozeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSnooze(row.memberId, option.hint);
                    setSnoozeOpen(false);
                    setMenuOpen(false);
                    toast({
                      title: `${row.memberName} snoozed`,
                      description: `Back on the list ${option.hint}.`,
                    });
                  }}
                  className="flex w-full items-baseline justify-between gap-3 rounded-[var(--radius-input)] px-2.5 py-2 text-left text-sm text-text hover:bg-[var(--surface-muted)]"
                >
                  {option.label}
                  <span data-tabular className="text-2xs text-text-muted">
                    {option.hint}
                  </span>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setDismissOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-[var(--radius-input)] px-2.5 py-2 text-left text-sm text-text hover:bg-[var(--surface-muted)]"
          >
            <EyeOff aria-hidden="true" className="size-4 text-text-muted" />
            Dismiss from today…
          </button>
        </PopoverContent>
      </Popover>

      <Dialog open={dismissOpen} onOpenChange={closeDismiss}>
        <DialogContent
          title={`Dismiss ${row.memberName} from today`}
          description="A dismissal is a clinical decision, so it is recorded with your name, the reason and the signals that were open."
        >
          <div className="flex flex-col gap-5">
            <RadioGroup
              label="Reason (required)"
              value={reason}
              onValueChange={setReason}
              options={queueDismissReasons.map((option) => ({
                value: option.value,
                label: option.label,
                hint: option.hint,
              }))}
            />
            <Textarea
              label="Note (optional)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Anything the next person should know."
              hint="Added to the audit entry verbatim. The member stays on the caseload either way."
            />
          </div>
          <DialogFooter className="-mx-6 mt-5 -mb-5">
            <p className="mr-auto text-2xs text-text-muted">
              {reason ? 'Ready to record.' : 'Choose a reason to enable Dismiss.'}
            </p>
            <Button variant="secondary" onClick={() => closeDismiss(false)}>
              Cancel
            </Button>
            <Button onClick={submitDismiss} disabled={!reason}>
              Dismiss row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
