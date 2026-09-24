import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, calculateYearFlow, calculateMonthFlows, calculateTodayFlow } from '../src/saju-engine.js';
import { calculateDailyScores } from '../src/daily-score.js';
import { buildCoreReading, buildYearReading, buildDailyReading } from '../src/reading-v20.js';

const chart=calculateSaju({
  calendar:'solar',year:1990,month:5,day:15,hour:9,minute:20,
  gender:'male',isLeap:false,precision:true,location:'korea',dayBoundary:'midnight'
});
const yearFlow=calculateYearFlow(chart,2026);
const previousMonths=calculateMonthFlows(chart,2025);
const currentMonths=calculateMonthFlows(chart,2026);
const months=[previousMonths.at(-1),...currentMonths.slice(0,11)];

test('core reading is concise, evidence backed and limited to five useful categories',()=>{
  const result=buildCoreReading(chart,{timeKnown:true});
  assert.equal(result.categories.length,5);
  assert.deepEqual(result.categories.map((item)=>item.title),['성향','일','돈','관계','회복']);
  for(const item of result.categories){
    assert.ok(item.headline.length>=18);
    assert.ok(item.summary.length>=70);
    assert.ok(item.practice.length>=30);
    assert.ok(item.evidence.length>=2);
  }
});

test('unknown birth time is explicitly downgraded rather than silently treated as certain',()=>{
  const result=buildCoreReading(chart,{timeKnown:false});
  assert.equal(result.structure.timeKnown,false);
  assert.ok(result.categories.find((item)=>item.id==='recovery').evidence.some((line)=>line.includes('시주')));
});

test('all twelve monthly readings have distinct visible titles, actions and cautions',()=>{
  const result=buildYearReading(chart,yearFlow,months);
  assert.equal(result.months.length,12);
  assert.equal(new Set(result.months.map((item)=>item.title)).size,12);
  assert.deepEqual(result.months.map((item)=>item.month),[1,2,3,4,5,6,7,8,9,10,11,12]);
  assert.equal(new Set(result.months.map((item)=>item.action)).size,12);
  assert.equal(new Set(result.months.map((item)=>item.caution)).size,12);
});

test('daily reading exposes exactly four adult life categories and score-aligned advice',()=>{
  const flow=calculateTodayFlow(chart,new Date('2026-09-24T03:00:00Z'));
  const scores=calculateDailyScores(chart,flow);
  const result=buildDailyReading(chart,flow,scores);
  assert.deepEqual(result.categories.map((item)=>item.label),['일','돈','관계','컨디션']);
  for(const item of result.categories){
    assert.equal(item.score,scores[item.key].score);
    assert.equal(item.state,scores[item.key].label);
    assert.ok(item.advice.length>=18);
  }
});
