import type { Metadata } from 'next';
import { FileClock } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `Audit log · ${APP_NAME}`,
  description: 'Every suggestion shown, confirmation, dismissal, edit and signature.',
};

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        subtitle="Every suggestion the software showed, and every decision a clinician made about it."
      />
      <EmptyState
        icon={<FileClock className="size-6" />}
        title="No audit events yet"
        description="Suggestions shown, confirmations, dismissals with their reasons, edits, identity merges and undos, and signatures will be listed here in order, with filters and a client-side CSV export."
      />
    </div>
  );
}
