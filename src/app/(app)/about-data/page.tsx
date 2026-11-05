import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `About the data · ${APP_NAME}`,
  description: 'Synthetic-data statement, provenance and the log of deliberate imperfections.',
};

export default function AboutDataPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="About the data"
        subtitle="Where everything on these screens comes from, and what is deliberately wrong with it."
      />

      <Card>
        <CardHeader
          title="Every member and record here is fictional"
          subtitle="This statement holds for every screen in the prototype."
        />
        <CardBody className="flex flex-col gap-3 text-sm text-text">
          <p>
            No real patient data is used anywhere in {APP_NAME}. Member identifiers begin with
            <span className="font-mono"> SYN-</span>, every phone number uses the reserved
            <span className="font-mono"> 555-01xx</span> exchange, and all clinician, facility,
            pharmacy and street names are invented.
          </p>
          <p>
            No credentialed or restricted clinical dataset was downloaded, opened, queried or
            referenced to build it. The background caseload is generated locally from open-source
            synthetic records; the five detailed members are hand-authored.
          </p>
          <p>
            There are no runtime network calls and no language-model calls. Every drafted note or
            suggestion is produced by deterministic local code and is labelled as a draft that a
            named clinician must confirm before anything enters the record.
          </p>
        </CardBody>
      </Card>

      <EmptyState
        title="Provenance details and the imperfections log are still to come"
        description="A per-source provenance summary, the credits for the generators used, and the numbered log of every deliberately planted data problem, each linked to the member it affects and the element on screen that exposes it."
      />
    </div>
  );
}
