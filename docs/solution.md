# Caseline — Solution Document

**A case-management workbench for health-plan nurses.**
Product-design deliverable. Clickable, high-fidelity wireframes.

---

## 1. The problem we set out to solve

Maria is an RN case manager at a health plan. Twenty years in the ICU, now
forty-eight active complex cases. On a Monday morning she has six new
hospital-discharge alerts waiting from the weekend.

Her day looks like this: she opens six or seven systems per member, calls
numbers that are dead, reads medication lists that contradict each other,
fills a forty-field assessment by hand after every contact, and by three
o'clock she has had two real conversations.

The work is not the problem. The path to the work is the problem.

**Our job:** shorten the path from a new member event to a verified,
completed care action.

---

## 2. What we built

Three screens for the three moments of Maria's day.

| Screen | The question it answers |
|---|---|
| **Today** | Whom do I work on, in what order, and why? |
| **Member Story** | What changed, what is reliable, what is unresolved, what do I do next? |
| **Call Workspace** | Can I hold the conversation while the record writes itself? |

Everything else in the product — the caseload list, tasks, the audit log, the
data-source register — exists to support those three.

---

## 3. The seven principles

These were not decoration. Every screen decision was checked against them.

**1. Trust is visible.**
Every important fact shows where it came from, when it happened clinically, and
when the plan actually received it. Those are three different times and we
never collapse them.

**2. Conflicts are shown, never merged.**
When the discharge list says furosemide 80 mg and the pharmacy data says 40 mg,
we put them side by side with both dates and both sources. Software does not
pick a winner. A clinician does, and that act is recorded.

**3. Priority has a reason and an action.**
No bare ranking. Every row in the queue says why it is there, what clock is
running, and what the next step is — including the channel and the time of day.

**4. The risk score is one dated input, never the driver.**
Cost-based risk models carry documented bias. We show the score with its model,
its basis and the date it was computed — and we warn when it predates the
member's latest admission. It is never the first column. It breaks ties and
nothing else.

**5. Reachability is part of care.**
Which number answers, whose number it actually is, consent per channel, the
best two-hour window, language. A member who cannot be reached is not a member
who can be dropped from the list.

**6. Claims are history, not status.**
Every claims-based panel carries "claims complete to about <date>". A quiet
month after that date reads as missing data, not as a healthy member.

**7. Nothing enters the record without a named clinician confirming it.**
No autonomous clinical actions, no auto-closed care gaps, no auto-merged
medication lists. Every drafted sentence is labelled as a draft until signed.

---

## 4. How the three screens work

### Today — the prioritised queue

Opens on Monday 9 November, 8:00 AM. Forty-eight active cases, six new
discharge alerts since Friday.

Four summary cards double as filters: members due today, contact windows
closing by tomorrow, open medication conflicts, and members without a verified
number. Then the queue itself, split into five tabs:

> **Due today 4 · At risk 3 · Follow-ups due 5 · Waiting on others 6 · All 48**

Each row carries the member, the reasons they surfaced today (as chips, each
with a freshness mark), the clock that is running, and the next action written
the way Maria would say it — "Call now", "Text 17:00", "Call caseworker",
"Call daughter 18:00".

**The ordering rule is published on the page**, not hidden:
safety escalation → transition with an expiring window → time-sensitive access
barrier → overdue follow-up → routine. Within a tier, nearest clock, then
confidence, then the risk score as a tie-break.

Dismissing an item requires a written reason. The footer carries a capacity
estimate — "11 members need a touch today; about 4.5 h at current prep time,
about 2.1 h with pre-filled notes" — labelled an estimate, and deliberately not
used to order anything.

### Member Story — the 360 view

Opens with the member's name, plan, program, PCP and flags, and immediately
below it a **reach line**: the best number, who it actually belongs to, how
often it has answered, the best window, and consent per channel.

Above the fold, side by side: **What changed in the last 72 hours** and **Next
best actions**. Each action shows its reason and source, and can be confirmed,
snoozed or dismissed with a reason.

