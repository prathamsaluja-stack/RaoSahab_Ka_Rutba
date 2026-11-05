'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] border font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-[var(--brand)] text-[var(--on-accent)] hover:brightness-110',
        secondary:
          'border-[var(--border)] bg-[var(--surface)] text-text hover:bg-[var(--surface-muted)]',
        ghost: 'border-transparent bg-transparent text-text hover:bg-[var(--surface-muted)]',
        danger:
          'border-transparent bg-[var(--urgent)] text-[var(--on-accent)] hover:brightness-110',
        link: 'h-auto border-transparent p-0 text-[var(--brand)] underline underline-offset-2 hover:brightness-110',
      },
      size: {
        sm: 'h-8 px-3 text-xs [&_svg]:size-4',
        md: 'h-9 px-4 text-sm [&_svg]:size-4',
        lg: 'h-10 px-5 text-sm [&_svg]:size-[18px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>, VariantProps<typeof buttonVariants> {
  /** Render the child element instead of a <button> (e.g. a Next.js <Link>). */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-[var(--radius-input)] border transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'border-transparent bg-[var(--brand)] text-[var(--on-accent)] hover:brightness-110',
        secondary:
          'border-[var(--border)] bg-[var(--surface)] text-text hover:bg-[var(--surface-muted)]',
        ghost: 'border-transparent bg-transparent text-text-muted hover:bg-[var(--surface-muted)]',
      },
      size: {
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-9 [&_svg]:size-[18px]',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
);

export interface IconButtonProps
  extends React.ComponentPropsWithoutRef<'button'>, VariantProps<typeof iconButtonVariants> {
  /** Required: icon-only controls carry their name for screen readers. */
  label: string;
}

export function IconButton({ className, variant, size, label, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
