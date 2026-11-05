'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlarmClock,
  CalendarClock,
  ClipboardList,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  PhoneOff,
  Pill,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Kbd,
  StatCard,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
} from '@/components/ui';
import { ClockPill, FreshnessMark } from '@/components/domain';
import { queueStatCards, queueTabs, queueRows } from '@/lib/data/queue';
import { ROW_ATTRIBUTE, useRowNavigation } from '@/lib/use-row-navigation';
import { cn } from '@/lib/utils';
import type { QueueRow, ReasonChip as ReasonChipData, SuggestedAction } from '@/domain';
import { QueueFooter } from './queue-footer';
import { QueueRowActions } from './queue-row-actions';

const MAX_REASON_CHIPS = 3;

const statCardIcons: Record<string, LucideIcon> = {
  due_today: AlarmClock,
  windows_closing: CalendarClock,
  med_conflicts: Pill,
  unverified_number: PhoneOff,
};

const channelIcons: Record<SuggestedAction['channel'], LucideIcon> = {
  call: Phone,
  text: MessageSquare,
  letter: Mail,
  portal: Globe,
  coordinate: Users,
  review: ClipboardList,
};

const clockUrgency = { ok: 'upcoming', due_soon: 'soon', overdue: 'overdue' } as const;

interface DismissalRecord {
  memberId: string;
  reason: string;
}

function ReasonChips({ row }: { row: QueueRow }) {
  const shown = row.reasons.slice(0, MAX_REASON_CHIPS);
  const rest = row.reasons.slice(MAX_REASON_CHIPS);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((reason) => (
        <ReasonChipCell key={reason.label} reason={reason} />
      ))}
      {rest.length > 0 ? (
        <Tooltip
          content={
            <span className="block whitespace-pre-line">
              {rest.map((reason) => `• ${reason.label}`).join('\n')}
            </span>
          }
        >
          <Chip tabIndex={0} aria-label={`${rest.length} more reasons`} className="font-medium">
            +{rest.length}
          </Chip>
        </Tooltip>
      ) : null}
    </div>
  );
}

function ReasonChipCell({ reason }: { reason: ReasonChipData }) {
  return (
    <Tooltip
      content={
        <span className="block">
          <span className="block font-medium">{reason.label}</span>
          <span className="mt-1 block">{reason.detail}</span>
          <span className="mt-1 block text-text-muted">{reason.sourceLabel}</span>
        </span>
      }
    >
      <Chip tabIndex={0} className="max-w-full">
        <span className="truncate">{reason.label}</span>
        <FreshnessMark
          level={reason.freshness}
          label={reason.freshnessLabel}
          description={`${reason.freshnessLabel}. ${reason.sourceLabel}`}
          subject={reason.label}
        />
      </Chip>
    </Tooltip>
  );
}

/**
 * Today: whom to work on, in what order, and why.
 *
 * Every row carries its reason, its clock and the next thing to do. The plan's
 * risk score is not a column here; it rides along as a dated note behind the
 * member's name and breaks ties and nothing else.
 */
