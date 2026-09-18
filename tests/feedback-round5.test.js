import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v9.css', import.meta.url), 'utf8');

test('runtime uses one clean production stylesheet and no post-render feedback script', () => {
  assert.match(html, /<link rel="stylesheet" href="\/site-v9\.css">/);
  assert.equal((html.match(/<link rel="stylesheet"/g) || []).length, 1);
  assert.doesNotMatch(html, /agency-v6\.css|reference-v\d+\.css|premium\.css|polish\.css|feedback-v2\.css|feedback-v3\.css|redesign-v5\.css/);
  assert.doesNotMatch(html, /src\/feedback-v2\.js/);
});

test('annual, decade and plain-chart structural shells exist', () => {
  assert.doesNotMatch(html, /id="yearActionPlan"/);
  assert.match(html, /class="month-block month-flow-shell"/);
  assert.match(html, /id="luckOverview"/);
  assert.match(html, /class="expert-content-shell"/);
});

test('base renderer owns decade narrative and upright reversed tarot', () => {
  assert.match(ui, /function buildLuckNarrative\(/);
  assert.match(ui, /큰 주제/);
  assert.match(ui, /기회/);
  assert.match(ui, /주의할 점/);
  assert.match(ui, /조언/);
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});

test('clean production stylesheet establishes the image-led dark editorial system', () => {
  assert.match(css, /--shell:min\(1360px/);
  assert.match(css, /\.hero-visual\{/);
  assert.match(css, /b-visual-atlas\.webp/);
  assert.match(css, /\.luck-overview/);
  assert.match(css, /\.expert-content-shell/);
});
