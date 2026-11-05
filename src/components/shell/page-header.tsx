import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  /** One line. Say what the page is for, not what it is called. */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Tabs or filters that sit directly under the title. */
  children?: React.ReactNode;
  className?: string;
}

/** Title, one-line subtitle, right-aligned actions, optional tabs (4.3). */
export function PageHeader({ title, subtitle, actions, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-text">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-text-muted">{subtitle}</p> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </header>
  );
}
