'use client';

import * as React from 'react';
import { AlertTriangle, CircleHelp, Gauge } from 'lucide-react';
import { Badge, Card, CardBody, CardFooter, CardHeader, Tooltip } from '@/components/ui';
import { ConflictBadge, FreshnessMark, SourceChip } from '@/components/domain';
import { formatDate, formatInstant } from '@/lib/time';
import type { LabTrend, MemberStoryView } from '@/lib/data/member-story';
import { Explainer, Field, RecordId } from './story-parts';

/** A trend line for three or fewer results: shape only, values alongside. */
function Sparkline({ trend }: { trend: LabTrend }) {
  const values = trend.points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 72;
  const height = 24;

  if (trend.points.length < 2) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-6 w-[72px] shrink-0 text-text-muted"
        role="img"
        aria-label={`One result only: ${values[0]} ${trend.unit}. No trend can be drawn.`}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx={width / 2} cy={height / 2} r="2.5" fill="currentColor" />
      </svg>
    );
  }

  const points = trend.points.map((point, index) => {
    const x = (index / (trend.points.length - 1)) * (width - 4) + 2;
    const y = height - 3 - ((point.value - min) / span) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const direction = (values.at(-1) ?? 0) > (values[0] ?? 0) ? 'rising' : 'falling';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-6 w-[72px] shrink-0 text-[var(--brand)]"
      role="img"
      aria-label={`${trend.name}, ${direction}: ${trend.points
        .map((point) => `${point.value} ${trend.unit} on ${point.atLabel}`)
        .join(', then ')}.`}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((point) => {
        const [x, y] = point.split(',');
        return <circle key={point} cx={x} cy={y} r="1.8" fill="currentColor" />;
      })}
    </svg>
  );
}

function LabRow({ trend }: { trend: LabTrend }) {
  const latest = trend.points.at(-1);
  if (!latest) return null;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
      <div className="min-w-44 flex-1">
        <p className="text-xs font-medium text-text">{trend.name}</p>
        <p className="font-mono text-2xs text-text-muted">LOINC {trend.loinc}</p>
      </div>
      <Sparkline trend={trend} />
      <div className="min-w-36">
        <p data-tabular className="text-sm font-semibold text-text">
          {latest.value} <span className="text-2xs font-normal text-text-muted">{trend.unit}</span>
        </p>
        <p data-tabular className="text-2xs text-text-muted">
          {latest.atLabel}
          {trend.points.length > 1
            ? ` · from ${trend.points[0]?.value} on ${trend.points[0]?.atLabel}`
            : ' · single result'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {latest.abnormalFlag && latest.abnormalFlag !== 'normal' ? (
          <Badge tone={latest.abnormalFlag === 'critical' ? 'urgent' : 'warning'}>
            {latest.abnormalFlag}
          </Badge>
        ) : (
          <Badge tone="success">in range</Badge>
        )}
        {trend.referenceRange ? (
          <span className="text-2xs text-text-muted">Ref {trend.referenceRange}</span>
        ) : null}
        <FreshnessMark
          level="filled"
          label="Verified"
          description={`Resulted ${latest.atLabel}, received ${latest.receivedLabel}.`}
          subject={trend.name}
        />
      </div>
      {trend.discrepancyNote ? (
        <div className="w-full">
          <ConflictBadge reason={trend.discrepancyNote} />
          <p className="mt-1 max-w-prose text-2xs text-[var(--warning)]">{trend.discrepancyNote}</p>
        </div>
      ) : null}
    </li>
  );
}

/**
 * The clinical snapshot: labs, diagnoses, the plan's risk score and the HRA.
 *
 * Every panel is dated, every diagnosis names its source, and a question
 * nobody asked says "not asked" rather than showing nothing at all.
 */
