import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.ComponentPropsWithoutRef<'div'> {
  title: string;
  /** Say why it is empty, not just that it is. */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center',
        className,
      )}
      {...props}
    >
      {icon ? <span className="text-text-muted">{icon}</span> : null}
      <p className="text-sm font-medium text-text">{title}</p>
      {description ? <p className="max-w-[48ch] text-xs text-text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
