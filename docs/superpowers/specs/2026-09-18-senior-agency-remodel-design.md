# Senior-Agency Full Site Remodel — Design Specification

## 0. Intent

Rebuild the presentation architecture of the existing saju + tarot website so the result feels like a senior design team at a major digital agency produced it.

This is not a skin refresh. The existing calculation engine, privacy model, interpretation logic, precision handling, and Rider–Waite–Smith tarot data remain intact. The page composition, information hierarchy, visual rhythm, typography, component grammar, and responsive behavior are redesigned from the ground up.

The site should feel like a premium Korean editorial/cultural web experience rather than a generic dashboard, template, or fortune-telling portal.

---

## 1. Design North Star

### Direction
**Contemporary Korean Editorial Mysticism**

The atmosphere should come from typography, whitespace, proportion, materiality, and symbolic restraint.

Avoid relying on:
- rounded SaaS cards
- glassmorphism
- purple gradients
- neon astrology visuals
- excessive gold
- generic star fields
- decorative boxes around every piece of content

Use:
- warm paper
- ink-black typography
- restrained vermilion
- subtle antique gold
- editorial serif display type
- thin rules
- offset compositions
- vertical rhythm
- large, confident whitespace
- selective dark stages

### Emotional qualities
- intelligent
- composed
- contemporary
- culturally grounded
- quiet confidence
- mystical without kitsch
- premium without fake luxury

---

## 2. Product Experience Goal

The primary user is not assumed to understand traditional saju terminology.

The experience must make it easy to:

1. enter birth information with confidence
2. understand the essential reading first
3. explore daily and yearly flow without information overload
4. understand decade luck as life background, not fortune-cookie prediction
5. learn the natal chart through plain language before raw terms
6. use tarot as reflective context, not deterministic prophecy
7. verify deeper data only when desired

The entire content order follows:

**Meaning → Implication → Action → Evidence**

---

## 3. Information Architecture

### Global order

1. Header
2. Hero
3. Birth input
4. Core Saju reading
5. Daily flow
6. Annual flow
7. Decade luck
8. Plain-language natal chart
9. Tarot
10. Footer

### Removed patterns

- duplicate in-page navigation systems on desktop unless they serve different jobs
- repeated cards for every subsection
- repeated section introductions with identical composition
- nested cards inside cards
- horizontal overflow for core reading content
- tables used where editorial layout is clearer

---

## 4. Grid and Layout Architecture

### Base container
- max width: 1320px
- desktop gutters: 40–56px
- tablet gutters: 28–36px
- mobile gutters: 16–20px

### Grid
Desktop uses a 12-column conceptual grid.

### Primary desktop patterns

#### Pattern A — Hero
- left 7 columns: statement, brand, context
- right 5 columns: symbolic visual + current reading entry

#### Pattern B — Editorial chapter
- left 3–4 columns: section number, label, headline
- right 8–9 columns: lead, reading, evidence

#### Pattern C — Metric section
- one large primary item
- four compact secondary items

#### Pattern D — Timeline
- slim index rail above
- wide narrative content below

#### Pattern E — Tarot stage
- 3 equal cards on desktop
- reading text beneath in two-column editorial rhythm

### Responsive

#### ≥ 1200
Full composition.

#### 900–1199
Two-column editorial compositions collapse carefully but retain visual hierarchy.

#### 640–899
Most sections become one-column. Navigation remains compact.

#### ≤ 639
Full mobile composition:
- single-column reading
- no sticky side rail
- horizontal top nav only if necessary
- 44px minimum touch targets
- large display typography reduced proportionally

---

## 5. Typography System

No external runtime font dependencies.

### Display
Preferred stack:
`"Noto Serif KR", "KoPub Batang", "Nanum Myeongjo", Georgia, serif`

Use only for:
- hero
- section titles
- large numerical or symbolic moments

### UI / Body
Preferred stack:
`"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", system-ui, sans-serif`

### Scale

- Hero Display: 72–92px desktop
- Section Display: 48–60px
- H3: 30–36px
- H4: 22–26px
- Lead: 19–21px
- Body Longform: 17–18px
- Body UI: 15–16px
- Caption: 13px
- Meta: 11–12px

