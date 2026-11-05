'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { crumbsFor } from '@/lib/navigation';
import { findMember } from '@/lib/member-directory';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const memberId = segments[0] === 'members' ? segments[1] : undefined;
  const member = memberId ? findMember(memberId) : undefined;
  const crumbs = crumbsFor(pathname, member?.name);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-xs text-text-muted">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" /> : null}
            {crumb.href ? (
              <Link href={crumb.href} className="truncate hover:text-text hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate font-medium text-text">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
