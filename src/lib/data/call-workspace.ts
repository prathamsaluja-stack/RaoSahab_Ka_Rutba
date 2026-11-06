import callWorkspaceJson from '@data/call/call-workspace.json';
import {
  callWorkspaceFileSchema,
  type AssessmentField,
  type CallWorkspace,
  type ContactPoint,
  type FiredSignal,
  type Member,
  type OutcomeCode,
} from '@/domain';
import { goldenDatasets } from '@/lib/data/golden';
import { signalsFor } from '@/lib/data/signals';

/**
 * The Call Workspace, assembled once per member.
 *
 * The screen is presentational: the guide, the forty assessment fields, the
 * drafted sentences and the list of things a signature writes are all
 * committed content. What the component layer adds is the clinician's own
 * acts — tapping an answer, keeping or changing a pre-filled value, resolving
 * an inferred sentence, signing — because those are the only things on this
 * screen that are allowed to change the record.
 */

export const callWorkspaceFile = callWorkspaceFileSchema.parse(callWorkspaceJson);

export const outcomeCodes: readonly OutcomeCode[] = callWorkspaceFile.outcomeCodes;
export const signedBy = callWorkspaceFile.signedBy;
export const signNote = callWorkspaceFile.signNote;

export interface CallWorkspaceView {
  member: Member;
  call: CallWorkspace;
  contact: ContactPoint | null;
  signals: readonly FiredSignal[];
  /** The forty fields grouped by section, in authored order. */
  sections: readonly { name: string; fields: readonly AssessmentField[] }[];
  outcomeCodes: readonly OutcomeCode[];
  signedBy: string;
  signNote: string;
}

function groupSections(fields: readonly AssessmentField[]) {
  const order: string[] = [];
  const grouped = new Map<string, AssessmentField[]>();
  for (const field of fields) {
    const existing = grouped.get(field.section);
    if (existing) {
      existing.push(field);
    } else {
      order.push(field.section);
      grouped.set(field.section, [field]);
    }
  }
  return order.map((name) => ({ name, fields: grouped.get(name) ?? [] }));
}

function buildView(call: CallWorkspace): CallWorkspaceView | undefined {
  const member = goldenDatasets.members.find((row) => row.id === call.memberId);
  if (!member) return undefined;

  const contact =
    goldenDatasets.contactPoints.find((row) => row.id === call.dialing.contactPointId) ?? null;

  return {
    member,
    call,
    contact,
    signals: signalsFor(call.memberId),
    sections: groupSections(call.assessment.fields),
    outcomeCodes,
    signedBy,
    signNote,
  };
}

const views = new Map<string, CallWorkspaceView>(
  callWorkspaceFile.members
    .map((call) => [call.memberId, buildView(call)] as const)
    .filter((entry): entry is readonly [string, CallWorkspaceView] => entry[1] !== undefined),
);

export function callWorkspaceView(id: string): CallWorkspaceView | undefined {
  return views.get(id.toUpperCase());
}

export const callWorkspaceIds: readonly string[] = [...views.keys()];
