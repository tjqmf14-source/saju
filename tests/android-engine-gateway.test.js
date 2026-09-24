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
  assert.equal(result.schemaVersion, 2);
  assert.deepEqual(result.chart.pillarStrings, {
    year: '정묘',
    month: '병오',
    day: '갑오',
    hour: '경오'
  });
  assert.equal(result.chart.dayMaster, '갑');
  assert.equal(result.meta.birthTimeKnown, true);
});

test('Android gateway provides user-facing native summaries without exposing technical evidence by default', async () => {
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
  assert.equal(typeof result.native.headline, 'string');
  assert.ok(result.native.headline.length > 8);
  assert.equal(result.native.sajuSections.length, 7);
  assert.deepEqual(result.native.sajuSections.map((item) => item.title), [
    '나를 한 문장으로',
    '내가 잘하는 것',
    '힘들어지는 상황',
    '일',
    '돈',
    '관계',
    '생활과 회복'
  ]);
  assert.equal(result.native.today.items.length, 4);
  assert.equal(result.native.months.length, 12);
  assert.equal(typeof result.native.year.summary, 'string');
  assert.equal(result.native.tojeong.months.length, 12);
  assert.match(result.native.tojeong.method.name, /144괘/);
  assert.equal(new Set(result.native.tojeong.months.map((month) => month.action)).size, 12);
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
  assert.equal(result.schemaVersion, 2);
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

test('Android tarot gateway returns one-card and three-card readings with asset-safe paths', async () => {
  const { drawTarotForAndroid } = await importGateway();

  const one = JSON.parse(drawTarotForAndroid(JSON.stringify({ count: 1, mode: 'today' })));
  assert.equal(one.ok, true);
  assert.equal(one.spread.length, 1);
  assert.match(one.spread[0].card.image, /^\/tarot-rws\/[a-z0-9]+\.jpg$/);
  assert.ok(one.spread[0].meaning.length > 5);
  assert.ok(one.spread[0].advice.length > 5);

  const three = JSON.parse(drawTarotForAndroid(JSON.stringify({ count: 3, mode: 'career' })));
  assert.equal(three.ok, true);
  assert.equal(three.spread.length, 3);
  assert.equal(new Set(three.spread.map((item) => item.card.code)).size, 3);
  assert.deepEqual(three.spread.map((item) => item.position), ['현재 일의 흐름', '성장 기회', '실행 조언']);
});

test('Android engine gateway is data-only and contains no browser UI or network API', async () => {
  const source = await readFile(new URL('../src/android-engine-entry.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /innerHTML|document\.|querySelector|localStorage/);
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
  assert.match(source, /globalThis\.SajutaroEngine/);
  assert.match(source, /drawTarotForAndroid/);
});


test('Android compatibility gateway returns five practical sections without a ranking score', async () => {
  const { calculateCompatibilityForAndroid } = await importGateway();
  const first = {
    calendar: 'solar',
    birthDate: '1987-06-14',
    birthTime: '11:45',
    birthTimeKnown: true,
    gender: 'male',
    precision: false
  };
  const second = {
    calendar: 'solar',
    birthDate: '1990-03-22',
    birthTime: '09:10',
    birthTimeKnown: true,
    gender: 'female',
    precision: false
  };
  const result = JSON.parse(calculateCompatibilityForAndroid(JSON.stringify({ first, second })));

  assert.equal(result.ok, true);
  assert.equal(result.compatibility.sections.length, 5);
  assert.deepEqual(result.compatibility.sections.map((section) => section.title), [
    '잘 맞는 부분',
    '다른 부분',
    '갈등하기 쉬운 상황',
    '서로 이해하면 좋은 점',
    '현실적인 관계 조언'
  ]);
  assert.equal('score' in result.compatibility, false);
  assert.match(result.compatibility.note, /좋고 나쁨을 확정하는 점수/);
});


test('Android native daily copy hides numeric fortune scores and technical ten-god jargon', async () => {
  const { calculateForAndroid } = await importGateway();
  const result = JSON.parse(calculateForAndroid(JSON.stringify({
    calendar: 'solar',
    birthDate: '1987-06-14',
    birthTime: '11:45',
    birthTimeKnown: true,
    gender: 'male',
    precision: false
  })));

  const visible = [
    result.native.today.headline,
    ...result.native.today.items.flatMap((item) => [item.label, item.text]),
    result.native.today.good,
    result.native.today.avoid
  ].join(' ');

  assert.doesNotMatch(visible, /\d+점/);
  assert.doesNotMatch(visible, /비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인/);
  assert.ok(result.native.today.items.every((item) => item.text.length >= 12 && item.text.length <= 48));
});

test('Android native interpretation copy uses natural Korean particles for the reference profile', async () => {
  const { calculateForAndroid } = await importGateway();
  const result = JSON.parse(calculateForAndroid(JSON.stringify({
    calendar: 'solar',
    birthDate: '1987-06-14',
    birthTime: '11:45',
    birthTimeKnown: true,
    gender: 'male',
    precision: false
  })));

  const visible = [result.native.headline, ...result.native.sajuSections.flatMap((item) => [item.summary, item.reason, item.action])].join(' ');
  assert.match(visible, /표현·문제제기가/);
  assert.doesNotMatch(visible, /표현·문제제기이\s|표현·문제제기과\s|자기 기준·동료이\s|자기 기준·동료을\s/);
});
