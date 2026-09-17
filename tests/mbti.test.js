import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju } from '../src/saju-engine.js';
import { calculateSajuMbti } from '../src/mbti.js';

const chart = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});

test('사주 기반 MBTI는 16유형 형식과 4개 축을 반환한다', () => {
  const result = calculateSajuMbti(chart);
  assert.match(result.type,/^[EI][SN][TF][JP]$/);
  assert.deepEqual(Object.keys(result.axes),['EI','SN','TF','JP']);
});

test('각 MBTI 축의 양쪽 비율 합은 100이다', () => {
  const result = calculateSajuMbti(chart);
  for (const axis of Object.values(result.axes)) {
    assert.equal(axis.left.percent + axis.right.percent,100);
    assert.ok(axis.left.percent>=0 && axis.left.percent<=100);
    assert.ok(axis.right.percent>=0 && axis.right.percent<=100);
    assert.ok(axis.reasons.length>0);
  }
});

test('동일 원국에는 항상 동일한 MBTI 결과가 나온다', () => {
  assert.deepEqual(calculateSajuMbti(chart),calculateSajuMbti(chart));
});

test('정식 MBTI가 아닌 참고 지표임을 명시한다', () => {
  const result = calculateSajuMbti(chart);
  assert.match(result.disclaimer,/정식 MBTI|비공식/);
});
