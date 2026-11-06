'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import type { MemberStoryView } from '@/lib/data/member-story';
import { ClinicalSnapshot } from './clinical-snapshot';
import { MedicationsMatrix } from './medications-matrix';
import { NextBestActions } from './next-best-actions';
import {
  AuthorizationsTab,
  CareGapsTab,
  ContactsTab,
  DocumentsTab,
  NotesTab,
  SourcesTab,
} from './record-tabs';
import { TimelineView } from './timeline-view';
import { WhatChanged } from './what-changed';

/** The nine Member Story sections from section 5, in order. */
export const MEMBER_TAB_LABELS = [
  'Overview',
  'Medications',
  'Timeline',
  'Contacts',
  'Documents',
  'Authorizations',
  'Care gaps',
  'Notes & tasks',
  'Sources',
] as const;

export function MemberTabs({ view }: { view: MemberStoryView }) {
  const counts: Record<string, number> = {
    medications: view.medicationRows.length,
    timeline: view.timeline.events.length,
    contacts: view.contacts.length,
    documents: view.documents.length,
    authorizations: view.auths.length,
    'care-gaps': view.careGaps.length,
    notes: view.notes.length + view.tasks.length,
    sources: view.sources.length,
  };

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'medications', label: 'Medications' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'contacts', label: 'Contacts' },
    { value: 'documents', label: 'Documents' },
    { value: 'authorizations', label: 'Authorizations' },
    { value: 'care-gaps', label: 'Care gaps' },
    { value: 'notes', label: 'Notes & tasks' },
    { value: 'sources', label: 'Sources' },
  ] as const;

  return (
    <Tabs defaultValue="overview" className="flex flex-col gap-4">
      <TabsList aria-label="Member Story sections" className="overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
            {tab.label}
            {counts[tab.value] !== undefined ? (
              <span data-tabular className="ml-1.5 text-2xs text-text-muted">
                {counts[tab.value]}
              </span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="flex flex-col gap-6">
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <WhatChanged entries={view.story.whatChanged} />
          <NextBestActions signals={view.signals} />
        </div>
        <ClinicalSnapshot view={view} />
      </TabsContent>

      <TabsContent value="medications">
        <MedicationsMatrix view={view} />
      </TabsContent>

      <TabsContent value="timeline">
        <TimelineView view={view} />
      </TabsContent>

      <TabsContent value="contacts">
        <ContactsTab view={view} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsTab view={view} />
      </TabsContent>

      <TabsContent value="authorizations">
        <AuthorizationsTab view={view} />
      </TabsContent>

      <TabsContent value="care-gaps">
        <CareGapsTab view={view} />
      </TabsContent>

      <TabsContent value="notes">
        <NotesTab view={view} />
      </TabsContent>

      <TabsContent value="sources">
        <SourcesTab view={view} />
      </TabsContent>
    </Tabs>
  );
}
