# Build brief: Care Management Workbench (clickable high-fidelity wireframes)

You are building a clickable, high-fidelity wireframe web app for a health-plan **case-management workbench**. It is the product-design deliverable of a product case. Work through the tasks in section 10 **in order**. Each task ships on its own branch as its own pull request. Read this whole brief before writing any code.

Work autonomously. Do not stop to ask questions unless a stop condition in section 12 applies. When you make a judgment call, record it under "Decisions and trade-offs" in that task's PR.

---

## 0. Configuration

| Key | Value | Notes |
|---|---|---|
| `REPO` | current directory | If it is not a git repo with a GitHub remote, stop (section 12). |
| `APP_NAME` | `Caseline` | Working product name, used in the UI and README only. |
| `BASE_BRANCH` | `main` | |
| `PR_MODE` | `stacked` | `stacked`: task N branches from task N-1 and its PR targets N-1's branch. `merge-each`: task N branches from `main`; after its PR's CI is green, squash-merge it with `gh pr merge --squash --delete-branch`, then start N+1 from updated `main`. |
| `AS_OF` | `2026-11-09T08:00:00-05:00` | Monday, 08:00 America/New_York. Every clock, age and freshness mark is computed from this single constant, never from the system clock. |
| `TIMEZONE` | `America/New_York` | |
| `HOLIDAYS` | `[]` | Business-day calendar. Keep empty by default so clocks match the case solution. |
| `CASELOAD` | `48` | 5 golden members + 43 background members. |
| `SYNTHEA_SEED` | `20261109` | |
| `DEPLOY_PAGES` | `false` | If `true`, do task 12. |

---

## 1. Source material

A local folder `reference/` may contain: the case brief PDF, a research report PDF, the case-solution PDF, and `HiLabs_APM_Case_Synthetic_Patient_Annex.xlsx`. **Read everything in `reference/` first.**

- `reference/` is never committed. The very first thing you do in task 1, before any `git add`, is create `.gitignore` containing `reference/`.
- If the annex `.xlsx` is present, it is authoritative for the five golden patients; reconcile your fixtures against it (task 4).
- If `reference/` is absent, rely on this brief alone.

---

## 2. Non-negotiable rules

### 2.1 Data

