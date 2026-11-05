/**
 * Background caseload generator.
 *
 * Writes the 43 background members that sit behind the five golden ones, so
 * the caseload list and the All tab read as 48 real cases instead of five
 * rows and a gap. Everything here is invented: the names come from fixed
 * word pools, the numbers all sit in the reserved 555-01xx exchange, and the
 * only randomness is a seeded linear congruential generator, so re-running
 * the script reproduces the committed file byte for byte.
 *
 * This is deliberately not the Synthea pipeline. These members are scenery
 * for screenshots: they are never opened, so they carry only the fields the
 * members list and the queue rows put on screen.
 *
 * Run with `pnpm data:generate`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEED = 20261109;
const COUNT = 43;
const AS_OF = '2026-11-09T08:00:00-05:00';

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(here, '../../data/background');

/** Seeded LCG (Numerical Recipes constants). Deterministic across platforms. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const FIRST_NAMES_F = [
  'Adaeze',
  'Birgitta',
  'Carlota',
  'Delphine',
  'Esperanza',
  'Fenella',
  'Guadalupe',
  'Hyacinth',
  'Imogen',
  'Juniper',
  'Kehinde',
  'Lioba',
  'Marisol',
  'Noor',
  'Ottilie',
  'Perpetua',
  'Rosalind',
  'Saoirse',
  'Thandiwe',
  'Ursula',
  'Verity',
  'Winnifred',
];

const FIRST_NAMES_M = [
  'Ambrose',
  'Bartholomew',
  'Cassius',
  'Desmond',
  'Ephraim',
  'Fitzgerald',
  'Gideon',
  'Horatio',
  'Ignatius',
  'Jebediah',
  'Kwabena',
  'Lazarus',
  'Montgomery',
  'Nikodem',
  'Obadiah',
  'Peregrine',
  'Quillon',
  'Rutherford',
  'Solomon',
  'Thaddeus',
  'Ulysses',
  'Vasilios',
];

const SURNAMES = [
  'Ashdown',
  'Barrowcliffe',
  'Calloway-Pike',
  'Dunmore',
  'Edgerton',
  'Fairbrother',
  'Glendenning',
  'Hollowell',
  'Ironside',
  'Jessup',
  'Kettleborough',
  'Larkspur',
  'Mossgrove',
  'Netherby',
  'Oakhurst',
  'Pennywhistle',
  'Quarrier',
  'Rushbrook',
  'Stillwater',
  'Thornbury',
  'Underhill',
  'Vexley',
  'Wrenfield',
  'Yarrowby',
  'Zendell',
  'Ambrister',
  'Blackwood-Hale',
  'Carrowmore',
  'Dellacroix',
  'Eastmarch',
  'Fennimore',
  'Greenhalgh',
  'Harkaway',
  'Inglewood',
  'Jarndyce',
  'Kirkbride',
  'Loveridge',
  'Marchetti',
  'Norrington',
  'Oglethorpe',
  'Prendergast',
  'Ravenscroft',
  'Sowerby',
];

interface ProgramProfile {
  program: string;
  lineOfBusiness: 'medicare_advantage' | 'medicaid' | 'medicaid_expansion' | 'dsnp';
  planName: string;
  conditions: string[];
  ageRange: [number, number];
}

const PROGRAMS: ProgramProfile[] = [
  {
    program: 'Heart failure',
    lineOfBusiness: 'medicare_advantage',
    planName: 'Bayline Medicare Advantage HMO (fictional)',
    conditions: ['Heart failure', 'Atrial fibrillation', 'Hypertension'],
    ageRange: [62, 88],
  },
  {
    program: 'Diabetes',
    lineOfBusiness: 'medicaid_expansion',
    planName: 'Commonwealth Choice Medicaid (fictional)',
    conditions: ['Type 2 diabetes', 'Hyperlipidaemia', 'Diabetic neuropathy'],
    ageRange: [38, 67],
  },
  {
    program: 'Respiratory',
    lineOfBusiness: 'medicaid',
    planName: 'Commonwealth Choice Medicaid (fictional)',
    conditions: ['COPD', 'Persistent asthma', 'Tobacco use disorder'],
    ageRange: [31, 72],
  },
  {
    program: 'Behavioral health',
    lineOfBusiness: 'medicaid',
    planName: 'Commonwealth Choice Medicaid (fictional)',
    conditions: ['Major depressive disorder', 'Generalised anxiety', 'Bipolar II'],
    ageRange: [24, 58],
  },
  {
    program: 'Kidney care',
    lineOfBusiness: 'medicare_advantage',
    planName: 'Bayline Medicare Advantage HMO (fictional)',
    conditions: ['CKD stage 4', 'Anaemia of CKD', 'Hypertension'],
    ageRange: [55, 84],
  },
  {
    program: 'Complex care',
    lineOfBusiness: 'dsnp',
    planName: 'Bayline Dual Complete D-SNP (fictional)',
    conditions: ['Dementia', 'Recurrent falls', 'CKD stage 3'],
    ageRange: [72, 94],
  },
];

const CITIES: [string, string, string][] = [
  ['Worcester', 'MA', '01602'],
  ['Springfield', 'MA', '01103'],
  ['Lowell', 'MA', '01852'],
  ['New Bedford', 'MA', '02740'],
  ['Pittsfield', 'MA', '01201'],
  ['Brockton', 'MA', '02301'],
  ['Fitchburg', 'MA', '01420'],
  ['Holyoke', 'MA', '01040'],
];

const STREETS = [
  'Example Lane',
  'Sample Street',
  'Placeholder Road',
  'Specimen Avenue',
  'Fictional Way',
  'Mockingbird Terrace',
];

const AREA_CODES = ['413', '508', '617', '781', '978'];

/** Numbers already spent on the golden members; never hand them out twice. */
const RESERVED_NUMBERS = new Set([
  '(413) 555-0151',
  '(413) 555-0164',
  '(508) 555-0142',
  '(508) 555-0177',
  '(617) 555-0133',
  '(617) 555-0196',
  '(781) 555-0109',
  '(781) 555-0188',
  '(978) 555-0118',
]);

