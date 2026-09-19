import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v11.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('V11 is the only active frontend stylesheet and follows the reference palette', () => {
  assert.ok(html.includes('site-v11.css'));
  assert.ok(!html.includes('site-v9.css'));
  assert.ok(css.includes('NAESAJU FRONTEND V11'));
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
  const order = ['id="input"','visual-keyword-showcase','quote-band','id="today"','id="year"','id="tarot"','id="reviews"','id="faq"','closing-cta'];
  let cursor = -1;
  for (const token of order) {
    const next = html.indexOf(token);
    assert.ok(next > cursor, token + ' should appear after the previous reference section');
    cursor = next;
  }
});

test('tarot exposes the complete 78-card rolling picker', () => {
  assert.match(html, /타로 리딩 시작하기/);
  assert.match(ui, /prepareTarotFan\(78\)/);
  assert.match(ui, /FULL 78-CARD DECK/);
  assert.match(ui, /function runTarotRoll/);
  assert.match(ui, /function selectTarotCard/);
  assert.ok(css.includes('.tarot-roller-viewport{'));
  assert.ok(css.includes('.tarot-roller-track{'));
});

test('solar-term month flow remains calculation-backed', () => {
  assert.match(ui, /function kstMonthNumber/);
  assert.match(ui, /월 절기운/);
  assert.match(ui, /양력 월초가 아니라/);
});
