# Premium Fortune Service UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시안과 유사한 전통 수묵풍 프리미엄 사주 서비스 화면으로 재구성하고, 일반인이 이해하기 쉬운 오늘/올해/월별/생활운/토정비결형 해석을 풍부하게 제공한다.

**Architecture:** 기존 `src/saju-engine.js`·`src/calendar.js`·`src/mbti.js` 계산 엔진은 변경하지 않고 프레젠테이션 계층만 확장한다. `index.html`은 서비스 정보 구조와 접근 가능한 영역을 담당하고, `styles.css`는 전통 수묵풍·프리미엄 카드 UI를 담당하며, `src/app.js`는 기존 계산 결과를 일반어 해석과 서비스 카드로 렌더링한다.

**Tech Stack:** Vite, vanilla ES modules, HTML5, CSS3, Node built-in test runner

**Spec:** `docs/superpowers/specs/2026-09-17-offline-saju-v2-design.md`

## Global Constraints

- 사주 계산 정확도 관련 기존 엔진을 변경하지 않는다.
- 양력/음력/윤달/1900~2100 입력 구조를 유지한다.
- 브라우저 내부 계산, 서버 전송 없음, 자동 저장 없음 원칙을 유지한다.
- 일반 사용자 화면에서는 명리 전문 용어보다 생활 언어를 먼저 보여준다.
- `토정비결` 영역은 정통 토정비결 계산을 가장하지 않고 `토정비결식 연간 해석`임을 명시한다.
- 건강·재정·연애 관련 문구는 단정적 예언이나 전문적 진단으로 표현하지 않는다.
- 사주 기반 MBTI는 정식 심리검사가 아닌 참고 지표라고 항상 표시한다.

---

### Task 1: Premium Service Information Architecture

**Files:**
- Modify: `index.html`
- Test: `tests/ui.test.js`

**Interfaces:**
- Consumes: 기존 DOM 렌더링 ID 및 `src/app.js` 이벤트 흐름
- Produces: `dailyFortuneGrid`, `todayLucky`, `tojungQuarterGrid`, `yearAdviceGrid`, `seasonGuide`, `reportNav` DOM 컨테이너

- [ ] **Step 1: Write a failing UI contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

for (const id of ['dailyFortuneGrid','todayLucky','tojungQuarterGrid','yearAdviceGrid','seasonGuide','reportNav']) {
  test(`premium UI contains #${id}`, () => assert.match(html, new RegExp(`id=["']${id}["']`)));
}
```

- [ ] **Step 2: Run the UI test and confirm it fails**

Run: `node --test tests/ui.test.js`
Expected: FAIL because the new premium containers do not yet exist.

- [ ] **Step 3: Expand index.html**

Add the six containers above while keeping all existing calculation-input IDs intact. Structure the page as: top navigation → hero → left sidebar → consultation/today cards → report overview → five life-fortune cards → today detail → 토정비결식 annual detail → yearly advice → monthly flow → lifetime flow → four service cards → expert details.

- [ ] **Step 4: Run the UI test**

Run: `node --test tests/ui.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/ui.test.js
git commit -m "feat: expand premium fortune service layout"
```

### Task 2: Rich General-Audience Fortune Copy

**Files:**
- Modify: `src/app.js`
- Test: `tests/ui-copy.test.js`

**Interfaces:**
- Consumes: `calculateTodayFlow(chart)`, `calculateYearFlows(chart, year, 1)`, `calculateMonthFlows(chart, year)`, existing chart elements/roles/relations
- Produces: deterministic plain-language copy for daily categories, lucky hints, quarterly annual narrative, yearly advice, seasonal guide

- [ ] **Step 1: Add source-level contract tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
for (const fn of ['renderDailyFortune','renderTodayLucky','renderTojungQuarters','renderYearAdvice','renderSeasonGuide']) {
  test(`app defines ${fn}`, () => assert.match(source, new RegExp(`function\\s+${fn}\\s*\\(`)));
}
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `node --test tests/ui-copy.test.js`
Expected: FAIL because the functions are not defined yet.

- [ ] **Step 3: Implement deterministic renderers**

Create the five functions using only already-calculated 사주 data. Daily categories must cover 총운/재물/연애/직업/컨디션. Lucky hints must show action, place, color-like symbolic cue and caution. Quarterly annual copy must summarize month-flow dominant groups. Year advice must show opportunity, caution, relationship, money. Seasonal guide must convert month flows into four seasonal blocks.

- [ ] **Step 4: Wire renderers into form submit**

Call all five functions after `renderToday`, `renderYear`, and `renderMonths` so every valid birth input refreshes all premium content.

- [ ] **Step 5: Run unit and full tests**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app.js tests/ui-copy.test.js
git commit -m "feat: add rich plain-language fortune interpretations"
```

### Task 3: Match the Approved Traditional Premium Mockup

**Files:**
- Modify: `styles.css`
- Modify: `assets/hero-landscape.svg`

**Interfaces:**
- Consumes: HTML class names from Task 1
- Produces: desktop two-column dashboard with sticky sidebar, watercolor hero, ivory cards, navy/purple controls, responsive mobile layout

- [ ] **Step 1: Refine visual tokens**

Use warm ivory background, navy text, muted lavender control color, peach/pink/mint service cards, serif display headings, rounded 14–20px cards, subtle paper shadows and thin borders.

- [ ] **Step 2: Add premium section styles**

Style `daily-fortune-grid`, `lucky-panel`, `quarter-grid`, `year-advice-grid`, `season-guide`, and report navigation so they visually match the approved mockup rather than a developer dashboard.

- [ ] **Step 3: Improve responsive behavior**

At 1080px collapse sidebar into horizontal navigation; at 760px use single-column cards and reduce hero typography without horizontal overflow.

- [ ] **Step 4: Build and verify CSS bundling**

Run: `npm run build`
Expected: Vite build exits 0.

- [ ] **Step 5: Commit**

```bash
git add styles.css assets/hero-landscape.svg
git commit -m "style: match traditional premium saju mockup"
```

### Task 4: Privacy and Production Verification

**Files:**
- Modify only if checks find an issue: `scripts/check-network.js`, `README.md`

**Interfaces:**
- Consumes: finished application tree
- Produces: green tests, network/privacy guard, production build

- [ ] **Step 1: Run complete verification**

Run: `npm run check`
Expected: Node tests pass, network/storage guard passes, Vite production build succeeds.

- [ ] **Step 2: Review UI copy for misleading claims**

Search rendered-source strings for phrases claiming medical diagnosis, guaranteed financial outcome, or `정통 토정비결 계산`. Replace any such phrasing with reference/interpretation language.

- [ ] **Step 3: Run complete verification again**

Run: `npm run check`
Expected: exit 0 with all tests passing.

- [ ] **Step 4: Commit final documentation if changed**

```bash
git add README.md scripts/check-network.js
git commit -m "docs: finalize premium saju service verification"
```
