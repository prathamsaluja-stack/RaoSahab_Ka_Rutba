import { describe, expect, it } from 'vitest';
import { ALL_NAV_ITEMS, crumbsFor, isActiveRoute } from '@/lib/navigation';

describe('isActiveRoute', () => {
  it('matches the route itself and anything nested under it', () => {
    expect(isActiveRoute('/members', '/members')).toBe(true);
    expect(isActiveRoute('/members/SYN-HF-001/call', '/members')).toBe(true);
  });

  it('does not match a route that merely shares a prefix', () => {
    expect(isActiveRoute('/members-archive', '/members')).toBe(false);
    expect(isActiveRoute('/today', '/tasks')).toBe(false);
  });
});

describe('crumbsFor', () => {
  it('labels a top-level route from the navigation map', () => {
    expect(crumbsFor('/data-sources')).toEqual([{ label: 'Data sources' }]);
  });

  it('names the member instead of the identifier when the member is known', () => {
    expect(crumbsFor('/members/SYN-HF-001', 'Harold Bellweather')).toEqual([
      { label: 'Members', href: '/members' },
      { label: 'Harold Bellweather' },
    ]);
  });

  it('falls back to the identifier and keeps deeper routes linked', () => {
    expect(crumbsFor('/members/SYN-DM-002/call')).toEqual([
      { label: 'Members', href: '/members' },
      { label: 'SYN-DM-002', href: '/members/SYN-DM-002' },
      { label: 'Call' },
    ]);
  });

  it('treats the root as Today, which is where it redirects', () => {
    expect(crumbsFor('/')).toEqual([{ label: 'Today' }]);
  });
});

describe('the navigation map', () => {
  it('covers every route in the information architecture exactly once', () => {
    const hrefs = ALL_NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toEqual([
      '/today',
      '/members',
      '/tasks',
      '/audit',
      '/data-sources',
      '/design',
      '/about-data',
      '/reports',
      '/settings',
    ]);
  });
});
