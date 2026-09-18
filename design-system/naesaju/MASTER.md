# 내사주 Design System — MASTER

> UI/UX Pro Max workflow 기반. 이 문서는 `feature/offline-saju-v2`의 UI Source of Truth이다.
> 페이지별 예외가 없다면 모든 UI는 이 규칙을 따른다.

## 1. Product Definition

- **Product type:** Content-first personal insight / fortune-reading web app
- **Core jobs:** 출생정보 입력 → 정밀 사주 리포트 탐색 → 오늘/연간/대운 이해 → 원국 근거 확인 → 타로 자기성찰
- **Audience:** 사주 전문용어에 익숙하지 않은 일반 사용자
- **Experience goal:** 전문적이되 무겁지 않고, 신비롭되 촌스럽지 않으며, 긴 리포트를 편집물처럼 편안하게 읽히게 한다.
- **Trust goal:** 계산 근거·프라이버시·비결정론적 표현을 시각적으로도 명확히 전달한다.
- **Stack:** Vite + static HTML/CSS + ES modules
- **Runtime constraint:** 외부 폰트/CDN/분석 SDK 없이 브라우저 안에서 동작

## 2. Design Direction

### Primary direction
**Korean Editorial Mysticism**

전통 명리의 분위기를 직접적인 전통문양·금색 장식·과도한 별자리 장식으로 표현하지 않는다. 대신 종이, 먹, 인장, 여백, 편집 타이포그래피, 절제된 선을 사용한다.

### Visual principles
1. **Content before decoration** — 긴 해설이 가장 먼저 읽혀야 한다.
2. **Editorial hierarchy** — 제목/리드/본문/근거의 위계를 잡지처럼 분명히 한다.
3. **One mystical stage** — 사주 리포트는 밝은 종이색, 타로만 다크 인디고 무대로 분리한다.
4. **Low chrome** — 카드·박스 남발보다 선, 여백, 타이포 계층으로 구획한다.
5. **Evidence follows interpretation** — 일반어 해설이 먼저, 원자료/전문용어는 두 번째.
6. **No casino aesthetic** — 과한 금색, 번쩍이는 그라데이션, 네온, 별가루, 룰렛 느낌 금지.

## 3. Core Tokens

### 3.1 Color

#### Surface
- `--color-bg: #F2EFE7` — 기본 종이 배경
- `--color-bg-subtle: #E8E1D5` — 보조 영역
- `--color-surface: #FFFDF7` — 입력/리포트 카드
- `--color-surface-strong: #DDD3C3` — 깊은 종이 톤

#### Text
- `--color-text: #191B22` — 기본 본문
- `--color-text-muted: #4D515B` — 보조 설명
- `--color-text-inverse: #FFFDF7` — 다크 섹션
- `--color-text-inverse-muted: #B9C0D0`

#### Brand / semantic accents
- `--color-brand: #B54B3F` — 인장 주홍. CTA/핵심 강조만.
- `--color-gold: #AF9567` — 절입/메타/구분 정보
- `--color-jade: #2F6C66` — 신뢰/근거/보완 정보
- `--color-tarot: #11182B` — 타로 배경
- `--color-tarot-raised: #171F38`

#### Lines
- `--color-line: rgba(25,27,34,.16)`
- `--color-line-soft: rgba(25,27,34,.09)`
- Dark section: `rgba(255,255,255,.14)`

### Color rules
- 본문 텍스트는 WCAG AA 대비를 유지한다.
- 색만으로 상태를 전달하지 않는다.
- `brand`는 한 화면에서 최대 10~15% 이하 시각 비중.
- 금색은 장식이 아니라 메타/보조 정보에 한정.
- 오늘 운세 점수, 오행, MBTI 축은 색 + 라벨 + 수치 동시 표기.

## 4. Typography

외부 웹폰트 없이 시스템 폰트 우선.

### Families
- **Display / editorial:** `Georgia, "Noto Serif KR", "Apple SD Gothic Neo", serif`
- **UI / body:** `"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif`

### Scale
- Display XL: `clamp(48px, 6vw, 88px)`, LH 1.02
- Display L: `clamp(40px, 4.5vw, 64px)`, LH 1.08
- H2: `clamp(34px, 4vw, 56px)`, LH 1.12
- H3: 28–34px, LH 1.2–1.3
- H4: 22–26px, LH 1.25
- Lead: 18–20px, LH 1.8
- Body L: 17px, LH 1.9
- Body: 16px, LH 1.75
- Body S: 14px, LH 1.65
- Meta: 12px, LH 1.5
- Micro: 11px, tracking .12–.16em

### Typography rules
- 장문 본문은 680–780px 범위를 권장.
- 11px 미만 텍스트 금지.
- 한글 본문 자간은 과도한 음수값 금지. 기본 `-0.01em` 안쪽.
- 영문 대문자 micro label은 장식용이며 핵심 정보 대체 금지.

