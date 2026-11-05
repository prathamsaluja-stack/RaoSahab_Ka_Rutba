import type { Metadata } from 'next';
import { ListChecks } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME, CASELOAD } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `Today · ${APP_NAME}`,
  description: 'The prioritized work queue: whom to work on, in what order, and why.',
};

export default function TodayPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Today" subtitle={`Mon 9 Nov · ${CASELOAD} active · 6 new since Friday`} />
      <EmptyState
        icon={<ListChecks className="size-6" />}
        title="The prioritized queue is not built yet"
        description="This screen will rank the caseload by time-bound clinical events, show why each member is on the list, the clock that governs them and the next action to take. The ranking arrives with the signals engine; the rows arrive with the caseload fixtures."
      />
    </div>
  );
}
