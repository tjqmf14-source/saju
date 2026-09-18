import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('hero uses the senior-agency split composition', () => {
  assert.match(html, /class="hero hero-primary"/);
  assert.match(html, /class="hero-visual"/);
});

test('desktop side rail is removed while one report navigation remains', () => {
  assert.doesNotMatch(html, /class="side-rail"/);
  assert.equal((html.match(/id="reportNav"/g) || []).length, 1);
});

test('daily flow has a primary reading and secondary metrics region', () => {
  assert.match(html, /id="dailyPrimary"/);
  assert.match(html, /id="dailyMetrics"/);
});

test('annual flow removes duplicated season summary and keeps one quarter plus month flow', () => {
  assert.doesNotMatch(html, /id="seasonGuide"/);
  assert.equal((html.match(/id="tojungQuarterGrid"/g) || []).length, 1);
  assert.equal((html.match(/id="monthForecast"/g) || []).length, 1);
});

test('decade and natal structures preserve overview-first editorial reading', () => {
  assert.match(html, /id="luckOverview"/);
  assert.match(html, /id="luckTimeline"/);
  assert.match(html, /class="expert-content-shell"/);
  assert.ok(html.indexOf('id="expertGuide"') < html.indexOf('id="pillarGrid"'));
});

test('tarot uses the dedicated dark stage and keeps local upright artwork', () => {
  assert.match(html, /class="tarot-stage"/);
  assert.doesNotMatch(ui, /reversed-art/);
  assert.match(ui, /REVERSED · 역방향/);
});

test('design system contains the new editorial grid and responsive breakpoints', () => {
  assert.match(css, /--content:1320px/);
  assert.match(css, /--display-xl:/);
  assert.match(css, /\.hero-primary\{/);
  assert.match(css, /\.daily-layout\{/);
  assert.match(css, /\.annual-layout\{/);
  assert.match(css, /\.luck-layout\{/);
  assert.match(css, /\.tarot-stage\{/);
  assert.match(css, /@media\(max-width:1199px\)/);
  assert.match(css, /@media\(max-width:899px\)/);
  assert.match(css, /@media\(max-width:639px\)/);
});

test('renderer no longer writes the removed season guide', () => {
  assert.doesNotMatch(ui, /seasonGuide/);
});
