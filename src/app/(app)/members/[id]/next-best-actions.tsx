'use client';

import * as React from 'react';
import {
  Check,
  ClipboardList,
  Clock4,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  Textarea,
  Tooltip,
} from '@/components/ui';
import { ConfidenceLabel, SourceChip } from '@/components/domain';
import { queueDismissReasons, queueSnoozeOptions } from '@/lib/data/queue';
import type { FiredSignal, SuggestedAction } from '@/domain';
import { cn } from '@/lib/utils';

const channelIcons: Record<SuggestedAction['channel'], LucideIcon> = {
  call: Phone,
  text: MessageSquare,
  letter: Mail,
  portal: Globe,
  coordinate: Users,
  review: ClipboardList,
};

interface ActionItem {
  key: string;
  signal: FiredSignal;
  action: SuggestedAction;
}

type ActionState =
  | { kind: 'open' }
  | { kind: 'confirmed' }
  | { kind: 'snoozed'; label: string }
  | { kind: 'dismissed'; reason: string };

function DismissDialog({ onDismiss }: { onDismiss: (reason: string) => void }) {
  const [reason, setReason] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const chosen = queueDismissReasons.find((option) => option.value === reason);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <X aria-hidden="true" />
          Dismiss
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Dismiss this suggestion"
        description="A dismissal is a record. It needs a reason before it can be saved."
      >
        <div className="flex flex-col gap-4">
          <RadioGroup
            label="Why is this not the right thing to do?"
            options={queueDismissReasons}
            value={reason}
            onValueChange={setReason}
          />
          <Textarea
            label="Note for the audit log (optional)"
            rows={3}
            placeholder="Anything the next person reading this record should know."
          />
        </div>
        <DialogFooter className="-mx-6 mt-5 -mb-5">
          <DialogClose asChild>
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            disabled={!chosen}
            onClick={() => {
              if (!chosen) return;
              onDismiss(chosen.label);
              setOpen(false);
            }}
          >
            Dismiss with reason
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionRow({ item }: { item: ActionItem }) {
  const [state, setState] = React.useState<ActionState>({ kind: 'open' });
  const Icon = channelIcons[item.action.channel];

  return (
    <li className="px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{item.signal.id}</Badge>
            <span className="text-2xs font-medium text-text-muted">{item.signal.name}</span>
            <Badge tone="warning" data-tabular>
              {item.signal.value}
            </Badge>
          </div>
          <p className="mt-1.5 text-xs font-medium text-text">{item.action.label}</p>
          <p className="mt-1 max-w-prose text-2xs text-text-muted">{item.action.rationale}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Tooltip content={<span>{item.action.rationale}</span>}>
            <Button variant="secondary" size="sm" tabIndex={0}>
              <Icon aria-hidden="true" />
              {item.action.shortLabel}
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">
          <Clock4 aria-hidden="true" />
          {item.action.window}
        </Badge>
        <Tooltip content={<span>{item.signal.confidenceReason}</span>}>
          <span tabIndex={0}>
            <ConfidenceLabel confidence={item.signal.confidence} />
          </span>
        </Tooltip>
        {item.signal.inputs.slice(0, 3).map((input) => (
          <SourceChip
            key={`${input.sourceRecordId}-${input.label}`}
            source={input.source}
            recordId={input.sourceRecordId}
            eventTime={input.eventTime}
            receivedTime={input.receivedTime}
          />
        ))}
        {item.signal.inputs.length > 3 ? (
          <Tooltip
            content={
              <span className="block whitespace-pre-line">
                {item.signal.inputs
                  .slice(3)
                  .map((input) => `• ${input.label}`)
                  .join('\n')}
              </span>
            }
          >
            <Badge tone="neutral" tabIndex={0} className="cursor-default">
              +{item.signal.inputs.length - 3} more records
            </Badge>
          </Tooltip>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {state.kind === 'open' ? (
          <>
            <Button size="sm" onClick={() => setState({ kind: 'confirmed' })}>
              <Check aria-hidden="true" />
              Confirm
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Clock4 aria-hidden="true" />
                  Snooze
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <p className="text-xs font-medium text-text">Snooze this suggestion until</p>
                <ul className="mt-2 flex flex-col">
                  {queueSnoozeOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => setState({ kind: 'snoozed', label: option.hint })}
                        className="w-full rounded-[var(--radius-input)] px-2 py-1.5 text-left hover:bg-[var(--surface-muted)]"
                      >
                        <span className="block text-xs text-text">{option.label}</span>
                        <span data-tabular className="block text-2xs text-text-muted">
                          {option.hint}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <DismissDialog onDismiss={(reason) => setState({ kind: 'dismissed', reason })} />
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                state.kind === 'confirmed'
                  ? 'success'
                  : state.kind === 'snoozed'
                    ? 'info'
                    : 'neutral'
              }
            >
              {state.kind === 'confirmed'
                ? 'Confirmed by Maria R., RN'
                : state.kind === 'snoozed'
                  ? `Snoozed until ${state.label}`
                  : `Dismissed: ${state.reason}`}
            </Badge>
            <Button
              variant="link"
              size="sm"
              className="text-2xs"
              onClick={() => setState({ kind: 'open' })}
            >
              Undo
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Next best actions.
 *
 * Every suggestion carries the signal it came from, the records behind that
 * signal and a word for how much weight it can take. Nothing acts on its own:
 * confirm, snooze or dismiss with a reason, and the dismissal is a record too.
 */
export function NextBestActions({
  signals,
  className,
}: {
  signals: readonly FiredSignal[];
  className?: string;
}) {
  const items: ActionItem[] = signals.flatMap((signal) =>
    signal.actions.map((action, index) => ({
      key: `${signal.id}-${index}`,
      signal,
      action,
    })),
  );

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader
        title="Next best actions"
        subtitle={`${items.length} suggestions from ${signals.length} signals that fired this morning`}
        actions={<Badge tone="neutral">Draft · a clinician confirms</Badge>}
      />
      <CardBody className="flex-1 px-0 py-0">
        <ol className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <ActionRow key={item.key} item={item} />
          ))}
        </ol>
      </CardBody>
      <CardFooter>
        Nothing on this list writes to the record. A named clinician confirms each one, and the
        confirmation, the snooze and the dismissal all land in the audit log with their reason.
      </CardFooter>
    </Card>
  );
}
