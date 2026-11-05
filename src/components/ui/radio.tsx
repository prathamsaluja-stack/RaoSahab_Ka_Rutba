'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
}

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  label: string;
  options: readonly RadioOption[];
}

export function RadioGroup({ label, options, className, ...props }: RadioGroupProps) {
  const groupId = React.useId();
  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      <legend className="mb-1 text-xs font-medium text-text">{label}</legend>
      <RadioGroupPrimitive.Root className="flex flex-col gap-2" {...props}>
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-start gap-2.5">
              <RadioGroupPrimitive.Item
                id={optionId}
                value={option.value}
                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] disabled:opacity-50 data-[state=checked]:border-[var(--brand)]"
              >
                <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-[var(--brand)]" />
              </RadioGroupPrimitive.Item>
              <label htmlFor={optionId} className="text-sm text-text">
                {option.label}
                {option.hint ? (
                  <span className="mt-0.5 block text-2xs text-text-muted">{option.hint}</span>
                ) : null}
              </label>
            </div>
          );
        })}
      </RadioGroupPrimitive.Root>
    </fieldset>
  );
}