### Rules

- long-form max line length: ~72–80 Korean characters
- body line-height: 1.8–1.95
- display line-height: 1.02–1.15
- micro labels never communicate primary meaning alone
- avoid over-tight negative tracking on Korean

---

## 6. Color System

### Foundations

- Paper: #F3EFE6
- Paper Warm: #E9E1D3
- Surface: #FFFDF8
- Ink: #17191F
- Ink Soft: #545863
- Rule: rgba(23,25,31,.14)

### Brand accents

- Vermilion: #A9473D
- Antique Gold: #AD9466
- Jade: #356C65
- Indigo: #11182B
- Indigo Raised: #18213A

### Usage

Vermilion:
- CTA
- active marker
- current timeline marker
- seal

Gold:
- dates
- solar term metadata
- secondary indicators
- small rules

Jade:
- trust
- precision
- calculation basis
- balancing guidance

Indigo:
- tarot stage
- rare contrast modules

Never use the site as an all-dark interface.

---

## 7. Header and Navigation

### Header

Desktop:
- brand left
- concise global nav right
- privacy status integrated as quiet text, not a pill

Avoid:
- centered nav plus extra sticky subnav plus side rail all competing simultaneously

### In-report navigation

One system only:
- desktop may use slim sticky chapter rail
- mobile uses compact horizontal chapter nav

### Active state

- text + 1–2px rule
- no pill
- `aria-current`

---

## 8. Hero

The hero should behave like a premium editorial landing page, not a feature checklist.

### Left
- restrained brand label
- large statement
- short paragraph

### Right
A composed symbolic scene that blends:
- one large Chinese character / saju glyph
- one subtle moon/tarot motif
- thin directional geometry
- current-day note or “begin your reading” message

No card stack.
No multiple chips.
No fake glass panels.

### Primary action
A single “정밀 리포트 만들기” action should be visually dominant.

---

## 9. Birth Input Experience

### Goal
Make a complex input flow feel calm and deliberate.

### Structure

#### Row 1
- calendar type
- precision mode

#### Row 2
- name
- year
- month
- day

#### Row 3
- time
- gender
- conditional leap month

#### Progressive disclosure
Precision settings remain under a details disclosure.

### Form design
- border-led controls
- 48px minimum height
- no unnecessary radius
- visible labels
- inline contextual validation

---

## 10. Core Reading

### Opening composition

Left:
- name
- birth basis
- one-sentence reading

Right:
- MBTI type
- dominant element
- dominant role
- relation status

Use large typography, not cards.

### Chapters

Each chapter:
- chapter number
- title
- lead
- 2–4 paragraphs

Alternate compositions subtly:
- some chapters use narrow left intro + wide body
- some use pull quote or side note
- never repeat identical white-card pattern

---

## 11. Daily Flow

### Desktop composition

Left 5 columns:
- overall score
- daily headline
- main practical advice

Right 7 columns:
- money
- love
- work
- condition

These four are rows or compact metric blocks, not nested cards.

### Rules
- 0–100 label always called “오늘의 흐름 지수”
- never imply probability
- practical advice under score
- one short trust note

---

## 12. Annual Flow

### Order

1. annual headline
2. long-form annual essay
3. four key action principles
4. quarterly action plan
5. 12-month rhythm

### Remove
Season cards if they duplicate quarter/month information.

### Quarter plan
Use a horizontal numbered editorial rail on desktop:
01 / 02 / 03 / 04

Each quarter contains:
- theme
- 1–2 sentence practical action

### Month rhythm
Desktop: 3 columns
Tablet: 2
Mobile: 1

Cards should feel like editorial cells:
- month number
- theme
- readable paragraph
- solar-term metadata

Avoid heavy boxes.

---

## 13. Decade Luck

### Layer 1 — Overview
A thin horizontal decade index.

Each item:
- start age
- pillar
- role

Current period:
- vermilion vertical marker
- text “현재”

### Layer 2 — Narrative
One period per editorial row.

Columns:
- left: age / pillar / role
- right: long explanation

Required substructure:
- 큰 주제
- 기회
- 주의할 점
- 조언

Desktop can use three subcolumns for short paragraphs only.
If copy exceeds comfortable width, use stacked blocks.

