import * as React from 'react';
import { Badge, type Tone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Confidence = 'high' | 'medium' | 'low';

const confidenceCopy: Record<Confidence, { label: string; tone: Tone }> = {
  high: { label: 'High confidence', tone: 'success' },
  medium: { label: 'Medium confidence', tone: 'info' },
  low: { label: 'Low confidence', tone: 'warning' },
};

export interface ConfidenceLabelProps {
  confidence: Confidence;
  /** What the confidence rests on, e.g. "structured discharge list". */
  basis?: string;
  className?: string;
}

/** Confidence in words. Caseline never prints a made-up percentage. */
export function ConfidenceLabel({ confidence, basis, className }: ConfidenceLabelProps) {
  const copy = confidenceCopy[confidence];
  return (
    <Badge tone={copy.tone} className={cn('cursor-default', className)}>
      {copy.label}
      {basis ? <span className="font-normal opacity-80">· {basis}</span> : null}
    </Badge>
  );
}
