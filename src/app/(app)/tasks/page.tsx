import type { Metadata } from 'next';
import { CalendarCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `Tasks · ${APP_NAME}`,
  description: 'Owned tasks and work waiting on other teams.',
};

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tasks"
        subtitle="What you own and what another team owes you, with the state each item is really in."
      />
      <EmptyState
        icon={<CalendarCheck className="size-6" />}
        title="No tasks yet"
        description="Tasks will separate what you own from what you are waiting on, name the owning team and the next check date, and track completion step by step: referral sent, accepted, scheduled, delivered. Approved will never read as done."
      />
    </div>
  );
}
