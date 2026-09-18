import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('design system exposes semantic spacing, motion and header tokens', () => {
  for (const token of ['--space-1:', '--space-4:', '--space-8:', '--section-gap:', '--header-h:', '--motion-fast:']) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
});

test('mobile report navigation cannot collide with a stacked header', () => {
  assert.match(css, /@media\(max-width:760px\)[\s\S]*?\.report-nav\{position:static/);
});

test('navigation and rail links keep touch-friendly hit areas', () => {
  assert.match(css, /\.topnav a\{[^}]*min-height:44px/);
  assert.match(css, /\.side-rail a\{[^}]*min-height:44px/);
});

test('daily fortune uses a consistent text-first index instead of mixed unicode icons', () => {
  assert.doesNotMatch(ui, /☀|◉|♡|▣|✦/);
  assert.match(ui, /daily-index/);
});

test('tarot layout is aspect-ratio driven instead of fixed min-height cards', () => {
  assert.match(css, /\.tarot-card-inner\{[^}]*aspect-ratio:2\/3/);
  assert.doesNotMatch(css, /\.tarot-card-inner\{[^}]*min-height:/);
});

test('structured cards remain restrained instead of repeated white SaaS boxes', () => {
  assert.match(css, /\.month-card\{[^}]*background:transparent/);
  assert.match(css, /\.relation-card\{[^}]*background:transparent/);
});