## 5. Spacing System

Base unit: **4px**

- 1 = 4
- 2 = 8
- 3 = 12
- 4 = 16
- 5 = 20
- 6 = 24
- 8 = 32
- 10 = 40
- 12 = 48
- 16 = 64
- 20 = 80
- 24 = 96
- 28 = 112

### Vertical rhythm
- Section gap desktop: 96–112px
- Section gap tablet: 72–88px
- Section gap mobile: 56–72px
- Heading → lead: 12–20px
- Card internal: 20–28px
- Inline controls: minimum 8px separation

## 6. Layout System

### Container
- Max width: **1280px**
- Desktop side gutter: minimum 24px
- Mobile gutter: 12–16px

### Grid
- Desktop: conceptual 12-column grid
- Workspace: `150px rail + minmax(0, 1fr)`
- Main reading split: 4/8 or 5/7
- Tablet <1080px: single main column
- Mobile <760px: all narrative grids collapse to one column

### Reading width
- Long-form copy: max 780px
- Metadata tables/visual bars may use full content width
- Tarot reading text: max 980px

### Overflow
- No horizontal page scroll.
- Navigation may horizontally scroll on mobile only.
- Month cards and decade overview must reflow, not force fixed widths.

## 7. Shape, Border, Shadow

### Radius
Editorial system uses nearly square geometry.
- Inputs/buttons/cards: 0–4px
- Avoid 12–24px SaaS-style rounded cards.

### Border
- Primary separator: 1px `--color-line`
- Quiet separator: 1px `--color-line-soft`
- Active editorial marker: 2px brand or gold line

### Shadow
Default: **none**.
Use shadow only for floating/sticky overlays if needed:
- `0 8px 28px rgba(17,24,43,.10)`
Never stack multiple glow/shadow effects.

## 8. Component Rules

### 8.1 Global Header
- Sticky
- Brand left / nav center / privacy status right
- Height 72–76px desktop
- Mobile nav scrolls horizontally
- Active section should gain text + underline, not pill background

### 8.2 Side Rail
- Desktop only
- Section index + short English label
- Current section may use brand color
- Hide below 1080px

### 8.3 Buttons

#### Primary CTA
- Background: brand
- Text: inverse
- Min height: 48px
- Min touch area: 44×44px
- No gradient
- Hover: 6–8% darker
- Active: translateY(1px)
- Focus: 3px brand outline with 3px offset

#### Secondary
- Transparent + 1px border
- Text color inherits context
- Tarot secondary uses gold border

#### Icon use
- Decorative Unicode symbols allowed only if not relied on as the sole meaning.
- Interactive icon-only controls require accessible label.

### 8.4 Form
- Visible label required; placeholder is supplementary.
- Min input height 48px.
- Error appears adjacent to the field or group.
- Precision options use progressive disclosure.
- Calendar type segmented control: active state uses ink fill.
- Boolean switches must remain keyboard-operable.
- Form layout:
  - Desktop: up to 6 compact columns
  - Tablet: 3 columns
  - Mobile: 2 columns
  - Narrow mobile: 1 column

### 8.5 Report Chapter
Structure:
1. section index
2. title
3. short lead
4. long-form paragraphs

Desktop: 320px context column + flexible body.
Mobile: stacked.

Do not put each paragraph in its own card.

### 8.6 Daily Fortune
- 0–100 value must always be labeled **흐름 지수**, not probability.
- 2-column desktop, 1-column mobile.
- Each item: icon/title → numeric score → track → interpretation → reason.
- Progress track minimum height 5px.
- Do not use gauge/donut charts; readability is more important than spectacle.

### 8.7 Annual Flow
Order:
1. year headline + summary
2. long-form deep dive
3. four key advice items
4. one quarterly action plan
5. season summary
6. 12-month flow

Only **one** quarterly-plan component may exist.

### 8.8 Month Flow
- Desktop: 3 columns
- Tablet: 2
- Mobile: 1
- Must show month, role/group, practical copy, solar-term boundary metadata.
- Min card width is fluid; never fixed.
- No carousel.

### 8.9 Decade Luck
Two-layer pattern:
1. **Overview index** — scan all decade periods
2. **Narrative timeline** — read each period deeply

Narrative must contain:
- 큰 주제
- 기회
- 주의할 점
- 조언

Current decade requires text marker + visual emphasis; color alone is insufficient.

### 8.10 Natal Chart / Expert Data
Order:
1. plain-language summary
2. personality/work/money/relationship/recovery
3. terminology glossary
4. raw chart accordion

Raw data is evidence, not the entry point.

