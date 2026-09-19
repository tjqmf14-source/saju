import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v12.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('V12 is the only active frontend stylesheet and follows the reference palette', () => {
  assert.ok(html.includes('site-v12.css'));
  assert.ok(!html.includes('site-v11.css'));
  assert.equal((html.match(/<link rel="stylesheet"/g) || []).length, 1);
  assert.ok(css.includes('NAESAJU V12'));
  assert.ok(css.includes('--bg:#03111d'));
  assert.ok(css.includes('--gold:#d8a75f'));
  assert.ok(css.includes("url('/oracle/b-visual-atlas.webp')"));
});

test('minimum readable UI type is 11pt-equivalent or larger', () => {
  assert.ok(css.includes('--min-type:15px'));
  assert.ok(css.includes('body,button,input,select,textarea,small{font-size:var(--min-type)}'));
  assert.doesNotMatch(css, /font-size:(?:[0-9]|1[0-4])px/);
});

test('landing page follows the supplied section order', () => {
  const order = ['id="input"','visual-keyword-showcase','quote-band','id="today"','id="year"','id="tarot"','id="standards"','id="faq"','closing-cta'];
  let cursor = -1;
  for (const token of order) {
    const next = html.indexOf(token);
    assert.ok(next > cursor, token + ' should appear after the previous reference section');
    cursor = next;
  }
});

test('document IDs are unique and primary recalculation CTA submits the live form', () => {
  const ids=[...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match)=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
  assert.match(html,/class="birth-side-submit"[^>]+type="submit"[^>]+form="birthForm"/);
  assert.match(ui,/event\.isTrusted/);
});

test('tarot exposes the complete 78-card overlapping fan picker', () => {
  assert.match(html, /타로 리딩 시작하기/);
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
  assert.match(ui, /월 절기운/);
  assert.match(ui, /양력 월초가 아니라/);
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
