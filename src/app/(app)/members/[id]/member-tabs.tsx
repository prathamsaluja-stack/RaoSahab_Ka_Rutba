'use client';

import { EmptyState, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

/** The nine Member Story tabs from section 5, in order. */
export const MEMBER_TABS = [
  {
    value: 'overview',
    label: 'Overview',
    blurb:
      'What changed in the last 72 hours and the next best actions, side by side, with the reason and source behind each one.',
  },
  {
    value: 'medications',
    label: 'Medications',
    blurb:
      'One row per drug and one column per source: discharge list, pharmacy fills, claims-derived and member-reported. Disagreements are shown, never merged by software.',
  },
  {
    value: 'timeline',
    label: 'Timeline',
    blurb:
      'Twelve months of typed events with a shaded band showing how far claims are actually complete, so a quiet month reads as missing data rather than a healthy member.',
  },
  {
    value: 'contacts',
    label: 'Contacts',
    blurb:
      'Every number with its owner, which ones answer, the best two-hour window, the language spoken and consent per channel.',
  },
  {
    value: 'documents',
    label: 'Documents',
    blurb:
      'Received, requested but not received, and restricted documents, each with a re-request action. A restricted record is shown as restricted, never as a blank.',
  },
  {
    value: 'authorizations',
    label: 'Authorizations',
    blurb:
      'Requested, approved, started and completed are four different states. Approved with no confirmed start of care is called out as such.',
  },
  {
    value: 'care-gaps',
    label: 'Care gaps',
    blurb:
      'Each measure with its open and close dates, including gaps that may already be closed by a claim that has not arrived yet.',
  },
  {
    value: 'notes',
    label: 'Notes & tasks',
    blurb: 'Signed notes, drafts in progress, and the tasks a call created.',
  },
  {
    value: 'sources',
    label: 'Sources',
    blurb:
      'The raw records behind everything above: source system, record identifier, clinical event time, received time, status and edit history.',
  },
] as const;

export function MemberTabs() {
  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-4">
      <TabsList aria-label="Member Story sections">
        {MEMBER_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {MEMBER_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <EmptyState title={`${tab.label} is not built yet`} description={tab.blurb} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
