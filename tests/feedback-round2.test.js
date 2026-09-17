import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const baseUi = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const feedbackUi = await readFile(new URL('../src/feedback-v2.js', import.meta.url), 'utf8');
const ui = `${baseUi}\n${feedbackUi}`;
const baseCss = await readFile(new URL('../polish.css', import.meta.url), 'utf8');
const feedbackCss = await readFile(new URL('../feedback-v2.css', import.meta.url), 'utf8');
const css = `${baseCss}\n${feedbackCss}`;

test('small UI copy is raised to a readable premium baseline', () => {
  assert.match(css, /\.detail-chapter-body p\s*\{[^}]*font-size:\s*17px/i);
  assert.match(css, /\.month-card p\s*\{[^}]*font-size:\s*13px/i);
  assert.match(css, /\.expert-panel summary\s*\{[^}]*font-size:\s*15px/i);
  assert.match(css, /\.tarot-reading p\s*\{[^}]*font-size:\s*14px/i);
});

test('expert raw chart includes a plain-language guide for non-experts', () => {
  assert.match(html, /id="expertGuide"/);
  assert.match(ui, /function renderExpertGuide\(/);
  assert.match(ui, /쉽게 말하면|생활에서|이 항목은/);
});

test('annual reading exposes long-form analysis and an action plan', () => {
  assert.match(html, /id="yearDeepDive"/);
  assert.match(html, /id="yearActionPlan"/);
  assert.match(ui, /function renderYearDeepDive\(/);
  assert.match(ui, /올해 전체 흐름|현실적인 조언|주의할 점/);
});

test('tarot keeps card labels upright while reversing only the illustration', () => {
  assert.doesNotMatch(css, /\.tarot-front\.reversed\s*\{/);
  assert.match(css, /\.tarot-illustration\.reversed-art\s*\{/);
  assert.match(ui, /tarot-illustration/);
  assert.match(ui, /reversed-art/);
});

test('tarot uses a complete local illustrated major arcana set', async () => {
  const { TAROT_ILLUSTRATIONS } = await import('../src/tarot-art.js');
  assert.equal(TAROT_ILLUSTRATIONS.length, 22);
  assert.ok(TAROT_ILLUSTRATIONS.every((art) => typeof art === 'string' && art.includes('<svg')));
});

test('polish layer adds ornamental depth instead of flat repeated panels', () => {
  assert.match(css, /\.panel::after/);
  assert.match(css, /\.section-label::after/);
  assert.match(css, /\.year-panel::before/);
  assert.match(css, /\.expert-intro-grid/);
});
