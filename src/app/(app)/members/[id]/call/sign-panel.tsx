'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Check,
  PenLine,
  PhoneOff,
  ShieldCheck,
  SquarePen,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { OutcomeCode, WriteTarget } from '@/domain';
import type { CallWorkspaceView } from '@/lib/data/call-workspace';
import { Explainer } from '../story-parts';

function WriteRow({
  target,
  text,
  onEdit,
}: {
  target: WriteTarget;
  text: string[];
  onEdit: (id: string, lines: string[]) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(() => text.join('\n'));

  const toggleEditing = React.useCallback(() => {
    if (!editing) setDraft(text.join('\n'));
    setEditing(!editing);
  }, [editing, text]);

  return (
    <li className="rounded-[var(--radius-card)] border border-[var(--border)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text">{target.title}</p>
          <p className="text-2xs text-text-muted">{target.destination}</p>
        </div>
        {target.editable ? (
          <Button size="sm" variant="ghost" onClick={toggleEditing}>
            <SquarePen aria-hidden="true" />
            {editing ? 'Done' : 'Edit the draft'}
          </Button>
        ) : (
          <Badge tone="neutral">Written as drafted</Badge>
        )}
      </div>
      <p className="mt-1 text-2xs text-text-muted">{target.summary}</p>

      {editing ? (
        <>
          <label className="sr-only" htmlFor={`write-${target.id}`}>
            Edit {target.title}
          </label>
          <textarea
            id={`write-${target.id}`}
            rows={Math.max(3, text.length + 1)}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() =>
              onEdit(
                target.id,
                draft
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line.length > 0),
              )
            }
            className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-text focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {text.map((line, index) => (
            <li key={`${target.id}-${index}`} className="flex items-start gap-2 text-xs text-text">
              <span
                aria-hidden="true"
                className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--text-muted)]"
              />
              {line}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * What one signature writes, and the dialog that lists it before it happens.
 *
 * Nothing enters the record without a named clinician confirming it, so the
 * dialog is the whole promise of the screen made explicit: here is every
 * destination, here is exactly what lands in it, and here is what is still
 * blocking it.
 */
export function WriteTargets({
  view,
  writeLines,
  onEditWrite,
  unresolvedCount,
  remainingCount,
  signed,
  onSign,
  signOpen,
}: {
  view: CallWorkspaceView;
  writeLines: Record<string, string[]>;
  onEditWrite: (id: string, lines: string[]) => void;
  unresolvedCount: number;
  remainingCount: number;
  signed: boolean;
  onSign: () => void;
  signOpen: boolean;
}) {
  const [open, setOpen] = React.useState(signOpen);
  const blocked = unresolvedCount > 0;
  const { call } = view;

  return (
    <Card>
      <CardHeader
        title="On sign, writes once to"
        subtitle={`${call.writes.length} destinations, one signature. Facts verified on this call are not retyped anywhere.`}
        actions={
          <Badge tone={signed ? 'success' : blocked ? 'warning' : 'neutral'}>
            {signed ? (
              <>
                <Check aria-hidden="true" />
                Signed by {view.signedBy}
              </>
            ) : blocked ? (
              <>
                <AlertTriangle aria-hidden="true" />
                Blocked: {unresolvedCount} inferred sentence
                {unresolvedCount === 1 ? '' : 's'}
              </>
            ) : (
              <>
                <ShieldCheck aria-hidden="true" />
                Ready to sign
              </>
            )}
          </Badge>
        }
      />
      <CardBody className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {call.writes.map((target) => (
            <WriteRow
              key={target.id}
              target={target}
              text={writeLines[target.id] ?? target.lines}
              onEdit={onEditWrite}
            />
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <CalendarClock aria-hidden="true" className="size-4 text-text-muted" />
          <span className="text-xs font-medium text-text">
            Next contact · {call.nextContact.label}
          </span>
          <span className="text-2xs text-text-muted">{call.nextContact.detail}</span>
        </div>

        <Explainer>{view.signNote}</Explainer>
      </CardBody>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-2xs text-text-muted">
          {signed
            ? `Signed by ${view.signedBy}. Written together: ${call.writes.map((target) => target.title).join(', ')}. The audit log records each one.`
            : blocked
              ? `${unresolvedCount} model-inferred sentence${unresolvedCount === 1 ? '' : 's'} still to confirm or remove. ${remainingCount} assessment fields are still unasked, which does not block the signature.`
              : `All inferred sentences are resolved. ${remainingCount} assessment fields are still unasked, which does not block the signature.`}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="lg" disabled={signed} onClick={() => setOpen(true)}>
            <PenLine aria-hidden="true" />
            {signed ? 'Signed' : `Sign as ${view.signedBy}`}
          </Button>

          <DialogContent
            title="Sign the call and write the record"
            description="Exactly this, and nothing else, is written when you sign."
            className="w-[min(720px,calc(100vw-32px))]"
          >
            {blocked ? (
              <p className="mb-4 flex items-start gap-2 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--urgent)_32%,var(--surface))] bg-[color-mix(in_srgb,var(--urgent)_8%,var(--surface))] px-3 py-2 text-xs text-text">
                <AlertTriangle
                  aria-hidden="true"
                  className="mt-px size-4 shrink-0 text-[var(--urgent)]"
                />
                <span>
                  <span className="font-medium">Cannot sign yet. </span>
                  {unresolvedCount} model-inferred sentence{unresolvedCount === 1 ? '' : 's'} in the
                  draft {unresolvedCount === 1 ? 'has' : 'have'} not been confirmed or removed. A
                  sentence nobody heard does not go into a medical record.
                </span>
              </p>
            ) : null}

            <ol className="flex max-h-[46vh] flex-col gap-2 overflow-y-auto pr-1">
              {call.writes.map((target, index) => (
                <li
                  key={target.id}
                  className="rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span data-tabular className="text-2xs text-text-muted">
                      {index + 1}.
                    </span>
                    <span className="text-xs font-medium text-text">{target.title}</span>
                    <span className="text-2xs text-text-muted">{target.destination}</span>
                  </div>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {(writeLines[target.id] ?? target.lines).map((line, lineIndex) => (
                      <li
                        key={`${target.id}-sign-${lineIndex}`}
                        className="text-2xs text-text-muted"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <p className="mt-4 text-2xs text-text-muted">
              Signed as <span className="font-medium text-text">{view.signedBy}</span> at Mon 9 Nov,
              09:21 ET. Today&apos;s item closes as completed and the queue re-ranks without this
              member.
            </p>

            <DialogFooter className="-mx-6 mt-5 -mb-5">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Keep editing
              </Button>
              <Button
                disabled={blocked || signed}
                onClick={() => {
                  onSign();
                  setOpen(false);
                }}
              >
                <PenLine aria-hidden="true" />
                Sign and write all {call.writes.length}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

/** The call that does not connect is still a record of an attempt. */
export function UnsuccessfulCall({
  codes,
  chosen,
  onChoose,
}: {
  codes: readonly OutcomeCode[];
  chosen: string | null;
  onChoose: (code: string) => void;
}) {
  const selected = codes.find((code) => code.code === chosen) ?? null;

  return (
    <Card>
      <CardHeader
        title="Unsuccessful call"
        subtitle="Nobody picked up, or the wrong person did. The attempt is still a fact about reachability."
        actions={<PhoneOff aria-hidden="true" className="size-4 text-text-muted" />}
      />
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {codes.map((code) => (
            <Button
              key={code.code}
              size="sm"
              variant={code.code === chosen ? 'primary' : 'secondary'}
              aria-pressed={code.code === chosen}
              onClick={() => onChoose(code.code)}
            >
              {code.label}
            </Button>
          ))}
        </div>
        <p
          className={cn(
            'rounded-[var(--radius-input)] px-3 py-2 text-2xs',
            selected
              ? 'bg-[color-mix(in_srgb,var(--info)_8%,var(--surface))] text-text'
              : 'bg-[var(--surface-muted)] text-text-muted',
          )}
        >
          {selected
            ? selected.updates
            : 'Pick an outcome code to see what it writes. Every code updates the contact history and the best-number ranking; none of them removes the member from the queue.'}
        </p>
      </CardBody>
    </Card>
  );
}
