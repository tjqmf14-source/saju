# 내사주 UI/UX Audit

기준: UI/UX Pro Max 우선순위 + 현재 `index.html`, `agency-v6.css`, `src/premium-ui.js` 코드 분석.

## Executive Summary

현재 UI의 방향 자체는 맞다. 특히 종이색 기반의 편집형 사주 리포트와 인디고 타로 구역 분리는 제품 성격과 잘 맞는다. 문제는 시각 스타일보다 **시스템화 수준**이다. 이미 좋은 스타일 규칙이 존재하지만, spacing/type/state/component 규칙이 명시적으로 표준화되어 있지 않아 앞으로 수정이 쌓이면 다시 일관성이 무너질 가능성이 있다.

가장 높은 우선순위는 다음 6가지다.

1. **Sticky navigation overlap 검증**
2. **아이콘 언어 통일**
3. **폼 정보 밀도 조정**
4. **semantic token 확장**
5. **화이트 박스 사용 기준 정리**
6. **모바일 타로 카드 높이와 읽기 흐름 검증**

---

## 1. Accessibility — Priority Critical

### 현재 강점
- Skip link 존재
- 주요 nav에 aria-label 존재
- `:focus-visible` 존재
- `prefers-reduced-motion` 대응
- Tarot image alt 제공
- `details/summary` 사용

### 개선 권장
- 다크 타로 영역의 focus outline이 주홍색 하나로만 고정되어 있어 배경 조합별 시인성을 실제 화면에서 검증할 것.
- 11px micro text는 보조 정보 전용으로 제한할 것.
- 오늘 운세의 기호 아이콘은 의미 전달의 보조로만 사용하고 텍스트 라벨을 항상 유지할 것.
- report nav의 현재 위치(active section)를 `aria-current` 또는 동등한 텍스트/시각 상태로 표시하는 것을 권장.

## 2. Touch & Interaction — Priority Critical

### 현재 강점
- input/select/button 최소 높이 48px
- CTA가 충분히 큼
- 모바일에서 대부분 단일열로 전환

### 개선 권장
- `.topnav a`는 세로 padding 8px만 있어 실제 클릭 높이가 44px보다 작을 수 있다. 최소 44px hit area 확보 권장.
- side rail 링크도 12px 텍스트만 클릭 대상으로 두지 말고 세로 패딩을 추가하는 편이 좋다.
- tarot button과 form controls는 충분하나 report nav 역시 최소 44px에 근접하게 만들 것.

## 3. Layout & Responsive — Priority High

### 문제 가능성
- `.topbar` sticky + `.report-nav` sticky가 동시에 존재한다.
- mobile에서 topbar가 2행으로 커지는데 report nav는 `top:112px` 고정이다.
- 실제 글꼴/브라우저에 따라 header 높이가 달라질 수 있어 겹침 가능성이 있다.

### 권장 구조
- CSS custom property `--header-h`를 breakpoint별로 정의하고 report nav의 top을 그 값으로 통일.
- 또는 모바일에서 report nav sticky를 해제.

### Birth Form
현재 desktop 6열은 공간 효율은 좋지만 서비스 첫 진입 화면에서 입력 난도가 높아 보일 수 있다.

권장:
- 이름: 2 columns
- 생년월일: 3 compact fields
- 시간/성별: 2 fields
- 윤달: conditional
- 총 2줄 구조 또는 4열 grid가 더 안정적

## 4. Style Selection — Priority High

현재 `Korean Editorial Mysticism` 방향은 유지할 가치가 높다.

### 유지
- warm paper
- ink typography
- vermilion seal
- restrained gold
- dark indigo tarot
- border-led editorial composition

### 줄일 것
- 데이터형 카드에 흰색 배경을 반복적으로 적용하는 패턴
- 장식 기호가 서로 다른 스타일로 혼용되는 것
- 태그/메타 박스가 늘어나며 다시 SaaS dashboard처럼 보이는 현상

## 5. Typography & Color — Priority Medium

