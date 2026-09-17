# Agency-Level Saju + Tarot Redesign

## Goal

Rebuild the presentation layer of the existing saju/tarot site so it no longer feels like a stack of dark dashboard cards. Preserve the verified calculation engine, privacy model, RWS tarot data, and all existing result content, but replace the visual system, page composition, and section hierarchy with a cohesive agency-quality editorial experience.

## Core Direction: Korean Editorial Mysticism

The site should feel like a contemporary Korean cultural/editorial brand rather than a generic fortune-telling dashboard.

- Base canvas: warm ivory / paper tone (`#F2EFE7` range)
- Main text: charcoal / ink (`#191B22` range)
- Accent 1: lacquer vermilion (`#B54B3F` range) for seals, active states, important markers
- Accent 2: muted antique gold (`#AF9567` range) for rules, small labels, symbolic accents
- Accent 3: muted jade teal (`#2F6C66` range) for secondary informative states
- Deep indigo/ink sections are used only where contrast adds meaning: hero moments, tarot stage, and selected luck/season modules. The entire site must not be deep navy.
- Typography becomes the main divider between sections. Use large serif/editorial display type, generous whitespace, thin rules, and asymmetrical composition instead of boxed grids everywhere.
- No external fonts, CDN assets, or runtime network calls. Use local/system font stacks.

## Architecture

### CSS

Replace the currently stacked active stylesheets (`premium.css`, `polish.css`, `feedback-v2.css`, `feedback-v3.css`, `redesign-v5.css`) with one final active stylesheet: `agency-v6.css`.

Legacy CSS files may remain in the repository for history/tests, but `index.html` must not load them after migration. `agency-v6.css` becomes the only active site stylesheet.

### JavaScript

`src/premium-ui.js` remains the source of truth for base result rendering. Post-render enhancement files must no longer be required for visual structure.

`src/feedback-v2.js`, `src/feedback-v4.js`, and `src/redesign-v5.js` may remain in the repo temporarily for compatibility tests, but `index.html` must not load `feedback-v2.js`. Any behavior still needed from those files must be folded into `premium-ui.js` or removed if redundant.

The calculation modules (`saju-engine.js`, `calendar.js`, `solar-terms.js`, `precision.js`, `tarot.js`, `daily-score.js`, `plain-chart.js`) are not redesigned and should not be behaviorally changed except where the renderer needs structured data already available.

## Global Layout System

- Desktop content width: 1280px max
- Main content grid: 12 columns
- Default outer gutters: 32–48px depending on viewport
- Vertical section rhythm: 88–128px between major modules
- Internal section padding: 40–64px desktop, 22–28px mobile
- Border radius reduced globally. Large rounded dashboard cards should no longer dominate.
- Use open compositions: ruled headers, split editorial layouts, timeline rails, typographic callouts, and selective framed surfaces.
- Mobile breakpoint: around 760px
- Tablet breakpoint: around 1080px

## Header and Hero

The header becomes lighter and editorial, with a paper/ink base rather than a persistent dark navigation bar.

Hero composition:

- Left 7 columns: brand statement, large editorial headline, short explanation
- Right 5 columns: birth input summary / today message panel with symbolic saju/tarot motif
- Use one dark indigo visual field or vertical motif on the right to establish the mystical tone without making the whole page dark
- Decorative elements: seal mark, thin constellation lines, subtle bagua/astrology-inspired geometry, restrained Korean red stamp accents
- No generic floating glass cards

## Input Section

The birth form should resemble a premium editorial form, not a settings dashboard.

- White/paper section with thin top/bottom rules
- Labels above controls
- One clean row on desktop, two-column tablet, one-column mobile
- Precision options collapse into an understated details area
- Primary CTA uses vermilion rather than purple gradient

## Result Section 02: Core Reading

The profile header becomes a magazine spread:

- Left: name, birth data, one-paragraph summary
- Right: Saju MBTI and 3–4 key indicators
- The MBTI orb is removed; replace with large typographic treatment
- Detailed report chapters use alternating editorial layouts, not repeated bordered cards
- Every chapter should have a large section number, title, short lead, and comfortable 70–80 character line length

## Section 03: Daily Flow

Keep the existing 0–100 flow scores, but redesign as a dashboard-light editorial meter section.

- One large overall score/summary on the left
- Four secondary meters on the right
- No tiny nested cards
- Advice is shown beneath in two-column prose blocks

## Section 04: Annual Flow

Remove duplicated annual-plan UI entirely.

Structure:

1. Annual lead essay
2. Four quarterly action-plan blocks in a horizontal editorial timeline on desktop
3. One `12개월 흐름` shell with consistent internal margins and a 3-column desktop grid
4. Mobile stacks naturally without horizontal overflow

There must be exactly one quarterly action-plan presentation. `yearActionPlan` must not exist.

`monthForecast` must live inside `month-flow-shell`, with no negative margins and no legacy width overrides.

## Section 05: Decade Luck

Replace the cramped horizontal-card strip with two layers:

1. `luckOverview`: a compact 10-year rail showing start age, pillar, and theme. It is a visual index, not the main content.
2. `luckTimeline`: vertically stacked deep narrative items. Each item contains:
   - Big theme
   - Opportunity
   - Caution
   - Advice

The currently active decade gets a restrained lacquer/gold indicator, not a giant filled card.

Copy must stay long-form and practical. Generic boilerplate such as “새로운 10년의 배경 주제가 시작됩니다” must not be used.

## Section 06: Plain-Language Natal Chart

Wrap the section in one consistent `expert-content-shell`.

Reading order:

1. Plain-language guide: personality, work, money, relationships, recovery
2. Four pillars visualized in one clean row on desktop
3. Element / ten-god bars
4. Relations and MBTI axes in collapsible raw-data areas

The plain-language explanation must remain first. Raw tables are secondary evidence.

All inner widths must use the same container. No nested components may extend beyond the section padding.

## Tarot Section

Tarot gets its own stage and is the primary dark section of the page.

- Full-bleed-ish indigo/ink background within the site frame
- RWS art remains upright visually, including reversed readings
- Reversed state is communicated through label + interpretation only
- 3-card readings use a balanced 3-column spread with generous breathing room
- Interpretation becomes a readable two-column or stacked editorial layout, never four narrow vertical text columns
- Gold linework and subtle star field are allowed only here to create contrast with the lighter saju sections

## Interaction and Accessibility

- Visible focus states for all controls
- Minimum 44px touch targets
- `prefers-reduced-motion` respected
- No horizontal scrolling for content sections at common desktop/tablet/mobile sizes
- Top navigation may wrap or become horizontally scrollable only on small screens
- All text contrast must meet normal readability expectations

## Testing

Add/update tests that verify:

- `index.html` loads only `agency-v6.css` as the final active design stylesheet
- `index.html` no longer loads `feedback-v2.js`
- `yearActionPlan` is absent
- `month-flow-shell` exists
- `luckOverview` exists
- `expert-content-shell` exists
- `premium-ui.js` renders deep luck narrative directly
- tarot renderer contains no `reversed-art`
- build/network/privacy checks continue to pass

Existing engine, tarot-data, precision, and interpretation tests must remain green.

## Non-Goals

- Do not alter the verified saju calculation engine
- Do not add external fonts, CDN icons, analytics, or server calls
- Do not merge into `main`
- Do not open a PR unless explicitly requested
