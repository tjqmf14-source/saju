import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v11.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('V11 is the only active frontend stylesheet and follows the reference palette', () => {
  assert.match(html, /site-v11\\.css/);
  assert.doesNotMatch(html, /site-v9\\.css/);
  assert.match(css, /NAESAJU FRONTEND V11/);
  assert.match(css, /--bg:#03111d/);
  assert.match(css, /--gold:#d8a75f/);
  assert.match(css, /url\\('\/oracle\/b-visual-atlas\\.webp'\\)/);
});

test('minimum readable UI type is 11pt-equivalent or larger', () => {
  assert.match(css, /--min-type:15px/);
  assert.match(css, /body,button,input,select,textarea,small\\{font-size:var\\(--min-type\\)\\}/);
  assert.doesNotMatch(css, /font-size:(?:[0-9]|1[0-4])px/);
});

test('landing page follows the supplied section order', () => {
  const order = [
    'id="input"',
    'visual-keyword-showcase',
    'quote-band',
    'id="today"',
    'id="year"',
    'id="tarot"',
    'id="reviews"',
    'id="faq"',
    'closing-cta'
  ];
  let cursor = -1;
  for (const token of order) {
    const next = html.indexOf(token);
    assert.ok(next > cursor, token + ' should appear after the previous reference section');
    cursor = next;
  }
});

test('tarot retains explicit fan-and-pick interaction', () => {
  assert.match(html, /타로 리딩 시작하기/);
  assert.match(html, /마음이 가는 카드를 직접 선택/);
  assert.match(ui, /prepareTarotFan/);
  assert.match(ui, /class="tarot-pick/);
  assert.match(ui, /function selectTarotCard/);
  assert.match(css, /\\.tarot-pick-deck\\{/);
});

test('solar-term month flow remains calculation-backed', () => {
  assert.match(ui, /function kstMonthNumber/);
  assert.match(ui, /월 절기운/);
  assert.match(ui, /양력 월초가 아니라/);
});
