import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function importGateway() {
  return import('../src/android-engine-entry.js');
}

test('Android gateway maps simple solar input to the verified calculation engine', async () => {
  const { calculateForAndroid } = await importGateway();
  const result = JSON.parse(calculateForAndroid(JSON.stringify({
    calendar: 'solar',
    birthDate: '1987-06-14',
    birthTime: '11:45',
    birthTimeKnown: true,
    gender: 'male',
    location: 'busan',
    dayBoundary: 'midnight',
    precision: false
  })));

  assert.equal(result.ok, true);
  assert.equal(result.schemaVersion, 1);
  assert.deepEqual(result.chart.pillarStrings, {
    year: '정묘',
    month: '병오',
    day: '갑오',
    hour: '경오'
  });
  assert.equal(result.chart.dayMaster, '갑');
  assert.equal(result.meta.birthTimeKnown, true);
});

test('Android gateway preserves lunar and leap-month input fields', async () => {
  const { normalizeAndroidRequest } = await importGateway();
  const input = normalizeAndroidRequest({
    calendar: 'lunar',
    birthDate: '2023-02-01',
    birthTime: '09:05',
    birthTimeKnown: true,
    isLeap: true,
    gender: 'female',
    precision: true,
    location: 'seoul',
    dayBoundary: 'jasi'
  });

  assert.equal(input.calendar, 'lunar');
  assert.equal(input.year, 2023);
  assert.equal(input.month, 2);
  assert.equal(input.day, 1);
  assert.equal(input.hour, 9);
  assert.equal(input.minute, 5);
  assert.equal(input.isLeap, true);
  assert.equal(input.gender, 'female');
  assert.equal(input.location, 'seoul');
  assert.equal(input.dayBoundary, 'jasi');
});

test('Android gateway returns structured errors instead of throwing across the bridge', async () => {
  const { calculateForAndroid } = await importGateway();
  const result = JSON.parse(calculateForAndroid('{not-json'));
  assert.equal(result.ok, false);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.error.code, 'INVALID_REQUEST');
  assert.match(result.error.message, /입력/);
});

test('unknown birth time is explicit and uses a neutral calculation fallback', async () => {
  const { calculateForAndroid } = await importGateway();
  const result = JSON.parse(calculateForAndroid(JSON.stringify({
    calendar: 'solar',
    birthDate: '1987-06-14',
    birthTimeKnown: false,
    gender: 'male',
    precision: false
  })));

  assert.equal(result.ok, true);
  assert.equal(result.meta.birthTimeKnown, false);
  assert.equal(result.meta.fallbackBirthTime, '12:00');
});

test('Android engine gateway is data-only and contains no browser UI or network API', async () => {
  const source = await readFile(new URL('../src/android-engine-entry.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /innerHTML|document\.|querySelector|localStorage/);
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
  assert.match(source, /globalThis\.SajutaroEngine/);
});
