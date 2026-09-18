import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');

test('B concept uses local illustrated hero and annual assets', () => {
  assert.match(css, /url\(['"]?\/oracle\/hero-scene\.svg/);
  assert.match(css, /url\(['"]?\/oracle\/annual-scene\.svg/);
});

test('B concept report preview exposes six illustrated keyword cards', () => {
  assert.match(html, /class="visual-keyword-showcase"/);
  const cards = html.match(/class="visual-keyword-card"/g) || [];
  assert.equal(cards.length, 6);
  for (const asset of [
    'keyword-character.svg',
    'keyword-work.svg',
    'keyword-money.svg',
    'keyword-relation.svg',
    'keyword-health.svg',
    'keyword-advice.svg'
  ]) {
    assert.match(html, new RegExp('/oracle/'+asset.replace('.', '\\.')));
  }
});

test('B concept keeps the reference-like composition blocks', () => {
  assert.match(html, /class="hero-proof-oracles"/);
  assert.match(html, /class="today-quote-panel"/);
  assert.match(html, /class="annual-visual-copy"/);
});
