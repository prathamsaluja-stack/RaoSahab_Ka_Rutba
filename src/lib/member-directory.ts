/**
 * A static member directory for the shell.
 *
 * The command palette and the caseload list need something to search before
 * the fixtures exist. These five are the golden members of section 7, named
 * and programmed exactly as the brief specifies; the 43 background members
 * arrive with the Synthea pipeline in task 5, at which point this module is
 * replaced by the repository layer in `src/lib/data`.
 */
export interface DirectoryMember {
  id: string;
  name: string;
  age: number;
  sex: 'F' | 'M';
  plan: string;
  program: string;
  isFictional: true;
}

export const DIRECTORY_MEMBERS: readonly DirectoryMember[] = [
  {
    id: 'SYN-HF-001',
    name: 'Harold Bellweather',
    age: 71,
    sex: 'M',
    plan: 'Medicare Advantage HMO',
    program: 'Heart failure',
    isFictional: true,
  },
  {
    id: 'SYN-DM-002',
    name: 'Priya Castellanos',
    age: 54,
    sex: 'F',
    plan: 'Medicaid expansion',
    program: 'Diabetes',
    isFictional: true,
  },
  {
    id: 'SYN-ED-003',
    name: 'Marcus Okonkwo-Lane',
    age: 38,
    sex: 'M',
    plan: 'Medicaid',
    program: 'Respiratory',
    isFictional: true,
  },
  {
    id: 'SYN-BH-004',
    name: 'Jade Wintermoor',
    age: 29,
    sex: 'F',
    plan: 'Medicaid',
    program: 'Behavioral health',
    isFictional: true,
  },
  {
    id: 'SYN-DUAL-005',
    name: 'Eleanor Fairweather',
    age: 83,
    sex: 'F',
    plan: 'D-SNP with Medicaid HCBS',
    program: 'Complex care',
    isFictional: true,
  },
];

/** The caseload the finished prototype carries; see section 0. */
export const PLANNED_CASELOAD = 48;

export function findMember(id: string): DirectoryMember | undefined {
  return DIRECTORY_MEMBERS.find((member) => member.id.toLowerCase() === id.toLowerCase());
}

/** Case-insensitive match on name, member ID, plan or program. */
export function searchMembers(query: string): readonly DirectoryMember[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return DIRECTORY_MEMBERS;
  return DIRECTORY_MEMBERS.filter((member) =>
    [member.name, member.id, member.plan, member.program].join(' ').toLowerCase().includes(needle),
  );
}
