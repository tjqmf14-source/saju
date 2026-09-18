import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../agency-v6.css', import.meta.url), 'utf8');
const EXPECTED_ATLAS_BYTES = 79548;
const EXPECTED_ATLAS_SHA256 = '9ab3f1366bf1ed44b937d8abc7fcdedbf03bcc8272711ab77ea664faf11d5bb2';

test('B concept uses the verified local visual atlas for hero and annual imagery', async () => {
  assert.match(css, /url\(['"]?\/oracle\/b-visual-atlas\.webp/);
  const atlas = await readFile(new URL('../public/oracle/b-visual-atlas.webp', import.meta.url));
  assert.equal(atlas.byteLength, EXPECTED_ATLAS_BYTES);
  assert.equal(atlas.toString('ascii', 0, 4), 'RIFF');
  assert.equal(atlas.toString('ascii', 8, 12), 'WEBP');
  assert.equal(atlas.readUInt32LE(4) + 8, atlas.byteLength);
  assert.equal(createHash('sha256').update(atlas).digest('hex'), EXPECTED_ATLAS_SHA256);
});

test('checked-in oracle atlas chunks reconstruct the exact production WebP', async () => {
  const chunks = await Promise.all(Array.from({ length: 7 }, (_, index) =>
    readFile(new URL(`../assets/oracle-atlas/chunk-${String(index).padStart(2, '0')}.txt`, import.meta.url), 'utf8')
  ));
  const encoded = chunks.map((chunk) => chunk.replace(/\s+/g, '')).join('');
  assert.equal(encoded.length, 106064);
  assert.match(encoded, /^[A-Za-z0-9+/=]+$/);
  const decoded = Buffer.from(encoded, 'base64');
  assert.equal(decoded.toString('base64'), encoded);
  assert.equal(decoded.byteLength, EXPECTED_ATLAS_BYTES);
  assert.equal(createHash('sha256').update(decoded).digest('hex'), EXPECTED_ATLAS_SHA256);
});

test('B concept report preview exposes six illustrated keyword cards', () => {
  assert.match(html, /class="[^"]*visual-keyword-showcase[^"]*"/);
  const cards = html.match(/class="visual-keyword-card"/g) || [];
  assert.equal(cards.length, 6);
  for (let index = 1; index <= 6; index += 1) {
    assert.match(html, new RegExp('atlas-card atlas-card-' + index));
  }
  assert.doesNotMatch(html, /keyword-(character|work|money|relation|health|advice)\.svg/);
});

test('B concept keeps the reference-like composition blocks', () => {
  assert.match(html, /class="hero-proof-oracles"/);
  assert.match(html, /class="today-quote-panel"/);
  assert.match(html, /class="annual-visual-copy"/);
});