export function ClinicalSnapshot({ view }: { view: MemberStoryView }) {
  const { labs, member, risk, story, assessments, adtEvents } = view;
  const latestAdmission = [...adtEvents]
    .filter((event) => event.type === 'admit' || event.type === 'ed_registration')
    .sort((a, b) => Date.parse(b.eventTime) - Date.parse(a.eventTime))[0];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-3">
      <div className="flex flex-col gap-6 xl:col-span-2">
        <Card>
          <CardHeader
            title="Labs"
            subtitle="Each result with its specimen date and, where there is more than one, its shape over time."
          />
          <CardBody className="px-0 py-0">
            {labs.length > 0 ? (
              <ul className="divide-y divide-[var(--border)]">
                {labs.map((trend) => (
                  <LabRow key={trend.loinc} trend={trend} />
                ))}
              </ul>
            ) : (
              <p className="px-6 py-5 text-xs text-text-muted">
                No laboratory results have been received for this member. That is an absence of
                data, not a normal result.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Assessment items"
            subtitle="What was asked, what was answered, and what nobody has asked yet."
          />
          <CardBody className="px-0 py-0">
            {assessments.length === 0 ? (
              <p className="max-w-prose px-6 py-5 text-xs text-text-muted">
                No health risk assessment is on file for this member. Nothing has been asked, which
                is not the same as nothing being wrong.
              </p>
            ) : null}
            <ul className="divide-y divide-[var(--border)]">
              {assessments.map((item) => (
                <li key={item.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-6 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text">{item.item}</p>
                    <p className="mt-0.5 text-2xs text-text-muted">
                      {item.instrument} · assessed {formatDate(item.assessedDate, 'd MMM yyyy')}
                      {item.recordedUnderMemberId ? (
                        <>
                          {' '}
                          · recorded under <RecordId>{item.recordedUnderMemberId}</RecordId>
                        </>
                      ) : null}
                    </p>
                  </div>
                  {item.state === 'answered' ? (
                    <span className="text-xs font-medium text-text">{item.value}</span>
                  ) : (
                    <Tooltip
                      content={
                        <span>
                          This item was never put to the member. An unasked question is not a
                          negative answer.
                        </span>
                      }
                    >
                      <Badge tone="warning" tabIndex={0} className="cursor-default">
                        <CircleHelp aria-hidden="true" />
                        {item.state === 'declined' ? 'Declined' : 'Not asked'}
                      </Badge>
                    </Tooltip>
                  )}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader
            title="Risk score"
            subtitle="One dated input. Never the order of the queue."
          />
          <CardBody className="flex flex-col gap-3">
            {risk ? (
              <>
                <div className="flex items-end gap-3">
                  <span data-tabular className="text-2xl font-semibold text-text">
                    {risk.value.toFixed(2)}
                  </span>
                  <Badge tone={risk.band === 'high' ? 'urgent' : 'neutral'}>
                    <Gauge aria-hidden="true" />
                    {risk.band} band
                  </Badge>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Model">{risk.model}</Field>
                  <Field label="Basis">
                    {risk.basis === 'cost'
                      ? 'Cost of care'
                      : risk.basis === 'utilization'
                        ? 'Utilization'
                        : 'Clinical'}
                  </Field>
                  <Field label="Scored">{formatDate(risk.scoredDate, 'd MMM yyyy')}</Field>
                  <Field label="Received">{formatInstant(risk.provenance.receivedTime)}</Field>
                </dl>
                {story.riskWarning ? (
                  <p className="flex items-start gap-2 rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--urgent)_28%,var(--surface))] bg-[color-mix(in_srgb,var(--urgent)_10%,var(--surface))] px-3 py-2 text-2xs text-[var(--urgent)]">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {story.riskWarning}
                      {latestAdmission
                        ? ` Latest hospital event: ${formatInstant(latestAdmission.eventTime)}.`
                        : ''}
                    </span>
                  </p>
                ) : null}
                <Explainer>{story.riskNote}</Explainer>
                <SourceChip
                  source={risk.provenance.source}
                  recordId={risk.provenance.sourceRecordId}
                  eventTime={formatInstant(risk.provenance.eventTime)}
                  receivedTime={formatInstant(risk.provenance.receivedTime)}
                />
              </>
            ) : (
              <p className="text-xs text-text-muted">No score on file.</p>
            )}
          </CardBody>
          <CardFooter>
            Cost-based models carry documented bias. Low data completeness is a reason to verify,
            not a reason to read someone as low risk.
          </CardFooter>
        </Card>

        <Card>
          <CardHeader
            title="Diagnoses"
            subtitle="As the plan has them coded, each with its source."
          />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-[var(--border)]">
              {member.conditions.map((condition) => (
                <li
                  key={`${condition.code}-${condition.provenance.sourceRecordId}`}
                  className="px-6 py-3"
                >
                  <p className="text-xs font-medium text-text">{condition.label}</p>
                  <p className="mt-0.5 font-mono text-2xs text-text-muted">
                    {condition.codeSystem} {condition.code}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <SourceChip
                      source={condition.provenance.source}
                      recordId={condition.provenance.sourceRecordId}
                      eventTime={formatInstant(condition.provenance.eventTime)}
                      receivedTime={formatInstant(condition.provenance.receivedTime)}
                    />
                    {condition.conflictsWith ? (
                      <ConflictBadge reason={condition.conflictsWith} />
                    ) : null}
                  </div>
                  {condition.conflictsWith ? (
                    <p className="mt-1 max-w-prose text-2xs text-[var(--warning)]">
                      Disagrees with: {condition.conflictsWith}. Both are shown; neither is picked.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
