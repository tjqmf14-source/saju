import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const feedback = await readFile(new URL('../src/feedback-v2.js', import.meta.url), 'utf8');

test('final redesign stylesheet is loaded last', () => {
  assert.match(html, /<link rel="stylesheet" href="\/redesign-v5\.css">/);
});

test('year section keeps one quarterly action plan instead of duplicate tables', () => {
  assert.doesNotMatch(html, /id="yearActionPlan"/);
  assert.doesNotMatch(feedback, /yearActionPlan/);
  assert.match(html, /id="tojungQuarterGrid"/);
});

test('12-month flow has a dedicated aligned shell', () => {
  assert.match(html, /class="month-block month-flow-shell"/);
});

test('decade section exposes overview plus deep narrative directly from base renderer', () => {
  assert.match(html, /id="luckOverview"/);
  assert.match(ui, /function buildLuckNarrative\(/);
  assert.match(ui, /큰 주제/);
  assert.match(ui, /기회/);
  assert.match(ui, /주의할 점/);
  assert.match(ui, /조언/);
  assert.doesNotMatch(ui, /이 시기부터 새로운 10년의 배경 주제가 시작됩니다/);
});

test('plain-chart section is wrapped for consistent inner margins', () => {
  assert.match(html, /class="expert-content-shell"/);
});

test('tarot reversal remains semantic while card art stays upright', () => {
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});
