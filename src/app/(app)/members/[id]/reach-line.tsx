'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  Languages,
  MessageSquare,
  Phone,
  PhoneOff,
  ShieldCheck,
  UserRound,
  Voicemail,
} from 'lucide-react';
import { Badge, Button, Card, Chip, Tooltip } from '@/components/ui';
import { FreshnessMark, SourceChip } from '@/components/domain';
import { formatInstant } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { ContactPoint } from '@/domain';
import type { MemberStoryView } from '@/lib/data/member-story';
import { consentTone, consentWord } from './story-parts';

const ownerWords: Record<ContactPoint['owner'], string> = {
  member: 'the member',
  spouse: 'the spouse',
  daughter: 'the daughter',
  son: 'the son',
  caregiver: 'a caregiver',
  caseworker: 'a caseworker',
  facility: 'a facility',
  unknown: 'nobody we can name',
};

const dayWords: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

function windowLabel(contact: ContactPoint): string {
  if (!contact.bestWindow) return 'No window established';
  const { start, end, days } = contact.bestWindow;
  const dayLabel =
    days.length === 0
      ? 'any day'
      : days.length === 5 && days.includes('mon') && days.includes('fri')
        ? 'weekdays'
        : days.map((day) => dayWords[day] ?? day).join(', ');
  return `${start}–${end}, ${dayLabel}`;
}

function answerLabel(contact: ContactPoint): string {
  const { attempts, answered } = contact.answerStats;
  if (attempts === 0) return 'Never called from the plan';
  return `Answered ${answered} of ${attempts}`;
}

function ConsentChips({ contact }: { contact: ContactPoint }) {
  const rows = [
    { icon: Phone, label: 'Calls', value: contact.consent.calls },
    { icon: MessageSquare, label: 'Texts', value: contact.consent.texts },
    { icon: Voicemail, label: 'Voicemail', value: contact.consent.voicemail },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {rows.map(({ icon: Icon, label, value }) => (
        <Badge key={label} tone={consentTone[value]}>
          <Icon aria-hidden="true" />
          {label}: {consentWord(value)}
        </Badge>
      ))}
      {contact.consent.recordedOn ? (
        <Tooltip
          content={
            <span>
              Consent recorded under {contact.consent.recordedOn}
              {contact.consent.recordedAt ? ` on ${formatInstant(contact.consent.recordedAt)}` : ''}
              .
            </span>
          }
        >
          <Badge tone="neutral" tabIndex={0} className="cursor-default">
            <ShieldCheck aria-hidden="true" />
            Recorded on <span className="font-mono">{contact.consent.recordedOn}</span>
          </Badge>
        </Tooltip>
      ) : (
        <Badge tone="warning">
          <ShieldCheck aria-hidden="true" />
          No consent record
        </Badge>
      )}
    </div>
  );
}

/**
 * The reach line, directly under the name.
 *
 * Reachability is part of care: which number answers, whose number it is,
 * when it answers, and what the member has agreed to per channel. A number
 * the plan has given up on is struck through and kept on screen, because a
 * dead number that quietly disappears is how members get lost.
 */
export function ReachLine({ view }: { view: MemberStoryView }) {
  const { bestContact, alternates, deadContactIds, story, member } = view;
  const promoted = story.reach.promoted;

  if (!bestContact) return null;

  const isDead = deadContactIds.includes(bestContact.id);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xs font-medium tracking-wide text-text-muted uppercase">
              Best number
            </span>
            <FreshnessMark
              level={bestContact.answerStats.answered > 0 ? 'filled' : 'half'}
              label={bestContact.answerStats.answered > 0 ? 'Answers' : 'Never tried'}
              description={`${answerLabel(bestContact)}. ${bestContact.answerStats.note ?? ''}`}
              subject={`Number ${bestContact.number}`}
            />
            {promoted?.toContactPointId === bestContact.id ? (
              <Badge tone="info">
                <ArrowRight aria-hidden="true" />
                Promoted from the ED registration
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              data-tabular
              className={cn(
                'text-lg font-semibold text-text',
                isDead && 'text-text-muted line-through',
              )}
            >
              {bestContact.number}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <UserRound aria-hidden="true" className="size-4" />
              {bestContact.label} ·{' '}
              {bestContact.ownerName ?? `Belongs to ${ownerWords[bestContact.owner]}`}
            </span>
          </div>

          <p className="max-w-prose text-xs text-text">{story.reach.headline}</p>
          <p className="max-w-prose text-2xs text-text-muted">{story.reach.note}</p>

          <div className="flex flex-wrap items-center gap-1.5">
            <Chip>
              <Clock3 aria-hidden="true" />
              {windowLabel(bestContact)}
            </Chip>
            <Chip>
              <Phone aria-hidden="true" />
              {answerLabel(bestContact)}
            </Chip>
            <Chip>
              <Languages aria-hidden="true" />
              {bestContact.language ?? member.preferredLanguage}
            </Chip>
            <SourceChip
              source={bestContact.provenance.source}
              recordId={bestContact.provenance.sourceRecordId}
              eventTime={formatInstant(bestContact.provenance.eventTime)}
              receivedTime={formatInstant(bestContact.provenance.receivedTime)}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <ConsentChips contact={bestContact} />
          <Button asChild size="lg">
            <Link href={`/members/${member.id}/call`}>
              <Phone aria-hidden="true" />
              Call {bestContact.number}
            </Link>
          </Button>
          <p className="text-2xs text-text-muted lg:text-right">
            {bestContact.bestWindow
              ? `Best window ${windowLabel(bestContact)}`
              : 'No answering window has been established yet'}
          </p>
        </div>
      </div>

      {promoted ? (
        <div className="border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--info)_7%,var(--surface))] px-6 py-3">
          <p className="text-xs font-medium text-text">
            Proposed change to the contact record
            <Badge tone="warning" className="ml-2 align-middle">
              Not applied
            </Badge>
          </p>
          <p className="mt-1 max-w-prose text-2xs text-text-muted">{promoted.reason}</p>
          <p className="mt-1 text-2xs text-text-muted">{promoted.state}</p>
        </div>
      ) : null}

      {alternates.length > 0 ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-3">
          <p className="text-2xs font-medium tracking-wide text-text-muted uppercase">
            Other numbers on file
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {alternates.map((contact) => {
              const dead = deadContactIds.includes(contact.id);
              return (
                <li key={contact.id} className="flex items-center gap-2 text-2xs">
                  {dead ? (
                    <PhoneOff aria-hidden="true" className="size-3.5 text-[var(--urgent)]" />
                  ) : (
                    <Phone aria-hidden="true" className="size-3.5 text-text-muted" />
                  )}
                  <span
                    data-tabular
                    className={cn('font-medium text-text', dead && 'text-text-muted line-through')}
                  >
                    {contact.number}
                  </span>
                  <span className="text-text-muted">
                    {contact.label} · {contact.ownerName ?? ownerWords[contact.owner]} ·{' '}
                    {answerLabel(contact)}
                  </span>
                  {dead ? (
                    <Badge tone="urgent">
                      Dead number · {contact.answerStats.attempts} failed attempts
                    </Badge>
                  ) : null}
                  {contact.isPrimaryOnFile && dead ? (
                    <Badge tone="warning">Still primary on file</Badge>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