### 8.11 Tarot
Tarot is the only persistent dark stage.
- Background: indigo
- Accent: muted gold
- 1-card spread centered
- 3-card spread: 3 columns desktop, 1 column mobile
- RWS image stays visually upright even for reversed meaning
- Reversal is conveyed by label + interpretation
- Text reading follows cards
- No glow, neon, particle, or casino animation

## 9. Interaction & Motion

- Micro interaction duration: 150–220ms
- Large reveal: 220–300ms
- Easing: `cubic-bezier(.2,.8,.2,1)`
- Do not animate width/height for layout.
- Card reveal may use opacity + transform.
- Respect `prefers-reduced-motion: reduce`.
- Never hide important feedback behind hover only.

## 10. Accessibility Rules

Priority order follows UI/UX Pro Max:
1. Accessibility
2. Touch/interaction
3. Performance
4. Style consistency
5. Responsive layout
6. Typography/color
7. Motion
8. Forms/feedback
9. Navigation
10. Data visualization

Required:
- WCAG AA contrast for body text
- all interactive controls keyboard reachable
- visible `:focus-visible`
- 44×44px minimum target
- meaningful alt text for RWS cards
- `aria-live` only for meaningful result updates
- skip link
- semantic heading order
- native details/summary for progressive disclosure
- no autoplay motion
- no color-only status

## 11. Responsive Rules

### ≥1081px
- full top navigation
- side rail visible
- 2/3/4-column editorial grids as defined
- 3 tarot cards

### 761–1080px
- side rail hidden
- nav remains visible
- form 3 columns
- month grid 2 columns
- tarot controls stacked
- tarot cards may remain 3 only if minimum readable width is preserved; otherwise 1–2

### ≤760px
- topbar stacks
- horizontal nav scroll allowed
- all narrative grids 1 column
- form 2 columns
- long headings cap around 44px
- report navigation horizontally scrollable

### ≤480px
- form 1 column
- basis metadata 1 column
- hero display around 38px

## 12. Content Hierarchy

Each section follows:
**What this means → Why it matters → What to do → Evidence**

Avoid:
- 전문용어를 제목으로 먼저 노출
- 같은 의미의 카드/패널 반복
- 장문을 3열 이상으로 나눔
- “좋다/나쁘다” 이분법
- 확정적 예언 표현

## 13. State System

### Neutral
Paper surface + ink text.

### Active
Brand underline or 2px marker.

### Success / trusted
Jade + explicit text.

### Warning / caution
Vermilion + explicit heading. Do not use bright error red unless true form error.

### Disabled
Opacity 0.55 + cursor/state semantics. Maintain text contrast.

### Loading
Prefer short inline status. Avoid skeletons for calculations that finish near-instantly.

### Empty
Explain why empty and what user can do next.

## 14. Anti-Patterns

- Generic SaaS dashboard cards everywhere
- excessive 16px+ rounded corners
- glassmorphism across reading content
- gold-on-black luxury casino look
- neon purple astrology gradients
- tiny metadata <11px
- body text <14px
- more than one major accent per section
- horizontal-scroll content cards
- icon-only labels
- emoji-only interactive controls
- decorative motion with no meaning
- every section using a different visual language
- external webfont/CDN dependency

## 15. Current Project Audit Snapshot

### Strong
- Existing warm paper + ink + vermilion palette already fits the desired editorial direction.
- Tarot is correctly separated as a dark stage.
- Skip link, labeled navigation, focus-visible, reduced-motion rules already exist.
- Responsive breakpoints at 1080/760/480 are coherent.
- Long-form interpretation is structurally separated from raw expert data.
- Month flow and decade luck are responsive grids rather than carousels.

### Needs normalization
- Current CSS has useful tokens but lacks a full semantic token layer for spacing, type, interaction and states.
- Several 11–12px labels are acceptable as micro/meta, but they must never carry primary meaning alone.
- `☀ ◉ ♡ ▣ ✦` icon set is visually inconsistent. Normalize to one icon language or text-first labels.
- Header + report nav create two sticky layers; mobile offset should be validated carefully to prevent overlap.
- Six-column desktop birth form is efficient but visually dense. Keep only while field labels remain comfortably readable.
- Current layout mixes border-only editorial sections with white boxed month/pillar cards. Use boxes only where scanning structured data is genuinely improved.
- `Georgia` fallback can create different Korean/Latin visual tones across OSes. Treat this as acceptable offline fallback, but do not depend on it for precise brand typography.

## 16. Definition of Done for Future UI Changes

Before merging any UI change, verify:
- no horizontal overflow at 360 / 390 / 768 / 1024 / 1440 widths
- all primary tap targets ≥44px
- keyboard path reaches every control
- focus state visible on light and dark backgrounds
- body text contrast passes AA
- no duplicated annual/quarter components
- tarot reversed image remains upright
- long-form copy width stays readable
- responsive grid collapses without clipped text
- `prefers-reduced-motion` respected
- build + UI tests + privacy/network check pass
