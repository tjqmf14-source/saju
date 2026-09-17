# 내사주DB v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1900~2100년 양력/음력·윤달·출생시간·성별을 지원하는 완전 오프라인 사주 계산기와 사주 기반 MBTI 성향 리포트를 만든다.

**Architecture:** 런타임 의존성 없는 ES Modules 정적 웹앱으로 재구성한다. 달력/절기/사주 엔진/MBTI/해석/UI를 분리하고 Node 내장 테스트 러너로 핵심 계산 회귀 테스트를 둔다.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript ES Modules, Node.js built-in test runner

**Spec:** `docs/superpowers/specs/2026-09-17-offline-saju-v2-design.md`

## Global Constraints

- 외부 API/CDN/서버 저장/localStorage/cookies/fetch/XHR를 사용하지 않는다.
- 지원 범위는 1900~2100년이다.
- 임의 운세 점수와 랜덤 값은 사용하지 않는다.
- 사주 기반 MBTI는 비공식 참고 지표임을 항상 표시한다.
- 기존 `main`은 보존하고 `feature/offline-saju-v2`에서 작업한다.

---

### Task 1: 달력 및 절기 엔진

**Files:**
- Create: `src/lunar-data.js`
- Create: `src/calendar.js`
- Create: `src/solar-terms.js`
- Create: `tests/calendar.test.js`
- Create: `tests/solar-terms.test.js`

**Interfaces:**
- Produces: `solarToLunar(date)`, `lunarToSolar(year, month, day, isLeap)`, `getSolarTermDate(year, longitude)`, `getMonthBoundaryIndex(date)`

- [ ] 달력 변환 회귀 테스트를 먼저 작성한다.
- [ ] 1900~2100 음력 비트 테이블과 변환 함수를 구현한다.
- [ ] 절기 경계 테스트를 작성한다.
- [ ] 태양 황경 계산 및 절기 시각 탐색을 구현한다.

### Task 2: 사주 계산 엔진

**Files:**
- Create: `src/data.js`
- Create: `src/saju-engine.js`
- Create: `tests/saju-engine.test.js`

**Interfaces:**
- Consumes: 달력/절기 모듈
- Produces: `calculateSaju(input)`, `calculateLuckCycles(chart)`, `calculateYearFlow(chart, year)`, `calculateMonthFlows(chart, year)`

- [ ] 알려진 간지와 경계 동작 테스트를 먼저 작성한다.
- [ ] 연주·월주·일주·시주 및 십성·오행을 구현한다.
- [ ] 합충형파해 탐지를 구현한다.
- [ ] 실제 절입 간격 기반 대운 시작 시점을 구현한다.

### Task 3: 사주 기반 MBTI 및 해석

**Files:**
- Create: `src/mbti.js`
- Create: `src/interpretation.js`
- Create: `tests/mbti.test.js`

**Interfaces:**
- Consumes: `calculateSaju()` 결과
- Produces: `calculateSajuMbti(chart)`, `buildInterpretation(chart, mbti)`

- [ ] 결정성과 범위 테스트를 먼저 작성한다.
- [ ] E/I·S/N·T/F·J/P 양쪽 점수와 기여 근거를 계산한다.
- [ ] 유형명보다 축 비율과 근거를 우선하는 해석을 구현한다.

### Task 4: 범용 UI 전면 개편

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Create: `src/app.js`
- Delete: `app.js`
- Delete: `comfyui-mcp-server.mjs`

**Interfaces:**
- Consumes: calendar/saju/mbti/interpretation

- [ ] 입력 폼과 개인정보 안내를 구현한다.
- [ ] 결과를 MBTI → 원국 → 오행/십성 → 구조 → 대운 → 세운/월운 순으로 렌더링한다.
- [ ] 모바일/태블릿/데스크톱 반응형과 접근성을 적용한다.
- [ ] 입력 오류와 지원 범위 오류를 사용자에게 명확하게 표시한다.

### Task 5: 테스트/문서/정리

**Files:**
- Create: `package.json`
- Modify: `README.md`

**Interfaces:**
- Produces: `npm test`

- [ ] Node 내장 테스트 러너 설정을 추가한다.
- [ ] README에 실행법, 개인정보 처리 방식, 계산 기준, MBTI 한계를 문서화한다.
- [ ] 외부 네트워크 호출 문자열이 없는지 정적 검사한다.
- [ ] 모든 핵심 테스트가 통과하는 상태로 마무리한다.
