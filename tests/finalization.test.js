import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../product-v17.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('Product V17 is the only active frontend stylesheet and uses the mobile app-first design system', () => {
  assert.ok(html.includes('product-v17.css'));
  assert.ok(!html.includes('site-v12.css'));
  assert.equal((html.match(/<link rel="stylesheet"/g) || []).length, 1);
  assert.match(html, /data-theme="product-v17"/);
  assert.match(css, /Product V17 — mobile app-first remodeling/);
  assert.ok(css.includes('--color-bg:#f2efe7'));
  assert.ok(css.includes('--color-surface:#fffdf7'));
  assert.ok(css.includes('--color-brand:#b54b3f'));
  assert.ok(css.includes('--color-tarot:#11182b'));
  assert.match(html, /class="trust-strip agency-shell"/);
});

test('desktop and mobile base type remain readable', () => {
  assert.match(css, /body\{background:var\(--color-bg\);font:400 17px\/1\.75/);
  assert.match(css, /@media\(max-width:720px\)\{[\s\S]*?body\{[^}]*font-size:17px/);
  assert.match(css, /\.form-grid input,\.form-grid select,\.profile-manager select,\.profile-manager button,\.precision-grid select\{font-size:16px\}/);
});


test('10pt floor, uncropped tarot art and evidence-first report rules are enforced', () => {
  const px=[...css.matchAll(/font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/g)].map((match)=>Number(match[1]));
  const shorthand=[...css.matchAll(/font\s*:\s*[^;{}]*?([0-9]+(?:\.[0-9]+)?)px[^;{}]*/g)].map((match)=>Number(match[1]));
  assert.ok(Math.min(...px,...shorthand) >= (10*96/72));
  assert.ok(css.includes('.tarot-preview-card img{width:100%;aspect-ratio:2/3;object-fit:contain;object-position:center'));
  assert.ok(css.includes('.tarot-card-inner{position:relative;aspect-ratio:7/12;'));
  assert.ok(css.includes('.tarot-card-image{object-fit:contain;object-position:center}'));
  const hardening=css.slice(css.lastIndexOf('Product V18 QA hardening'));
  assert.ok(hardening.includes('.chapter-takeaway{display:none!important}'));
  assert.ok(hardening.includes('.chapter-evidence{'));
  assert.ok(hardening.includes('display:block!important'));
  assert.ok(hardening.includes('.chapter-full-analysis{'));
  assert.ok(hardening.includes('.month-card small{'));
});

test('landing page follows the Product V17 editorial section order', () => {
  const order = ['id="input"','visual-keyword-showcase','quote-band','id="today"','id="year"','id="compatibility"','id="tarot"','id="full-report"','closing-cta'];
  let cursor = -1;
  for (const token of order) {
    const next = html.indexOf(token);
    assert.ok(next > cursor, token + ' should appear after the previous Product V17 section');
    cursor = next;
  }
  assert.doesNotMatch(html,/id=["'](?:standards|faq)["']/);
  assert.doesNotMatch(html,/class=["'][^"']*annual-scene/);
});

test('document IDs are unique and primary recalculation CTA submits the live form', () => {
  const ids=[...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match)=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
  assert.match(html,/class="birth-side-submit"[^>]+type="submit"[^>]+form="birthForm"/);
  assert.match(ui,/results\.dataset\.mode='personal'/);
  assert.match(ui,/results\.dataset\.mode='demo'/);
  assert.doesNotMatch(ui,/form\.requestSubmit\(\)/);
});

test('commercial UX adds local profiles, sharing, compatibility and mobile navigation', () => {
  assert.match(html,/id="profileSelect"/);
  assert.match(html,/id="saveProfile"/);
  assert.match(html,/id="compatibility"/);
  assert.match(html,/id="compatibilityForm"/);
  assert.match(html,/class="mobile-bottom-nav"/);
  assert.match(html,/id="shareReport"/);
  assert.match(html,/data-day-shift="-1"/);
  assert.match(html,/id="fortuneDate"/);
  assert.match(html,/id="dailyTimeFlow"/);
  assert.match(html,/id="weeklyPreview"/);
  assert.match(html,/id="dailyActionGuide"/);
  assert.match(html,/id="dailyBriefGrid"/);
  assert.match(html,/id="partnerProfileSelect"/);
  assert.match(ui,/PROFILE_STORAGE_KEY/);
  assert.match(ui,/localStorage\.setItem/);
  assert.match(ui,/function renderCompatibility/);
  assert.match(ui,/navigator\.share/);
  assert.match(ui,/calculateTodayTimeFlows/);
  assert.match(ui,/weeklyPreview/);
  assert.match(ui,/먼저 이것만 보세요/);
  assert.match(ui,/오늘의 중심/);
  assert.match(ui,/chapter-evidence/);
});

test('tarot exposes the complete 78-card overlapping fan picker', () => {
  assert.match(html, /카드 펼치기/);
  assert.match(ui, /prepareTarotFan\(78\)/);
  assert.match(ui, /FULL 78-CARD DECK/);
  assert.match(ui, /스크롤바 없이 전체 덱을 한 장면에서 보여줍니다/);
  assert.match(ui, /function runTarotDeal/);
  assert.match(ui, /function selectTarotCard/);
  assert.match(ui, /aria-multiselectable/);
  assert.match(ui, /aria-selected/);
  assert.ok(css.includes('.tarot-fan-stage{'));
  assert.ok(css.includes('.tarot-fan-track{'));
});

test('final information architecture keeps detailed year data inside precision report', () => {
  assert.ok(html.indexOf('id="annualDetailReport"') > html.indexOf('id="full-report"'));
  assert.ok(html.indexOf('id="yearDeepDive"') > html.indexOf('id="annualDetailReport"'));
  assert.ok(html.indexOf('id="monthForecast"') > html.indexOf('id="annualDetailReport"'));
  assert.match(html, /id="todayQuoteTitle"/);
  assert.match(html, /id="annualQuote"/);
  assert.match(ui,/todayQuoteTitle/);
  assert.match(ui,/annualQuote/);
});

test('solar-term month flow remains calculation-backed', () => {
  assert.match(ui, /function kstMonthNumber/);
  assert.match(ui, /monthFlowCopy\(item\)/);
  assert.match(ui, /절입/);
});

test('all internal navigation anchors resolve to real targets', () => {
  const ids=new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match)=>match[1]));
  const anchors=[...html.matchAll(/href=["']#([^"']+)["']/g)].map((match)=>match[1]);
  for(const target of anchors) assert.ok(ids.has(target), `missing anchor target #${target}`);
});

test('final markup does not retain hidden dead result placeholders', () => {
  assert.doesNotMatch(html,/id=["'](?:heroMessage|heroSub|todaySummary|todayLucky)["']/);
  assert.doesNotMatch(css,/\.daily-summary,\.lucky-strip\{display:none\}/);
  assert.match(html,/class="premium-link" href="#full-report"/);
});

test('input validation is explicit, accessible and uses safe HTML escaping', () => {
  assert.match(ui,/function inputError/);
  assert.match(ui,/function integerInput/);
  assert.match(ui,/aria-invalid/);
  assert.match(ui,/aria-errormessage/);
  assert.match(ui,/&quot;/);
});

test('static images all declare alt text', () => {
  const images=[...html.matchAll(/<img\b[^>]*>/g)].map((match)=>match[0]);
  assert.ok(images.length>0);
  for(const image of images) assert.match(image,/\balt=["'][^"']*["']/);
});