1. **Synthetic data only.** Allowed sources:
   - Synthea output that you generate locally (https://github.com/synthetichealth/synthea, Apache-2.0).
   - CMS Synthetic Medicare Claims Public Use Files (https://www.cms.gov/data-research/statistics-trends-and-reports/medicare-claims-synthetic-public-use-files), only for field naming and days-supply calibration, and only if reachable (task 5).
   - Hand-authored golden fixtures (section 7).
2. **Never download, open, query or reference data from MIMIC-IV or any other PhysioNet credentialed dataset**, even if credentials are available on this machine. Its data use agreement forbids passing the data to third-party services, and the case requires clearly fake data.
3. Synthea emits real-looking clinician, hospital and pharmacy names drawn from public provider files, and realistic street addresses. **Replace all of them** with obviously fictional ones (for example "Riverbend General Hospital (fictional)", "Dr. Rook (fictional)", "214 Example Lane"). Keep city and state.
4. Member IDs start with `SYN-`. Every phone number uses the reserved `555-01xx` exchange (vary area codes so you have enough numbers). Every member record has `isFictional: true`. The Member Story header shows "(fictional)" after the name, and a dismissible banner in the shell states "All members and records are fictional".
5. No photos of people. Avatars are initials.
6. **No runtime network calls and no LLM API calls.** Every "AI" feature is a deterministic local mock, labelled in the UI as a draft that a clinician must confirm.

### 2.2 Git, commits and PRs: no agent attribution anywhere

1. Never add attribution to an AI tool or agent in: commit messages, commit trailers (`Co-Authored-By`, `Claude-Session`, `Generated with` or similar), PR titles, PR bodies, PR comments, code comments, README, docs, `package.json` (`author`, `contributors`), file names or branch names.
2. Do not create `CLAUDE.md`, `AGENTS.md`, `.claude/` or any agent config inside the repo. If you need scratch notes, use `CLAUDE.local.md`, and make sure `.gitignore` covers it (task 1). Refer to that ignore entry in commit messages generically ("ignore local notes files").
3. Use the git identity already configured (`git config user.name` and `user.email`). Never set or change it. If either is empty, stop (section 12).
4. Conventional Commits (`feat(scope): …`, `fix(scope): …`, `chore: …`, `test: …`, `docs: …`), imperative mood, subject ≤ 72 characters, body explaining *why*. Two to six logical commits per task, not one giant commit and not dozens of tiny ones.
5. **Before every push**, run:
   ```bash
   git log --format='%an <%ae>%n%B' "$PR_BASE..HEAD" \
     | grep -inE 'co-authored-by|claude|anthropic|generated with|claude-session|noreply@anthropic|🤖' \
     && echo "ATTRIBUTION FOUND - fix before pushing" || echo "clean"
   ```
   If anything is found, rewrite those commits on your feature branch (`git rebase -i` / `git commit --amend`) until the check prints `clean`. Never force-push to `main`. On your own feature branch use `--force-with-lease` only.
6. **After creating each PR**, run:
   ```bash
   gh pr view <number> --json title,body -q '.title + "\n" + .body' \
     | grep -inE 'claude|anthropic|generated with|🤖' && echo "FIX PR TEXT" || echo "clean"
   ```
   If it is not clean, rewrite the body with `gh pr edit <number> --body-file <file>`.
7. Write PR bodies to a temp file outside the repo (`/tmp/pr-NN.md`), never commit them.
8. Never commit: `reference/`, `.cache/`, `data/raw/`, Synthea raw output, CMS zip files, `.env*`, `CLAUDE.local.md`, secrets of any kind.

### 2.3 Per-task workflow

For task `NN` with slug `SLUG` and type `TYPE` (`feat`, `chore`, `ci`):

```bash
# 1. Pick the base
#    stacked:    PR_BASE = branch of task NN-1 (main for task 1)
#    merge-each: PR_BASE = main (pulled fresh)
git switch "$PR_BASE" && git pull --ff-only || true
git switch -c "$TYPE/NN-SLUG"

# 2. Implement, committing as you go

# 3. Quality gates (all must pass)
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm test:e2e            # from task 3 onward, if the task touches UI

# 4. Attribution check (2.2.5), then push
git push -u origin "$TYPE/NN-SLUG"

# 5. Open the PR
gh pr create --base "$PR_BASE" --head "$TYPE/NN-SLUG" \
  --title "<conventional title>" --body-file /tmp/pr-NN.md \
  --label "<labels>"

# 6. PR text check (2.2.6). Wait for CI with: gh pr checks <number> --watch
#    If CI fails, fix on the same branch and push again.
```

In task 1, create these labels once (ignore "already exists" errors): `area:infra`, `area:ui`, `area:data`, `area:engine`, `type:feature`, `type:chore`, `stacked`.

### 2.4 PR description template

Every PR body follows this structure. Be specific; no filler.

```markdown
## Summary
One to three sentences: what this PR delivers and which case need it serves.

## Context
Task NN of 12 in the Caseline workbench build. Base: `<branch>` (stacked on #<n>) | Base: `main`.
Serves: <e.g. "Screen 1 (prioritised queue); principle: every priority has a reason and an action">

## What changed
- Bullet per meaningful change, naming the files or modules a reviewer should open first.

## Screenshots
<!-- UI tasks only. Commit 1–3 PNGs under docs/screenshots/prNN/ and embed them with
     SHA-pinned URLs so they survive branch deletion:
     ![Today queue](https://github.com/<owner>/<repo>/blob/<commit-sha>/docs/screenshots/prNN/today.png?raw=true) -->

## How to test
1. `pnpm install && pnpm dev`
2. Open <route>
3. Expect <observable behaviour>

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
```

### 2.5 Quality bar

- TypeScript `strict`, no `any` except at parsing boundaries guarded by zod.
- No console errors or warnings on any route.
- WCAG 2.2 AA: contrast, visible focus rings, keyboard paths, labelled controls. Freshness and status are never conveyed by colour or shape alone; always pair with text or an accessible label.
- UI copy in US English (the users are at a US health plan). Plain clinical language, no marketing tone.

---

## 3. Product context (what the screens must do)

**User.** Maria, RN case manager at a health plan: 20 years ICU, 48 active complex cases, 6 new hospital-discharge alerts since Friday. Today she opens 6–7 systems per member, calls dead numbers, finds medication lists that disagree, fills a 40-field assessment per contact, and has two real conversations by 3 pm.

**Job of the product.** Shorten the path from a new member event to a verified, completed care action. Three screens for three moments:

1. **Today**: whom to work on, in what order, and why.
2. **Member Story**: what changed, what is reliable, what is unresolved, what to do next.
3. **Call Workspace**: hold the conversation while the record writes itself, with the clinician confirming.

**Design principles (enforce in every PR):**

- **Trust is visible.** Every important fact shows its source, clinical/event time and received time. Conflicts are shown side by side and **never merged by software**; resolving them is the clinician's act.
- **Priority has a reason and an action.** Every queue item shows why it is there, its deadline, and a suggested next step. The plan's risk score is shown as one dated input, **never the first column and never the sole driver** (cost-based risk scores carry documented bias).
- **Reachability is part of care.** Which number answers, whose number it is, consent per channel, best time window, language.
- **Documentation follows the work.** Facts verified once are reused; notes are drafted from records plus the call; one signature writes everything once.
- **Completion matters.** Referral sent, authorization approved, appointment scheduled and service delivered are different states. "Approved" never reads as "done".
- **Claims are history, not status.** Every claims-derived panel carries "claims complete to about <date>"; a quiet month after that date reads as missing data, not a healthy member.
- **Nothing enters the record without a named clinician confirming it.** No autonomous clinical actions, no auto-closed care gaps, no auto-merged medication lists.

---

## 4. Visual identity

Take the *principles* of Rippling's enterprise UI (structured left sidebar, calm top bar, generous whitespace, modular cards on a quiet canvas, hairline borders instead of heavy shadows, consistent type scale, dense-but-readable tables) and express them in an **original** identity.

**Do not copy** Rippling's colour palette (no deep plum/aubergine chrome, no yellow brand accent), logo, wordmark, icons, illustrations, typeface or any screen layout pixel-for-pixel.

### 4.1 Tokens (CSS variables, light and dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--canvas` | `#F6F7F9` | `#0E1116` | App background |
| `--surface` | `#FFFFFF` | `#151A21` | Cards, sidebar, top bar |
| `--surface-muted` | `#F1F3F5` | `#1B2129` | Table headers, wells |
| `--border` | `#E4E7EC` | `#2A313B` | Hairlines (1px) |
| `--text` | `#0B1B2B` | `#E6EAF0` | Primary text |
| `--text-muted` | `#5B6676` | `#98A2B3` | Secondary text |
| `--brand` | `#0F6B66` | `#2DB3A9` | Primary actions, active nav |
| `--brand-soft` | `#E6F2F1` | `#123331` | Active nav background, selected rows |
| `--urgent` | `#B42318` | `#F97066` | Overdue clocks, safety flags |
| `--warning` | `#B54708` | `#FDB022` | Conflicts, single-source facts |
| `--info` | `#175CD3` | `#84ADFF` | Informational chips |
| `--success` | `#067647` | `#47CD89` | Verified, completed |
| `--focus` | `#2E90FA` | `#53B1FD` | Focus ring (2px + 2px offset) |

Check every text/background pair for AA contrast and adjust shades if needed; record changes in the PR.

### 4.2 Type, spacing, shape

- Typeface: **Inter** via `next/font` (UI), **IBM Plex Mono** (IDs, timestamps in raw-source views). Tabular numerals for all numbers in tables and clocks.
- Scale: 12 / 13 / 14 (body) / 16 / 20 / 24 / 30. Weights 400, 500, 600 only.
- 4-pt spacing grid. Page padding 32px (24px below 1280px). Card padding 20–24px. Gaps 16 or 24.
- Radii: 6 (inputs, chips), 10 (cards), 14 (dialogs). Shadows only on overlays (popover, dialog, drawer).
- Icons: `lucide-react`, 16px in tables, 18–20px in nav.

### 4.3 Layout skeleton

- **Sidebar** 248px (collapsed 64px): app mark + `APP_NAME` at top; sections **Work** (Today, Members, Tasks), **Records** (Audit log, Data sources), **Prototype** (Design system, About the data); muted stub items **Reports** and **Settings** at the bottom. Active item uses `--brand-soft` background with a 2px brand indicator.
- **Top bar** 56px: breadcrumbs at left; global search (⌘K / Ctrl+K command palette) centred; at right an **as-of chip** ("Data as of Mon 9 Nov, 08:00 ET"), program filter, theme toggle, notifications (static), user menu "Maria R., RN".
- **Page header**: title, one-line subtitle, right-aligned actions, optional tabs underneath.
- **Content**: modular cards on `--canvas`, max width 1440px.
- **Responsive**: ≥1280px full layout; 1024–1279px collapsed sidebar; <1024px sidebar becomes a drawer and multi-column cards stack. Primary target is a 1440×900 desktop.

---

## 5. Information architecture

| Route | Screen |
|---|---|
| `/` | Redirect to `/today` |
| `/today` | Screen 1: prioritised work queue |
| `/members` | Searchable caseload list (all 48) |
| `/members/[id]` | Screen 2: Member Story. Tabs: Overview, Medications, Timeline, Contacts, Documents, Authorizations, Care gaps, Notes & tasks, Sources |
| `/members/[id]/call` | Screen 3: Call Workspace |
| `/tasks` | Owned tasks and "waiting on others" with owner team and completion states |
| `/audit` | Audit log of suggestions, confirmations, dismissals, edits, signatures |
| `/data-sources` | Feed list with freshness SLA and last-received time |
| `/design` | Style guide of every token and component |
| `/about-data` | Synthetic-data disclaimer, data provenance, imperfections log, source credits |
| `/reports`, `/settings` | Empty state: "Deliberately not in the MVP", with one line on why |

Keyboard shortcuts: `g t` Today, `g m` Members, `/` search, `j`/`k` move in tables, `Enter` open, `?` shortcut sheet, `a` annotation mode (task 11).

---

## 6. Domain model (`src/domain`)

Define TypeScript types plus zod schemas. Every clinical or operational fact carries provenance:

```ts
type ProvenanceStatus = 'source_confirmed' | 'member_reported' | 'inferred' | 'unresolved';
interface Provenance {
  source: SourceSystem;          // 'eligibility' | 'adt' | 'pbm' | 'claims' | 'ccd' | 'labs' | 'um' | 'contact' | 'hra' | 'risk' | 'measures' | 'directory' | 'appointments' | 'cm_record'
  sourceRecordId: string;
  eventTime: string;             // when it happened clinically (ISO)
  receivedTime: string;          // when the plan received it (ISO)
  status: ProvenanceStatus;
  reviewer?: string;
  history?: { at: string; by: string; change: string }[];
}
```

Entities: `Member`, `Coverage` (line of business, program, effective dates, dual status, prior IDs), `ContactPoint` (number, label, **owner** e.g. member/daughter/caseworker, validity, last outcome, answer stats, best window, consent per channel), `AdtEvent` (type, facility, time, diagnosis optional, disposition optional, duplicateOf optional), `PharmacyFill` (drug, RxNorm, strength, days supply, fill date, prescriber, pharmacy, status incl. reversed), `MedicationStatement` (one row per drug **per source**: discharge list, PBM, claims-derived, member-reported), `Claim` (service date, received date, codes, status), `ClinicalDocument` (type, state `received | requested_not_received | restricted`), `LabResult` (LOINC, value, unit, specimen time), `AuthRequest` (service, status, decision time, owner team, start-of-care confirmed?), `OutreachAttempt` (time, number, channel, outcome code), `Assessment` (HRA/SDOH item, value, assessed date), `RiskScore` (value, model, basis, scored date), `CareGap` (measure, window open/close, state incl. `pending_claim`), `Appointment` (booked/canceled/completed/unknown), `Task` (owner, team, due, state stepper), `Note`, `AuditEvent`.

Data access: a repository layer in `src/lib/data` with async functions (`getQueue`, `getMember`, `getMemberSignals`, …) reading committed JSON, so it can be swapped for an API later.

---

## 7. Golden patients (hand-authored fixtures)

Five fictional members, each built to break a naive display. Populate **at least nine** datasets per member, and plant the imperfections listed. Pick unstated details yourself, keeping every date consistent with `AS_OF`. Log every planted imperfection in `data/golden/imperfections.json` as `IMP-01` … `IMP-30` with member, dataset, description and the UI element that must expose it.

### SYN-HF-001 · Harold Bellweather (fictional) · 71 M · Medicare Advantage HMO · heart-failure program
- HFrEF, atrial fibrillation, CKD 3b. PCP Dr. Rook (fictional). Hard of hearing.
- Admitted 1 Nov (ADT), discharged **Fri 6 Nov 16:45**; ADT alerts carry **no diagnosis**. Discharge medication list (CCD) received Fri 19:30. **Discharge summary requested, not received.** Admission absent from claims; claims complete to about 25 Sep.
- Medications by source (render as a matrix, never merged):
  | Drug | Discharge list (CCD, 6 Nov) | PBM fills (as of Sun 8 Nov 23:00) | Claims-derived (22 Sep) |
  |---|---|---|---|
  | Furosemide | 80 mg daily (changed) | 40 mg, filled 10 Oct | 40 mg |
  | Sacubitril/valsartan | 24/26 mg BID (new) | **no fill seen** | — |
  | Apixaban | 5 mg BID | 5 mg, 25 Oct | 5 mg |
  | Metoprolol succinate | 50 mg daily | 50 mg, 25 Oct | 50 mg |
  | Atorvastatin | 40 mg daily | 40 mg, 12 Sep | 40 mg |
- Labs: BNP 1,850 (1 Nov) → 620 (5 Nov); K 4.9; eGFR 48 (5 Nov), 52 (Jul). **eGFR 48 sits in the stage 3a range while the coded diagnosis is CKD 3b**: keep both and log it as a planted coded-stage-versus-lab discrepancy; display both, reconcile neither.
- Readmission risk 0.31, scored 31 Oct, i.e. **before this admission** (show the warning).
- Home-health authorization pending since Fri. HRA (26 Apr): lives with spouse, transport fine, **scale at home never asked**.
- Reach: mobile ··0142 answered 3/3 mornings; spouse Doris ··0177; best 09:00–11:00; consent calls yes, texts no.
- Timeline: echo (Jul), cardiology 30 Aug, PCP 22 Sep (claim), admit 1 Nov, discharge 6 Nov.
- Expected at 8 am: rank **#1 Due today**; contact window ends **Tue 10 Nov 17:00**; S1, S2, S3 fire; visit due by Fri 13 Nov.
- Call content for the Call Workspace demo: dyspnea on stairs, +2 lb since Friday, member holds a 40 mg furosemide bottle, sacubitril/valsartan not collected because of a $47 copay quote, no scale at home; next contact Thu 12 Nov 09:30.

### SYN-DM-002 · Priya Castellanos (fictional) · 54 F · Medicaid expansion · type 2 diabetes on insulin
- **Two member IDs** after a coverage lapse; fills split across both. A single-ID view shows a **false 242-day spring gap** and hides the **real 51-day autumn gap**. Identity resolution merges them with a visible "merged from" badge and an undo.
- Insulin and metformin 51 days past expected run-out, zero refills left. A1c 9.8% (July, about four months old); prior A1c sits under the old ID.
- No-show at PCP on 14 Oct, invisible in claims. Text consent recorded only on the old ID. HRA under the old ID. Works two evening jobs; morning calls fail.
- Expected at 8 am: in **At risk**; S4 fires with a 51-day gap on the resolved person (lapse period excluded). Next action: text at 14:00 before her shift; offer same-week PCP visit with renewals and 90-day supply.

### SYN-ED-003 · Marcus Okonkwo-Lane (fictional) · 38 M · Medicaid · persistent asthma + major depression
- Number on file dead for 7 calls, plus a letter to an old address. The current mobile and address appear **only in ED registration (ADT) messages**.
- **6 ADT messages for 5 ED visits** in 90 days (one duplicate). Claims show 2 of 5 visits. Four rescue-inhaler fills, no controller since July. Social context only in a free-text clinical note. No HRA. No text consent. Attributed PCP never seen.
- Expected at 8 am: **#2 Due today**; reason chips "5 ED visits / 90 d" and "New mobile from ED" (single-source mark); S5 and S10 fire; the 7-day follow-up-after-ED window closes **Tue 10 Nov**. Next action: text/call the ED-registration number after 17:00, obtain verbal text consent, book same-week visit and controller refill. The Member Story promotes the ED number and marks the file number dead.

### SYN-BH-004 · Jade Wintermoor (fictional) · 29 F · Medicaid · behavioral health + housing instability
- **Conflicting diagnoses**: bipolar I (BH clinic) vs major depression (PCP claims). Show both with sources; pick neither.
- Housing recorded stable eight months ago; shelter address closed, returned mail. A substance-use record exists but is **restricted (42 CFR Part 2)**: render a "Restricted" badge, never a blank.
- Lithium and quetiapine **28 days past run-out** after a subtherapeutic lithium level; lithium level overdue 8 days. Two missed psychiatry visits. Crisis-line contact 30 Oct. Reachable only via shelter caseworker, 10:00–12:00 (answered 2/2).
- Expected at 8 am: **#3 Due today**; S8 fires. Next action: call caseworker, coordinate with BH case manager today, rebook psychiatry, request lithium level, housing referral. No crisis inferred from diagnosis alone; any acute concern follows a clinician-led escalation path.

### SYN-DUAL-005 · Eleanor Fairweather (fictional) · 83 F · D-SNP with Medicaid HCBS · dementia, CKD 4, falls
- Primary number labelled "Home" is actually **daughter Linda's work-hours mobile**; call after 18:00.
- **ED fall 27 Oct, treat-and-release**: it never entered the transition queue in the legacy view; ED claim still missing 13 days later; CKD still coded stage 3.
- Home-health PT requested 28 Oct, **approved 29 Oct, start of care not confirmed** (12 days since request).
- **Two calcium-channel blockers from two prescribers**; gabapentin not adjusted for eGFR 24; 11 medications including one OTC item invisible to PBM data.
- A cost-based model ranks her "medium".
- Expected at 8 am: **#4 Due today**; 7-day follow-up overdue 6 days; S6, S7, S9 fire. Next action: call daughter after 18:00, confirm PT start with agency, raise the duplicate pair with PCP and cardiology, falls-safety review, request respite and personal-care hours.

---

## 8. Background caseload (Synthea pipeline)

Goal: 43 realistic background members so the queue, lists and counts feel like a real 48-case load. Pipeline lives in `scripts/data/`, written in TypeScript and run with `tsx`.

1. **Get Synthea.** Check `java -version` (Java 17+). Download the latest `synthea-with-dependencies.jar` from the Synthea GitHub releases into `.cache/synthea/`. Run `java -jar … -h` and confirm flag names for the installed version before using them.
2. **Generate.** Roughly:
   ```bash
   java -jar .cache/synthea/synthea-with-dependencies.jar \
     -p 150 -s 20261109 -cs 20261109 -r 20261109 -a 30-90 \
     --exporter.csv.export=true --exporter.fhir.export=false \
     --exporter.years_of_history=3 \
     --exporter.baseDirectory=.cache/synthea/output Massachusetts
   ```
   If the reference-date flag is unsupported, generate normally and shift every date so the dataset ends at `AS_OF`.
3. **Select** 43 members whose conditions fit care-management programs (heart failure, diabetes, COPD/asthma, CKD, depression, dementia) and whose payer maps to Medicare Advantage, Medicaid or dual-eligible.
4. **Transform** Synthea CSVs (patients, encounters, conditions, medications, observations, claims, payers) into the domain model:
   - **ADT**: inpatient and emergency encounters in the last 120 days → admit/discharge or ED-registration events, received minutes to hours later; about 30% without diagnosis; about 10% duplicated.
   - **Pharmacy fills**: expand medication records into fills with 30- or 90-day supplies (distribution from calibration step 6); PBM feed current through Sun 8 Nov 23:00; plant gaps in about 20% of maintenance drugs; a few reversals.
   - **Claims lag**: drop claims with service date later than a per-member `claimsCompleteThrough` (about `AS_OF` minus 30–60 days, median about 45).
   - **Contact history, UM authorizations, HRA dates, care gaps, risk scores**: generate deterministically with a seeded PRNG; include some wrong numbers, relatives' numbers, stale HRAs, approved-not-started services.
   - **Scrub**: rename all people to fictional names, replace provider/facility/pharmacy names with fictional ones, rewrite street lines, assign `SYN-BG-0NN` IDs and `555-01xx` numbers.
5. **Tune counts.** Background members must combine with the golden five so that, at `AS_OF`, the Today tabs read **Due today 4 · At risk 3 · Follow-ups due 5 · Waiting on others 6 · All 48**, with **6 new discharge alerts since Friday**. The four Due-today rows are the golden members in order Harold, Marcus, Jade, Eleanor; Priya is one of the three At risk.
6. **Calibrate (optional).** Try to fetch the CMS Synthetic Medicare Claims PUF prescription drug event file. If reachable and under 500 MB, compute the days-supply distribution and write `data/calibration/pde-days-supply.json` with the source cited. Otherwise write documented defaults labelled `"basis": "assumption"`. Never commit the raw CMS files.
7. **Output.** Commit `data/background/*.json` and `data/background/manifest.json` (seed, Synthea version, CLI args, counts, generation date) so the app and CI never need Java. Keep raw output in `.cache/` (ignored).
8. **Fallback.** If Java or the download is unavailable, write a deterministic TypeScript generator producing the same shape, set `"generator": "fallback"` in the manifest, and state this prominently in the PR.

Add `docs/data-provenance.md`: sources, what is synthetic, what each transform does, Synthea Apache-2.0 credit, CMS PUF citation.

---

## 9. Signals and prioritization (`src/engine`)

Pure, deterministic functions. Each signal returns `{ id, fired, reason, inputs: SourceRef[], confidence: 'high'|'medium'|'low', actions: SuggestedAction[] }`. No percentages for confidence.

| Signal | Rule (plain language) | Confidence | Golden expected value |
|---|---|---|---|
| S1 New discharge drug not picked up | Drug on discharge list with no fill within 48 h of discharge | High if from structured CCD; medium if extracted, unconfirmed | Harold: sacubitril/valsartan, **63 h** |
| S2 Medication lists disagree | Same ingredient at different doses, or present on one list and absent on another | Per row, with source and date | Harold: furosemide 80 vs 40 mg |
| S3 Transition clock | Business days since discharge vs 2-business-day contact, 7-day visit, 30-day reconciliation windows | High | Harold: **1 business day elapsed**, window ends Tue 17:00 |
| S4 Refill gap, chronic program | Days past expected run-out > 7 (7-day grace) for maintenance drug; escalate if A1c ≥ 9 or BNP rising; computed on the **resolved person** with coverage-lapse days excluded | Medium; lower if fills split across IDs | Priya: **51 days** |
| S5 Frequent ED + new reachable number | ≥ 3 ED visits in 90 days after de-duplication; registration contact differs from file | Medium until the number answers | Marcus: **6 raw / 5 de-duplicated** |
| S6 Duplicate therapy / high-risk drug | Same class from different prescribers, or renally dosed drug with low eGFR | High on fact; significance is clinical | Eleanor: **2 CCBs**, gabapentin with eGFR 24 |
| S7 Authorized service not started | Approved home health/DME without start-of-care confirmation within 3 days | High on status, medium on start | Eleanor: **12 days since PT request** |
| S8 Behavioral-health deterioration | Psychotropic gap + missed visit or crisis contact; housing instability raises priority; restricted data shown as restricted | Medium | Jade: **28-day gap** |
| S9 Caregiver strain and safety | Caregiver is primary contact + fall or ED visit + ≥ 8 medications | Medium (HRA months old) | Eleanor: **11 medications** |
| S10 Best number, time, channel | Rank numbers by answer rate; infer best 2-hour window; respect text consent | Grows with outcomes | Marcus: **7 failed calls** to dead number |

**Queue ordering:** tier from time-bound clinical events (safety escalation → transition with expiring window → time-sensitive access barrier → overdue follow-up → routine) → within tier by nearest clock → then confidence → then risk score as **tie-break only**. Low data completeness triggers a verification action, never "low risk". Low reachability triggers an alternative-contact action, never removal from the queue.

**Tabs:** Due today (hard clock due by end of today/tomorrow or safety signal), At risk (signal fired, no hard clock), Follow-ups due (scheduled cadence), Waiting on others (owned by another team; shows owner and next check), All.

**Freshness marks** (component from task 2): filled = verified or received within the dataset's freshness SLA; half = single source, unconfirmed or inferred; open = older than the dataset's staleness threshold (default 30 days). Always with a text label in the tooltip and accessible name.

**Required unit tests** (in addition to the table): business-day arithmetic across a weekend; refill arithmetic: a 90-day supply filled 3 Aug covers through 31 Oct and the next supply is due 1 Nov (no gap may be asserted before then); ED de-duplication; "newest received is not necessarily most clinically current" (a late claim for an earlier event must not override a newer ADT event); queue order and tab counts from section 8.5.

---

## 10. Tasks (one PR each)

### Task 1 · `chore/01-scaffold` · "chore: scaffold app, tooling and CI"
Labels: `area:infra`, `type:chore`.
- Create `.gitignore` **first** (Node defaults plus `reference/`, `.cache/`, `data/raw/`, `CLAUDE.local.md`, `.env*`, Playwright artifacts).
- Latest stable Next.js (App Router, `src/`, TypeScript strict), pnpm, Node version pinned in `.nvmrc` and `engines`, Tailwind CSS, shadcn/ui initialised, `lucide-react`, ESLint + Prettier (with Tailwind class sorting), Vitest + Testing Library, Playwright (Chromium), `tsx`, `zod`, `date-fns` + `date-fns-tz`, `zustand`, `@tanstack/react-table`.
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `data:generate`, `screenshots`.
- GitHub Actions `ci.yml` on pull requests and pushes to main: install, lint, typecheck, unit tests, build, Playwright smoke (with browser install and caching).
- `.github/pull_request_template.md` mirroring section 2.4. `.editorconfig`. README skeleton (purpose, synthetic-data notice, how to run).
- Placeholder page rendering `APP_NAME`.
- Acceptance: CI green on the PR.

### Task 2 · `feat/02-design-system` · "feat(ui): design tokens and component library"
Labels: `area:ui`, `type:feature`.
- Tokens from section 4 as CSS variables with light/dark themes, mapped into Tailwind; fonts via `next/font`.
- Primitives: Button, IconButton, Badge, Chip, Card (header/body/footer), StatCard, Tabs, DataTable (compact/comfortable density, sticky header), Tooltip, Popover, Dialog, Sheet/Drawer, Toast, Avatar (initials), Kbd, EmptyState, Skeleton, SegmentedControl, Checkbox, Radio, Select, Textarea, Progress.
- Domain components: `FreshnessMark`, `SourceChip`, `ConflictBadge`, `ClockPill` (time remaining, urgency colour, overdue state, absolute deadline in tooltip), `ReasonChip`, `ConfidenceLabel` (words, not %), `RestrictedBadge`, `MergedFromBadge` (with undo), `StatusStepper` (requested → approved → started → completed, plus unknown).
- `/design` page showing every component, state and theme.
- Unit tests for `ClockPill` and `FreshnessMark` logic.
- Acceptance: `/design` renders in both themes; no serious axe violations.

### Task 3 · `feat/03-app-shell` · "feat(shell): sidebar, top bar and page layouts"
Labels: `area:ui`, `type:feature`.
- Sidebar, top bar, command palette (member search over fixtures once available; static list until then), as-of chip, theme toggle, user menu, synthetic-data banner, breadcrumbs, `PageHeader`, responsive behaviour from 4.3, keyboard shortcuts from section 5, all routes from section 5 present with stubs or empty states.
- Playwright smoke: every route loads, navigation works, no console errors.

### Task 4 · `feat/04-domain-fixtures` · "feat(data): domain model, golden members and data layer"
Labels: `area:data`, `type:feature`.
- Types and zod schemas (section 6); time utilities (`AS_OF`, timezone, business days); golden fixtures (section 7) in `data/golden/`; `imperfections.json`; repository layer.
- If the annex `.xlsx` exists in `reference/`, add `scripts/data/check-annex.ts` (SheetJS) that compares fixtures against the annex and prints differences; fix fixtures until it reports none, and say so in the PR.
- Tests: every fixture parses; date math; refill arithmetic.

### Task 5 · `feat/05-synthea-caseload` · "feat(data): Synthea-derived background caseload"
Labels: `area:data`, `type:feature`.
- Everything in section 8, including scrubbing, count tuning, manifest, optional CMS calibration, `docs/data-provenance.md`.
- Unit-test the transform against a tiny committed Synthea sample (3 synthetic patients, scrubbed) in `scripts/data/__fixtures__/`.
- PR must state the Synthea version, seed, member counts by program and line of business, and whether the fallback generator was used.

### Task 6 · `feat/06-signals-engine` · "feat(engine): signals S1–S10 and explainable queue"
Labels: `area:engine`, `type:feature`.
- Section 9 in full: signals, freshness/confidence computation, queue builder, tab classifier, "why this order" explanation data, capacity estimate ("11 members need a touch today; about 4.5 h at current prep time, about 2.1 h with pre-filled notes" — compute from configurable per-case minutes, label as an estimate).
- Tests: every golden expected value; queue order; tab counts 4/3/5/6/48; 6 new since Friday.

### Task 7 · `feat/07-today-queue` · "feat(today): prioritized work queue"
Labels: `area:ui`, `type:feature`.
- Page header "Today", subtitle "Mon 9 Nov · 48 active · 6 new since Friday".
- Row of four StatCards that also act as filters: Due today; Contact windows closing by tomorrow; Open medication conflicts; Members without a verified number.
- Queue card with tabs from section 9. Columns: rank, Member (name, age/sex, program), Why today (reason chips with freshness marks, newest first, max three plus "+n"), Clock (`ClockPill`), Next (primary action labelled by channel and time, e.g. "Call now", "Text 17:00", "Call caseworker", "Call daughter 18:00"), overflow menu (snooze with date; dismiss **requires** a reason and writes an audit event).
- Footer: freshness legend, score basis ("event tier › clock › confidence › risk score as tie-break"), capacity line, "Why this order" popover, "Hide dismissed" toggle.
- Row click or Enter opens Member Story; `j`/`k` navigation. Risk score is not a column.
- E2E: Harold is first; dismiss cannot submit without a reason; tab counts match.

### Task 8 · `feat/08-member-story` · "feat(member): Member Story 360 view"
Labels: `area:ui`, `type:feature`.
- Header: name with "(fictional)", age/sex, plan, program, PCP, flags (e.g. hard of hearing). **Reach line** directly under it: best number with answer stats and owner, alternates, best window, consent per channel, Call button.
- Overview layout: **What changed (72 h)** and **Next best actions** side by side above the fold. Actions support confirm, snooze, dismiss with reason; each shows its reason and source on hover.
- **Medications matrix**: one row per drug, one column per source (discharge list, PBM, claims-derived, member-reported when present), each cell with freshness mark and date; conflict rows highlighted with a reason. "Reconcile" opens a dialog where the clinician records a decision per conflicting row plus a note; this creates a reconciliation draft for the Call Workspace. Never auto-merge.
- **Timeline** (12 months) with the claims-completeness shaded band and stamp, typed event markers, tooltips with source and received time.
- **Clinical snapshot**: labs with dates and small trend lines, diagnoses with sources, risk score with model, basis, scored date and a warning when it predates the latest admission, HRA items with assessment dates and "not asked" states.
- Other tabs: Contacts (contact graph: numbers, owners, outcomes, consent), Documents (incl. "requested, not received" and "restricted" states with a re-request action), Authorizations (status stepper; "approved, start not confirmed"), Care gaps (window and `pending_claim` state), Notes & tasks, **Sources** (raw-record drawer: source, record ID, event time, received time, status, history in monospace).
- Golden variants: Harold (three-source matrix, unfilled ARNI, missing summary); Priya (merged-from badge with undo; gap computed on resolved person); Marcus (ED number promoted, file number marked dead); Jade (two diagnoses with sources, restricted badge); Eleanor (reach line shows daughter Linda evenings, duplicate CCB pair with both prescribers, PT approved-not-started).
- E2E: for each golden member, its variant element is present.

### Task 9 · `feat/09-call-workspace` · "feat(call): call workspace with drafted note and write-once sign"
Labels: `area:ui`, `type:feature`.
- Header: member, number being called and its owner, call timer, recording-consent state (asked / yes / no).
- **Left, Guide**: a checklist (not a script) that adapts to program and to record gaps (e.g. HRA "scale at home" gap inserts a question for Harold; a diabetes call asks about hypoglycemia instead). Answer chips feed the note. Red-flag escalation item per program. "Add caregiver on the line".
- **Left-bottom, Structured assessment**: progress for the 40 fields: pre-filled from records (each with source and date, keep/change), confirmed from this call, remaining. Field list in a drawer.
- **Right, Note draft**: deterministic template engine fed by records plus guide answers. Every sentence tagged *from record*, *heard on call* or *model-inferred*; inferred sentences are flagged ("not heard on call — confirm or remove") and block signing until resolved. Inline editing. Clear label: "Draft · not in the record until signed".
- **Right-bottom, On sign writes once to**: call note, care-plan goals and tasks, medication-reconciliation attestation (RN, date), drafted messages to PCP/specialist (shown, editable), next contact date.
- **Sign**: confirmation dialog listing exactly what will be written; requires all inferred flags resolved and required fields complete; writes to a local store and the audit log; toast; returns to Today with the item completed and the queue recomputed.
- **Unsuccessful call**: outcome codes (no answer, voicemail, wrong number, disconnected, reached other person) update contact history and S10.
- Use the Harold call content from section 7.
- E2E: full Harold flow from Today → Member Story → Call Workspace → sign → Today updated.

### Task 10 · `feat/10-tasks-audit-provenance` · "feat(records): tasks, audit log and data pages"
Labels: `area:ui`, `area:data`, `type:feature`.
- `/tasks`: my tasks and waiting-on-others, with owner team, due date, next check, and completion steppers (referral sent → accepted → scheduled → delivered; authorization requested → approved → started).
- `/audit`: chronological suggestions shown, confirmations, dismissals with reasons, edits, merges and undos, signatures; filters; client-side CSV export.
- `/data-sources`: each feed, freshness SLA, last received, known quality issues.
- `/about-data`: synthetic-data statement, provenance summary, the 30-row imperfections log with links to the member and UI element that exposes each, source credits.

### Task 11 · `feat/11-wireframe-polish` · "feat(wireframe): annotation mode, accessibility pass and screenshots"
Labels: `area:ui`, `type:feature`.
- **Annotation mode** (top-bar toggle, shortcut `a`): numbered markers on key regions of Today, Member Story and Call Workspace, plus a side panel "What sits here and why" (write the rationale in your own words from section 3 and the reference docs).
- **Low-fi mode** toggle: greyscale, flat surfaces, system font, for a classic wireframe look in slides.
- Accessibility pass: axe in Playwright across every route in both themes, zero serious or critical violations; focus order; reduced-motion support.
- `scripts/screenshots.ts` (Playwright): Today, Member Story for all five golden members, Call Workspace (Harold mid-call and the sign dialog), `/design`; 1440×900 at device scale 2, light theme, plus annotated variants; output to `docs/screenshots/`.
- Final README: overview, screenshot gallery, how to run, data provenance, what is mocked, design principles, deliberate non-goals (UM workflows, member app, new predictive models, autonomous clinical actions).

### Task 12 · `ci/12-pages-deploy` · "ci: static export and GitHub Pages deploy" (only if `DEPLOY_PAGES=true`)
Labels: `area:infra`, `type:chore`.
- Static export with `generateStaticParams` for member routes, correct `basePath`, Pages workflow on push to main. Confirm in the PR that no reference material or raw data is in the build output.

---

## 11. Final report

When the last task is done, print:

1. A table: task, branch, PR number and URL, CI status.
2. Merge order (for `stacked`: merge #1 first; GitHub retargets each dependent PR when its base branch is merged and deleted).
3. How to run locally and regenerate data.
4. Every assumption or deviation from this brief, in one list.
5. Confirmation that the attribution checks in 2.2.5 and 2.2.6 passed for every commit and PR.

---

## 12. Stop conditions

Stop and report clearly (do not improvise) if:
- `gh auth status` fails, or the repo has no GitHub remote.
- `git config user.name` or `user.email` is empty.
- An attribution check fails and you cannot remove the text.
- A step would require MIMIC-IV or other credentialed or real patient data.
- CI fails on the same task three times after your fixes.

For anything else (Java missing, CMS download blocked, a library API changed), take the documented fallback or the most reasonable choice, keep going, and record it in the PR.
