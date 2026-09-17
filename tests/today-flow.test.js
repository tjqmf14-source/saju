import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, calculateTodayFlow } from '../src/saju-engine.js';

test('오늘의 운세는 KST 날짜의 일진과 십성을 반환한다', () => {
  const chart = calculateSaju({ calendar:'solar', year:1987, month:6, day:14, hour:11, minute:45, gender:'male', isLeap:false });
  const result = calculateTodayFlow(chart, new Date('2026-09-17T12:00:00+09:00'));
  assert.equal(result.date.year, 2026);
  assert.equal(result.date.month, 9);
  assert.equal(result.date.day, 17);
  assert.match(result.korean, /^[갑을병정무기경신임계][자축인묘진사오미신유술해]$/);
  assert.ok(result.tenGod);
  assert.ok(result.group);
});
