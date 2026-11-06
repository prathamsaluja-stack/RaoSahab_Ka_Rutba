'use client';

import * as React from 'react';
import { CircleOff, GitCompareArrows, ShieldAlert } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  RadioGroup,
  Textarea,
  Tooltip,
} from '@/components/ui';
import { ConflictBadge, FreshnessMark } from '@/components/domain';
import { formatDate, formatInstant } from '@/lib/time';
import {
  MEDICATION_SOURCE_COLUMNS,
  reconcileDecisions,
  type MedicationMatrixRow,
  type MemberStoryView,
} from '@/lib/data/member-story';
import type { MedicationSourceList, MedicationStatement } from '@/domain';
import { cn } from '@/lib/utils';
import { Explainer, RecordTable, Td, Th } from './story-parts';

const changeTone = {
  new: 'warning',
  changed: 'warning',
  unchanged: 'neutral',
  stopped: 'urgent',
} as const;

const severityCopy = {
  conflict: 'Sources disagree',
  missing: 'Expected and absent',
  single_source: 'One source only',
} as const;

/**
 * Each column is dated by the thing it actually knows: the discharge list by
 * the day it was written, the pharmacy column by the day the drug was handed
 * over, the claims column by the day it was billed.
 */
function cellDateLabel(statement: MedicationStatement): string {
  switch (statement.sourceList) {
    case 'discharge_list':
      return `Listed ${formatDate(statement.provenance.eventTime, 'd MMM')}`;
    case 'pbm':
      return `Filled ${formatDate(statement.provenance.eventTime, 'd MMM')}`;
    case 'claims_derived':
      return `Billed ${formatDate(statement.asOfDate, 'd MMM')}`;
    case 'member_reported':
      return `Told us ${formatDate(statement.asOfDate, 'd MMM')}`;
  }
}

function Cell({
  statement,
  column,
  row,
}: {
  statement: MedicationStatement | null;
  column: MedicationSourceList;
  row: MedicationMatrixRow;
}) {
  if (!statement) {
    const missing = row.conflict?.severity === 'missing' && column === 'pbm';
    return (
      <Td
        className={cn(
          'text-text-muted',
          missing && 'bg-[color-mix(in_srgb,var(--urgent)_8%,transparent)]',
        )}
      >
        <span className="inline-flex items-center gap-1.5 text-2xs">
          <CircleOff aria-hidden="true" className="size-3.5" />
          {missing ? 'No fill seen' : 'Not on this list'}
        </span>
      </Td>
    );
  }

  return (
    <Td>
      <div className="flex flex-col gap-1">
        <span data-tabular className="text-xs font-medium text-text">
          {statement.dose} · {statement.frequency}
        </span>
        <span className="flex items-center gap-1.5 text-2xs text-text-muted">
          <FreshnessMark
            level={
              statement.provenance.source === 'claims'
                ? 'open'
                : statement.provenance.status === 'member_reported'
                  ? 'half'
                  : 'filled'
            }
            label={
              statement.provenance.source === 'claims'
                ? 'Stale'
                : statement.provenance.status === 'member_reported'
                  ? 'Member reported'
                  : 'Verified'
            }
            description={`${cellDateLabel(statement)}. This source is current to ${formatDate(
              statement.asOfDate,
              'd MMM yyyy',
            )}. Received ${formatInstant(statement.provenance.receivedTime)}.`}
            subject={`${statement.drug}, ${statement.sourceList.replace(/_/g, ' ')}`}
          />
          {cellDateLabel(statement)}
        </span>
        {statement.change && statement.change !== 'unchanged' ? (
          <Badge tone={changeTone[statement.change]} className="self-start">
            {statement.change}
          </Badge>
        ) : null}
        {statement.prescriber ? (
          <span className="text-2xs text-text-muted">{statement.prescriber}</span>
        ) : null}
      </div>
    </Td>
  );
}

