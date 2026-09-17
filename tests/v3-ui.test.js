import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

for (const id of ['precisionToggle','precisionSettings','birthLocation','dayBoundary','detailedReport','tarot','tarotMode','tarotQuestion','tarotDeck','tarotResult','accuracyBasis']) {
  test(`v3 UI contains #${id}`, () => assert.match(html, new RegExp(`id=["']${id}["']`)));
}

test('v3 UI uses premium-ui as the single page controller', () => {
  assert.match(html, /src="\/src\/premium-ui\.js"/);
  assert.doesNotMatch(html, /src="\/src\/app\.js"/);
});

for (const symbol of ['buildDetailedInterpretation','calculateSajuMbti','drawTarot','interpretSpread']) {
  test(`premium controller wires ${symbol}`, () => assert.match(source, new RegExp(symbol)));
}

test('public form does not ship with a personal birth profile', () => {
  assert.doesNotMatch(html, /value="민규"/);
  assert.doesNotMatch(html, /value="1987"/);
  assert.doesNotMatch(html, /value="11:45"/);
});

test('precision location defaults to neutral Korea average', () => {
  assert.match(html, /<option value="korea" selected>대한민국 평균<\/option>/);
  assert.doesNotMatch(html, /<option value="busan" selected>/);
});
