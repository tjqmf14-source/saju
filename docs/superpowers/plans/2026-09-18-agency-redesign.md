# Agency-Level Saju + Tarot Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current stacked dark-dashboard presentation with a single agency-quality Korean editorial mysticism design system while preserving the verified saju engine, privacy model, long-form interpretation, and RWS tarot behavior.

**Architecture:** `index.html` will load one active stylesheet, `agency-v6.css`, and only the main UI module, `src/premium-ui.js`. Existing legacy polish/feedback files stay in the repository only for compatibility/history tests but are no longer part of runtime. The renderer directly produces decade narrative, upright tarot artwork, annual layout, and plain-language chart structure so post-render DOM mutation is not required.

**Tech Stack:** Vite, static HTML/CSS, ES modules, Node test runner, existing `manseryeok` calculation dependency.

**Spec:** `docs/superpowers/specs/2026-09-18-agency-redesign-design.md`

## Global Constraints

- Preserve all verified saju calculation behavior and precision logic.
- Preserve browser-only privacy: no runtime network APIs, persistence APIs, CDN fonts, analytics, or external assets.
- Keep Rider–Waite–Smith artwork local under `/tarot-rws/`.
- Work only on `feature/offline-saju-v2`; do not merge `main` and do not open a PR.
- Warm ivory/ink is the primary page palette; indigo is reserved mainly for tarot and selective contrast regions.
- `yearActionPlan` must not exist in the active markup.
- The 12-month flow must live inside `month-flow-shell` without horizontal overflow.
- Decade luck must expose both `luckOverview` and long-form `luckTimeline` content.
- Plain-language natal reading must appear before raw chart tables and share one `expert-content-shell`.
- Reversed tarot semantics must never rotate the RWS image.

---

### Task 1: Lock the redesign contract with tests

**Files:**
- Modify: `tests/feedback-round5.test.js`

**Interfaces:**
- Consumes: active `index.html`, `src/premium-ui.js`, and new `agency-v6.css`.
- Produces: regression contract for the final runtime structure.

- [ ] **Step 1: Update the failing design-contract tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');

test('runtime uses one agency stylesheet and no post-render feedback script', () => {
  assert.match(html, /<link rel="stylesheet" href="\/agency-v6\.css">/);
  assert.doesNotMatch(html, /premium\.css|polish\.css|feedback-v2\.css|feedback-v3\.css|redesign-v5\.css/);
  assert.doesNotMatch(html, /src\/feedback-v2\.js/);
});

test('annual, decade and plain-chart structural shells exist', () => {
  assert.doesNotMatch(html, /id="yearActionPlan"/);
  assert.match(html, /class="month-block month-flow-shell"/);
  assert.match(html, /id="luckOverview"/);
  assert.match(html, /class="expert-content-shell"/);
});

