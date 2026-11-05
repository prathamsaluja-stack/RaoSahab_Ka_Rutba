import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FreshnessMark } from '@/components/domain/freshness-mark';

describe('FreshnessMark', () => {
  it('fills the mark for a confirmed fact inside its feed SLA', () => {
    render(
      <FreshnessMark
        receivedTime="2026-11-09T06:00:00-05:00"
        status="source_confirmed"
        subject="PBM fill history"
      />,
    );

    const mark = screen.getByRole('img');
    expect(mark).toHaveAttribute('data-level', 'filled');
    expect(mark).toHaveAccessibleName(/PBM fill history\. Freshness: Verified/);
  });

  it('half-fills a single-source fact and says so in words', () => {
    render(
      <FreshnessMark
        receivedTime="2026-11-09T06:00:00-05:00"
        status="source_confirmed"
        singleSource
        showLabel
        subject="Mobile number from ED registration"
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('data-level', 'half');
    expect(screen.getByText('Single source')).toBeInTheDocument();
  });

  it('opens the mark for a fact past the staleness threshold', () => {
    render(
      <FreshnessMark
        receivedTime="2026-04-26T10:00:00-04:00"
        status="source_confirmed"
        showLabel
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('data-level', 'open');
    expect(screen.getByText('Stale')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(/30-day staleness threshold/);
  });

  it('carries its meaning in the accessible name, not only the glyph', () => {
    render(<FreshnessMark receivedTime="2026-11-09T07:00:00-05:00" status="member_reported" />);

    const mark = screen.getByRole('img');
    expect(mark).toHaveAccessibleName(/Member reported/);
    expect(mark).toHaveAttribute('tabindex', '0');
  });
});
