'use client';

import * as React from 'react';
import { AlertTriangle, Check, CircleDashed, ListChecks, UserPlus } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  chipVariants,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui';
import { SourceChip } from '@/components/domain';
import { cn } from '@/lib/utils';
import type { AnswerChip, CallWorkspace, GuideItem, GuideOrigin } from '@/domain';
import { Explainer } from '../story-parts';

const originCopy: Record<GuideOrigin, { label: string; tone: 'neutral' | 'warning' | 'urgent' }> = {
  program: { label: 'Program checklist', tone: 'neutral' },
  record_gap: { label: 'Inserted: gap in the record', tone: 'warning' },
  red_flag: { label: 'Red flag', tone: 'urgent' },
  closing: { label: 'Closing', tone: 'neutral' },
};

const chipTone: Record<AnswerChip['tone'], 'neutral' | 'warning' | 'urgent' | 'success' | 'info'> =
  {
    neutral: 'neutral',
    warning: 'warning',
    urgent: 'urgent',
    success: 'success',
    info: 'info',
  };

function GuideRow({
  item,
  index,
  answeredChipId,
  onAnswer,
}: {
  item: GuideItem;
  index: number;
  answeredChipId: string | null;
  onAnswer: (itemId: string, chipId: string) => void;
}) {
  const origin = originCopy[item.origin];
  const answered = answeredChipId !== null;

  return (
    <li
      className={cn(
        'rounded-[var(--radius-card)] border px-4 py-3',
        item.origin === 'red_flag'
          ? 'border-[color-mix(in_srgb,var(--urgent)_30%,var(--surface))] bg-[color-mix(in_srgb,var(--urgent)_6%,var(--surface))]'
          : item.origin === 'record_gap'
            ? 'border-[color-mix(in_srgb,var(--warning)_30%,var(--surface))] bg-[color-mix(in_srgb,var(--warning)_6%,var(--surface))]'
            : 'border-[var(--border)] bg-[var(--surface)]',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-2xs font-medium',
            answered
              ? 'border-[var(--success)] bg-[var(--success)] text-white'
              : 'border-[var(--border)] text-text-muted',
          )}
        >
          {answered ? <Check className="size-3" /> : index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={origin.tone}>
              {item.origin === 'red_flag' ? <AlertTriangle aria-hidden="true" /> : null}
              {origin.label}
            </Badge>
            {item.source && item.sourceLabel ? (
              <SourceChip source={item.source} recordId={item.sourceLabel} />
            ) : null}
            {answered ? (
              <span className="text-2xs text-[var(--success)]">Answer recorded in the note</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-2xs text-text-muted">
                <CircleDashed aria-hidden="true" className="size-3" />
                Not asked yet
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-medium text-text">{item.prompt}</p>
          <p className="mt-1 max-w-prose text-2xs text-text-muted">{item.because}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.chips.map((chip) => {
              const selected = chip.id === answeredChipId;
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onAnswer(item.id, chip.id)}
                  className={cn(
                    chipVariants({
                      tone: selected ? chipTone[chip.tone] : 'neutral',
                      interactive: true,
                    }),
                    selected && 'ring-1 ring-current',
                  )}
                >
                  {selected ? <Check aria-hidden="true" className="size-3.5" /> : null}
                  {chip.label}
                </button>
              );
            })}
          </div>

          {item.escalation ? (
            <p className="mt-2 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--urgent)_28%,var(--surface))] bg-[var(--surface)] px-3 py-2 text-2xs text-text">
              <span className="font-medium text-[var(--urgent)]">Escalation path · </span>
              {item.escalation}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function CaregiverControl({
  caregiver,
  added,
  onAdd,
}: {
  caregiver: CallWorkspace['caregiver'];
  added: string | null;
  onAdd: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const chosen = caregiver.candidates.find((candidate) => candidate.id === added) ?? null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap items-center gap-2">
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <UserPlus aria-hidden="true" />
            {caregiver.label}
          </Button>
        </DialogTrigger>
        {chosen ? (
          <Badge tone="success">
            On the line: {chosen.name} · {chosen.relation}
          </Badge>
        ) : (
          <span className="text-2xs text-text-muted">{caregiver.hint}</span>
        )}
      </div>

      <DialogContent
        title="Add a caregiver on the line"
        description="Who is joining, what their relationship is, and the consent that allows them to hear this. All three are written into the call note."
      >
        <ul className="flex flex-col gap-2">
          {caregiver.candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">{candidate.name}</p>
                  <p className="text-2xs text-text-muted">
                    {candidate.relation} · <span data-tabular>{candidate.number}</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={candidate.id === added ? 'secondary' : 'primary'}
                  onClick={() => {
                    onAdd(candidate.id);
                    setOpen(false);
                  }}
                >
                  {candidate.id === added ? 'On the line' : 'Add to the call'}
                </Button>
              </div>
              <p className="mt-1 text-2xs text-text-muted">{candidate.consentLabel}</p>
            </li>
          ))}
        </ul>
        <DialogFooter className="-mx-6 mt-5 -mb-5">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The guide: a checklist, not a script.
 *
 * Two of Harold's items are here only because the record has a hole — the
 * HRA never asked about a scale, and three sources disagree about the
 * diuretic dose — and both say so on their face. The red-flag item carries a
 * clinician-led escalation path; nothing on this screen escalates by itself.
 */
export function CallGuide({
  call,
  answers,
  onAnswer,
  caregiverId,
  onCaregiver,
}: {
  call: CallWorkspace;
  answers: Record<string, string | null>;
  onAnswer: (itemId: string, chipId: string) => void;
  caregiverId: string | null;
  onCaregiver: (id: string) => void;
}) {
  const answeredCount = call.guide.items.filter((item) => answers[item.id]).length;

  return (
    <Card>
      <CardHeader
        title="Guide"
        subtitle="A checklist, not a script. Tapping an answer writes a sentence into the draft on the right."
        actions={
          <Badge tone="neutral">
            <ListChecks aria-hidden="true" />
            {answeredCount} of {call.guide.items.length} answered
          </Badge>
        }
      />
      <CardBody className="flex flex-col gap-3">
        <Explainer>{call.guide.note}</Explainer>
        <CaregiverControl caregiver={call.caregiver} added={caregiverId} onAdd={onCaregiver} />
        <ul className="flex flex-col gap-2">
          {call.guide.items.map((item, index) => (
            <GuideRow
              key={item.id}
              item={item}
              index={index + 1}
              answeredChipId={answers[item.id] ?? null}
              onAnswer={onAnswer}
            />
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
