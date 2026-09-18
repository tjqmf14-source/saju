# Senior-Agency Full Remodel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the full saju + tarot presentation layer into a senior-agency editorial experience while preserving all calculation, privacy, precision, and tarot-data behavior.

**Architecture:** Keep the existing domain/calculation modules unchanged. Replace the active page composition in `index.html`, rebuild the single active stylesheet `agency-v6.css`, and adjust only the presentation markup emitted by `src/premium-ui.js`. The new UI uses a small editorial component grammar, one global navigation system, one report navigation system, and distinct layouts for hero, reading, daily, annual, decade, natal, and tarot sections.

**Tech Stack:** Vite, static HTML/CSS, ES modules, Node test runner, existing `manseryeok` dependency.

**Spec:** `docs/superpowers/specs/2026-09-18-senior-agency-remodel-design.md`

## Global Constraints

- Work only on `feature/offline-saju-v2`.
- Do not merge `main` and do not open a PR.
- Preserve `src/saju-engine.js`, `calendar.js`, `solar-terms.js`, `precision.js`, `tarot.js`, `daily-score.js`, `plain-chart.js`, and interpretation behavior.
- No external runtime network, CDN fonts/icons, analytics, or persistent browser storage.
- RWS tarot artwork remains local and visually upright for reversed readings.
- One active stylesheet: `/agency-v6.css`.
- Warm editorial paper/ink is the main visual language; indigo is primarily reserved for tarot.
- Meaning → Implication → Action → Evidence is the content hierarchy.
- Minimum interactive target 44px, visible focus, reduced-motion support.
- Verify 360, 390, 768, 1024, and 1440 responsive intent through structural tests and CI; visual browser QA remains a separate manual check if browser tooling is unavailable.

---

### Task 1: Lock the new architecture with failing tests

**Files:**
- Create: `tests/senior-remodel.test.js`

**Interfaces:**
- Consumes: `index.html`, `agency-v6.css`, `src/premium-ui.js`
- Produces: regression contract for the final structure.

- [ ] **Step 1: Write tests for the new structure**

Tests must assert:
- hero contains `hero-primary` and `hero-visual`
- duplicate desktop side rail is absent
- one `report-nav` remains
- daily section exposes `daily-primary` + `daily-metrics`
- season guide is absent
- annual section order is deep dive → advice → quarters → months
- decade overview + narrative remain
- expert raw data follows plain-language guide
- tarot uses `tarot-stage`
- CSS defines editorial grid/tokens and mobile breakpoints
- renderer does not rotate reversed tarot art

- [ ] **Step 2: Push the failing test**
Commit: `test: define senior-agency remodel contract`

- [ ] **Step 3: Confirm CI fails for the expected missing architecture**
Expected failure: selectors/classes in the new contract are absent.

---

### Task 2: Rebuild page composition

**Files:**
- Modify: `index.html`

**Interfaces:**
- Preserves all IDs consumed by `src/premium-ui.js`.
- Produces new structural classes consumed by `agency-v6.css`.

- [ ] **Step 1: Replace hero**
Structure:
```html
<section class="hero hero-primary">
  <div class="hero-copy">...</div>
  <div class="hero-visual">...</div>
</section>
```

- [ ] **Step 2: Remove persistent desktop `side-rail`**
Keep one global header nav and one `report-nav` after results.

- [ ] **Step 3: Recompose results**
Required major classes:
- `reading-opening`
- `daily-layout`
- `annual-layout`
- `luck-layout`
- `expert-layout`
- `tarot-stage`

- [ ] **Step 4: Remove `seasonGuide` from markup**
Quarter + month structures remain.

- [ ] **Step 5: Keep all renderer IDs**
Do not rename:
`birthForm`, `results`, `dailyFortuneGrid`, `yearDeepDive`, `yearAdviceGrid`, `tojungQuarterGrid`, `monthForecast`, `luckOverview`, `luckTimeline`, `expertGuide`, `pillarGrid`, `elementChart`, `roleChart`, `relationGrid`, `mbtiAxes`, `tarotDeck`, `tarotResult`.

