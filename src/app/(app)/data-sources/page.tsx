import type { Metadata } from 'next';
import { Database } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `Data sources · ${APP_NAME}`,
  description: 'Each feed, its freshness target and when it last arrived.',
};

export default function DataSourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data sources"
        subtitle="What feeds this workbench, how fresh each feed is meant to be, and when it last arrived."
      />
      <EmptyState
        icon={<Database className="size-6" />}
        title="No feeds listed yet"
        description="Eligibility, ADT, pharmacy, claims, clinical documents, labs, utilization management, contact history, assessments, risk, measures, directory and appointments will each appear here with a freshness target, a last-received time and their known quality problems."
      />
    </div>
  );
}
