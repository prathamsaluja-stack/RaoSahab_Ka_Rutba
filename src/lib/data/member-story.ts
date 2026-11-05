import memberStoryJson from '@data/golden/member-story.json';
import {
  memberStoryFileSchema,
  type Appointment,
  type AdtEvent,
  type Assessment,
  type AuditEvent,
  type AuthRequest,
  type CareGap,
  type Claim,
  type ClaimsCompleteness,
  type ClinicalDocument,
  type ContactPoint,
  type Coverage,
  type LabResult,
  type MedicationSourceList,
  type MedicationStatement,
  type Member,
  type MemberStory,
  type Note,
  type OutreachAttempt,
  type PharmacyFill,
  type Provenance,
  type RiskScore,
  type Task,
  type FiredSignal,
} from '@/domain';
import { goldenDatasets } from '@/lib/data/golden';
import { signalsFor } from '@/lib/data/signals';
import { formatDate, formatInstant } from '@/lib/time';

/**
 * Everything one Member Story needs, assembled once per member.
 *
 * The screens are presentational: they read the committed fixtures and the
 * stated readings in `member-story.json` and print them. Nothing here derives
 * a clinical number, merges two sources or decides anything — the matrix is
 * laid side by side and the reconciliation is the clinician's act.
 */

export const memberStoryFile = memberStoryFileSchema.parse(memberStoryJson);

export const reconcileDecisions = memberStoryFile.reconcileDecisions;
export const changeWindowLabel = memberStoryFile.changeWindowLabel;

/** The four columns of the medication matrix, always in this order. */
export const MEDICATION_SOURCE_COLUMNS: readonly {
  id: MedicationSourceList;
  label: string;
  blurb: string;
}[] = [
  {
    id: 'discharge_list',
    label: 'Discharge list',
    blurb: 'What the hospital sent home with the member, as a structured document.',
  },
  {
    id: 'pbm',
    label: 'Pharmacy fills',
    blurb: 'What the pharmacy benefit feed says was dispensed.',
  },
  {
    id: 'claims_derived',
    label: 'Claims-derived',
    blurb: 'What has been billed. History, not status.',
  },
  {
    id: 'member_reported',
    label: 'Member-reported',
    blurb: 'What the member or the household told us on a call.',
  },
];

export interface MedicationMatrixRow {
  ingredient: string;
  drug: string;
  rxNorm: string;
  drugClass: string | null;
  isHighRisk: boolean;
  cells: Record<MedicationSourceList, MedicationStatement | null>;
  conflict: { severity: 'conflict' | 'missing' | 'single_source'; reason: string } | null;
}

export type TimelineLaneId = 'hospital' | 'visits' | 'medications' | 'results' | 'coordination';

export interface TimelineLane {
  id: TimelineLaneId;
  label: string;
}

export const TIMELINE_LANES: readonly TimelineLane[] = [
  { id: 'hospital', label: 'Hospital and ED' },
  { id: 'visits', label: 'Visits and claims' },
  { id: 'medications', label: 'Medications' },
  { id: 'results', label: 'Labs and documents' },
  { id: 'coordination', label: 'Outreach and authorizations' },
];

export interface TimelineEvent {
  id: string;
  lane: TimelineLaneId;
  kind: string;
  title: string;
  detail: string;
  at: string;
  atLabel: string;
  source: Provenance['source'];
  sourceRecordId: string;
  receivedLabel: string;
  tone: 'urgent' | 'warning' | 'info' | 'neutral' | 'success';
  /** 0 at the left edge of the window, 1 at the right. */
  position: number;
}

export interface TimelineMonth {
  key: string;
  label: string;
  position: number;
  width: number;
}

export interface TimelineView {
  months: readonly TimelineMonth[];
  events: readonly TimelineEvent[];
  /** Where the claims feed stops being honest, as a fraction of the axis. */
  claimsCompletePosition: number;
  claimsCompleteLabel: string;
  claimsStamp: string;
  outsideWindowCount: number;
  windowLabel: string;
}

export interface LabTrend {
  loinc: string;
  name: string;
  unit: string;
  referenceRange: string | null;
  points: {
    id: string;
    value: number;
    at: string;
    atLabel: string;
    abnormalFlag: LabResult['abnormalFlag'];
    receivedLabel: string;
  }[];
  latest: LabResult;
  discrepancyNote: string | null;
}

