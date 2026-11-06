'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Circle, Mic, MicOff, Phone, Timer, UserRound } from 'lucide-react';
import { Avatar, Badge, Button, Card, useToast } from '@/components/ui';
import { ClockPill, ConfidenceLabel } from '@/components/domain';
import { cn } from '@/lib/utils';
import type { CallWorkspaceView } from '@/lib/data/call-workspace';
import { CallGuide } from './call-guide';
import { NoteDraft, type InferredResolution } from './note-draft';
import { StructuredAssessment, type FieldDecision } from './structured-assessment';
import { UnsuccessfulCall, WriteTargets } from './sign-panel';

const consentTone = {
  yes: 'success',
  no: 'warning',
  asked: 'neutral',
} as const;

function CallHeader({ view }: { view: CallWorkspaceView }) {
  const { call, member } = view;
  const recording = call.recordingConsent;

  return (
    <Card className="flex flex-col gap-4 px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-1 basis-[420px] items-start gap-4">
        <Avatar name={member.name} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-text">{member.name} (fictional)</h2>
            <span data-tabular className="font-mono text-2xs text-text-muted">
              {member.id}
            </span>
            <Badge tone="brand">{call.programLabel}</Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text">
            <Phone aria-hidden="true" className="size-3.5 text-text-muted" />
            <span data-tabular className="font-semibold">
              {call.dialing.number}
            </span>
            <span className="inline-flex items-center gap-1 text-text-muted">
              <UserRound aria-hidden="true" className="size-3.5" />
              {call.dialing.ownerLabel}
            </span>
          </p>
          <p className="mt-1 max-w-prose text-2xs text-text-muted">{call.dialing.note}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 xl:max-w-[560px] xl:justify-end">
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5">
          <Circle
            aria-hidden="true"
            className="size-2 fill-[var(--success)] text-[var(--success)]"
          />
          <Timer aria-hidden="true" className="size-4 text-text-muted" />
          <span data-tabular className="text-sm font-semibold text-text">
            {call.timer.elapsed}
          </span>
          <span className="text-2xs text-text-muted">{call.timer.connectedLabel}</span>
        </span>

        <Badge tone={consentTone[recording.state]} title={recording.detail}>
          {recording.state === 'yes' ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
          {recording.label}
        </Badge>

        {call.clock ? (
          <ClockPill
            deadline={call.clock.deadline}
            label={call.clock.label}
            reading={call.clock.reading}
            urgency={call.clock.state === 'overdue' ? 'overdue' : 'soon'}
          />
        ) : null}

        <Button variant="secondary" size="sm" asChild>
          <Link href={`/members/${member.id}`}>
            <ArrowLeft aria-hidden="true" />
            Member Story
          </Link>
        </Button>
      </div>

      <p className="text-2xs text-text-muted xl:hidden">{recording.detail}</p>
    </Card>
  );
}

/**
 * Screen 3: hold the conversation while the record writes itself.
 *
 * Everything the clinician does here is an act with a name: tapping an
 * answer, keeping or changing a pre-filled value, confirming or removing an
 * inferred sentence, picking an outcome code, signing. The software drafts;
 * it never decides, and it never writes without the signature.
 */
export function CallWorkspace({
  view,
  signOpen = false,
}: {
  view: CallWorkspaceView;
  signOpen?: boolean;
}) {
  const { call } = view;
  const toast = useToast();

  const [answers, setAnswers] = React.useState<Record<string, string | null>>(() =>
    Object.fromEntries(call.guide.items.map((item) => [item.id, item.answeredChipId])),
  );
  const [caregiverId, setCaregiverId] = React.useState<string | null>(() =>
    call.memberId === 'SYN-BH-004' ? 'CG-BH-CASEWORKER' : null,
  );
  const [decisions, setDecisions] = React.useState<Record<string, FieldDecision>>({});
  const [texts, setTexts] = React.useState<Record<string, string>>({});
  const [resolutions, setResolutions] = React.useState<Record<string, InferredResolution>>({});
  const [writeLines, setWriteLines] = React.useState<Record<string, string[]>>({});
  const [outcome, setOutcome] = React.useState<string | null>(null);
  const [signed, setSigned] = React.useState(false);

  const unresolvedCount = call.note.sentences.filter(
    (sentence) => sentence.tag === 'inferred' && resolutions[sentence.id] === undefined,
  ).length;

  const handleAnswer = React.useCallback((itemId: string, chipId: string) => {
    setAnswers((current) => ({
      ...current,
      [itemId]: current[itemId] === chipId ? null : chipId,
    }));
  }, []);

  const handleSign = React.useCallback(() => {
    setSigned(true);
    toast({
      title: `Signed by ${view.signedBy}`,
      description: `${call.writes.length} destinations written at once. Next contact ${call.nextContact.label}. Today's item is complete and the queue has re-ranked.`,
      tone: 'success',
    });
  }, [call.nextContact.label, call.writes.length, toast, view.signedBy]);

  const handleOutcome = React.useCallback(
    (code: string) => {
      setOutcome((current) => {
        if (current === code) return null;
        const chosen = view.outcomeCodes.find((entry) => entry.code === code);
        if (chosen) {
          toast({
            title: `Outcome recorded: ${chosen.label}`,
            description: chosen.updates,
          });
        }
        return code;
      });
    },
    [toast, view.outcomeCodes],
  );

  return (
    <div className="flex flex-col gap-6">
      <CallHeader view={view} />

      {signed ? (
        <p
          className={cn(
            'rounded-[var(--radius-card)] border px-4 py-3 text-xs text-text',
            'border-[color-mix(in_srgb,var(--success)_32%,var(--surface))] bg-[color-mix(in_srgb,var(--success)_8%,var(--surface))]',
          )}
        >
          <span className="font-medium">Signed by {view.signedBy}. </span>
          Written together in one act: {call.writes.map((target) => target.title).join(', ')}. The
          audit log records each one.{' '}
          <Link href="/today" className="underline underline-offset-2">
            Back to Today
          </Link>
          , where this item now reads as complete.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <CallGuide
            call={call}
            answers={answers}
            onAnswer={handleAnswer}
            caregiverId={caregiverId}
            onCaregiver={setCaregiverId}
          />
          <StructuredAssessment
            view={view}
            decisions={decisions}
            onDecide={(id, decision) => setDecisions((current) => ({ ...current, [id]: decision }))}
          />
        </div>

        <div className="flex flex-col gap-6">
          <NoteDraft
            call={call}
            texts={texts}
            resolutions={resolutions}
            onEdit={(id, text) => setTexts((current) => ({ ...current, [id]: text }))}
            onResolve={(id, resolution) =>
              setResolutions((current) => ({ ...current, [id]: resolution }))
            }
          />
          <WriteTargets
            view={view}
            writeLines={writeLines}
            onEditWrite={(id, lines) => setWriteLines((current) => ({ ...current, [id]: lines }))}
            unresolvedCount={unresolvedCount}
            remainingCount={call.assessment.remaining}
            signed={signed}
            onSign={handleSign}
            signOpen={signOpen}
          />
          <UnsuccessfulCall codes={view.outcomeCodes} chosen={outcome} onChoose={handleOutcome} />
        </div>
      </div>

      {view.signals.length > 0 ? (
        <Card className="px-6 py-4">
          <h3 className="text-sm font-semibold text-text">
            What put this call on today&apos;s list
          </h3>
          <p className="mt-1 text-2xs text-text-muted">
            The signals behind the guide, with the records they rest on. Priority has a reason and
            an action; this is the reason.
          </p>
          <ul className="mt-3 grid gap-3 lg:grid-cols-3">
            {view.signals.map((signal) => (
              <li
                key={signal.id}
                className="rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{signal.id}</Badge>
                  <span className="text-xs font-medium text-text">{signal.name}</span>
                  <Badge tone="warning">{signal.value}</Badge>
                </div>
                <p className="mt-1 text-2xs text-text-muted">{signal.reason}</p>
                <div className="mt-2">
                  <ConfidenceLabel
                    confidence={signal.confidence}
                    basis={`${signal.inputs.length} source records`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
