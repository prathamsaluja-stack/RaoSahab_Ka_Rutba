# Caseline

Clickable, high-fidelity wireframes for a health-plan **case-management
workbench**. The prototype shortens the path from a new member event to a
verified, completed care action across three screens:

1. **Today** - whom to work on, in what order, and why.
2. **Member Story** - what changed, what is reliable, what is unresolved, and
   what to do next.
3. **Call Workspace** - hold the conversation while the record drafts itself,
   with a clinician confirming every entry.

This is a product-design deliverable, not a production system.

## Synthetic data notice

**All members, records, clinicians, facilities, addresses and phone numbers in
this repository are fictional.** Nothing here is derived from a real person.

- Member identifiers start with `SYN-`.
- Every phone number uses the reserved `555-01xx` exchange.
- Provider, hospital and pharmacy names are invented and labelled
  "(fictional)".
- No credentialed or restricted-use dataset is read, referenced or shipped.
- There are no runtime network calls and no model API calls. Every "AI"
  feature is a deterministic local mock, labelled in the interface as a draft
  that a clinician must confirm.

Every clock, age and freshness mark is computed from a single pinned instant,
`AS_OF` (Monday 9 November 2026, 08:00 America/New_York), never from the system
clock, so the screens read identically on any machine on any day.

## Requirements

- Node (see `.nvmrc`)
- pnpm 10 or newer

## How to run

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

| Script               | What it does                            |
| -------------------- | --------------------------------------- |
| `pnpm dev`           | Start the development server            |
| `pnpm build`         | Production build                        |
| `pnpm start`         | Serve the production build              |
| `pnpm lint`          | ESLint                                  |
| `pnpm format`        | Format with Prettier                    |
| `pnpm format:check`  | Fail on unformatted files (used in CI)  |
| `pnpm typecheck`     | TypeScript, no emit                     |
| `pnpm test`          | Unit tests (Vitest + Testing Library)   |
| `pnpm test:e2e`      | End-to-end smoke (Playwright, Chromium) |
| `pnpm data:generate` | Regenerate the background caseload      |
| `pnpm screenshots`   | Capture the screenshot gallery          |

## Stack

Next.js (App Router, `src/`, TypeScript strict), Tailwind CSS, shadcn/ui,
`lucide-react`, zod, `date-fns` with `date-fns-tz`, zustand,
`@tanstack/react-table`, Vitest with Testing Library, Playwright, and `tsx` for
data scripts.

## Status

Scaffold only. The design system, app shell, domain model, data pipeline,
signals engine and the three screens arrive in subsequent pull requests.
