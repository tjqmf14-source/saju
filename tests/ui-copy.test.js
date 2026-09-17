import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

for (const fn of ['renderDailyFortune','renderTodayLucky','renderTojungQuarters','renderYearAdvice','renderSeasonGuide']) {
  test(`app defines ${fn}`, () => {
    assert.match(source, new RegExp(`function\\s+${fn}\\s*\\(`));
  });
}
