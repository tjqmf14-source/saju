import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, calculateTodayFlow } from '../src/saju-engine.js';
import { analyzeAdvancedMyeongri } from '../src/advanced-myeongri.js';
import { calculateDailyScores } from '../src/daily-score.js';

const chart=calculateSaju({
  calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,
  gender:'male',precision:false
});

test('advanced myeongri exposes month structure and ten individual ten-gods',()=>{
  const advanced=analyzeAdvancedMyeongri(chart);
  assert.equal(advanced.structure.monthBranch,'오');
  assert.ok(typeof advanced.structure.tenGod==='string' && advanced.structure.tenGod.length>0);
  assert.equal(Object.keys(advanced.tenGodDetail.scores).length,10);
  assert.equal(advanced.tenGodDetail.top.length,4);
  assert.ok(['높음','중간'].includes(advanced.structure.confidence));
});

test('advanced strength explains season, roots and support rather than element count only',()=>{
  const advanced=analyzeAdvancedMyeongri(chart);
  assert.ok(advanced.strength.score>=15 && advanced.strength.score<=85);
  assert.equal(advanced.strength.evidence.length,3);
  assert.match(advanced.meta.method,/월령·통근/);
  assert.match(advanced.meta.caution,/학파 차이/);
});

test('daily report includes an explainable emotion metric',()=>{
  const today=calculateTodayFlow(chart,new Date('2026-09-21T03:00:00Z'));
  const scores=calculateDailyScores(chart,today);
  assert.ok(scores.emotion);
  assert.ok(scores.emotion.score>=0 && scores.emotion.score<=100);
  assert.match(scores.emotion.reason,/감정 지수/);
});