### Tone
Advisory, contextual, reflective.
No robotic generic copy.

---

## 14. Plain-Language Natal Chart

### Primary principle
Raw data is evidence, not the main interface.

### Order

1. “나를 쉽게 읽기” headline
2. personality
3. work
4. money
5. relationships
6. recovery
7. glossary
8. raw data accordions

### Raw data
- four pillars
- elements
- ten-gods
- relations
- MBTI axes

Use simple tables/bars only where data comparison benefits.

---

## 15. Tarot Stage

Tarot is the only visually dark major section.

### Background
Deep indigo.

### Composition
- large editorial headline
- reading controls
- RWS card spread
- interpretation below

### Cards
- aspect ratio driven
- actual RWS artwork
- 1-card centered
- 3-card evenly spaced
- no card rotation for reversed reading

### Reversed reading
Communicate through:
- text label
- interpretation

Never rotate image.

### Reading
Two-column maximum.
No four-column text walls.

---

## 16. Motion

Motion is subtle and functional.

### Allowed
- section fade/slide 12–20px
- 180–280ms
- tarot reveal
- nav indicator transition

### Not allowed
- parallax
- continuous star animations
- pulsing CTA
- glowing elements
- looping decorative motion

Respect `prefers-reduced-motion`.

---

## 17. Accessibility

- 44px minimum interactive target
- WCAG AA body text
- visible focus
- keyboard-operable form and tarot
- skip link
- semantic headings
- `aria-current` for nav
- clear label + error
- no color-only states
- meaningful RWS alt text

---

## 18. Code Architecture

### Preserve
- `src/saju-engine.js`
- `src/calendar.js`
- `src/solar-terms.js`
- `src/precision.js`
- `src/tarot.js`
- `src/daily-score.js`
- `src/plain-chart.js`
- interpretation logic

### Replace / rebuild
- `index.html`
- `agency-v6.css`
- presentation markup in `src/premium-ui.js`

### Design system source
- `design-system/naesaju/MASTER.md`

### Runtime constraints
- one active stylesheet
- no external runtime network
- no persistent browser storage
- no CDN font or icon dependency

---

## 19. Component Grammar

Use a deliberately small component vocabulary:

- `editorial-section`
- `section-kicker`
- `section-heading`
- `section-lead`
- `content-rule`
- `metric-row`
- `reading-chapter`
- `timeline-index`
- `timeline-story`
- `data-disclosure`
- `tarot-stage`

Avoid inventing a unique visual component for every section.

---

## 20. Visual Quality Bar

The implementation is not considered complete if it merely satisfies CSS structure.

It must pass these visual criteria:

### Desktop 1440
- intentional whitespace
- no cramped 5–6 card rows
- type hierarchy obvious at a glance
- no generic dashboard impression
- long reading feels like a premium editorial article

### Tablet 1024
- no compressed desktop layout
- narrative columns adapt cleanly
- no horizontal page overflow

### Mobile 390
- sections remain readable
- no oversized empty gaps
- nav does not overlap
- tarot remains usable
- form remains comfortable

---

## 21. QA Matrix

Verify at:
- 360×800
- 390×844
- 768×1024
- 1024×1366
- 1440×1000

Check:
- horizontal overflow
- sticky overlap
- clipped text
- line length
- touch size
- focus visibility
- readable month cards
- readable decade narratives
- upright reversed tarot image
- content order
- consistent typography

---

## 22. Acceptance Criteria

The remodel is complete only when:

1. the old dashboard/card-heavy visual grammar is gone
2. one consistent editorial design system controls all sections
3. hero, daily, annual, decade, natal, and tarot each have intentional distinct compositions
4. the overall page still feels like one brand
5. all existing calculations remain unchanged
6. RWS tarot remains local and private
7. no runtime network or persistent storage is introduced
8. responsive QA passes all target widths
9. design-system regression tests pass
10. full `npm run check` passes
11. GitHub Actions CI is successful on the final branch SHA

---

## 23. Non-Goals

- no new backend
- no account system
- no analytics
- no external design library
- no external icon package
- no new saju calculation model
- no deterministic fortune claims
- no merge to `main`
- no PR unless explicitly requested
