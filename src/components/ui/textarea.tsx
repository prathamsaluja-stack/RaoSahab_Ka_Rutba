'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  label: string;
  hint?: React.ReactNode;
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-xs font-medium text-text">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-describedby={hintId}
        className={cn(
          'min-h-20 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-text placeholder:text-text-muted',
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-2xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