export interface BackgroundMemberRecord {
  id: string;
  name: string;
  isFictional: true;
  age: number;
  sex: 'F' | 'M';
  program: string;
  lineOfBusiness: ProgramProfile['lineOfBusiness'];
  planName: string;
  conditions: string[];
  primaryPhone: string;
  phoneValidity: 'verified' | 'unverified' | 'wrong_number';
  address: { line1: string; city: string; state: string; postalCode: string };
  enrolledSince: string;
  lastContactAt: string | null;
  /** The plan's cost-based band. One dated input, never the first column. */
  riskBand: 'low' | 'medium' | 'high';
  openTasks: number;
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

export function generateBackgroundMembers(): BackgroundMemberRecord[] {
  const random = createRandom(SEED);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)]!;
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

  const usedNames = new Set<string>();
  const usedNumbers = new Set(RESERVED_NUMBERS);
  const members: BackgroundMemberRecord[] = [];

  for (let index = 1; index <= COUNT; index += 1) {
    const profile = PROGRAMS[index % PROGRAMS.length]!;
    const sex: 'F' | 'M' = random() < 0.54 ? 'F' : 'M';

    let name = '';
    do {
      const first = pick(sex === 'F' ? FIRST_NAMES_F : FIRST_NAMES_M);
      name = `${first} ${pick(SURNAMES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    let primaryPhone = '';
    do {
      primaryPhone = `(${pick(AREA_CODES)}) 555-01${pad(between(0, 99), 2)}`;
    } while (usedNumbers.has(primaryPhone));
    usedNumbers.add(primaryPhone);

    const [city, state, postalCode] = pick(CITIES);
    const conditionCount = between(1, profile.conditions.length);
    const validityRoll = random();
    const contactRoll = random();
    const daysAgo = between(3, 96);

    members.push({
      id: `SYN-BG-${pad(index, 3)}`,
      name,
      isFictional: true,
      age: between(profile.ageRange[0], profile.ageRange[1]),
      sex,
      program: profile.program,
      lineOfBusiness: profile.lineOfBusiness,
      planName: profile.planName,
      conditions: profile.conditions.slice(0, conditionCount),
      primaryPhone,
      phoneValidity:
        validityRoll < 0.68 ? 'verified' : validityRoll < 0.9 ? 'unverified' : 'wrong_number',
      address: {
        line1: `${between(2, 980)} ${pick(STREETS)}`,
        city,
        state,
        postalCode,
      },
      enrolledSince: `20${between(17, 25)}-${pad(between(1, 12), 2)}-01`,
      lastContactAt: contactRoll < 0.12 ? null : isoDaysBefore(daysAgo),
      riskBand: random() < 0.22 ? 'high' : random() < 0.55 ? 'medium' : 'low',
      openTasks: between(0, 4),
    });
  }

  return members;
}

/** A calendar date `days` before AS_OF, in the plan's timezone. */
function isoDaysBefore(days: number): string {
  const base = new Date(AS_OF);
  base.setUTCDate(base.getUTCDate() - days);
  return base.toISOString().slice(0, 10);
}

export function main(): void {
  const members = generateBackgroundMembers();
  mkdirSync(outputDir, { recursive: true });

  writeFileSync(
    resolve(outputDir, 'members.json'),
    `${JSON.stringify(members, null, 2)}\n`,
    'utf8',
  );

  writeFileSync(
    resolve(outputDir, 'manifest.json'),
    `${JSON.stringify(
      {
        generator: 'deterministic',
        seed: SEED,
        asOf: AS_OF,
        count: members.length,
        caseload: members.length + 5,
        script: 'scripts/data/generate.ts',
        notes: [
          'Every name, street line and telephone number is invented.',
          'Telephone numbers use the reserved 555-01xx exchange only.',
          'Background members are list scenery: they carry no clinical detail.',
          'Re-running the script reproduces this file exactly.',
        ],
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`Wrote ${members.length} background members to data/background/`);
}

main();
