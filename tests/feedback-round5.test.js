import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const feedback = await readFile(new URL('../src/feedback-v2.js', import.meta.url), 'utf8');
const redesign = await readFile(new URL('../src/redesign-v5.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../redesign-v5.css', import.meta.url), 'utf8');

test('final redesign is loaded from the active enhancement entry', () => {
  assert.match(feedback, /import '.\/redesign-v5\.js'/);
  assert.match(redesign, /import '..\/redesign-v5\.css'/);
});

test('year section keeps one quarterly action plan instead of duplicate tables', () => {
  assert.match(html, /id="tojungQuarterGrid"/);
  assert.doesNotMatch(feedback, /yearActionPlan/);
  assert.match(redesign, /yearActionPlan/);
  assert.match(redesign, /remove\(\)/);
});

test('12-month flow receives a dedicated aligned shell at runtime', () => {
  assert.match(redesign, /month-flow-shell/);
  assert.match(css, /\.month-flow-shell/);
  assert.match(css, /\.month-grid\s*\{[^}]*grid-template-columns:/i);
});

test('decade section exposes overview plus deep narrative in the final renderer', () => {
  assert.match(redesign, /function buildLuckNarrative\(/);
  assert.match(redesign, /luckOverview/);
  assert.match(redesign, /큰 주제/);
  assert.match(redesign, /기회/);
  assert.match(redesign, /주의할 점/);
  assert.match(redesign, /조언/);
  assert.doesNotMatch(redesign, /이 시기부터 새로운 10년의 배경 주제가 시작됩니다/);
});

test('plain-chart section is wrapped for consistent inner margins', () => {
  assert.match(redesign, /expert-content-shell/);
  assert.match(css, /\.expert-content-shell/);
});

test('tarot reversal remains semantic while card art stays upright', () => {
  assert.match(ui, /REVERSED · 역방향/);
  assert.match(redesign, /reversed-art/);
  assert.match(css, /\.tarot-illustration\.reversed-art\s*\{[^}]*transform:\s*none/i);
});
