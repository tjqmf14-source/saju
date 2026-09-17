import test from 'node:test';
import assert from 'node:assert/strict';
import { solarToLunar, lunarToSolar, isLeapMonth } from '../src/calendar.js';

const ymd = (year, month, day) => ({ year, month, day });

test('1900 기준일을 음력 1월 1일로 변환한다', () => {
  assert.deepEqual(solarToLunar(ymd(1900, 1, 31)), { year: 1900, month: 1, day: 1, isLeap: false });
});

test('2024 설날을 음력 1월 1일로 변환한다', () => {
  assert.deepEqual(solarToLunar(ymd(2024, 2, 10)), { year: 2024, month: 1, day: 1, isLeap: false });
});

test('2023 윤2월 1일을 정확히 왕복 변환한다', () => {
  assert.equal(isLeapMonth(2023, 2), true);
  assert.deepEqual(solarToLunar(ymd(2023, 3, 22)), { year: 2023, month: 2, day: 1, isLeap: true });
  assert.deepEqual(lunarToSolar(2023, 2, 1, true), { year: 2023, month: 3, day: 22 });
});

test('대표 날짜의 양력-음력-양력 왕복 결과가 같다', () => {
  for (const original of [ymd(1950, 6, 25), ymd(1987, 6, 14), ymd(2000, 1, 1), ymd(2024, 9, 17), ymd(2099, 12, 31)]) {
    const lunar = solarToLunar(original);
    const roundTrip = lunarToSolar(lunar.year, lunar.month, lunar.day, lunar.isLeap);
    assert.deepEqual(roundTrip, original);
  }
});

test('실제 윤달이 아닌 입력은 거부한다', () => {
  assert.throws(() => lunarToSolar(2024, 2, 1, true), /윤달/);
});
