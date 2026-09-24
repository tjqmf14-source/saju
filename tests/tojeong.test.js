import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTojeong } from '../src/tojeong.js';

test('토정비결 공개 검증 예시: 음1976-08-26 / 2005 -> 212', () => {
  const result = calculateTojeong({
    calendar: 'lunar',
    year: 1976,
    month: 8,
    day: 26,
    isLeap: false
  }, 2005);

  assert.equal(result.koreanAge, 30);
  assert.equal(result.evidence.taese.ganji, '을유');
  assert.equal(result.evidence.taese.value, 20);
  assert.equal(result.evidence.wolgeon.ganji, '을유');
  assert.equal(result.evidence.wolgeon.value, 14);
  assert.equal(result.evidence.monthDays, 29);
  assert.equal(result.evidence.iljin.ganji, '병진');
  assert.equal(result.evidence.iljin.value, 18);
  assert.equal(result.code, '212');
});

test('대월 검증 예시: 음1975-07-25 / 2024 -> 811', () => {
  const result = calculateTojeong({
    calendar: 'lunar',
    year: 1975,
    month: 7,
    day: 25,
    isLeap: false
  }, 2024);

  assert.equal(result.evidence.taese.ganji, '갑진');
  assert.equal(result.evidence.wolgeon.ganji, '임신');
  assert.equal(result.evidence.iljin.ganji, '갑자');
  assert.equal(result.evidence.monthDays, 30);
  assert.equal(result.code, '811');
});

test('144괘 현대 해설은 12개월 모두 제공하고 단정적 예언 대신 행동 기준을 준다', () => {
  const result = calculateTojeong({
    calendar: 'solar',
    year: 1987,
    month: 6,
    day: 14
  }, 2026);

  assert.equal(result.months.length, 12);
  assert.ok(result.overview.tone.length > 5);
  assert.ok(result.overview.action.length > 10);
  assert.match(result.overview.note, /확정적으로 예측하지 않습니다/);
  for (const month of result.months) {
    assert.ok(month.action.length > 10);
    assert.ok(month.topics.length >= 1);
  }
  assert.equal(new Set(result.months.map((month) => month.action)).size, 12);
});
