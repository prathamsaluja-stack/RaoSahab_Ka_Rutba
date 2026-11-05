import type { Metadata } from 'next';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';
import { MemberList } from './member-list';

export const metadata: Metadata = {
  title: `Members · ${APP_NAME}`,
  description: 'The caseload, searchable by name, member ID, plan or program.',
};

export default function MembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members"
        subtitle="Your caseload. Every member here is fictional and every record is synthetic."
      />
      <MemberList />
    </div>
  );
}
