import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Phone } from 'lucide-react';
import Link from 'next/link';
import { Avatar, Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';
import { DIRECTORY_MEMBERS, findMember } from '@/lib/member-directory';
import { MemberTabs } from './member-tabs';

export function generateStaticParams() {
  return DIRECTORY_MEMBERS.map((member) => ({ id: member.id }));
}

export async function generateMetadata({ params }: PageProps<'/members/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const member = findMember(id);
  return {
    title: member ? `${member.name} · ${APP_NAME}` : `Member · ${APP_NAME}`,
    description: 'Member Story: what changed, what is reliable, what is unresolved, what to do.',
  };
}

export default async function MemberPage({ params }: PageProps<'/members/[id]'>) {
  const { id } = await params;
  const member = findMember(id);
  if (!member) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${member.name} (fictional)`}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono">{member.id}</span>
            <span aria-hidden="true">·</span>
            <span>
              {member.age} {member.sex}
            </span>
            <span aria-hidden="true">·</span>
            <span>{member.plan}</span>
          </span>
        }
        actions={
          <>
            <Badge tone="brand">{member.program}</Badge>
            <Button asChild>
              <Link href={`/members/${member.id}/call`}>
                <Phone aria-hidden="true" />
                Open call workspace
              </Link>
            </Button>
          </>
        }
      >
        <p className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-text-muted">
          <Avatar name={member.name} size="sm" />
          The reach line — best number, who owns it, answer history, best window and consent per
          channel — sits here, directly under the name, once the contact records exist.
        </p>
      </PageHeader>

      <MemberTabs />
    </div>
  );
}
