# Slide 4 — Data strategy (2 of 2)

Content for the second data-strategy slide. Slide 3 is the solution overview
with the technology stack on the left; this slide carries the dataset
inventory, the freshness and quality story, and how the feeds combine.

Layout mirrors slide 3: stacked bands down the left column, three labelled
panels down the right.

---

## Header

- **Header strip:** `Caseline — Data strategy | Inventory left`
- **Tab bar:** unchanged, Solution active
- **Slide title:** **Caseline - Every feed we trust, how fresh it is, and what it is wrong about**

---

## Left column — panel label: `Dataset Inventory by Freshness`

Vertical rail down the left edge of the bands: `Fresher ↓ Slower`. Bands stack
like slide 3's layers, with the `↓` connector between them.

### Band 1 — `Minutes to Hours`

Filled/dark band. The emphasis band: this is where the product lives.

| Dataset | Sub-label |
|---|---|
| **ADT hospital events** | Admit, ED, discharge — the trigger |
| **Call outcomes** | Each attempt re-ranks the numbers |
| **Member-reported** | Portal, SMS and IVR replies |

### Band 2 — `Days`

Filled band.

| Dataset | Sub-label |
|---|---|
| **Pharmacy fills** | Picked up, days supply, refills |
| **Lab results** | eGFR, A1c, potassium |
| **Clinical documents** | Discharge list, summaries, CCD |
| **Prior auth and referrals** | Approved, started, delivered |

### Band 3 — `Weeks to Months`

Light band.

| Dataset | Sub-label |
|---|---|
| **Medical claims** | History, never current status |
| **Care gaps (HEDIS)** | Measure and window close date |
| **Risk score** | One dated opinion, tie-break only |

### Band 4 — `Standing Context`

Light band.

| Dataset | Sub-label |
|---|---|
| **Eligibility and enrollment** | Roster, dual status, ID history |
| **Care-management record** | Assessments, plan, tasks, notes |
| **Provider and care team** | PCP, specialist, caseworker, family |
| **Restricted records** | 42 CFR Part 2 — a state, not a blank |

### Band 5 — `Priority`

Outlined footer band, like slide 3's Application Layer strip.

> **Must-have, day one** — ADT · pharmacy · eligibility · contact and consent ·
> clinical documents · labs · prior auth · CM record · claims with completeness ·
> care gaps · risk score · audit ledger
>
> **Phase two** — SDOH screening and community referral · appointment feed from
> connected practices · remote monitoring (HF weights, CGM, BP) · NEMT transport ·
> member-service call history

---

## Right column

### Panel label: `Data Quality Stance`

> No feed is clean and none of them agree. The product's job is not to reconcile
> them into one tidy answer — it is to **show the disagreement, date it, name its
> source, and let a clinician decide**. Every record carries **three separate
> times**: when it happened clinically, when the plan received it, and when we
> assessed it. We never collapse them, because the distance between them *is* the
> clinical signal.

### Panel label: `Known Defects and How We Handle Them`

Six rows, styled exactly like slide 3's Key Platform Functions.

**Blank fields are never blank →** ADT alerts arrive with no diagnosis; a
requested discharge summary never comes. We render **"No diagnosis sent"** and
**"Requested, not received"** with the request time and a re-request action.

**Lag is drawn, not hidden →** Every claims panel carries **claims complete to
≈ date**, shaded on the timeline. A quiet month after that date reads as
**missing data, not a healthy member**.

**Conflicts are shown, never merged →** Three sources, three doses, three dates,
side by side. Software picks **no winner**. The clinician's decision is the
record.

**One person, one history →** A coverage lapse splits a member across IDs,
creating a **false 242-day gap** and hiding a **real 51-day one**. Resolution is
explicit, badged **"merged from"**, and reversible.

**Phone data decays fastest →** Owner, answer rate, consent and best window per
number. The freshest working mobile often sits in an **ED registration**, not the
eligibility file.

**Stale opinions are dated →** Risk scores show **model, basis and scored date**,
and warn when they **predate the latest admission**. They break ties and nothing
else.

### Panel label: `How Feeds Combine`

**Inputs strip:** `ADT · Pharmacy fills · Clinical documents · Eligibility · Prior auth · Contact history`

**`01` New discharge drug not picked up**
ADT discharge + discharge med list + pharmacy feed + contact history →
*"63 hours after discharge, no fill. The feed is current to last night, so this
is a **missing fill, not missing data**. Likely cost. Call 09:00."*

**`02` Real gap, not the apparent one**
Identity resolution + fills + days supply →
*"Under one ID, a false 242-day gap in spring. On the **resolved person**, a real
51-day gap now."*

**`03` Approved but never started**
Auth approval + absent vendor encounter + claims completeness →
*"Approved 11 days ago, nothing delivered — but claims run only to 28 Sep, so
absence is **weak evidence**. Call the vendor; do not close the task."*

### Rules band — bottom, full width

> **An insight is only as fresh as its slowest input** — and the row names that
> input. **Thin data triggers a verification action, never a "low risk" label.
> Poor reachability triggers another channel, never removal from the queue.**

---

## Fitting note

Slide 3's `Data Sources` row covers only four buckets at one line each, so this
slide carries the whole rubric ask: inventory, source, clinical meaning,
freshness, defects, handling, priority, and combination. It fits, but it is
dense. If it runs long at 1920×1080, cut Band 4's sub-labels (keep the bold
names only) and drop `03` from *How Feeds Combine*.

---

*Every member, record, clinician, facility and telephone number referenced here
is fictional. Nothing is derived from a real person.*
