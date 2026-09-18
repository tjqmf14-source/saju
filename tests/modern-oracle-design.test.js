import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');

test('Modern Oracle theme is declared at document level', () => {
  assert.match(html, /<body[^>]+data-theme="modern-oracle"/);
  assert.match(css, /--oracle-bg:#07111f/);
  assert.match(css, /--oracle-gold:#d6b26e/);
  assert.match(css, /--oracle-cream:#f4ead3/);
});

test('hero includes a dedicated celestial oracle graphic rather than an empty color block', () => {
  assert.match(html, /class="oracle-portal"/);
  assert.match(html, /class="oracle-orbit"/);
  assert.match(html, /class="oracle-moon"/);
});

test('major reading sections use the shared oracle panel language', () => {
  for (const cls of ['input-panel','reading-opening','year-panel','luck-panel','expert-panel']) {
    assert.match(html, new RegExp('class="[^"]*\\b'+cls+'\\b[^"]*oracle-panel'));
  }
});

test('daily flow has a circular oracle score presentation', () => {
  assert.match(css, /\.daily-primary-score\{[^}]*border-radius:50%/s);
  assert.match(css, /conic-gradient/);
});

test('navigation and primary actions use restrained gold interaction states', () => {
  assert.match(css, /\.topnav a:hover[^}]*color:var\(--oracle-gold\)/s);
  assert.match(css, /\.cta\{[^}]*background:var\(--oracle-gold\)/s);
});

test('site includes decorative constellation geometry with no external asset dependency', () => {
  assert.match(html, /class="constellation-geometry"/);
  assert.doesNotMatch(html, /https?:\/\//);
});


test('Modern Oracle ships a local SVG icon system for key product actions', () => {
  assert.match(html, /id="oracleIconSprite"/);
  for (const id of ['icon-calendar','icon-sun','icon-coin','icon-heart','icon-briefcase','icon-health','icon-orbit','icon-chart','icon-tarot']) {
    assert.match(html, new RegExp('id="'+id+'"'));
  }
});

test('major sections include real graphic motifs rather than text-only panels', () => {
  assert.match(html, /class="five-elements-orbit"/);
  assert.match(html, /class="annual-visual-copy"/);
  assert.match(html, /class="decade-celestial-track"/);
  assert.match(html, /class="natal-orbit-graphic"/);
  assert.match(html, /class="tarot-ornament"/);
});

test('feature navigation uses reusable line icons', () => {
  assert.match(html, /class="[^"]*feature-orbit-nav[^"]*"/);
  assert.match(html, /<use href="#icon-orbit"/);
  assert.match(html, /<use href="#icon-tarot"/);
});

test('oracle graphics have dedicated responsive styling', () => {
  for (const cls of ['\.five-elements-orbit','\.annual-visual-copy','\.decade-celestial-track','\.natal-orbit-graphic','\.feature-orbit-nav']) {
    assert.match(css, new RegExp(cls+'\\{'));
  }
});
