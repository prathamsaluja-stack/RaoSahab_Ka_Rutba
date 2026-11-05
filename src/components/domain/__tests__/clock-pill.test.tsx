import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClockPill } from '@/components/domain/clock-pill';

describe('ClockPill', () => {
  it('shows time remaining and names the deadline for assistive tech', () => {
    render(<ClockPill deadline="2026-11-10T17:00:00-05:00" label="Contact window" />);

    const pill = screen.getByLabelText('Contact window: 1 d 9 h left. Due Tue 10 Nov, 17:00 ET.');
    expect(pill).toHaveTextContent('1 d 9 h left');
    expect(pill).toHaveAttribute('data-urgency', 'upcoming');
  });

  it('states overdue in words, not only in colour', () => {
    render(<ClockPill deadline="2026-11-03T08:00:00-05:00" label="7-day follow-up" />);

    const pill = screen.getByText('Overdue by 6 d').closest('[data-urgency]');
    expect(pill).toHaveAttribute('data-urgency', 'overdue');
    expect(screen.getByLabelText(/Overdue by 6 d\. Due Tue 3 Nov, 08:00 ET\./)).toBeInTheDocument();
  });

  it('marks a deadline inside four hours as critical', () => {
    render(<ClockPill deadline="2026-11-09T10:00:00-05:00" />);

    expect(screen.getByText('2 h left').closest('[data-urgency]')).toHaveAttribute(
      'data-urgency',
      'critical',
    );
  });

  it('marks a deadline inside a day as soon', () => {
    render(<ClockPill deadline="2026-11-09T20:00:00-05:00" />);

    expect(screen.getByText('12 h left').closest('[data-urgency]')).toHaveAttribute(
      'data-urgency',
      'soon',
    );
  });

  it('is reachable by keyboard so the tooltip can be read without a mouse', () => {
    render(<ClockPill deadline="2026-11-10T17:00:00-05:00" />);

    expect(screen.getByText('1 d 9 h left').closest('[data-urgency]')).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  it('accepts an explicit now so the pill never reads the system clock', () => {
    render(<ClockPill deadline="2026-11-09T09:00:00-05:00" now="2026-11-09T08:30:00-05:00" />);

    expect(screen.getByText('30 m left')).toBeInTheDocument();
  });
});
