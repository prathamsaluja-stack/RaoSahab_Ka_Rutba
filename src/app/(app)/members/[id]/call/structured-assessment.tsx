'use client';

import * as React from 'react';
import { CheckCheck, CircleDashed, FileStack, Pencil } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui';
import { SourceChip } from '@/components/domain';
import { cn } from '@/lib/utils';
import type { AssessmentField } from '@/domain';
import type { CallWorkspaceView } from '@/lib/data/call-workspace';
import { Explainer } from '../story-parts';

export type FieldDecision = 'kept' | 'changed';

const stateCopy: Record<
  AssessmentField['state'],
  { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
  prefilled: { label: 'Pre-filled from records', tone: 'neutral' },
  confirmed: { label: 'Confirmed on this call', tone: 'success' },
  remaining: { label: 'Remaining', tone: 'warning' },
};

function FieldRow({
  field,
  decision,
  onDecide,
}: {
  field: AssessmentField;
  decision: FieldDecision | undefined;
  onDecide: (id: string, decision: FieldDecision) => void;
}) {
  return (
    <li className="flex flex-col gap-1 border-b border-[var(--border)] px-3 py-2 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-text">{field.label}</span>
        <Badge tone={stateCopy[field.state].tone}>{stateCopy[field.state].label}</Badge>
      </div>
      <p
        className={cn(
          'text-xs',
          field.state === 'remaining' ? 'text-text-muted italic' : 'text-text',
        )}
      >
        {field.value}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {field.source && field.dateLabel ? (
          <SourceChip
            source={field.source}
            recordId={field.sourceRecordId ?? undefined}
            eventTime={field.dateLabel}
          />
        ) : null}
        {field.state === 'prefilled' ? (
          <span className="flex items-center gap-1">
            <Button
              size="sm"
              variant={decision === 'kept' ? 'primary' : 'ghost'}
              onClick={() => onDecide(field.id, 'kept')}
            >
              <CheckCheck aria-hidden="true" />
              Keep
            </Button>
            <Button
              size="sm"
              variant={decision === 'changed' ? 'primary' : 'ghost'}
              onClick={() => onDecide(field.id, 'changed')}
            >
              <Pencil aria-hidden="true" />
              Change on this call
            </Button>
          </span>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Progress across the forty structured fields.
 *
 * Documentation follows the work: a fact verified once is reused, so most of
 * the form arrives already filled. Every pre-filled value still carries the
 * feed and the date it came from, and a clinician keeps it or changes it —
 * an April answer and an answer given a minute ago are not the same thing.
 */
export function StructuredAssessment({
  view,
  decisions,
  onDecide,
}: {
  view: CallWorkspaceView;
  decisions: Record<string, FieldDecision>;
  onDecide: (id: string, decision: FieldDecision) => void;
}) {
  const { assessment } = view.call;
  const done = assessment.prefilled + assessment.confirmed;
  const keptCount = Object.values(decisions).filter((value) => value === 'kept').length;
  const changedCount = Object.values(decisions).filter((value) => value === 'changed').length;

  const buckets = [
    {
      key: 'prefilled' as const,
      count: assessment.prefilled,
      label: 'Pre-filled from records',
      hint: 'Each one shows its source and date, and can be kept or changed.',
      tone: 'bg-[var(--info)]',
    },
    {
      key: 'confirmed' as const,
      count: assessment.confirmed,
      label: 'Confirmed on this call',
      hint: 'Said out loud by the member or the caregiver in the last few minutes.',
      tone: 'bg-[var(--success)]',
    },
    {
      key: 'remaining' as const,
      count: assessment.remaining,
      label: 'Remaining',
      hint: 'Still to ask. The call can be signed without them; they stay open on the member.',
      tone: 'bg-[var(--surface-muted)]',
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Structured assessment"
        subtitle={assessment.instrument}
        actions={
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm">
                <FileStack aria-hidden="true" />
                Open the full field list
              </Button>
            </SheetTrigger>
            <SheetContent
              title={`${assessment.instrument} · ${view.member.name} (fictional)`}
              description="Every field, its value, where the value came from and when. Pre-filled values can be kept or changed here too."
            >
              <div className="flex flex-col gap-4">
                {view.sections.map((section) => (
                  <section key={section.name}>
                    <h4 className="text-2xs font-medium tracking-wide text-text-muted uppercase">
                      {section.name}
                    </h4>
                    <ul className="mt-2 rounded-[var(--radius-card)] border border-[var(--border)]">
                      {section.fields.map((field) => (
                        <FieldRow
                          key={field.id}
                          field={field}
                          decision={decisions[field.id]}
                          onDecide={onDecide}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      <CardBody className="flex flex-col gap-4">
        <Progress
          value={done}
          max={assessment.total}
          label={`${assessment.instrument}: ${done} of ${assessment.total} fields filled`}
          valueText={`${done} of ${assessment.total} fields filled · ${assessment.remaining} remaining`}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {buckets.map((bucket) => (
            <div
              key={bucket.key}
              className="rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('size-2 rounded-full border border-[var(--border)]', bucket.tone)}
                />
                <span data-tabular className="text-lg font-semibold text-text">
                  {bucket.count}
                </span>
                <span className="text-2xs font-medium text-text">{bucket.label}</span>
              </div>
              <p className="mt-1 text-2xs text-text-muted">{bucket.hint}</p>
            </div>
          ))}
        </div>

        <Explainer>{assessment.note}</Explainer>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={keptCount > 0 ? 'success' : 'neutral'}>
            <CheckCheck aria-hidden="true" />
            {keptCount} pre-filled values kept on this call
          </Badge>
          <Badge tone={changedCount > 0 ? 'warning' : 'neutral'}>
            <Pencil aria-hidden="true" />
            {changedCount} marked for change
          </Badge>
          <Badge tone="neutral">
            <CircleDashed aria-hidden="true" />
            {assessment.remaining} fields still to ask
          </Badge>
        </div>
      </CardBody>
    </Card>
  );
}
