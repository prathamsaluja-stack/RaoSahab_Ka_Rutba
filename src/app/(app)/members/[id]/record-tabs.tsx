'use client';

import * as React from 'react';
import {
  CalendarClock,
  CheckCircle2,
  FileClock,
  FileText,
  Inbox,
  Lock,
  PhoneCall,
  Send,
  Terminal,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Sheet,
  SheetContent,
  SheetTrigger,
  Tooltip,
} from '@/components/ui';
import {
  ClockPill,
  FreshnessMark,
  RestrictedBadge,
  SourceChip,
  StatusStepper,
} from '@/components/domain';
import { formatDate, formatInstant } from '@/lib/time';
import type { AuthRequest, CareGap } from '@/domain';
import type { MemberStoryView, SourceRecordRow } from '@/lib/data/member-story';
import { cn } from '@/lib/utils';
import { consentTone, consentWord, Explainer, RecordId, RecordTable, Td, Th } from './story-parts';

const validityTone = {
  verified: 'success',
  unverified: 'warning',
  wrong_number: 'urgent',
  disconnected: 'urgent',
} as const;

/** Contacts: every number, whose it is, what it did when we called it. */
export function ContactsTab({ view }: { view: MemberStoryView }) {
  const { contacts, outreach, deadContactIds } = view;

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader
          title="Contact graph"
          subtitle="Numbers ranked by what actually answers, with the owner and the consent recorded for each channel."
        />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-[var(--border)]">
            {contacts.map((contact) => {
              const dead = deadContactIds.includes(contact.id);
              return (
                <li key={contact.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      data-tabular
                      className={cn(
                        'text-sm font-semibold text-text',
                        dead && 'text-text-muted line-through',
                      )}
                    >
                      {contact.number}
                    </span>
                    <Badge tone={validityTone[contact.validity]}>
                      {contact.validity.replace(/_/g, ' ')}
                    </Badge>
                    {contact.isPrimaryOnFile ? <Badge tone="neutral">Primary on file</Badge> : null}
                    {dead ? <Badge tone="urgent">Marked dead</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {contact.label} · {contact.ownerName ?? `owner recorded as ${contact.owner}`}
                  </p>
                  <dl className="mt-2.5 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-2xs text-text-muted">Answer history</dt>
                      <dd data-tabular className="text-xs text-text">
                        {contact.answerStats.answered} of {contact.answerStats.attempts}
                      </dd>
                      {contact.answerStats.note ? (
                        <p className="mt-0.5 text-2xs text-text-muted">
                          {contact.answerStats.note}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <dt className="text-2xs text-text-muted">Best window</dt>
                      <dd data-tabular className="text-xs text-text">
                        {contact.bestWindow
                          ? `${contact.bestWindow.start}–${contact.bestWindow.end}`
                          : 'None established'}
                      </dd>
                      {contact.bestWindow ? (
                        <p className="mt-0.5 text-2xs text-text-muted">
                          {contact.bestWindow.basis}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <dt className="text-2xs text-text-muted">Last outcome</dt>
                      <dd className="text-xs text-text">
                        {contact.lastOutcome
                          ? contact.lastOutcome.outcome.replace(/_/g, ' ')
                          : 'Never attempted'}
                      </dd>
                      {contact.lastOutcome ? (
                        <p data-tabular className="mt-0.5 text-2xs text-text-muted">
                          {formatInstant(contact.lastOutcome.at)}
                        </p>
                      ) : null}
                    </div>
                  </dl>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {(['calls', 'texts', 'voicemail'] as const).map((channel) => (
                      <Badge key={channel} tone={consentTone[contact.consent[channel]]}>
                        {channel}: {consentWord(contact.consent[channel])}
                      </Badge>
                    ))}
                    {contact.consent.recordedOn ? (
                      <Badge tone="neutral">
                        recorded on <RecordId>{contact.consent.recordedOn}</RecordId>
                      </Badge>
                    ) : null}
                    <SourceChip
                      source={contact.provenance.source}
                      recordId={contact.provenance.sourceRecordId}
                      receivedTime={formatInstant(contact.provenance.receivedTime)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
        <CardFooter>
          Low reachability is a reason to try another channel, never a reason to drop someone from
          the caseload.
        </CardFooter>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader title="Outreach history" subtitle={`${outreach.length} attempts on record`} />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-[var(--border)]">
            {outreach.map((attempt) => (
              <li key={attempt.id} className="flex items-start gap-3 px-6 py-2.5">
                <PhoneCall
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    attempt.outcome === 'answered'
                      ? 'text-[var(--success)]'
                      : attempt.outcome === 'no_answer' || attempt.outcome === 'voicemail'
                        ? 'text-text-muted'
                        : 'text-[var(--urgent)]',
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs text-text">
                    {attempt.outcome.replace(/_/g, ' ')}
                    {attempt.number ? (
                      <span data-tabular className="text-text-muted">
                        {' '}
                        · {attempt.number}
                      </span>
                    ) : null}
                  </p>
                  <p data-tabular className="text-2xs text-text-muted">
                    {formatInstant(attempt.at)} · {attempt.channel}
                  </p>
                  {attempt.note ? (
                    <p className="mt-0.5 text-2xs text-text-muted">{attempt.note}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

const documentStateCopy = {
  received: { label: 'Received', tone: 'success' },
  requested_not_received: { label: 'Requested, not received', tone: 'warning' },
  restricted: { label: 'Restricted', tone: 'neutral' },
} as const;

/** Documents, including the ones that did not arrive and the ones withheld. */
export function DocumentsTab({ view }: { view: MemberStoryView }) {
  return (
    <Card>
      <CardHeader
        title="Documents"
        subtitle={`${view.documents.length} records · a document that never arrived is a row, not an absence`}
      />
      <CardBody className="px-0 py-0">
        <ul className="divide-y divide-[var(--border)]">
          {view.documents.map((document) => {
            const state = documentStateCopy[document.state];
            return (
              <li key={document.id} className="flex flex-wrap items-start gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {document.state === 'restricted' ? (
                      <Lock aria-hidden="true" className="size-4 text-text-muted" />
                    ) : document.state === 'received' ? (
                      <FileText aria-hidden="true" className="size-4 text-text-muted" />
                    ) : (
                      <FileClock aria-hidden="true" className="size-4 text-[var(--warning)]" />
                    )}
                    <span className="text-xs font-medium text-text">{document.title}</span>
                    {document.state === 'restricted' ? (
                      <RestrictedBadge basis={document.restrictionBasis ?? '42 CFR Part 2'} />
                    ) : (
                      <Badge tone={state.tone}>{state.label}</Badge>
                    )}
                  </div>
                  {document.type === document.title ? null : (
                    <p className="mt-1 text-2xs text-text-muted">{document.type}</p>
                  )}
                  <p data-tabular className="mt-1 text-2xs text-text-muted">
                    {document.requestedAt
                      ? `Requested ${formatInstant(document.requestedAt)}`
                      : 'Arrived unprompted'}
                    {' · '}
                    {document.receivedAt
                      ? `received ${formatInstant(document.receivedAt)}`
                      : 'nothing received'}
                  </p>
                  {document.restrictionBasis ? (
                    <p className="mt-1 max-w-prose text-2xs text-text-muted">
                      {document.restrictionBasis}. The record exists; the space is never left blank.
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SourceChip
                    source={document.provenance.source}
                    recordId={document.provenance.sourceRecordId}
                  />
                  {document.state === 'requested_not_received' ? (
                    <Button variant="secondary" size="sm">
                      <Send aria-hidden="true" />
                      Re-request
                    </Button>
                  ) : document.state === 'restricted' ? (
                    <Button variant="secondary" size="sm">
                      <Send aria-hidden="true" />
                      Request a release
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <Inbox aria-hidden="true" />
                      Open
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}

function stepperState(auth: AuthRequest) {
  if (auth.status === 'completed') return 'completed' as const;
  if (auth.startOfCareConfirmed || auth.status === 'started') return 'started' as const;
  if (auth.status === 'approved') return 'approved' as const;
  if (auth.status === 'requested') return 'requested' as const;
  return 'unknown' as const;
}

/** Authorizations: requested, approved, started and completed stay apart. */
export function AuthorizationsTab({ view }: { view: MemberStoryView }) {
  return (
    <Card>
      <CardHeader
        title="Authorizations"
        subtitle="Approved is a decision. Started is a service. Only one of them helps the member."
      />
      <CardBody className="px-0 py-0">
        {view.auths.length === 0 ? (
          <p className="px-6 py-5 text-xs text-text-muted">
            No authorizations have been raised for this member.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {view.auths.map((auth) => {
              const approvedNotStarted = auth.status === 'approved' && !auth.startOfCareConfirmed;
              return (
                <li key={auth.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-text">{auth.service}</span>
                    <Badge tone={approvedNotStarted ? 'warning' : 'neutral'}>{auth.status}</Badge>
                    {approvedNotStarted ? (
                      <Badge tone="urgent">Approved, start not confirmed</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-2xs text-text-muted">
                    {auth.ownerTeam}
                    {auth.vendor ? ` · ${auth.vendor}` : ' · no vendor assigned'}
                  </p>
                  <StatusStepper
                    className="mt-3"
                    current={stepperState(auth)}
                    dates={{
                      requested: formatDate(auth.requestedAt, 'd MMM'),
                      approved: auth.decisionTime
                        ? formatDate(auth.decisionTime, 'd MMM')
                        : undefined,
                      started: auth.startOfCareAt
                        ? formatDate(auth.startOfCareAt, 'd MMM')
                        : undefined,
                    }}
                    unconfirmedNote={
                      approvedNotStarted
                        ? 'The agency has not confirmed a start of care. Call them for a date rather than reading this as delivered.'
                        : undefined
                    }
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <SourceChip
                      source={auth.provenance.source}
                      recordId={auth.provenance.sourceRecordId}
                      eventTime={formatInstant(auth.provenance.eventTime)}
                      receivedTime={formatInstant(auth.provenance.receivedTime)}
                    />
                    {approvedNotStarted ? (
                      <Button variant="secondary" size="sm">
                        <PhoneCall aria-hidden="true" />
                        Call the agency for a start date
                      </Button>
                    ) : null}
                  </div>
                  {auth.provenance.history?.map((entry) => (
                    <p key={entry.at} data-tabular className="mt-2 text-2xs text-text-muted">
                      {formatInstant(entry.at)} · {entry.by} · {entry.change}
                    </p>
                  ))}
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

const gapStateCopy: Record<
  CareGap['state'],
  { label: string; tone: 'warning' | 'success' | 'neutral' | 'info' }
> = {
  open: { label: 'Open', tone: 'warning' },
  closed: { label: 'Closed', tone: 'success' },
  pending_claim: { label: 'Pending claim', tone: 'info' },
  excluded: { label: 'Excluded', tone: 'neutral' },
  unknown: { label: 'Unknown', tone: 'neutral' },
};

/** Care gaps, including the ones a claim may already have closed. */
export function CareGapsTab({ view }: { view: MemberStoryView }) {
  return (
    <Card>
      <CardHeader
        title="Care gaps"
        subtitle={`${view.careGaps.length} measures · a gap closes when a clinician or a claim says so, never on its own`}
      />
      <CardBody className="flex flex-col gap-4">
        <Explainer>{view.story.claimsNote}</Explainer>
        <RecordTable
          caption="Care gaps with their measurement windows"
          head={
            <tr>
              <Th>Measure</Th>
              <Th className="w-24">Code</Th>
              <Th className="w-44">Window</Th>
              <Th className="w-32">State</Th>
              <Th>Why</Th>
            </tr>
          }
        >
          {view.careGaps.map((gap) => {
            const state = gapStateCopy[gap.state];
            return (
              <tr key={gap.id}>
                <Td className="font-medium">{gap.measure}</Td>
                <Td>
                  <RecordId>{gap.measureCode}</RecordId>
                </Td>
                <Td data-tabular className="text-text-muted">
                  {formatDate(gap.windowOpen, 'd MMM')} to{' '}
                  {formatDate(gap.windowClose, 'd MMM yyyy')}
                </Td>
                <Td>
                  <Badge tone={state.tone}>{state.label}</Badge>
                </Td>
                <Td className="text-text-muted">{gap.note ?? '—'}</Td>
              </tr>
            );
          })}
        </RecordTable>
      </CardBody>
    </Card>
  );
}

const taskStateTone = (state: string) =>
  state === 'completed' || state === 'delivered'
    ? 'success'
    : state === 'waiting_on_others'
      ? 'info'
      : 'neutral';

/** Notes and the work a call created. */
export function NotesTab({ view }: { view: MemberStoryView }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader
          title="Tasks"
          subtitle={`${view.tasks.length} open items, with whose desk each one sits on`}
        />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-[var(--border)]">
            {view.tasks.map((task) => (
              <li key={task.id} className="px-6 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text">{task.title}</p>
                    <p className="mt-1 text-2xs text-text-muted">
                      {task.owner} · {task.ownerTeam}
                    </p>
                  </div>
                  <ClockPill deadline={task.due} label="Due" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone={taskStateTone(task.state)}>{task.state.replace(/_/g, ' ')}</Badge>
                  {task.waitingOnOthers ? <Badge tone="info">Waiting on others</Badge> : null}
                  {task.nextCheck ? (
                    <Badge tone="neutral" data-tabular>
                      <CalendarClock aria-hidden="true" />
                      Next check {formatInstant(task.nextCheck)}
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notes" subtitle={`${view.notes.length} notes, newest first`} />
        <CardBody className="px-0 py-0">
          <ul className="divide-y divide-[var(--border)]">
            {view.notes.map((note) => (
              <li key={note.id} className="px-6 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-text">{note.authorName}</span>
                  <span className="text-2xs text-text-muted">{note.authorRole}</span>
                  <Badge tone="neutral">{note.type.replace(/_/g, ' ')}</Badge>
                  {note.signed ? (
                    <Badge tone="success">
                      <CheckCircle2 aria-hidden="true" />
                      Signed {note.signedAt ? formatInstant(note.signedAt) : ''}
                    </Badge>
                  ) : (
                    <Badge tone="warning">Draft · not in the record</Badge>
                  )}
                </div>
                <p data-tabular className="mt-1 text-2xs text-text-muted">
                  {formatInstant(note.createdAt)}
                </p>
                <p className="mt-1.5 max-w-prose text-xs text-text">{note.text}</p>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function SourceDrawer({ row }: { row: SourceRecordRow }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Terminal aria-hidden="true" />
          Open raw record
        </Button>
      </SheetTrigger>
      <SheetContent
        title={row.label}
        description={`${row.dataset} · ${row.provenance.sourceRecordId}`}
      >
        <pre className="overflow-x-auto rounded-[var(--radius-input)] bg-[var(--surface-muted)] p-4 font-mono text-2xs leading-5 text-text">
          {JSON.stringify(
            {
              dataset: row.dataset,
              source: row.provenance.source,
              sourceRecordId: row.provenance.sourceRecordId,
              eventTime: row.provenance.eventTime,
              receivedTime: row.provenance.receivedTime,
              status: row.provenance.status,
              reviewer: row.provenance.reviewer ?? null,
              history: row.provenance.history ?? [],
            },
            null,
            2,
          )}
        </pre>
        {row.provenance.history?.length ? (
          <div className="mt-4">
            <p className="text-xs font-medium text-text">Edit history</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {row.provenance.history.map((entry) => (
                <li key={entry.at} data-tabular className="text-2xs text-text-muted">
                  {formatInstant(entry.at)} · {entry.by} · {entry.change}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-2xs text-text-muted">No edits recorded against this record.</p>
        )}
        <p className="mt-4 text-2xs text-text-muted">
          Clinical event time and received time are kept apart on purpose: a late claim for an old
          event must never look newer than a fresh ADT message.
        </p>
      </SheetContent>
    </Sheet>
  );
}

/** The raw-record drawer: everything above this page, in monospace. */
export function SourcesTab({ view }: { view: MemberStoryView }) {
  return (
    <Card>
      <CardHeader
        title="Sources"
        subtitle={`${view.sources.length} records behind this page, newest received first`}
        actions={
          <Tooltip
            content={<span>Identifiers, times and statuses exactly as the feeds sent them.</span>}
          >
            <Badge tone="neutral" tabIndex={0} className="cursor-default font-mono">
              raw
            </Badge>
          </Tooltip>
        }
      />
      <CardBody className="px-0 py-0">
        <RecordTable
          className="rounded-none border-0"
          caption="Every source record behind this member story"
          head={
            <tr>
              <Th className="w-40">Dataset</Th>
              <Th>Record</Th>
              <Th className="w-44">Event time</Th>
              <Th className="w-44">Received</Th>
              <Th className="w-36">Status</Th>
              <Th className="w-40">Raw record</Th>
            </tr>
          }
        >
          {view.sources.map((row) => (
            <tr key={row.key}>
              <Td className="text-text-muted">{row.dataset}</Td>
              <Td>
                <span className="block text-xs text-text">{row.label}</span>
                <RecordId>{row.provenance.sourceRecordId}</RecordId>
              </Td>
              <Td data-tabular className="font-mono text-2xs text-text-muted">
                {row.eventLabel}
              </Td>
              <Td data-tabular className="font-mono text-2xs text-text-muted">
                {row.receivedLabel}
              </Td>
              <Td>
                <span className="inline-flex items-center gap-1.5">
                  <FreshnessMark
                    level={row.provenance.status === 'source_confirmed' ? 'filled' : 'half'}
                    label={row.provenance.status.replace(/_/g, ' ')}
                    description={`${row.dataset} record ${row.provenance.sourceRecordId}, received ${row.receivedLabel}.`}
                    subject={row.label}
                  />
                  <span className="font-mono text-2xs text-text-muted">
                    {row.provenance.status}
                  </span>
                </span>
              </Td>
              <Td>
                <SourceDrawer row={row} />
                {row.provenance.history?.length ? (
                  <span className="block text-2xs text-[var(--info)]">
                    {row.provenance.history.length} edit
                    {row.provenance.history.length === 1 ? '' : 's'}
                  </span>
                ) : null}
              </Td>
            </tr>
          ))}
        </RecordTable>
      </CardBody>
      <CardFooter>
        Every fact on the other tabs resolves to one of these rows. Nothing is displayed that cannot
        be followed back to the feed it came from.
      </CardFooter>
    </Card>
  );
}
