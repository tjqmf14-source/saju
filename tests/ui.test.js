import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

for (const id of ['input','dailyPrimary','dailyMetrics','todayLucky','tojungQuarterGrid','yearAdviceGrid','tarot','reviews','faq']) {
  test(`V11 UI contains #${id}`, () => {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  });
}