The centrepiece is the **medications matrix** — one row per drug, one column
per source (discharge list, pharmacy fills, claims-derived, member-reported).
Conflicting rows are highlighted with the reason. "Reconcile" opens a dialog
where the clinician records a decision per row; that decision becomes a draft
the Call Workspace picks up. Nothing merges on its own.

Around it: a twelve-month timeline with the claims-completeness band shaded in;
labs with trends; diagnoses with competing sources kept apart; documents that
can read "requested, not received" or "restricted" rather than going blank;
authorisations on a stepper that distinguishes *approved* from *started* from
*delivered*; and a Sources drawer showing the raw record behind any fact.

### Call Workspace — the conversation

Left side, a **guide** — a checklist, not a script. It adapts to the program
and to what is missing from the record. (Harold's assessment never asked
whether he has a scale at home, so the guide inserts that question.) Answers
become chips that feed the note.

Below it, the **structured assessment**: the forty fields, split into
pre-filled from records (each showing its source and date, keep or change),
confirmed on this call, and still outstanding.

Right side, the **note draft**, assembled from the record plus what was heard.
Every sentence is tagged *from record*, *heard on call* or *model-inferred* —
and an inferred sentence is flagged "not heard on call — confirm or remove" and
**blocks signing** until it is resolved.

**One signature writes everything once**: the call note, care-plan goals and
tasks, the medication-reconciliation attestation, drafted messages to the PCP
and specialist, and the next contact date. The confirmation dialog lists
exactly what is about to be written. Then the queue recomputes and the item is
done.

Calls that do not connect matter too: no answer, voicemail, wrong number,
disconnected, reached someone else — each outcome updates the contact history
and changes how numbers are ranked next time.

---

## 5. The data: five members built to break a naive screen

The whole caseload is synthetic and labelled as such. Every member ID starts
with `SYN-`, every phone number uses the reserved 555-01xx exchange, every
hospital, pharmacy and clinician name is invented and marked "(fictional)".
No real or credentialed patient data was used, downloaded or referenced.

Forty-three background members give the queue and lists realistic weight. The
five in front are hand-authored, and each one exists to defeat a display that
takes data at face value:

- **Harold, 71, heart failure.** Discharged Friday at 16:45. The alerts carry
  no diagnosis. The discharge summary was requested and never arrived. Three
  medication sources disagree. The new drug was never picked up — a $47 copay.
  His risk score was computed *before* the admission.
- **Priya, 54, diabetes on insulin.** Two member IDs after a coverage lapse.
  Viewed under one ID she shows a false 242-day gap in spring and hides the
  real 51-day gap now. Resolving the identity is shown with a "merged from"
  badge and an undo.
- **Marcus, 38, asthma and depression.** Seven failed calls to a dead number.
  His working mobile exists only inside ED registration messages. Six messages
  for five ED visits — one is a duplicate.
- **Jade, 29, behavioural health and housing instability.** Two conflicting
  diagnoses from two sources; we show both and pick neither. A substance-use
  record is restricted by law, so it renders as "Restricted", never as a blank.
  Reachable only through a shelter caseworker, 10:00–12:00.
- **Eleanor, 83, dual-eligible, dementia and falls.** The number labelled
  "Home" is really her daughter's work mobile — call after 18:00. Physical
  therapy was approved eleven days ago and still has not started. Two
  calcium-channel blockers from two prescribers. A cost model calls her
  "medium".

Thirty deliberate imperfections are logged by ID, each naming the member, the
dataset, and the exact screen element that must expose it. The log is a test of
the design, not a disclaimer.

Every clock, age and freshness mark is computed from one pinned instant —
Monday 9 November 2026, 08:00 ET — so the screens read identically on any
machine on any day.

---

## 6. How priority is decided

Ten named signals produce the queue. Each returns a plain-language reason, the
records it drew on, a confidence stated in words rather than a percentage, and
one or more suggested actions.

