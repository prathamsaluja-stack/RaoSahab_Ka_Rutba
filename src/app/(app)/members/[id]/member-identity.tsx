'use client';

import * as React from 'react';
import { AlertTriangle, RotateCcw, Stethoscope } from 'lucide-react';
import { Badge, Button, Tooltip } from '@/components/ui';
import { MergedFromBadge } from '@/components/domain';
import { formatInstant } from '@/lib/time';
import type { MemberStoryView } from '@/lib/data/member-story';

/**
 * Who this person is, and on what basis the plan believes they are one person.
 *
 * Identity resolution is shown and reversible: the badge names the IDs it
 * folded together and the undo says exactly how many records would vanish.
 */
export function MemberIdentity({ view }: { view: MemberStoryView }) {
  const { member, coverage, story, priorIdRecordCount } = view;
  const merge = member.mergedFrom;
  const [undone, setUndone] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-text-muted">
        <span className="font-mono text-text">{member.id}</span>
        <span aria-hidden="true">·</span>
        <span>
          {member.age} {member.sex === 'F' ? 'F' : 'M'}
        </span>
        <span aria-hidden="true">·</span>
        <span>{coverage?.planName ?? 'No active coverage on file'}</span>
        <span aria-hidden="true">·</span>
        <Badge tone="brand">{coverage?.program ?? 'Complex care'} program</Badge>
        {coverage?.dualStatus === 'full' ? <Badge tone="info">Dual eligible, full</Badge> : null}
        {member.pcp ? (
          <span className="inline-flex items-center gap-1.5">
            <Stethoscope aria-hidden="true" className="size-3.5" />
            PCP {member.pcp.name} · {member.pcp.specialty}
          </span>
        ) : (
          <Badge tone="warning">No PCP attributed</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {member.flags.map((flag) => (
          <Badge key={flag} tone="warning">
            {flag}
          </Badge>
        ))}
        {member.address.returnedMail ? (
          <Badge tone="urgent">
            <AlertTriangle aria-hidden="true" />
            Mail returned from the address on file
          </Badge>
        ) : null}
        <Tooltip content={<span>Every member and record in this prototype is invented.</span>}>
          <Badge tone="neutral" tabIndex={0} className="cursor-default">
            Synthetic record
          </Badge>
        </Tooltip>
      </div>

      {merge ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          {undone ? (
            <>
              <Badge tone="warning">
                <AlertTriangle aria-hidden="true" />
                Merge undone for this view
              </Badge>
              <span className="text-2xs text-text-muted">
                Showing <span className="font-mono">{member.id}</span> only. {priorIdRecordCount}{' '}
                records from {merge.memberIds.filter((id) => id !== member.id).join(', ')} are
                hidden, including the fills that make the refill gap readable.
              </span>
              <Button
                variant="link"
                size="sm"
                className="text-2xs"
                onClick={() => setUndone(false)}
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                Restore the merge
              </Button>
            </>
          ) : (
            <>
              <MergedFromBadge mergedFrom={merge.memberIds} onUndo={() => setUndone(true)} />
              <span className="text-2xs text-text-muted">
                {merge.basis}. Merged by {merge.mergedBy} on {formatInstant(merge.mergedAt)}.
              </span>
            </>
          )}
        </div>
      ) : null}

      <p className="max-w-prose text-sm text-text">{story.summary}</p>
    </div>
  );
}
