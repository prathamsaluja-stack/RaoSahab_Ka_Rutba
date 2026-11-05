import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `Reports · ${APP_NAME}`,
  description: 'Deliberately not in the MVP.',
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" subtitle="Deliberately not in the MVP." />
      <EmptyState
        icon={<Activity className="size-6" />}
        title="Deliberately not in the MVP"
        description="Program reporting is a manager's job, not a case manager's, and plans already run it from the data warehouse. Building it here would compete with a system that wins, and would not shorten the path from a member event to a completed care action."
      />
    </div>
  );
}
