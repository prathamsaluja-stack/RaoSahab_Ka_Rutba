import backgroundMembersJson from '@data/background/members.json';
import manifestJson from '@data/background/manifest.json';
import {
  backgroundMemberSchema,
  caseloadManifestSchema,
  type CaseloadRow,
  type LineOfBusiness,
} from '@/domain';
import { goldenDatasets, parseDataset } from '@/lib/data/golden';

/**
 * The 48-case caseload: five golden members with a full record behind them,
 * plus forty-three background members that exist so the list, the counts and
 * the All tab look like a real desk.
 */

export const backgroundMembers = parseDataset(
  'background/members',
  backgroundMemberSchema,
  backgroundMembersJson,
);

export const caseloadManifest = caseloadManifestSchema.parse(manifestJson);

/** Golden members carry their own clinical record; these are the list bits. */
const GOLDEN_LIST_FACTS: Record<
  string,
  { lastContactAt: string | null; riskBand: CaseloadRow['riskBand']; openTasks: number }
> = {
  'SYN-HF-001': { lastContactAt: '2026-10-21', riskBand: 'high', openTasks: 3 },
  'SYN-DM-002': { lastContactAt: '2026-09-18', riskBand: 'medium', openTasks: 2 },
  'SYN-ED-003': { lastContactAt: null, riskBand: 'medium', openTasks: 3 },
  'SYN-BH-004': { lastContactAt: '2026-10-30', riskBand: 'high', openTasks: 4 },
  'SYN-DUAL-005': { lastContactAt: '2026-10-14', riskBand: 'medium', openTasks: 4 },
};

const goldenRows: CaseloadRow[] = goldenDatasets.members.map((member) => {
  const coverage = goldenDatasets.coverage.find(
    (row) => row.memberId === member.id && !row.isLapse && row.effectiveTo === null,
  );
  const contact = goldenDatasets.contactPoints.find(
    (row) => row.memberId === member.id && row.isPrimaryOnFile,
  );
  const facts = GOLDEN_LIST_FACTS[member.id];

  return {
    id: member.id,
    name: member.name,
    age: member.age,
    sex: member.sex,
    program: coverage?.program ?? 'Complex care',
    lineOfBusiness: (coverage?.lineOfBusiness ?? 'medicaid') as LineOfBusiness,
    planName: coverage?.planName ?? 'Commonwealth Choice Medicaid (fictional)',
    primaryPhone: contact?.number ?? '(508) 555-0100',
    phoneValidity: contact?.validity ?? 'unverified',
    lastContactAt: facts?.lastContactAt ?? null,
    riskBand: facts?.riskBand ?? 'medium',
    openTasks: facts?.openTasks ?? 0,
    isGolden: true,
  };
});

const backgroundRows: CaseloadRow[] = backgroundMembers.map((member) => ({
  id: member.id,
  name: member.name,
  age: member.age,
  sex: member.sex,
  program: member.program,
  lineOfBusiness: member.lineOfBusiness,
  planName: member.planName,
  primaryPhone: member.primaryPhone,
  phoneValidity: member.phoneValidity,
  lastContactAt: member.lastContactAt,
  riskBand: member.riskBand,
  openTasks: member.openTasks,
  isGolden: false,
}));

/** All 48 rows, golden members first, then the background roster by ID. */
export const caseloadRows: readonly CaseloadRow[] = [...goldenRows, ...backgroundRows];

export const caseloadRowsById: ReadonlyMap<string, CaseloadRow> = new Map(
  caseloadRows.map((row) => [row.id, row]),
);

export function caseloadRow(id: string): CaseloadRow | undefined {
  return caseloadRowsById.get(id);
}

/** Case-insensitive match on name, ID, plan or program, for the palette. */
export function searchCaseload(query: string): readonly CaseloadRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return caseloadRows;
  return caseloadRows.filter((row) =>
    [row.name, row.id, row.planName, row.program].join(' ').toLowerCase().includes(needle),
  );
}