function ReconcileDialog({ rows }: { rows: readonly MedicationMatrixRow[] }) {
  const [open, setOpen] = React.useState(false);
  const [decisions, setDecisions] = React.useState<Record<string, string>>({});
  const complete = rows.every((row) => decisions[row.ingredient]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={rows.length === 0}>
          <GitCompareArrows aria-hidden="true" />
          Reconcile {rows.length} row{rows.length === 1 ? '' : 's'}
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Reconcile the medication list"
        description="One decision per disagreeing row, recorded against your name. Nothing is merged until you sign."
        className="w-[min(720px,calc(100vw-32px))]"
      >
        <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-1">
          {rows.map((row) => (
            <section
              key={row.ingredient}
              className="rounded-[var(--radius-card)] border border-[var(--border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-text">{row.drug}</h4>
                <Badge tone="warning">{severityCopy[row.conflict?.severity ?? 'conflict']}</Badge>
              </div>
              <p className="mt-1 max-w-prose text-2xs text-text-muted">{row.conflict?.reason}</p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {MEDICATION_SOURCE_COLUMNS.map((column) => {
                  const cell = row.cells[column.id];
                  return (
                    <li
                      key={column.id}
                      className="flex items-baseline justify-between gap-3 rounded-[var(--radius-input)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-2xs"
                    >
                      <span className="text-text-muted">{column.label}</span>
                      <span data-tabular className="font-medium text-text">
                        {cell ? `${cell.dose} ${cell.frequency}` : 'Nothing on this list'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <RadioGroup
                className="mt-3"
                label="Your decision"
                options={reconcileDecisions}
                value={decisions[row.ingredient] ?? ''}
                onValueChange={(value) =>
                  setDecisions((current) => ({ ...current, [row.ingredient]: value }))
                }
              />
            </section>
          ))}
          <Textarea
            label="Reconciliation note"
            rows={3}
            placeholder="What the member said, what you are sending to the prescriber, what remains open."
            hint="This becomes a reconciliation draft for the call workspace. It enters the record when you sign."
          />
        </div>
        <DialogFooter className="-mx-6 mt-5 -mb-5">
          <DialogClose asChild>
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" disabled={!complete} onClick={() => setOpen(false)}>
            Save as a reconciliation draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * One row per drug, one column per source. Never merged.
 *
 * Software is allowed to put the lists side by side and say which rows
 * disagree. Deciding which one is true is a clinician's act, recorded as one.
 */
export function MedicationsMatrix({ view }: { view: MemberStoryView }) {
  const { medicationRows, conflictRows, story } = view;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Medications by source"
          subtitle={`${medicationRows.length} drugs · ${conflictRows.length} rows where the sources do not agree`}
          actions={<ReconcileDialog rows={conflictRows} />}
        />
        <CardBody className="flex flex-col gap-4">
          <Explainer>{story.medications.note}</Explainer>
          <RecordTable
            caption="Medications, one row per drug and one column per source"
            head={
              <tr>
                <Th className="w-56">Drug</Th>
                {MEDICATION_SOURCE_COLUMNS.map((column) => (
                  <Th key={column.id}>
                    <Tooltip content={<span>{column.blurb}</span>}>
                      <span tabIndex={0}>{column.label}</span>
                    </Tooltip>
                  </Th>
                ))}
              </tr>
            }
          >
            {medicationRows.map((row) => (
              <React.Fragment key={row.ingredient}>
                <tr
                  className={cn(
                    row.conflict &&
                      'bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] [&>td]:border-b-0',
                  )}
                >
                  <Td>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-text">{row.drug}</span>
                      <span className="font-mono text-2xs text-text-muted">
                        RxNorm {row.rxNorm}
                      </span>
                      {row.drugClass ? (
                        <span className="text-2xs text-text-muted">{row.drugClass}</span>
                      ) : null}
                      {row.isHighRisk ? (
                        <Badge tone="urgent" className="self-start">
                          <ShieldAlert aria-hidden="true" />
                          High risk
                        </Badge>
                      ) : null}
                    </div>
                  </Td>
                  {MEDICATION_SOURCE_COLUMNS.map((column) => (
                    <Cell
                      key={column.id}
                      statement={row.cells[column.id]}
                      column={column.id}
                      row={row}
                    />
                  ))}
                </tr>
                {row.conflict ? (
                  <tr className="bg-[color-mix(in_srgb,var(--warning)_8%,transparent)]">
                    <Td colSpan={MEDICATION_SOURCE_COLUMNS.length + 1} className="pt-0">
                      <div className="flex flex-wrap items-start gap-2">
                        {row.conflict.severity === 'conflict' ? (
                          <ConflictBadge reason={row.conflict.reason} />
                        ) : (
                          <Badge tone="warning">
                            <CircleOff aria-hidden="true" />
                            {severityCopy[row.conflict.severity]}
                          </Badge>
                        )}
                        <p className="max-w-prose text-2xs text-[var(--warning)]">
                          {row.conflict.reason}
                        </p>
                      </div>
                    </Td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
          </RecordTable>
        </CardBody>
        <CardFooter>
          Caseline never merges two medication lists. The matrix shows what each system says; the
          reconciliation dialog records which one a named clinician decided to believe, and why.
        </CardFooter>
      </Card>
    </div>
  );
}
