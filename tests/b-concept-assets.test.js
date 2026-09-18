import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');

test('B concept uses the generated local visual atlas for hero and annual imagery', async () => {
  assert.match(css, /url\(['"]?\/oracle\/b-visual-atlas\.webp/);
  const atlas = await readFile(new URL('../public/oracle/b-visual-atlas.webp', import.meta.url));
  assert.ok(atlas.byteLength > 50000);
});

test('B concept report preview exposes six illustrated keyword cards', () => {
  assert.match(html, /class="[^"]*visual-keyword-showcase[^"]*"/);
  const cards = html.match(/class="visual-keyword-card"/g) || [];
  assert.equal(cards.length, 6);
  for (let index = 1; index <= 6; index += 1) {
    assert.match(html, new RegExp('atlas-card atlas-card-'+index));
  }
  assert.doesNotMatch(html, /keyword-(character|work|money|relation|health|advice)\.svg/);
});

test('B concept keeps the reference-like composition blocks', () => {
  assert.match(html, /class="hero-proof-oracles"/);
  assert.match(html, /class="today-quote-panel"/);
  assert.match(html, /class="annual-visual-copy"/);
});
