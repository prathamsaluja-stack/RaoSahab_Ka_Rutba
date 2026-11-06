import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Button, Card, CardBody, CardHeader } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';
import { caseloadRow, caseloadRows } from '@/lib/data/caseload';
import { callWorkspaceView } from '@/lib/data/call-workspace';
import { CallWorkspace } from './call-workspace';

export function generateStaticParams() {
  return caseloadRows.map((member) => ({ id: member.id }));
}

export async function generateMetadata({
  params,
}: PageProps<'/members/[id]/call'>): Promise<Metadata> {
  const { id } = await params;
  const member = caseloadRow(id.toUpperCase());
  return {
    title: member ? `Call ${member.name} · ${APP_NAME}` : `Call workspace · ${APP_NAME}`,
    description:
      'Hold the conversation while the record writes itself, with the clinician confirming.',
  };
}

export default async function CallWorkspacePage({ params }: PageProps<'/members/[id]/call'>) {
  const { id } = await params;
  const row = caseloadRow(id.toUpperCase());
  if (!row) notFound();

  const view = callWorkspaceView(id);

  if (!view) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`Call workspace · ${row.name} (fictional)`}
          subtitle={`${row.id} · ${row.program} · ${row.planName}`}
        />
        <Card>
          <CardHeader
            title="This member is caseload scenery"
            subtitle="Five members carry a full record and a worked call in this prototype; the other forty-three exist so the lists and counts read like a real desk."
          />
          <CardBody className="flex flex-col gap-3 text-xs text-text-muted">
            <p className="max-w-prose">
              A call guide is only honest when there is a record behind it: the questions are
              inserted by what the record is missing, and the note is drafted from what the feeds
              actually say. Nothing clinical was invented behind this row, so no call content is
              shown here.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/members/${row.id}`}>Back to the member</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/members/SYN-HF-001/call">
                  <Phone aria-hidden="true" />
                  Open the worked call
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Call workspace · ${view.member.name} (fictional)`}
        subtitle={view.call.summary}
      />
      <CallWorkspace view={view} />
    </div>
  );
}
