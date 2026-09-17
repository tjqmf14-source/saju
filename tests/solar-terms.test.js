import test from 'node:test';
import assert from 'node:assert/strict';
import { getSolarTermDate, JIE_TERMS } from '../src/solar-terms.js';

const minutes = (a, b) => Math.abs(a.getTime() - b.getTime()) / 60000;

test('2024 입춘 시각을 수분 오차 이내로 계산한다', () => {
  const actual = getSolarTermDate(2024, 315);
  const expected = new Date(Date.UTC(2024, 1, 4, 8, 27, 8));
  assert.ok(minutes(actual, expected) < 4, `${actual.toISOString()} / ${expected.toISOString()}`);
});

test('2012 백로 시각을 수분 오차 이내로 계산한다', () => {
  const actual = getSolarTermDate(2012, 165);
  const expected = new Date(Date.UTC(2012, 8, 7, 5, 29, 1));
  assert.ok(minutes(actual, expected) < 4, `${actual.toISOString()} / ${expected.toISOString()}`);
});

test('월주 경계용 12절을 모두 제공한다', () => {
  assert.equal(JIE_TERMS.length, 12);
  assert.deepEqual(JIE_TERMS.map((item) => item.longitude), [285,315,345,15,45,75,105,135,165,195,225,255]);
});
