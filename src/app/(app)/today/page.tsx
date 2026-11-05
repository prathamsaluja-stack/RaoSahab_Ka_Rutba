import type { Metadata } from 'next';
import { Inbox } from 'lucide-react';
import { Badge } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME, CASELOAD } from '@/lib/app-config';
import { dischargeAlerts } from '@/lib/data/queue';
import { TodayQueue } from './today-queue';

export const metadata: Metadata = {
  title: `Today · ${APP_NAME}`,
  description: 'The prioritized work queue: whom to work on, in what order, and why.',
};

export default function TodayPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Today"
        subtitle={`Mon 9 Nov · ${CASELOAD} active · ${dischargeAlerts.count} new since Friday`}
        actions={
          <Badge tone="info" className="gap-1.5 px-2.5 py-1 text-xs">
            <Inbox aria-hidden="true" />
            {dischargeAlerts.label}
          </Badge>
        }
      />
      <TodayQueue />
    </div>
  );
}
