'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  label: React.ReactNode;
  hint?: React.ReactNode;
}

export function Checkbox({ label, hint, className, id, ...props }: CheckboxProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <CheckboxPrimitive.Root
        id={inputId}
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--surface)] disabled:opacity-50 data-[state=checked]:border-[var(--brand)] data-[state=checked]:bg-[var(--brand)] data-[state=checked]:text-[var(--on-accent)]"
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <Check className="size-3" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label htmlFor={inputId} className="text-sm text-text">
        {label}
        {hint ? <span className="mt-0.5 block text-2xs text-text-muted">{hint}</span> : null}
      </label>
    </div>
  );
}
