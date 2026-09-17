import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../polish.css', import.meta.url), 'utf8');

test('reversed tarot meaning does not visually rotate the RWS card image', () => {
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});

test('tarot interpretation uses a readable stacked layout instead of narrow columns', () => {
  assert.match(css, /\.tarot-reading-grid\s*\{[^}]*grid-template-columns:\s*1fr/i);
  assert.match(css, /\.tarot-reading\s*\{[^}]*max-width:/i);
});

test('page polish aligns content margins and reduces table-box visual density', () => {
  assert.match(css, /\.main-column\s*\{[^}]*padding-inline:\s*clamp\(/i);
  assert.match(css, /\.panel-flow\b/);
  assert.match(css, /\.luck-step\s*\{[^}]*grid-template-columns:/i);
});

test('decade reading contains deep, advice-oriented narrative instead of generic boilerplate', () => {
  assert.match(ui, /function buildLuckNarrative\(/);
  assert.match(ui, /큰 주제/);
  assert.match(ui, /기회/);
  assert.match(ui, /주의할 점/);
  assert.match(ui, /조언/);
  assert.doesNotMatch(ui, /이 시기부터 새로운 10년의 배경 주제가 시작됩니다/);
});

test('annual and monthly copy is written as full user-facing guidance', () => {
  assert.match(ui, /이번 흐름에서 중요한 것은/);
  assert.match(ui, /생활에서 체감할 수 있는 방식/);
  assert.match(ui, /서두르기보다/);
});
