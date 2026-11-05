import {
  Activity,
  BookOpen,
  CalendarCheck,
  Database,
  FileClock,
  LayoutGrid,
  Palette,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * The navigation map for the whole prototype.
 *
 * Section 5 of the brief fixes the routes; section 4.3 fixes how they are
 * grouped in the sidebar. Both the sidebar and the command palette read this
 * one list, so a route can never appear in one and not the other.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Short line used in the command palette and on stub pages. */
  description: string;
  /** Muted stub items sit at the bottom of the sidebar and read as inactive. */
  muted?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'work',
    label: 'Work',
    items: [
      {
        href: '/today',
        label: 'Today',
        icon: LayoutGrid,
        description: 'Whom to work on, in what order, and why',
      },
      {
        href: '/members',
        label: 'Members',
        icon: Users,
        description: 'The full caseload, searchable',
      },
      {
        href: '/tasks',
        label: 'Tasks',
        icon: CalendarCheck,
        description: 'What you own and what you are waiting on',
      },
    ],
  },
  {
    id: 'records',
    label: 'Records',
    items: [
      {
        href: '/audit',
        label: 'Audit log',
        icon: FileClock,
        description: 'Every suggestion, confirmation, dismissal and signature',
      },
      {
        href: '/data-sources',
        label: 'Data sources',
        icon: Database,
        description: 'Each feed, its freshness target and when it last arrived',
      },
    ],
  },
  {
    id: 'prototype',
    label: 'Prototype',
    items: [
      {
        href: '/design',
        label: 'Design system',
        icon: Palette,
        description: 'Every token and component, in both themes',
      },
      {
        href: '/about-data',
        label: 'About the data',
        icon: BookOpen,
        description: 'What is synthetic, where it came from, what is deliberately imperfect',
      },
    ],
  },
];

/** Stub destinations kept out of the MVP on purpose (section 5). */
export const NAV_STUBS: NavItem[] = [
  {
    href: '/reports',
    label: 'Reports',
    icon: Activity,
    description: 'Deliberately not in the MVP',
    muted: true,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Deliberately not in the MVP',
    muted: true,
  },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV_SECTIONS.flatMap((section) => section.items),
  ...NAV_STUBS,
];

/** Program filter options in the top bar. */
export const PROGRAM_FILTERS = [
  { value: 'all', label: 'All programs' },
  { value: 'heart-failure', label: 'Heart failure' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'behavioral-health', label: 'Behavioral health' },
  { value: 'complex-care', label: 'Complex care' },
] as const;

/** A nav item is active on its own route and on anything nested under it. */
export function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export interface Crumb {
  label: string;
  href?: string;
}

const STATIC_CRUMB_LABELS = new Map<string, string>([
  ...ALL_NAV_ITEMS.map((item) => [item.href, item.label] as const),
  ['/members', 'Members'],
]);

/**
 * Breadcrumbs for a pathname. Member routes read
 * "Members / <member id> / Call" so a reviewer can always see where a deep
 * route sits, even before the fixtures land in task 4.
 */
export function crumbsFor(pathname: string, memberName?: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Today' }];

  const crumbs: Crumb[] = [];
  let href = '';
  segments.forEach((segment, index) => {
    href += `/${segment}`;
    const isLast = index === segments.length - 1;
    const isMemberId = segments[0] === 'members' && index === 1;
    const label = isMemberId
      ? (memberName ?? segment)
      : (STATIC_CRUMB_LABELS.get(href) ?? titleCase(segment));
    crumbs.push(isLast ? { label } : { label, href });
  });
  return crumbs;
}

function titleCase(segment: string): string {
  const words = segment.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
