import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';
import { DIRECTORY_MEMBERS, findMember } from '@/lib/member-directory';

export function generateStaticParams() {
  return DIRECTORY_MEMBERS.map((member) => ({ id: member.id }));
}

export async function generateMetadata({
  params,
}: PageProps<'/members/[id]/call'>): Promise<Metadata> {
  const { id } = await params;
  const member = findMember(id);
  return {
    title: member ? `Call ${member.name} · ${APP_NAME}` : `Call workspace · ${APP_NAME}`,
    description:
      'Hold the conversation while the record writes itself, with the clinician confirming.',
  };
}

export default async function CallWorkspacePage({ params }: PageProps<'/members/[id]/call'>) {
  const { id } = await params;
  const member = findMember(id);
  if (!member) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Call workspace · ${member.name} (fictional)`}
        subtitle="Hold the conversation while the record writes itself. Nothing is recorded until a named clinician signs."
        actions={
          <Button variant="secondary" asChild>
            <Link href={`/members/${member.id}`}>
              <ArrowLeft aria-hidden="true" />
              Back to the member
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Guide"
            subtitle="A checklist, not a script, shaped by the program and by what the record is missing."
          />
          <CardBody>
            <EmptyState
              icon={<PhoneCall className="size-6" />}
              title="The call guide is not built yet"
              description="Questions adapt to the member's program and to gaps in the record, answers become chips that feed the note, and each program carries its own red-flag escalation step."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Note draft" subtitle="Draft · not in the record until signed." />
          <CardBody>
            <EmptyState
              title="The drafted note is not built yet"
              description="Each sentence will be tagged as taken from the record, heard on the call, or inferred. Inferred sentences are flagged and block signing until a clinician confirms or removes them."
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
