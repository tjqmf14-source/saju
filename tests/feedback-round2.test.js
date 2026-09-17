import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');

test('agency redesign keeps body and interpretation copy at a readable baseline', () => {
  assert.match(css, /body\{[^}]*font-size:17px/i);
  assert.match(css, /\.detail-chapter-body p\{[^}]*font-size:17px/i);
  assert.match(css, /\.month-card p\{[^}]*font-size:14px/i);
  assert.match(css, /\.tarot-reading-grid p\{[^}]*font-size:15px/i);
});

test('expert raw chart includes a plain-language guide for non-experts', () => {
  assert.match(html, /id="expertGuide"/);
  assert.match(ui, /function renderExpertGuide\(/);
  assert.match(ui, /생활에서는 이렇게 보일 수 있어요/);
});

test('annual reading exposes long-form analysis with exactly one quarterly plan', () => {
  assert.match(html, /id="yearDeepDive"/);
  assert.match(html, /id="tojungQuarterGrid"/);
  assert.doesNotMatch(html, /id="yearActionPlan"/);
  assert.match(ui, /올해 전체 흐름/);
  assert.match(ui, /현실적인 조언/);
  assert.match(ui, /주의할 점/);
});

test('tarot card art stays upright while reversed meaning remains explicit', () => {
  assert.match(css, /\.tarot-card-image\{[^}]*transform:none!important/i);
  assert.match(ui, /tarot-illustration/);
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});

test('tarot uses a complete local illustrated major arcana set', async () => {
  const { TAROT_ILLUSTRATIONS } = await import('../src/tarot-art.js');
  assert.equal(TAROT_ILLUSTRATIONS.length, 22);
  assert.ok(TAROT_ILLUSTRATIONS.every((art) => typeof art === 'string' && art.includes('<svg')));
});

test('agency layer replaces flat dashboard density with editorial and tarot-specific composition', () => {
  assert.match(css, /\.hero\{[^}]*grid-template-columns:7fr 5fr/i);
  assert.match(css, /\.detail-chapter\{[^}]*grid-template-columns:320px minmax\(0,1fr\)/i);
  assert.match(css, /\.tarot-section\{[^}]*background:var\(--indigo\)/i);
  assert.match(css, /\.luck-step\{[^}]*grid-template-columns:190px minmax\(0,1fr\)/i);
});