### 현재 강점
- 17px body
- 긴 본문 line-height 1.95
- display serif / body sans 역할 구분
- 브랜드 컬러 사용량 절제

### 개선
- 시스템 폰트만 쓰는 조건에서 `Georgia + Korean fallback` 조합은 OS별 인상이 달라진다.
- heading에서 한글과 영문이 섞일 때 서체 톤이 흔들릴 수 있으므로 heading에 한글-only/영문-only 역할을 더 분명히 할 것.
- body max width 780px 규칙을 유지.

## 6. Iconography

현재:
- ☀
- ◉
- ♡
- ▣
- ✦
- 命
- ☾

문제:
- 천문기호, 도형, 텍스트 문자, 장식 문자가 혼합되어 스타일 시스템으로 느껴지지 않는다.

권장:
- 정보 카드에서는 아이콘을 제거하고 text-first 구성
- 장식은 `命`, 얇은 선, 달 기호 정도로 제한
- 상호작용 아이콘이 필요할 경우 동일 stroke 체계의 local SVG 사용

## 7. Forms & Feedback

현재 좋은 점:
- visible label
- form error area
- precision settings progressive disclosure

개선:
- form error를 가능하면 해당 field group 가까이 출력
- precision toggle OFF일 때 disabled field의 시각 상태를 명확히
- 윤달 field 등장/사라짐에 layout shift가 크지 않은지 확인

## 8. Annual / Monthly Flow

현재 구조:
- headline
- deep dive
- advice
- quarter
- season
- month

이 순서는 좋다.

개선:
- season summary와 month grid가 기능적으로 겹쳐 보일 수 있으므로 season은 간단한 editorial index 수준으로 유지
- month card는 background card보다 border-led cell로 바꾸는 것도 검토 가능
- month role/group를 색으로만 구분하지 말 것

## 9. Decade Luck

현재 구조는 적절하다.
- overview scan
- long-form timeline

개선:
- overview 5열은 desktop에서 빠르게 훑기 좋으나 텍스트가 길어질 때 답답할 수 있다.
- current decade를 border + text marker로 강조하되 배경색 과다 사용 금지.
- timeline body는 3열 narrative에서 문장이 길어지면 2열 또는 stacked가 더 읽기 좋을 수 있음.

## 10. Natal Chart / Expert

현재 UX 방향이 가장 좋다.

유지:
- plain-language guide first
- glossary
- raw chart accordion

개선:
- pillar cards만 structured data card로 유지
- relation cards는 white box 대신 left rule + text 방식으로 충분
- MBTI는 항상 “사주 기반 성향 · 비공식 참고” 표시 유지

## 11. Tarot

현재 강점:
- RWS art
- reversed art upright
- dark stage
- reading content separated below cards

개선:
- 760–1080 구간에서 3장 tarot card 폭이 실제로 충분한지 확인.
- card inner의 fixed-like min-height 460/520px는 이미지 종횡비와 브라우저 폭에 따라 큰 빈 공간이 생길 수 있다.
- 가능하면 image aspect-ratio를 기준으로 카드 높이를 자연스럽게 만들 것.
- decorative reveal은 150–300ms 이내 유지.

## 12. Recommended Implementation Order

### Phase 1 — System cleanup
- semantic design tokens
- header/report-nav sticky variable
- hit area normalization
- icon language cleanup

### Phase 2 — Content readability
- form density
- decade narrative grid responsive tuning
- month card border-led variant
- expert raw-data box reduction

### Phase 3 — Visual QA
Widths:
- 360
- 390
- 768
- 1024
- 1440

Verify:
- no horizontal scroll
- no sticky overlap
- no clipped Korean text
- no body <14px
- all interactive targets ≥44px
- tarot cards do not create awkward blank space

## Final Direction

현재 UI를 다시 전면 갈아엎을 필요는 없다. **지금 만든 editorial visual language를 유지하면서 디자인 시스템을 더 엄격하게 만들고, interaction/layout consistency를 다듬는 방향**이 가장 효율적이다.
