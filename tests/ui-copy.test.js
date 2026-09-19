import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

for (const fn of ['renderToday','renderYear','renderDetailedReport','renderTarot','renderAccuracyBasis']) {
  test(`premium UI defines ${fn}`, () => {
    assert.match(source, new RegExp(`function\\s+${fn}\\s*\\(`));
  });
}

test('premium UI wires daily, yearly, detailed interpretation and tarot output', () => {
  for (const id of ['dailyPrimary','dailyMetrics','yearAdviceGrid','tojungQuarterGrid','detailedReport','tarotDeck','tarotResult']) {
    assert.match(source, new RegExp(`['\"]${id}['\"]`));
  }
});


test('premium UI exposes explicit birth input validation helpers', () => {
  assert.match(source,/function\s+inputError\s*\(/);
  assert.match(source,/function\s+integerInput\s*\(/);
  assert.match(source,/aria-invalid/);
});