export interface SourceRecordRow {
  key: string;
  dataset: string;
  label: string;
  provenance: Provenance;
  eventLabel: string;
  receivedLabel: string;
}

export interface MemberStoryView {
  member: Member;
  story: MemberStory;
  coverage: Coverage | null;
  coverageHistory: readonly Coverage[];
  contacts: readonly ContactPoint[];
  bestContact: ContactPoint | null;
  alternates: readonly ContactPoint[];
  deadContactIds: readonly string[];
  signals: readonly FiredSignal[];
  medicationRows: readonly MedicationMatrixRow[];
  conflictRows: readonly MedicationMatrixRow[];
  timeline: TimelineView;
  claimsCompleteness: ClaimsCompleteness | null;
  labs: readonly LabTrend[];
  risk: RiskScore | null;
  assessments: readonly Assessment[];
  documents: readonly ClinicalDocument[];
  auths: readonly AuthRequest[];
  careGaps: readonly CareGap[];
  tasks: readonly Task[];
  notes: readonly Note[];
  outreach: readonly OutreachAttempt[];
  fills: readonly PharmacyFill[];
  adtEvents: readonly AdtEvent[];
  claims: readonly Claim[];
  appointments: readonly Appointment[];
  auditEvents: readonly AuditEvent[];
  sources: readonly SourceRecordRow[];
}

const WINDOW_START = '2025-12-01T00:00:00-05:00';
const WINDOW_END = '2026-11-30T23:59:00-05:00';

const windowStartMs = Date.parse(WINDOW_START);
const windowEndMs = Date.parse(WINDOW_END);

function positionOf(instant: string): number {
  const value = (Date.parse(instant) - windowStartMs) / (windowEndMs - windowStartMs);
  return Math.min(1, Math.max(0, value));
}

function buildMonths(): TimelineMonth[] {
  const months: TimelineMonth[] = [];
  for (let index = 0; index < 12; index += 1) {
    const start = new Date(Date.UTC(2025, 11 + index, 1));
    const next = new Date(Date.UTC(2025, 12 + index, 1));
    const startIso = start.toISOString();
    const nextIso = next.toISOString();
    months.push({
      key: startIso.slice(0, 7),
      label: start.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }),
      position: positionOf(startIso),
      width: positionOf(nextIso) - positionOf(startIso),
    });
  }
  return months;
}

const TIMELINE_MONTHS = buildMonths();

function byMemberIds<T extends { memberId: string }>(
  rows: readonly T[],
  ids: readonly string[],
): T[] {
  return rows.filter((row) => ids.includes(row.memberId));
}

function buildMedicationRows(
  statements: readonly MedicationStatement[],
  story: MemberStory,
): MedicationMatrixRow[] {
  const order: string[] = [];
  const grouped = new Map<string, MedicationStatement[]>();

  for (const statement of statements) {
    const existing = grouped.get(statement.ingredient);
    if (existing) {
      existing.push(statement);
    } else {
      order.push(statement.ingredient);
      grouped.set(statement.ingredient, [statement]);
    }
  }

  // Conflicting rows first: the point of the matrix is the disagreement.
  const conflictOrder = story.medications.conflicts.map((entry) => entry.ingredient);
  order.sort((a, b) => {
    const rankA = conflictOrder.indexOf(a);
    const rankB = conflictOrder.indexOf(b);
    if (rankA === rankB) return 0;
    if (rankA === -1) return 1;
    if (rankB === -1) return -1;
    return rankA - rankB;
  });

  return order.map((ingredient) => {
    const rows = grouped.get(ingredient) ?? [];
    const cells = {
      discharge_list: rows.find((row) => row.sourceList === 'discharge_list') ?? null,
      pbm: rows.find((row) => row.sourceList === 'pbm') ?? null,
      claims_derived: rows.find((row) => row.sourceList === 'claims_derived') ?? null,
      member_reported: rows.find((row) => row.sourceList === 'member_reported') ?? null,
    } satisfies Record<MedicationSourceList, MedicationStatement | null>;
    const sample = rows[0];
    const conflict = story.medications.conflicts.find((entry) => entry.ingredient === ingredient);

    return {
      ingredient,
      drug: sample?.drug ?? ingredient,
      rxNorm: sample?.rxNorm ?? '',
      drugClass: rows.find((row) => row.drugClass)?.drugClass ?? null,
      isHighRisk: rows.some((row) => row.isHighRisk),
      cells,
      conflict: conflict ? { severity: conflict.severity, reason: conflict.reason } : null,
    };
  });
}

