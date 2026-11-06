'use client';

import * as React from 'react';
import { AlertTriangle, Check, FileText, Pencil, Sparkles, Trash2, X } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader } from '@/components/ui';
import { SourceChip } from '@/components/domain';
import { cn } from '@/lib/utils';
import type { CallWorkspace, NoteSentence, NoteTag } from '@/domain';

export type InferredResolution = 'confirmed' | 'removed';

const tagCopy: Record<
  NoteTag,
  { label: string; tone: 'neutral' | 'success' | 'warning'; bar: string }
> = {
  record: {
    label: 'From record',
    tone: 'neutral',
    bar: 'border-l-[var(--info)]',
  },
  call: {
    label: 'Heard on call',
    tone: 'success',
    bar: 'border-l-[var(--success)]',
  },
  inferred: {
    label: 'Model-inferred',
    tone: 'warning',
    bar: 'border-l-[var(--warning)]',
  },
};

function SentenceRow({
  sentence,
  text,
  resolution,
  onEdit,
  onResolve,
}: {
  sentence: NoteSentence;
  text: string;
  resolution: InferredResolution | undefined;
  onEdit: (id: string, text: string) => void;
  onResolve: (id: string, resolution: InferredResolution) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(text);

  const startEditing = React.useCallback(() => {
    setDraft(text);
    setEditing(true);
  }, [text]);

  const copy = tagCopy[sentence.tag];
  const unresolved = sentence.tag === 'inferred' && resolution === undefined;
  const removed = resolution === 'removed';

  return (
    <li
      className={cn(
        'border-l-2 py-2 pr-2 pl-3',
        copy.bar,
        unresolved && 'bg-[color-mix(in_srgb,var(--warning)_8%,var(--surface))]',
        removed && 'opacity-60',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={copy.tone}>
          {sentence.tag === 'inferred' ? <Sparkles aria-hidden="true" /> : null}
          {copy.label}
        </Badge>
        {sentence.source && sentence.sourceLabel ? (
          <SourceChip source={sentence.source} recordId={sentence.sourceLabel} />
        ) : sentence.sourceLabel ? (
          <span className="text-2xs text-text-muted">{sentence.sourceLabel}</span>
        ) : null}
        {resolution === 'confirmed' ? (
          <Badge tone="success">
            <Check aria-hidden="true" />
            Confirmed by the clinician on this call
          </Badge>
        ) : null}
        {removed ? <Badge tone="neutral">Removed from the draft</Badge> : null}
        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="ml-auto inline-flex items-center gap-1 rounded-[var(--radius-input)] px-1.5 py-0.5 text-2xs text-text-muted hover:bg-[var(--surface-muted)] hover:text-text"
          >
            <Pencil aria-hidden="true" className="size-3" />
            Edit
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-2">
          <label className="sr-only" htmlFor={`sentence-${sentence.id}`}>
            Edit this sentence
          </label>
          <textarea
            id={`sentence-${sentence.id}`}
            value={draft}
            rows={3}
            onChange={(event) => setDraft(event.target.value)}
            className="w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                onEdit(sentence.id, draft.trim() === '' ? text : draft);
                setEditing(false);
              }}
            >
              <Check aria-hidden="true" />
              Keep the edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X aria-hidden="true" />
              Cancel
            </Button>
            <span className="text-2xs text-text-muted">
              An edited sentence keeps its tag and is logged against your name.
            </span>
          </div>
        </div>
      ) : (
        <p className={cn('mt-1 text-sm text-text', removed && 'line-through')}>{text}</p>
      )}

      {sentence.tag === 'inferred' ? (
        <div className="mt-2 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--warning)_32%,var(--surface))] bg-[var(--surface)] px-3 py-2">
          <p className="flex items-start gap-1.5 text-2xs font-medium text-[var(--warning)]">
            <AlertTriangle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
            Not heard on call — confirm or remove
          </p>
          {sentence.basis ? (
            <p className="mt-1 text-2xs text-text-muted">{sentence.basis}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={resolution === 'confirmed' ? 'primary' : 'secondary'}
              onClick={() => onResolve(sentence.id, 'confirmed')}
            >
              <Check aria-hidden="true" />
              Confirm: the member said this
            </Button>
            <Button
              size="sm"
              variant={resolution === 'removed' ? 'danger' : 'secondary'}
              onClick={() => onResolve(sentence.id, 'removed')}
            >
              <Trash2 aria-hidden="true" />
              Remove from the note
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/**
 * The drafted note.
 *
 * Every sentence says where it came from. The inferred ones are the point:
 * they are visibly not evidence, they carry their own warning, and they
 * block the signature until a clinician has either owned them or thrown them
 * away. Nothing here is in the record until it is signed.
 */
export function NoteDraft({
  call,
  texts,
  resolutions,
  onEdit,
  onResolve,
}: {
  call: CallWorkspace;
  texts: Record<string, string>;
  resolutions: Record<string, InferredResolution>;
  onEdit: (id: string, text: string) => void;
  onResolve: (id: string, resolution: InferredResolution) => void;
}) {
  const inferred = call.note.sentences.filter((sentence) => sentence.tag === 'inferred');
  const unresolved = inferred.filter((sentence) => resolutions[sentence.id] === undefined);

  const counts = {
    record: call.note.sentences.filter((sentence) => sentence.tag === 'record').length,
    call: call.note.sentences.filter((sentence) => sentence.tag === 'call').length,
    inferred: inferred.length,
  };

  return (
    <Card>
      <CardHeader
        title={call.note.header}
        subtitle={call.note.byline}
        actions={
          <Badge tone={unresolved.length > 0 ? 'warning' : 'success'}>
            <FileText aria-hidden="true" />
            {unresolved.length > 0
              ? `${unresolved.length} inferred sentence${unresolved.length === 1 ? '' : 's'} blocking the signature`
              : 'All inferred sentences resolved'}
          </Badge>
        }
      />
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{counts.record} from record</Badge>
          <Badge tone="success">{counts.call} heard on call</Badge>
          <Badge tone="warning">{counts.inferred} model-inferred</Badge>
          <span className="text-2xs text-text-muted">
            Tags stay on the sentence after signing, so a later reader can tell what was heard from
            what was read.
          </span>
        </div>

        {unresolved.length > 0 ? (
          <p className="flex items-start gap-2 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--warning)_32%,var(--surface))] bg-[color-mix(in_srgb,var(--warning)_8%,var(--surface))] px-3 py-2 text-2xs text-text">
            <AlertTriangle
              aria-hidden="true"
              className="mt-px size-3.5 shrink-0 text-[var(--warning)]"
            />
            Signing is blocked while a model-inferred sentence is unresolved. Confirm it only if the
            member actually said it; otherwise remove it.
          </p>
        ) : null}

        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {call.note.sentences.map((sentence) => (
            <SentenceRow
              key={sentence.id}
              sentence={sentence}
              text={texts[sentence.id] ?? sentence.text}
              resolution={resolutions[sentence.id]}
              onEdit={onEdit}
              onResolve={onResolve}
            />
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
