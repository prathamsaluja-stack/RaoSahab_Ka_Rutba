## Summary

<!-- One to three sentences: what this PR delivers and which case need it serves. -->

## Context

<!-- Task NN of 11 in the Caseline workbench build. Base: `<branch>` (stacked on #<n>) | Base: `main`. -->
<!-- Serves: <e.g. "Screen 1 (prioritised queue); principle: every priority has a reason and an action"> -->

## What changed

<!-- Bullet per meaningful change, naming the files or modules a reviewer should open first. -->

## Screenshots

<!-- UI tasks only. Commit 1-3 PNGs under docs/screenshots/prNN/ and embed them with
     SHA-pinned URLs so they survive branch deletion:
     ![Today queue](https://github.com/<owner>/<repo>/blob/<commit-sha>/docs/screenshots/prNN/today.png?raw=true) -->

## How to test

1. `pnpm install && pnpm dev`
2. Open `<route>`
3. Expect `<observable behaviour>`

## Data and safety notes

- Data touched: <golden fixtures | Synthea background | none>. All synthetic.
- Automation in this PR: <none | what is mocked, and what a clinician must confirm>.

## Decisions and trade-offs

- <choice made, alternative rejected, why>

## Out of scope / follow-ups

- <deferred items, with the task that picks them up>

## Checklist

- [ ] Lint, typecheck, unit tests and build pass locally
- [ ] E2E smoke passes (UI tasks)
- [ ] No real patient data, no real provider names, no secrets
- [ ] New UI is keyboard-reachable and labelled
