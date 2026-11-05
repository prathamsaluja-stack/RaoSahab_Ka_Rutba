import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/shell';
import { APP_NAME } from '@/lib/app-config';

export const metadata: Metadata = {
  title: `Settings · ${APP_NAME}`,
  description: 'Deliberately not in the MVP.',
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" subtitle="Deliberately not in the MVP." />
      <EmptyState
        icon={<Settings className="size-6" />}
        title="Deliberately not in the MVP"
        description="Administration, role management and feed configuration belong to the plan's platform team and its existing identity tooling. The only preference this prototype needs, the theme, sits in the top bar."
      />
    </div>
  );
}
