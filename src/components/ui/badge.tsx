import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Tone tints are mixed over the surface at 12%, which keeps text at AA. */
const toneStyles = {
  neutral: 'text-text-muted bg-[var(--surface-muted)] border-[var(--border)]',
  brand:
    'text-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_12%,var(--surface))] border-[color-mix(in_srgb,var(--brand)_28%,var(--surface))]',
  urgent:
    'text-[var(--urgent)] bg-[color-mix(in_srgb,var(--urgent)_12%,var(--surface))] border-[color-mix(in_srgb,var(--urgent)_28%,var(--surface))]',
  warning:
    'text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))] border-[color-mix(in_srgb,var(--warning)_28%,var(--surface))]',
  info: 'text-[var(--info)] bg-[color-mix(in_srgb,var(--info)_12%,var(--surface))] border-[color-mix(in_srgb,var(--info)_28%,var(--surface))]',
  success:
    'text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] border-[color-mix(in_srgb,var(--success)_28%,var(--surface))]',
} as const;

export type Tone = keyof typeof toneStyles;

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-[var(--radius-input)] border px-2 py-0.5 text-2xs font-medium [&_svg]:size-3.5 [&_svg]:shrink-0',
  { variants: { tone: toneStyles }, defaultVariants: { tone: 'neutral' } },
);

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-input)] border px-2.5 py-1 text-xs [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      tone: toneStyles,
      interactive: {
        true: 'cursor-pointer transition-colors hover:brightness-[0.98]',
        false: '',
      },
    },
    defaultVariants: { tone: 'neutral', interactive: false },
  },
);

export interface ChipProps
  extends React.ComponentPropsWithoutRef<'span'>, VariantProps<typeof chipVariants> {}

/** A Chip is a labelled fact. It never carries meaning by colour alone. */
export function Chip({ className, tone, interactive, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ tone, interactive }), className)} {...props} />;
}

export { badgeVariants, chipVariants, toneStyles };