test('base renderer owns decade narrative and upright reversed tarot', () => {
  assert.match(ui, /function buildLuckNarrative\(/);
  assert.match(ui, /큰 주제/);
  assert.match(ui, /기회/);
  assert.match(ui, /주의할 점/);
  assert.match(ui, /조언/);
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});

test('agency stylesheet establishes light editorial base and dark tarot stage', () => {
  assert.match(css, /--paper:/);
  assert.match(css, /--ink:/);
  assert.match(css, /\.tarot-section\s*\{/);
  assert.match(css, /\.luck-overview/);
  assert.match(css, /\.expert-content-shell/);
});
```

- [ ] **Step 2: Run the targeted test and verify it fails**

Run: `node --test tests/feedback-round5.test.js`

Expected: FAIL because `agency-v6.css` and the new runtime structure do not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/feedback-round5.test.js
git commit -m "test: define final agency redesign contract"
```

### Task 2: Replace active markup and stylesheet stack

**Files:**
- Modify: `index.html`
- Create: `agency-v6.css`

**Interfaces:**
- Consumes: IDs expected by `src/premium-ui.js`.
- Produces: final runtime layout and all visual classes used by the renderer.

- [ ] **Step 1: Replace active stylesheet/script loading in `index.html`**

The `<head>` must contain only:

```html
<link rel="stylesheet" href="/agency-v6.css">
```

The bottom runtime scripts must contain only:

```html
<script type="module" src="/src/premium-ui.js"></script>
```

- [ ] **Step 2: Refactor year/luck/expert wrappers without changing renderer IDs**

Required structure:

```html
<div class="month-block month-flow-shell">
  <div class="block-head">...</div>
  <div id="monthForecast" class="month-grid"></div>
</div>

<section id="luck" class="luck-panel editorial-section">
  ...
  <div id="luckOverview" class="luck-overview"></div>
  <div id="luckTimeline" class="luck-timeline"></div>
</section>

<section id="expert" class="expert-panel editorial-section">
  ...
  <div class="expert-content-shell">
    <div id="expertGuide" class="expert-guide"></div>
    ...raw details...
  </div>
</section>
```

Do not include `yearActionPlan`.

- [ ] **Step 3: Create `agency-v6.css` as the only active design system**

Implement these exact design tokens at the top:

```css
:root {
  --paper:#f2efe7;
  --paper-2:#e8e1d5;
  --ink:#191b22;
  --ink-soft:#4d515b;
  --line:rgba(25,27,34,.16);
  --vermilion:#b54b3f;
  --gold:#af9567;
  --jade:#2f6c66;
  --indigo:#11182b;
  --indigo-2:#171f38;
  --white:#fffdf7;
  --content:1280px;
}
```

The stylesheet must provide:

- paper/ink body and header
- 12-column editorial hero and workspace
- restrained rules instead of repeated rounded boxes
- responsive 4-column quarter grid and 3-column month grid
- no horizontal overflow in `.month-flow-shell`
- decade overview rail + vertical narrative rows
- plain-language expert grid with consistent padding
- dark indigo tarot stage with three-card spread
- focus-visible styles and reduced-motion support
- breakpoints around 1080px and 760px

- [ ] **Step 4: Run targeted design test**

Run: `node --test tests/feedback-round5.test.js`

Expected: Remaining failures should now be limited to renderer behavior in Task 3.

- [ ] **Step 5: Commit markup/design-system migration**

```bash
git add index.html agency-v6.css
git commit -m "style: replace dashboard skin with editorial agency design"
```

### Task 3: Move luck/tarot behavior into the base renderer

**Files:**
- Modify: `src/premium-ui.js`

**Interfaces:**
- Consumes: existing `chart.luck`, `GROUP_COPY`, local RWS `item.card.image` fields.
- Produces: `buildLuckNarrative(item, index, isActive)`, `renderLuck(chart)`, and upright tarot markup.

- [ ] **Step 1: Add a direct decade narrative builder**

Add:

```js
function buildLuckNarrative(item,index,isActive){
  const group=item.group || ['비겁','식상','재성','관성','인성'][index%5];
  const copy=GROUP_COPY[group] || GROUP_COPY.인성;
  return {
    theme:`${copy.label}이 삶의 배경으로 커지는 10년`,
    lead:`${item.age}세부터의 시기는 ${copy.summary}으로 읽을 수 있습니다. 대운은 사건 하나를 맞히는 운세가 아니라, 선택과 관계와 생활에서 반복해서 나타나는 배경 주제에 가깝습니다.`,
    opportunity:`${copy.opportunity}을 실제 생활에서 적극적으로 활용해 보세요.`,
    caution:`${copy.caution}이 반복될 때는 속도를 줄이고 기준을 다시 확인하는 편이 좋습니다.`,
    advice:`${copy.label}의 장점을 크게 쓰되 무리하게 증명하려 하지 않는 것이 핵심입니다.${isActive?' 지금 지나고 있는 구간이므로 올해의 작은 선택도 이 장기 흐름 안에서 바라보세요.':''}`
  };
}
```

If `item.group` is not present, derive the group from the luck pillar stem relative to the natal day stem using existing chart helpers rather than leaving the fallback as the final implementation.

- [ ] **Step 2: Replace `renderLuck(chart)`**

`luckOverview` must render compact decade index items, while `luckTimeline` renders one narrative row per period with `큰 주제 / 기회 / 주의할 점 / 조언`.

- [ ] **Step 3: Remove reversed-art class from tarot markup**

Use:

```js
<div class="tarot-illustration">
  <img class="tarot-card-image" src="${item.card.image}" ...>
</div>
```

Keep:

```js
${item.reversed?'REVERSED · 역방향':'UPRIGHT · 정방향'}
```

- [ ] **Step 4: Run renderer/design tests**

Run:

```bash
node --test tests/feedback-round5.test.js tests/tarot.test.js tests/feedback-round3.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit renderer ownership changes**

```bash
git add src/premium-ui.js
git commit -m "refactor: make base renderer own luck and tarot presentation"
```

### Task 4: Integrate annual flow and plain-language natal layout

**Files:**
- Modify: `src/premium-ui.js`
- Modify: `agency-v6.css`

**Interfaces:**
- Consumes: `yearFlow`, `monthFlows`, `buildPlainChartGuide(chart)`.
- Produces: exactly one quarterly presentation, aligned 12-month flow, and evidence-first raw chart disclosure.

- [ ] **Step 1: Keep one quarterly action-plan renderer**

`renderYear()` should render only `tojungQuarterGrid` as the quarterly presentation. It must not reference `yearActionPlan`.

- [ ] **Step 2: Improve month card copy density**

Each month card should render:

```html
<article class="month-card">
  <div class="month-card-head">...</div>
  <p>long-form user-facing guidance</p>
  <small>절입 기준 ...</small>
</article>
```

Do not use negative margins or horizontal scroll.

- [ ] **Step 3: Ensure expert plain-language guide precedes raw data**

`renderExpertGuide(chart)` remains first. The raw `details` blocks stay after the guide inside `.expert-content-shell`.

- [ ] **Step 4: Run focused tests**

Run:

```bash
node --test tests/feedback-round5.test.js tests/ui.test.js tests/interpretation.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit annual/plain-chart integration**

```bash
git add src/premium-ui.js agency-v6.css
git commit -m "feat: finish annual and natal editorial layouts"
```

### Task 5: Full regression verification and cleanup

**Files:**
- Modify only if verification reveals a concrete regression.

**Interfaces:**
- Consumes: final branch state.
- Produces: verified feature branch with no regressions.

- [ ] **Step 1: Run the complete project check**

Run:

```bash
npm install
npm run check
```

Expected:
- all Node tests pass
- `check:network` reports no browser network/persistent-storage APIs
- Vite production build succeeds

- [ ] **Step 2: Verify runtime stylesheet/script references**

Search `index.html` and confirm:

```text
agency-v6.css          present
premium.css            absent
polish.css             absent
feedback-v2.css        absent
feedback-v3.css        absent
redesign-v5.css        absent
src/feedback-v2.js     absent
```

- [ ] **Step 3: Verify user-requested structures**

Confirm:

```text
yearActionPlan         absent
month-flow-shell       present
luckOverview           present
expert-content-shell   present
reversed-art runtime   absent from premium-ui.js
```

- [ ] **Step 4: Commit any verification fixes**

```bash
git add -A
git commit -m "fix: close final agency redesign regressions"
```

Skip this commit if no changes were needed.

- [ ] **Step 5: Confirm GitHub Actions CI on the final SHA**

Expected: workflow `CI` completes with conclusion `success` on `feature/offline-saju-v2`.
