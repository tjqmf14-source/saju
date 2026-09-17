# Precision Tarot Dark Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KASI 기반 사주 계산을 정밀 시간 보정까지 확장하고, 상세 장문 해석·딥네이비 점술 UI·오프라인 타로를 완성한다.

**Architecture:** `src/saju-engine.js`는 기존 계산 엔진의 단일 진입점으로 유지하되 정밀 옵션을 전달한다. `src/interpretation.js`는 사주 결과를 장문 생활 언어로 변환하고, `src/tarot.js`는 메이저 아르카나 22장과 무작위 스프레드를 담당한다. `src/premium-ui.js`는 DOM 렌더링만 담당하고, `index.html`/`premium.css`는 딥네이비 Modern Editorial Mystic UI를 제공한다.

**Tech Stack:** Vite, vanilla ES modules, manseryeok 2.0.0, Node built-in test runner, CSS3

**Spec:** `docs/superpowers/specs/2026-09-17-precision-tarot-dark-design.md`

## Global Constraints

- 외부 API 호출 없이 완전 오프라인으로 동작한다.
- 생년월일·시간·출생지·타로 질문을 저장하지 않는다.
- `manseryeok@2.0.0`의 절기·음력·대운 계산을 재구현하지 않는다.
- 진태양시/자시 관법은 학파 차이가 있으므로 사용자가 확인 가능한 옵션으로 제공한다.
- 타로는 참고용 자기성찰 도구로 표현한다.
- 건강·재정·연애 문구는 확정적 예언이나 전문 진단으로 표현하지 않는다.

---

### Task 1: Precision calculation options

**Files:**
- Modify: `src/saju-engine.js`
- Create: `src/precision.js`
- Create: `tests/precision.test.js`

**Interfaces:**
- `resolvePrecision(input) -> { enabled, longitude, locationLabel, dayBoundary, trueSolarTime }`
- `calculateSaju(input)` accepts optional `precision`, `location`, `dayBoundary`
- chart `basis` exposes applied precision details

- [ ] Write tests for default 127.5°E precision, location mapping, precision OFF, and day-boundary forwarding.
- [ ] Verify tests fail.
- [ ] Implement `precision.js` and forward settings to `calculateFourPillars`.
- [ ] Verify precision tests and existing engine tests pass.

### Task 2: Detailed interpretation engine

**Files:**
- Create: `src/interpretation.js`
- Create: `tests/interpretation.test.js`

**Interfaces:**
- `buildDetailedInterpretation(chart, mbti, yearFlow, monthFlows) -> { overview, temperament, innerOuter, strengths, career, money, love, relationships, recovery, year, luck }`
- Each section contains `title`, `lead`, and `paragraphs[]`.

- [ ] Write tests asserting every section exists and contains at least two substantial paragraphs.
- [ ] Verify tests fail.
- [ ] Implement deterministic interpretations using day master, top/weak elements, top roles, branch relations, annual flow and luck pillars.
- [ ] Verify tests pass.

### Task 3: Offline Major Arcana tarot

**Files:**
- Create: `src/tarot.js`
- Create: `tests/tarot.test.js`

**Interfaces:**
- `MAJOR_ARCANA` contains exactly 22 unique cards.
- `drawTarot(count, randomSource?) -> [{ card, reversed }]`
- `interpretSpread(mode, draw) -> structured position results`

- [ ] Write tests for 22 unique cards, no duplicates in 3-card draw, valid 1/3-card spreads, and deterministic injected random source.
- [ ] Verify tests fail.
- [ ] Implement cards and draw/interpretation functions.
- [ ] Verify tests pass.

### Task 4: Deep navy editorial UI

**Files:**
- Replace: `index.html`
- Replace: `premium.css`
- Modify: `src/premium-ui.js`
- Create: `tests/v3-ui.test.js`

**Interfaces:**
- Required DOM IDs: `precisionToggle`, `precisionSettings`, `birthLocation`, `dayBoundary`, `detailedReport`, `tarot`, `tarotMode`, `tarotQuestion`, `tarotDeck`, `tarotResult`, `accuracyBasis`.

- [ ] Add UI contract tests for new sections and accessibility labels.
- [ ] Verify tests fail.
- [ ] Rebuild the page in Modern Editorial Mystic style with deep navy background, editorial hero, restrained mystical graphics, larger text, fewer card borders and responsive layouts.
- [ ] Wire precision settings, detailed report, and tarot interactions in `premium-ui.js`.
- [ ] Verify UI tests pass.

### Task 5: Final verification

**Files:**
- Modify only if needed: `README.md`, `scripts/check-network.js`

- [ ] Run `npm test`.
- [ ] Run `npm run check:network`.
- [ ] Run `npm run build`.
- [ ] Run `npm run check`.
- [ ] Confirm GitHub Actions is green on the latest commit.
