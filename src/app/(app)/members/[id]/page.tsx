import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardBody, CardHeader } from '@/components/ui';
import { ClockPill } from '@/components/domain';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';
import { caseloadRow, caseloadRows } from '@/lib/data/caseload';
import { memberStoryView } from '@/lib/data/member-story';
import { queueRowFor } from '@/lib/data/queue';
import { MemberIdentity } from './member-identity';
import { MemberTabs } from './member-tabs';
import { ReachLine } from './reach-line';

export function generateStaticParams() {
  return caseloadRows.map((member) => ({ id: member.id }));
}

export async function generateMetadata({ params }: PageProps<'/members/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const member = caseloadRow(id.toUpperCase());
  return {
    title: member ? `${member.name} · ${APP_NAME}` : `Member · ${APP_NAME}`,
    description: 'Member Story: what changed, what is reliable, what is unresolved, what to do.',
  };
}

export default async function MemberPage({ params }: PageProps<'/members/[id]'>) {
  const { id } = await params;
  const row = caseloadRow(id.toUpperCase());
  if (!row) notFound();

  const view = memberStoryView(id);
  const queueRow = queueRowFor(row.id);

  if (!view) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={`${row.name} (fictional)`}
          subtitle={`${row.id} · ${row.age} ${row.sex} · ${row.planName} · ${row.program}`}
        />
        <Card>
          <CardHeader
            title="This member is caseload scenery"
            subtitle="Five members carry a full record in this prototype; the other forty-three exist so the lists and counts read like a real desk."
          />
          <CardBody className="flex flex-col gap-3 text-xs text-text-muted">
            <p className="max-w-prose">
              {row.name} appears in the caseload list, in the Today queue counts and in the command
              palette, with a program, a plan and a primary number. Nothing clinical was invented
              behind the row, so nothing clinical is shown here.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/members">Back to the caseload</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/members/SYN-HF-001">
                  Open a full Member Story
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { member } = view;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${member.name} (fictional)`}
        actions={
          <>
            {queueRow?.clock ? (
              <ClockPill
                deadline={queueRow.clock.deadline}
                label={queueRow.clock.label}
                reading={queueRow.clock.reading}
                urgency={queueRow.clock.state === 'overdue' ? 'overdue' : 'soon'}
              />
            ) : null}
            {queueRow ? <Badge tone="brand">{queueRow.tierLabel}</Badge> : null}
            <Button asChild size="lg">
              <Link href={`/members/${member.id}/call`}>
                <Phone aria-hidden="true" />
                Open call workspace
              </Link>
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <Avatar name={member.name} size="lg" />
          <MemberIdentity view={view} />
        </div>
        <ReachLine view={view} />
      </PageHeader>

      <MemberTabs view={view} />
    </div>
  );
}
