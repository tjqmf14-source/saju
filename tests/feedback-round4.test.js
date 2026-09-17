import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');

test('final runtime no longer depends on legacy post-render enhancement modules', () => {
  assert.doesNotMatch(html, /src\/feedback-v2\.js|src\/feedback-v4\.js|src\/redesign-v5\.js/);
  assert.match(html, /src\/premium-ui\.js/);
});

test('reversed tarot keeps RWS artwork visually upright while retaining reversed meaning', () => {
  assert.match(css, /\.tarot-card-image\{[^}]*transform:none!important/i);
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});

test('tarot interpretation uses readable editorial columns instead of narrow vertical strips', () => {
  assert.match(css, /\.tarot-reading-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/i);
  assert.match(css, /\.tarot-reading\{[^}]*max-width:980px/i);
});

test('agency layout aligns content margins and reduces table-box visual density', () => {
  assert.match(css, /--content:1280px/i);
  assert.match(css, /\.detail-chapter\{[^}]*border-top:1px solid var\(--line\)/i);
  assert.match(css, /\.luck-step\{[^}]*grid-template-columns:190px minmax\(0,1fr\)/i);
});

test('decade reading contains deep, advice-oriented narrative instead of generic boilerplate', () => {
  assert.match(ui, /function buildLuckNarrative\(/);
  assert.match(ui, /큰 주제/);
  assert.match(ui, /기회/);
  assert.match(ui, /주의할 점/);
  assert.match(ui, /조언/);
  assert.doesNotMatch(ui, /이 시기부터 새로운 10년의 배경 주제가 시작됩니다/);
});

test('annual and monthly copy is expanded into user-facing guidance', () => {
  assert.match(ui, /올해 전체 흐름/);
  assert.match(ui, /현실적인 조언/);
  assert.match(ui, /반복해서 같은 문제가 생길 때/);
  assert.match(ui, /절입 기준/);
});
