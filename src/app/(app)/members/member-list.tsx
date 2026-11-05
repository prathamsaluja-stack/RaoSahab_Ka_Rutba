'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Avatar, Badge, EmptyState, Kbd } from '@/components/ui';
import { DIRECTORY_MEMBERS, PLANNED_CASELOAD, searchMembers } from '@/lib/member-directory';
import { ROW_ATTRIBUTE, useRowNavigation } from '@/lib/use-row-navigation';

/**
 * The caseload list, standing in for the full 48 until the fixtures land.
 * It already carries the row behaviour the finished tables need: `j` and `k`
 * move, Enter opens.
 */
export function MemberList() {
  const [query, setQuery] = React.useState('');
  const results = searchMembers(query);
  const { containerRef, onKeyDown } = useRowNavigation<HTMLDivElement>();
  const inputId = React.useId();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor={inputId} className="text-xs font-medium text-text">
            Search the caseload
          </label>
          <div className="flex h-9 w-full max-w-sm items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border)] bg-[var(--surface)] px-3">
            <Search aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
            <input
              id={inputId}
              type="search"
              value={query}
              placeholder="Name, member ID, plan or program"
              onChange={(event) => setQuery(event.target.value)}
              className="h-full flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
            />
          </div>
        </div>
        <p className="text-xs text-text-muted">
          <Kbd>j</Kbd> and <Kbd>k</Kbd> move through the list, <Kbd>Enter</Kbd> opens the focused
          member.
        </p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No member matches that search"
          description="Try a member ID beginning with SYN-, a program, or part of a name."
        />
      ) : (
        <div
          ref={containerRef}
          onKeyDown={onKeyDown}
          className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
        >
          {results.map((member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              {...{ [ROW_ATTRIBUTE]: '' }}
              className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface-muted)]"
            >
              <Avatar name={member.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">
                  {member.name} <span className="font-normal text-text-muted">(fictional)</span>
                </span>
                <span className="block truncate text-xs text-text-muted">
                  <span className="font-mono">{member.id}</span> · {member.age} {member.sex} ·{' '}
                  {member.plan}
                </span>
              </span>
              <Badge tone="brand">{member.program}</Badge>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-text-muted">
        Showing {results.length} of {DIRECTORY_MEMBERS.length} members. The remaining{' '}
        {PLANNED_CASELOAD - DIRECTORY_MEMBERS.length} of the {PLANNED_CASELOAD}-case load join this
        list when the background caseload is generated.
      </p>
    </div>
  );
}
