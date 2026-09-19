import test from 'node:test';
import assert from 'node:assert/strict';
import { MAJOR_ARCANA, prepareTarotFan, drawTarot, interpretSpread } from '../src/tarot.js';

test('major arcana contains 22 unique cards', () => {
  assert.equal(MAJOR_ARCANA.length, 22);
  assert.equal(new Set(MAJOR_ARCANA.map((c)=>c.id)).size, 22);
});


test('selection fan prepares unique hidden choices', () => {
  const fan = prepareTarotFan(78, ()=>0.37);
  assert.equal(fan.length, 78);
  assert.equal(new Set(fan.map((item)=>item.card.id)).size, 78);
  assert.ok(fan.every((item)=>typeof item.reversed === 'boolean'));
});

test('selection fan validates its size', () => {
  assert.throws(()=>prepareTarotFan(2), RangeError);
  assert.throws(()=>prepareTarotFan(79), RangeError);
});

test('three card draw has no duplicate cards', () => {
  const sequence = [0.01,0.11,0.21,0.31,0.41,0.51,0.61,0.71,0.81,0.91];
  let index = 0;
  const draw = drawTarot(3, () => sequence[index++ % sequence.length]);
  assert.equal(draw.length, 3);
  assert.equal(new Set(draw.map((d)=>d.card.id)).size, 3);
  assert.ok(draw.every((d)=>typeof d.reversed === 'boolean'));
});

test('draw is deterministic with injected random source', () => {
  const random = () => 0.25;
  assert.deepEqual(drawTarot(1, random), drawTarot(1, random));
});

test('today spread returns one interpreted position', () => {
  const result = interpretSpread('today', drawTarot(1, ()=>0.2));
  assert.equal(result.length, 1);
  assert.equal(result[0].position, '오늘의 메시지');
  assert.ok(result[0].text.length > 30);
});

test('question, love, money and career spreads return three positions', () => {
  const draw = drawTarot(3, ()=>0.4);
  assert.equal(interpretSpread('love', draw).length, 3);
  assert.equal(interpretSpread('money', draw).length, 3);
  assert.equal(interpretSpread('career', draw).length, 3);
  assert.equal(interpretSpread('question', draw).length, 3);
  assert.deepEqual(interpretSpread('career', draw).map((v)=>v.position), ['현재 일의 흐름','성장 기회','실행 조언']);
});
