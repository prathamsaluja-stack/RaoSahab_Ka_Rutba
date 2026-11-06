'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { Badge, Card, CardBody, CardFooter, CardHeader, Tooltip } from '@/components/ui';
import { SourceChip } from '@/components/domain';
import {
  TIMELINE_LANES,
  type TimelineEvent,
  type TimelineLaneId,
  type MemberStoryView,
} from '@/lib/data/member-story';
import { cn } from '@/lib/utils';
import { Explainer, toneDot } from './story-parts';

const laneShape: Record<TimelineLaneId, string> = {
  hospital: 'size-2.5 rounded-[2px]',
  visits: 'size-2.5 rounded-full',
  medications: 'h-3 w-1.5 rounded-[1px]',
  results: 'size-2.5 rotate-45 rounded-[1px]',
  coordination: 'size-2.5 rounded-full ring-2 ring-[var(--surface)]',
};

const MIN_GAP = 0.022;
const ROW_HEIGHT = 14;

/** Stack markers that would otherwise sit on top of each other. */
function withRows(events: readonly TimelineEvent[]): { event: TimelineEvent; row: number }[] {
  const lastInRow: number[] = [];
  return events.map((event) => {
    let row = lastInRow.findIndex((position) => event.position - position >= MIN_GAP);
    if (row === -1) {
      row = lastInRow.length;
    }
    lastInRow[row] = event.position;
    return { event, row };
  });
}

function Marker({ event, lane }: { event: TimelineEvent; lane: TimelineLaneId }) {
  return (
    <Tooltip
      content={
        <span className="block max-w-72">
          <span className="block font-medium">{event.title}</span>
          <span className="mt-1 block">{event.detail}</span>
          <span className="mt-1 block text-text-muted">
            {event.kind} · {event.atLabel}
          </span>
          <span className="block text-text-muted">Received {event.receivedLabel}</span>
          <span className="mt-1 block font-mono text-2xs text-text-muted">
            {event.sourceRecordId}
          </span>
        </span>
      }
    >
      <button
        type="button"
        aria-label={`${event.kind}: ${event.title}. ${event.atLabel}. Received ${event.receivedLabel}. Record ${event.sourceRecordId}.`}
        className={cn(
          'absolute -translate-x-1/2 focus-visible:z-10',
          laneShape[lane],
          toneDot[event.tone],
        )}
        style={{ left: `${event.position * 100}%` }}
      />
    </Tooltip>
  );
}

/**
 * Twelve months of typed events, with the claims-completeness band.
 *
 * The shaded tail is the part of the record claims have not caught up with.
 * A quiet month inside it is missing data, not a healthy member, and the
 * stamp on the band says so in words.
 */
export function TimelineView({ view }: { view: MemberStoryView }) {
  const { timeline, story, claimsCompleteness } = view;
  const laneEvents = TIMELINE_LANES.map((lane) => ({
    lane,
    rows: withRows(timeline.events.filter((event) => event.lane === lane.id)),
  }));

  return (
    <Card>
      <CardHeader
        title="Timeline"
        subtitle={`${timeline.windowLabel} · ${timeline.events.length} records across five lanes`}
        actions={
          <Badge tone="warning" data-tabular>
            {timeline.claimsStamp}
          </Badge>
        }
      />
      <CardBody className="flex flex-col gap-5">
        <Explainer>{story.timelineNote}</Explainer>

        <div className="overflow-x-auto">
          <div className="min-w-[840px]">
            <div className="flex">
              <div className="w-44 shrink-0" />
              <div className="relative flex-1">
                <div className="flex border-b border-[var(--border)]">
                  {timeline.months.map((month) => (
                    <div
                      key={month.key}
                      style={{ width: `${month.width * 100}%` }}
                      className="border-l border-[var(--border)] px-1 py-1 text-2xs text-text-muted first:border-l-0"
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="w-44 shrink-0">
                {laneEvents.map(({ lane, rows }) => (
                  <div
                    key={lane.id}
                    style={{
                      height: `${Math.max(2, Math.max(...rows.map((row) => row.row + 1), 1) + 1) * ROW_HEIGHT + 12}px`,
                    }}
                    className="flex items-center border-b border-[var(--border)] pr-3 text-2xs text-text-muted"
                  >
                    {lane.label}
                    <span className="ml-auto font-mono">{rows.length}</span>
                  </div>
                ))}
              </div>

              <div className="relative flex-1">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--warning)_14%,transparent)_0px,color-mix(in_srgb,var(--warning)_14%,transparent)_4px,transparent_4px,transparent_9px)]"
                  style={{ left: `${timeline.claimsCompletePosition * 100}%` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 w-px bg-[var(--warning)]"
                  style={{ left: `${timeline.claimsCompletePosition * 100}%` }}
                />
                {timeline.months.map((month) => (
                  <div
                    key={month.key}
                    aria-hidden="true"
                    className="absolute inset-y-0 w-px bg-[var(--border)]"
                    style={{ left: `${month.position * 100}%` }}
                  />
                ))}

                {laneEvents.map(({ lane, rows }) => (
                  <div
                    key={lane.id}
                    style={{
                      height: `${Math.max(2, Math.max(...rows.map((row) => row.row + 1), 1) + 1) * ROW_HEIGHT + 12}px`,
                    }}
                    className="relative border-b border-[var(--border)]"
                  >
                    {rows.map(({ event, row }) => (
                      <div
                        key={event.id}
                        className="absolute inset-x-0"
                        style={{ top: `${row * ROW_HEIGHT + 10}px` }}
                      >
                        <Marker event={event} lane={lane.id} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex">
              <div className="w-44 shrink-0" />
              <div className="relative h-7 flex-1">
                <div
                  className="absolute top-1 -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${timeline.claimsCompletePosition * 100}%` }}
                >
                  <Badge tone="warning" data-tabular>
                    {timeline.claimsStamp}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-2xs text-text-muted">
          {TIMELINE_LANES.map((lane) => (
            <span key={lane.id} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn(laneShape[lane.id], 'bg-[var(--text-muted)]')}
              />
              {lane.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3 w-5 bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--warning)_28%,transparent)_0px,color-mix(in_srgb,var(--warning)_28%,transparent)_3px,transparent_3px,transparent_7px)]"
            />
            Claims have not caught up with this stretch
          </span>
          {timeline.outsideWindowCount > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <Info aria-hidden="true" className="size-3.5" />
              {timeline.outsideWindowCount} record
              {timeline.outsideWindowCount === 1 ? '' : 's'} outside this window
            </span>
          ) : null}
        </div>

        {claimsCompleteness ? (
          <div className="flex flex-wrap items-center gap-2">
            <SourceChip source="claims" recordId={`COMPLETENESS-${claimsCompleteness.memberId}`} />
            <p className="max-w-prose text-2xs text-text-muted">{claimsCompleteness.basis}</p>
          </div>
        ) : null}
      </CardBody>
      <CardFooter>{story.claimsNote}</CardFooter>
    </Card>
  );
}
