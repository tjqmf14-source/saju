import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, detectBranchRelations } from '../src/saju-engine.js';

test('1987-06-14 11:45 원국을 검증된 간지로 계산한다', () => {
  const chart = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});
  assert.deepEqual(chart.pillarStrings,{year:'정묘',month:'병오',day:'갑오',hour:'경오'});
  assert.equal(chart.dayMaster,'갑');
  assert.equal(chart.lunar.month,5);
  assert.equal(chart.lunar.day,18);
});

test('동일 날짜의 음력 입력은 같은 원국을 만든다', () => {
  const solar = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});
  const lunar = calculateSaju({calendar:'lunar',year:1987,month:5,day:18,hour:11,minute:45,isLeap:false,gender:'male'});
  assert.deepEqual(lunar.pillarStrings,solar.pillarStrings);
});

test('대운 순역행은 성별과 연간 음양 규칙을 따른다', () => {
  const male = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});
  const female = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'female'});
  assert.equal(male.luck.forward,false);
  assert.equal(female.luck.forward,true);
});

test('지지 충과 삼합을 탐지한다', () => {
  const relations = detectBranchRelations(['자','오','신','진']);
  assert.ok(relations.some((r)=>r.type==='충' && r.members.includes('자') && r.members.includes('오')));
  assert.ok(relations.some((r)=>r.type==='삼합' && r.members.join('')==='신자진'));
});

test('오행 분포는 합계가 8로 정규화된다', () => {
  const chart = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});
  const total = Object.values(chart.elements).reduce((a,b)=>a+b,0);
  assert.ok(Math.abs(total-8)<1e-9);
});