export function TodayQueue() {
  const router = useRouter();
  const [tab, setTab] = React.useState<string>('due_today');
  const [cardFilter, setCardFilter] = React.useState<string | null>(null);
  const [dismissed, setDismissed] = React.useState<DismissalRecord[]>([]);
  const [snoozed, setSnoozed] = React.useState<string[]>([]);
  const [hideDismissed, setHideDismissed] = React.useState(true);
  const { containerRef, onKeyDown } = useRowNavigation<HTMLDivElement>();

  const activeCard = queueStatCards.find((card) => card.id === cardFilter) ?? null;

  const rows = React.useMemo(() => {
    let result: readonly QueueRow[] = queueRows;

    if (activeCard) {
      result = activeCard.tab
        ? result.filter((row) => row.tab === activeCard.tab)
        : result.filter((row) => activeCard.memberIds.includes(row.memberId));
    } else if (tab !== 'all') {
      result = result.filter((row) => row.tab === tab);
    }

    if (hideDismissed) {
      const ids = new Set(dismissed.map((record) => record.memberId));
      result = result.filter((row) => !ids.has(row.memberId));
    }
    return result;
  }, [activeCard, tab, hideDismissed, dismissed]);

  const dismissedIds = new Set(dismissed.map((record) => record.memberId));
  const snoozedIds = new Set(snoozed);

  function openMember(row: QueueRow) {
    router.push(`/members/${row.memberId}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {queueStatCards.map((card) => {
          const Icon = statCardIcons[card.id] ?? AlarmClock;
          const selected = cardFilter === card.id;
          return (
            <StatCard
              key={card.id}
              label={card.label}
              value={card.value}
              hint={card.hint}
              selected={selected}
              icon={<Icon aria-hidden="true" className="size-4" />}
              onClick={() => setCardFilter(selected ? null : card.id)}
            />
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 pt-4">
          <Tabs value={activeCard ? '' : tab} onValueChange={setTab}>
            <TabsList className="border-b-0">
              {queueTabs.map((entry) => (
                <Tooltip key={entry.id} content={<span>{entry.description}</span>}>
                  <TabsTrigger value={entry.id} disabled={Boolean(activeCard)}>
                    {entry.label}
                    <span
                      data-tabular
                      className="ml-1.5 rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-2xs font-medium text-text-muted"
                    >
                      {entry.count}
                    </span>
                  </TabsTrigger>
                </Tooltip>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 pb-2">
            {activeCard ? (
              <Button variant="secondary" size="sm" onClick={() => setCardFilter(null)}>
                <X aria-hidden="true" />
                Filtered by “{activeCard.label}”
              </Button>
            ) : (
              <p className="hidden text-2xs text-text-muted lg:block">
                <Kbd>j</Kbd> <Kbd>k</Kbd> move, <Kbd>Enter</Kbd> opens the member story
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--border)]" />

        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Nothing in this view"
              description="Every row here has been dismissed or snoozed. Clear the filter, or untick “Hide dismissed” below to see what left the list and why."
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            onKeyDown={onKeyDown}
            className="max-h-[36rem] overflow-auto"
            role="region"
            aria-label="Today's queue"
          >
            <table className="w-full table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-12" />
                <col className="w-[18rem]" />
                <col />
                <col className="w-[11.5rem]" />
                <col className="w-[11rem]" />
                <col className="w-12" />
              </colgroup>
              <caption className="sr-only">
                Today&apos;s queue, ordered by event tier, then clock, then confidence.
              </caption>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[var(--surface-muted)]">
                  {['#', 'Member', 'Why today', 'Clock', 'Next', ''].map((heading, index) => (
                    <th
                      key={heading || index}
                      scope="col"
                      className={cn(
                        'border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-left text-2xs font-medium tracking-wide text-text-muted uppercase',
                        index === 0 && 'pr-0',
                      )}
                    >
                      {heading || <span className="sr-only">Row actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const ChannelIcon = channelIcons[row.nextAction.channel];
                  const isDismissed = dismissedIds.has(row.memberId);
                  const isSnoozed = snoozedIds.has(row.memberId);
                  return (
                    <tr
                      key={row.memberId}
                      {...{ [ROW_ATTRIBUTE]: '' }}
                      tabIndex={0}
                      onClick={() => openMember(row)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') openMember(row);
                      }}
                      className={cn(
                        'cursor-pointer border-b border-[var(--border)] align-top last:border-b-0 hover:bg-[var(--brand-soft)] focus-visible:bg-[var(--brand-soft)]',
                        (isDismissed || isSnoozed) && 'opacity-60',
                      )}
                    >
                      <td data-tabular className="px-4 py-3 pr-0 text-sm text-text-muted">
                        {row.rank}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <Avatar name={row.memberName} size="sm" className="mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text">
                              {row.memberName}{' '}
                              <span className="font-normal text-text-muted">(fictional)</span>
                            </p>
                            <p data-tabular className="text-2xs text-text-muted">
                              {row.age} {row.sex} · {row.program}
                            </p>
                            <p className="font-mono text-2xs text-text-muted">{row.memberId}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge tone="neutral">{row.tierLabel}</Badge>
                          {isSnoozed ? <Badge tone="info">Snoozed</Badge> : null}
                          {isDismissed ? <Badge tone="warning">Dismissed</Badge> : null}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="mb-1.5 text-xs text-text">{row.headline}</p>
                        <ReasonChips row={row} />
                        {row.riskNote ? (
                          <p className="mt-1.5 text-2xs text-text-muted">{row.riskNote}</p>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        {row.clock ? (
                          <div className="flex flex-col items-start gap-1">
                            <ClockPill
                              deadline={row.clock.deadline}
                              label={row.clock.label}
                              reading={row.clock.reading}
                              urgency={clockUrgency[row.clock.state]}
                            />
                            <span data-tabular className="text-2xs text-text-muted">
                              {row.clock.deadlineLabel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-2xs text-text-muted">
                            No hard clock
                            <span className="mt-0.5 block">Signal fired, cadence applies</span>
                          </span>
                        )}
                        {row.waitingOn ? (
                          <p className="mt-1.5 text-2xs text-text-muted">
                            {row.waitingOn.team} · {row.waitingOn.state}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        <Tooltip
                          content={
                            <span className="block">
                              <span className="block font-medium">{row.nextAction.label}</span>
                              <span className="mt-1 block">{row.nextAction.rationale}</span>
                            </span>
                          }
                        >
                          <Button
                            size="sm"
                            variant={row.rank <= 4 ? 'primary' : 'secondary'}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ChannelIcon aria-hidden="true" />
                            {row.nextAction.shortLabel}
                          </Button>
                        </Tooltip>
                        <p className="mt-1 text-2xs text-text-muted">{row.nextAction.window}</p>
                      </td>

                      <td className="px-4 py-3">
                        <QueueRowActions
                          row={row}
                          onSnooze={(memberId) =>
                            setSnoozed((current) =>
                              current.includes(memberId) ? current : [...current, memberId],
                            )
                          }
                          onDismiss={(memberId, reason) =>
                            setDismissed((current) =>
                              current.some((record) => record.memberId === memberId)
                                ? current
                                : [...current, { memberId, reason }],
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <QueueFooter
          hideDismissed={hideDismissed}
          onHideDismissedChange={setHideDismissed}
          dismissedCount={dismissed.length}
        />
      </Card>
    </div>
  );
}
