import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  title,
  subtitle,
  actions,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'header'> & {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4',
        className,
      )}
      {...props}
    >
      {(title ?? subtitle) !== undefined ? (
        <div className="min-w-0">
          {title ? <h2 className="text-base font-semibold text-text">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-xs text-text-muted">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function CardBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentPropsWithoutRef<'footer'>) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center gap-4 border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-3 text-xs text-text-muted',
        className,
      )}
      {...props}
    />
  );
}
