'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ label, options, placeholder, className, ...props }: SelectProps) {
  const id = React.useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-medium text-text">
        {label}
      </label>
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          id={id}
          className="flex h-9 items-center justify-between gap-2 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-text"
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="size-4 text-text-muted" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-50 overflow-hidden rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-overlay)]"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer items-center justify-between gap-6 rounded-[4px] px-2 py-1.5 text-sm text-text outline-none data-[highlighted]:bg-[var(--surface-muted)]"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4 text-[var(--brand)]" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