const adtKind: Record<AdtEvent['type'], { title: string; tone: TimelineEvent['tone'] }> = {
  admit: { title: 'Admission', tone: 'urgent' },
  discharge: { title: 'Discharge', tone: 'urgent' },
  transfer: { title: 'Transfer', tone: 'warning' },
  ed_registration: { title: 'ED registration', tone: 'warning' },
  ed_discharge: { title: 'ED discharge', tone: 'warning' },
};

function buildTimeline(
  view: Pick<
    MemberStoryView,
    | 'adtEvents'
    | 'claims'
    | 'appointments'
    | 'fills'
    | 'labs'
    | 'documents'
    | 'outreach'
    | 'auths'
    | 'claimsCompleteness'
    | 'story'
  >,
): TimelineView {
  const raw: Omit<TimelineEvent, 'position'>[] = [];

  for (const event of view.adtEvents) {
    const kind = adtKind[event.type];
    raw.push({
      id: event.id,
      lane: 'hospital',
      kind: kind.title,
      title: `${kind.title} · ${event.facility}`,
      detail: [
        event.diagnosis ? `Diagnosis: ${event.diagnosis}` : 'No diagnosis on the message',
        event.disposition,
        event.duplicateOf ? `Duplicate of ${event.duplicateOf}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      at: event.eventTime,
      atLabel: formatInstant(event.eventTime),
      source: event.provenance.source,
      sourceRecordId: event.provenance.sourceRecordId,
      receivedLabel: formatInstant(event.provenance.receivedTime),
      tone: event.duplicateOf ? 'neutral' : kind.tone,
    });
  }

  for (const claim of view.claims) {
    raw.push({
      id: claim.id,
      lane: 'visits',
      kind: 'Claim',
      title: `${claim.type === 'pharmacy' ? 'Pharmacy claim' : 'Claim'} · ${claim.provider}`,
      detail: `${claim.placeOfService} · ${claim.status} · ${[claim.codes.cpt, claim.codes.revenue, ...claim.codes.icd10].filter(Boolean).join(', ')}`,
      at: `${claim.serviceDate}T12:00:00-05:00`,
      atLabel: formatDate(claim.serviceDate),
      source: claim.provenance.source,
      sourceRecordId: claim.provenance.sourceRecordId,
      receivedLabel: formatDate(claim.receivedDate),
      tone: 'neutral',
    });
  }

  for (const appointment of view.appointments) {
    const tone: TimelineEvent['tone'] =
      appointment.state === 'no_show'
        ? 'warning'
        : appointment.state === 'completed'
          ? 'success'
          : 'info';
    raw.push({
      id: appointment.id,
      lane: 'visits',
      kind: 'Appointment',
      title: `${appointment.specialty} · ${appointment.provider}`,
      detail: appointment.outcomeUnconfirmed
        ? 'Outcome never confirmed by anything downstream of the booking'
        : `State: ${appointment.state.replace('_', ' ')}`,
      at: appointment.scheduledFor,
      atLabel: formatInstant(appointment.scheduledFor),
      source: appointment.provenance.source,
      sourceRecordId: appointment.provenance.sourceRecordId,
      receivedLabel: formatInstant(appointment.provenance.receivedTime),
      tone,
    });
  }

  for (const fill of view.fills) {
    raw.push({
      id: fill.id,
      lane: 'medications',
      kind: 'Pharmacy fill',
      title: `${fill.drug} ${fill.strength}`,
      detail: `${fill.daysSupply}-day supply · ${fill.refillsRemaining} refills left · ${fill.pharmacy}${fill.status === 'reversed' ? ' · reversed at the pharmacy' : ''}`,
      at: `${fill.fillDate}T12:00:00-05:00`,
      atLabel: formatDate(fill.fillDate),
      source: fill.provenance.source,
      sourceRecordId: fill.provenance.sourceRecordId,
      receivedLabel: formatInstant(fill.provenance.receivedTime),
      tone: fill.status === 'reversed' ? 'warning' : 'neutral',
    });
  }

  for (const lab of view.labs) {
    for (const point of lab.points) {
      raw.push({
        id: point.id,
        lane: 'results',
        kind: 'Lab result',
        title: `${lab.name} ${point.value} ${lab.unit}`,
        detail: lab.referenceRange
          ? `Reference ${lab.referenceRange}${point.abnormalFlag ? ` · flagged ${point.abnormalFlag}` : ''}`
          : (point.abnormalFlag ?? 'Resulted'),
        at: point.at,
        atLabel: point.atLabel,
        source: 'labs',
        sourceRecordId: point.id,
        receivedLabel: point.receivedLabel,
        tone:
          point.abnormalFlag === 'critical'
            ? 'urgent'
            : point.abnormalFlag === 'high' || point.abnormalFlag === 'low'
              ? 'warning'
              : 'neutral',
      });
    }
  }

  for (const document of view.documents) {
    raw.push({
      id: document.id,
      lane: 'results',
      kind: 'Document',
      title: document.title,
      detail:
        document.state === 'received'
          ? 'Received'
          : document.state === 'restricted'
            ? (document.restrictionBasis ?? 'Restricted record')
            : 'Requested, not received',
      at: document.receivedAt ?? document.requestedAt ?? document.provenance.eventTime,
      atLabel: formatInstant(
        document.receivedAt ?? document.requestedAt ?? document.provenance.eventTime,
      ),
      source: document.provenance.source,
      sourceRecordId: document.provenance.sourceRecordId,
      receivedLabel: document.receivedAt
        ? formatInstant(document.receivedAt)
        : 'Nothing received yet',
      tone: document.state === 'received' ? 'neutral' : 'warning',
    });
  }

  for (const attempt of view.outreach) {
    raw.push({
      id: attempt.id,
      lane: 'coordination',
      kind: 'Outreach',
      title: `${attempt.channel === 'letter' ? 'Letter' : attempt.channel === 'text' ? 'Text' : 'Call'} · ${attempt.outcome.replace(/_/g, ' ')}`,
      detail: attempt.note ?? (attempt.number ? `To ${attempt.number}` : 'Inbound contact'),
      at: attempt.at,
      atLabel: formatInstant(attempt.at),
      source: attempt.provenance.source,
      sourceRecordId: attempt.provenance.sourceRecordId,
      receivedLabel: formatInstant(attempt.provenance.receivedTime),
      tone:
        attempt.outcome === 'answered'
          ? 'success'
          : attempt.outcome === 'disconnected' ||
              attempt.outcome === 'wrong_number' ||
              attempt.outcome === 'returned_mail'
            ? 'urgent'
            : 'neutral',
    });
  }

  for (const auth of view.auths) {
    raw.push({
      id: auth.id,
      lane: 'coordination',
      kind: 'Authorization',
      title: auth.service,
      detail: `${auth.status}${auth.startOfCareConfirmed ? ' · start of care confirmed' : ' · start of care not confirmed'} · ${auth.ownerTeam}`,
      at: auth.requestedAt,
      atLabel: formatInstant(auth.requestedAt),
      source: auth.provenance.source,
      sourceRecordId: auth.provenance.sourceRecordId,
      receivedLabel: formatInstant(auth.provenance.receivedTime),
      tone: auth.status === 'approved' && !auth.startOfCareConfirmed ? 'warning' : 'info',
    });
  }

  const inWindow = raw.filter(
    (event) => Date.parse(event.at) >= windowStartMs && Date.parse(event.at) <= windowEndMs,
  );
  const outsideWindowCount = raw.length - inWindow.length;

  const events = inWindow
    .map((event) => ({ ...event, position: positionOf(event.at) }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  const completeThrough = view.claimsCompleteness?.completeThrough ?? '2026-09-25';

  return {
    months: TIMELINE_MONTHS,
    events,
    claimsCompletePosition: positionOf(`${completeThrough}T23:59:00-04:00`),
    claimsCompleteLabel: formatDate(completeThrough, 'd MMM'),
    claimsStamp: `Claims complete to about ${formatDate(completeThrough, 'd MMM yyyy')}`,
    outsideWindowCount,
    windowLabel: 'Dec 2025 to Nov 2026',
  };
}

function buildLabs(results: readonly LabResult[]): LabTrend[] {
  const order: string[] = [];
  const grouped = new Map<string, LabResult[]>();

  for (const result of results) {
    const existing = grouped.get(result.loinc);
    if (existing) {
      existing.push(result);
    } else {
      order.push(result.loinc);
      grouped.set(result.loinc, [result]);
    }
  }

  return order.flatMap((loinc) => {
    const rows = [...(grouped.get(loinc) ?? [])].sort(
      (a, b) => Date.parse(a.specimenTime) - Date.parse(b.specimenTime),
    );
    const latest = rows[rows.length - 1];
    if (!latest) return [];
    return [
      {
        loinc,
        name: latest.name,
        unit: latest.unit,
        referenceRange: latest.referenceRange ?? null,
        points: rows.map((row) => ({
          id: row.id,
          value: row.value,
          at: row.specimenTime,
          atLabel: formatDate(row.specimenTime),
          abnormalFlag: row.abnormalFlag,
          receivedLabel: formatInstant(row.provenance.receivedTime),
        })),
        latest,
        discrepancyNote: rows.find((row) => row.discrepancyNote)?.discrepancyNote ?? null,
      },
    ];
  });
}

function sourceRow(
  dataset: string,
  label: string,
  provenance: Provenance,
  index: number,
): SourceRecordRow {
  return {
    key: `${dataset}-${provenance.sourceRecordId}-${index}`,
    dataset,
    label,
    provenance,
    eventLabel: formatInstant(provenance.eventTime),
    receivedLabel: formatInstant(provenance.receivedTime),
  };
}

const EMPTY_TIMELINE_INPUT = {
  adtEvents: [],
  claims: [],
  appointments: [],
  fills: [],
  labs: [],
  documents: [],
  outreach: [],
  auths: [],
} as const;

function buildView(member: Member, story: MemberStory): MemberStoryView {
  const ids = [member.id, ...member.priorMemberIds];
  const d = goldenDatasets;

  const contacts = byMemberIds(d.contactPoints, ids);
  const bestContact =
    contacts.find((contact) => contact.id === story.reach.bestContactPointId) ??
    contacts.find((contact) => contact.isPrimaryOnFile) ??
    contacts[0] ??
    null;

  const documents = byMemberIds(d.clinicalDocuments, ids);
  const auths = byMemberIds(d.authRequests, ids);
  const adtEvents = byMemberIds(d.adtEvents, ids);
  const claims = byMemberIds(d.claims, ids);
  const appointments = byMemberIds(d.appointments, ids);
  const fills = byMemberIds(d.pharmacyFills, ids);
  const outreach = byMemberIds(d.outreachAttempts, ids);
  const labs = buildLabs(byMemberIds(d.labResults, ids));
  const claimsCompleteness = d.claimsCompleteness.find((row) => row.memberId === member.id) ?? null;

  const medicationRows = buildMedicationRows(byMemberIds(d.medicationStatements, ids), story);

  const sources: SourceRecordRow[] = [
    sourceRow('Eligibility', `Member record ${member.id}`, member.provenance, 0),
    ...byMemberIds(d.coverage, ids).map((row, index) =>
      sourceRow('Coverage', `${row.planName} · ${row.program}`, row.provenance, index),
    ),
    ...contacts.map((row, index) =>
      sourceRow('Contact point', `${row.number} · ${row.label}`, row.provenance, index),
    ),
    ...adtEvents.map((row, index) =>
      sourceRow('ADT', `${row.type.replace(/_/g, ' ')} · ${row.facility}`, row.provenance, index),
    ),
    ...byMemberIds(d.medicationStatements, ids).map((row, index) =>
      sourceRow(
        'Medication statement',
        `${row.drug} ${row.dose} · ${row.sourceList.replace(/_/g, ' ')}`,
        row.provenance,
        index,
      ),
    ),
    ...fills.map((row, index) =>
      sourceRow(
        'Pharmacy fill',
        `${row.drug} ${row.strength} · ${row.fillDate}`,
        row.provenance,
        index,
      ),
    ),
    ...claims.map((row, index) =>
      sourceRow(
        'Claim',
        `${row.type} · ${row.provider} · ${row.serviceDate}`,
        row.provenance,
        index,
      ),
    ),
    ...byMemberIds(d.labResults, ids).map((row, index) =>
      sourceRow('Lab result', `${row.name} ${row.value} ${row.unit}`, row.provenance, index),
    ),
    ...documents.map((row, index) => sourceRow('Document', row.title, row.provenance, index)),
    ...auths.map((row, index) =>
      sourceRow('Authorization', `${row.service} · ${row.status}`, row.provenance, index),
    ),
    ...outreach.map((row, index) =>
      sourceRow(
        'Outreach',
        `${row.channel} · ${row.outcome.replace(/_/g, ' ')}`,
        row.provenance,
        index,
      ),
    ),
    ...byMemberIds(d.assessments, ids).map((row, index) =>
      sourceRow('Assessment', `${row.instrument} · ${row.item}`, row.provenance, index),
    ),
    ...byMemberIds(d.riskScores, ids).map((row, index) =>
      sourceRow('Risk score', `${row.model} · ${row.value}`, row.provenance, index),
    ),
    ...byMemberIds(d.careGaps, ids).map((row, index) =>
      sourceRow('Care gap', `${row.measureCode} · ${row.measure}`, row.provenance, index),
    ),
    ...appointments.map((row, index) =>
      sourceRow('Appointment', `${row.specialty} · ${row.provider}`, row.provenance, index),
    ),
    ...byMemberIds(d.notes, ids).map((row, index) =>
      sourceRow(
        'Note',
        `${row.type.replace(/_/g, ' ')} · ${row.authorName}`,
        row.provenance,
        index,
      ),
    ),
    ...byMemberIds(d.tasks, ids).map((row, index) =>
      sourceRow('Task', row.title, row.provenance, index),
    ),
  ].sort((a, b) => Date.parse(b.provenance.receivedTime) - Date.parse(a.provenance.receivedTime));

  return {
    member,
    story,
    coverage:
      byMemberIds(d.coverage, [member.id]).find(
        (row) => !row.isLapse && row.effectiveTo === null,
      ) ?? null,
    coverageHistory: byMemberIds(d.coverage, ids).sort((a, b) =>
      a.effectiveFrom < b.effectiveFrom ? 1 : -1,
    ),
    contacts,
    bestContact,
    alternates: contacts.filter((contact) => contact.id !== bestContact?.id),
    deadContactIds: story.reach.deadContactPointIds,
    signals: signalsFor(member.id),
    medicationRows,
    conflictRows: medicationRows.filter((row) => row.conflict !== null),
    timeline: buildTimeline({
      ...EMPTY_TIMELINE_INPUT,
      adtEvents,
      claims,
      appointments,
      fills,
      labs,
      documents,
      outreach,
      auths,
      claimsCompleteness,
      story,
    }),
    claimsCompleteness,
    labs,
    risk: byMemberIds(d.riskScores, [member.id])[0] ?? null,
    assessments: byMemberIds(d.assessments, ids),
    documents,
    auths,
    careGaps: byMemberIds(d.careGaps, ids),
    tasks: byMemberIds(d.tasks, ids),
    notes: byMemberIds(d.notes, ids).sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    ),
    outreach: [...outreach].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    fills,
    adtEvents,
    claims,
    appointments,
    auditEvents: d.auditEvents.filter((row) => row.memberId !== null && ids.includes(row.memberId)),
    sources,
  };
}

const views = new Map<string, MemberStoryView>(
  memberStoryFile.members.flatMap((story) => {
    const member = goldenDatasets.members.find((row) => row.id === story.memberId);
    return member ? [[member.id, buildView(member, story)] as const] : [];
  }),
);

/** The Member Story for one golden member, or undefined for everyone else. */
export function memberStoryView(id: string): MemberStoryView | undefined {
  return views.get(id.toUpperCase());
}

export const memberStoryIds: readonly string[] = [...views.keys()];