- [ ] **Step 6: Push and verify targeted structural test**

---

### Task 3: Rebuild the single active design system

**Files:**
- Replace: `agency-v6.css`

**Interfaces:**
- Consumes structural classes from Task 2.
- Produces responsive, accessible visual system.

- [ ] **Step 1: Rebuild foundations**
Tokens:
`--paper`, `--surface`, `--ink`, `--muted`, `--rule`, `--brand`, `--gold`, `--jade`, `--indigo`, spacing scale, type scale, container, motion.

- [ ] **Step 2: Build global grid**
- max 1320px
- 12-column conceptual layout
- desktop ≥1200
- tablet 900–1199
- compact 640–899
- mobile ≤639

- [ ] **Step 3: Implement section-specific compositions**
- hero 7/5
- reading opening 8/4
- daily 5/7
- annual editorial rail/cells
- decade index + narrative rows
- expert plain-language first
- tarot dark stage

- [ ] **Step 4: Remove generic SaaS card grammar**
No universal large radii, no shadow stack, no repeated white cards for narrative prose.

- [ ] **Step 5: Accessibility**
44px targets, `:focus-visible`, reduced motion, readable contrast, no horizontal content scroll.

- [ ] **Step 6: Push and verify CSS contract**

---

### Task 4: Refactor renderer markup to match the new composition

**Files:**
- Modify: `src/premium-ui.js`

**Interfaces:**
- Preserves calculation inputs/outputs.
- Changes only generated HTML/classes and presentation copy arrangement.

- [ ] **Step 1: Daily**
Render overall flow separately into `daily-primary`; render money/love/work/condition as compact metric rows in `daily-metrics`.

- [ ] **Step 2: Annual**
Remove season render logic. Keep exactly:
deep dive → advice → quarter → months.

- [ ] **Step 3: Decade**
Keep overview index + narrative, but long narratives use stacked or 2-column blocks instead of three narrow prose columns.

- [ ] **Step 4: Expert**
Keep plain-language guide first and raw data in disclosures.

- [ ] **Step 5: Tarot**
Use `tarot-stage` classes; reversed reading remains text-only orientation with upright art.

- [ ] **Step 6: Push and verify renderer tests**

---

### Task 5: Finish interaction and responsive polish

**Files:**
- Modify: `agency-v6.css`
- Modify: `src/premium-ui.js` only if needed for accessible nav state

**Interfaces:**
- Completes behavior without changing domain logic.

- [ ] **Step 1: Navigation**
Global nav + report nav only. `aria-current` via IntersectionObserver.

- [ ] **Step 2: Mobile**
At ≤639:
- one-column form
- one-column month cards
- one-column decade narrative
- one-column tarot
- non-overlapping nav
- display type reduced to ~38–44px

- [ ] **Step 3: Tablet**
At 900–1199:
- no compressed desktop 3-column prose
- month cards 2 columns
- tarot 3 only if readable, otherwise 2/1

- [ ] **Step 4: Interaction polish**
180–280ms transitions; no continuous decorative animation.

- [ ] **Step 5: Push and verify**

---

### Task 6: Final regression and branch verification

**Files:**
- Modify only if concrete regressions are found.

**Interfaces:**
- Final branch state.

- [ ] **Step 1: Run full CI equivalent**
Expected CI step: `npm run check`.

- [ ] **Step 2: Confirm tests**
All existing engine, precision, tarot, interpretation, network/privacy, and new remodel tests pass.

- [ ] **Step 3: Confirm build**
Vite production build succeeds.

- [ ] **Step 4: Confirm privacy**
No browser network transmission or persistent storage APIs introduced.

- [ ] **Step 5: Confirm final GitHub Actions run**
Final branch SHA must have CI `conclusion: success`.

- [ ] **Step 6: Report exact final SHA and limitations**
If browser visual QA is unavailable, state that explicitly rather than claiming pixel-level visual verification.