| | Signal |
|---|---|
| S1 | A drug on the discharge list was never picked up |
| S2 | Medication lists disagree |
| S3 | Transition clock — contact, visit and reconciliation windows |
| S4 | Refill gap on a chronic program, computed on the resolved person |
| S5 | Frequent ED visits plus a new reachable number |
| S6 | Duplicate therapy, or a renally dosed drug against low kidney function |
| S7 | An authorised service that never started |
| S8 | Behavioural-health deterioration |
| S9 | Caregiver strain and safety |
| S10 | Best number, best time, best channel |

Two rules keep the logic honest: **thin data triggers a verification action,
never a "low risk" label**, and **poor reachability triggers an alternative
contact, never removal from the queue**.

---

## 7. How we worked

The build ran as twelve sequential tasks, each on its own branch and pull
request, each with its quality gates green before the next one started.

1. **Scaffold** — project, tooling, continuous integration.
2. **Design system** — colour, type and spacing tokens in light and dark, the
   component library, and the domain components that carry meaning: freshness
   marks, source chips, conflict badges, clock pills, confidence labels,
   restricted badges, status steppers. All published on a `/design` page.
3. **App shell** — sidebar, top bar, command palette, the "data as of" chip,
   keyboard shortcuts, and every route present as a stub so the information
   architecture was visible before any screen was filled.
4. **Domain model and the golden five** — the record shapes, the time rules,
   the hand-authored members and the imperfections log.
5. **Background caseload** — forty-three deterministic members so the counts
   feel like a real load.
6. **Signals and the queue** — the ten signals, the ordering, the tab counts.
7. **Today**, **8. Member Story**, **9. Call Workspace** — the three screens.
10. **Tasks, audit log and data pages.**
11. **Annotation mode, accessibility pass and the screenshot gallery.**
12. Optional static deploy.

The order was deliberate: identity before components, components before shell,
shell before data, data before logic, logic before screens. Nothing visual was
built on top of data that had not been decided.

Two constraints held throughout. **No live model calls and no network calls** —
every "AI" behaviour is a fixed, local, repeatable draft, labelled in the
interface as something a clinician must confirm. And **accessibility is not a
later pass** — freshness and status are never carried by colour or shape alone;
they always come with text.

---

## 8. Where the build stands

**Complete and clickable:** the design system and `/design` style guide, the
app shell and navigation, the domain model, the golden five and the background
caseload, the signals and queue data, and all three primary screens — Today,
Member Story (all tabs, for all five members) and the Call Workspace through
signing. Fourteen presentation screenshots are captured, in both themes.

**Still stubs:** the Tasks board, the audit log, the data-source register and
the About-the-data page. Each renders its page header and an empty state
describing what belongs there.

**Not yet done:** annotation mode and the low-fidelity toggle, the full
automated accessibility sweep, and the final README gallery.

One honest note about the prototype's nature: the priority logic is *stated*
rather than *executed*. The signals, the ordering and the resulting queue are
written down as a fixed reading of this caseload at 8:00 on 9 November, so the
screens are identical for everyone who opens them. The rules are published on
the page and the arithmetic is specified; the live engine is the next step, not
a hidden one.

---

## 9. What we deliberately did not build

Saying no was part of the design.

- **No utilisation-management workflow.** Different user, different system.
- **No member-facing app.** This is the nurse's workbench.
- **No new predictive model.** The industry has plenty; the problem is that
  nobody can see where the existing numbers come from.
- **No autonomous clinical action.** Nothing is closed, merged, signed or sent
  without a named clinician.
- **Reports and Settings** ship as empty states that say, in one line, why they
  are out of the MVP.

---

## 10. The argument, in one paragraph

Maria does not need a smarter score. She needs to open one screen and see whom
to call, why, by when, on which number, and what to say — and then to have the
documentation fall out of the conversation instead of after it. Caseline makes
every fact show its source and its two timestamps, refuses to merge anything a
clinician has not decided, treats reaching someone as clinical work rather than
admin, and spends one signature where the old path spent an afternoon. The
measure of success is not a prettier queue. It is more real conversations
before three o'clock.

---

*All members, records, clinicians, facilities, addresses and phone numbers in
this repository are fictional. Nothing here is derived from a real person.*
