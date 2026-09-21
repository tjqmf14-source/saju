import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju } from '../src/saju-engine.js';
import { buildInterpretiveProfile } from '../src/interpretive-profile.js';
import { buildDetailedInterpretation } from '../src/interpretation.js';
import { calculateSajuMbti } from '../src/mbti.js';
import { calculateYearFlows, calculateMonthFlows } from '../src/saju-engine.js';

const chart=calculateSaju({
  calendar:'solar',
  year:1987,month:6,day:14,hour:11,minute:45,
  gender:'male',isLeap:false,precision:true,location:'korea',dayBoundary:'midnight'
});

test('interpretive profile separates ten gods and records their real placements',()=>{
  const profile=buildInterpretiveProfile(chart);
  assert.equal(profile.tenGods.ranking.length,10);
  assert.equal(profile.placements.length,3);
  assert.equal(profile.readingOrder.length,4);
  assert.ok(profile.tenGods.ranking.every((item)=>Array.isArray(item.locations)));
  assert.ok(profile.tenGods.ranking.some((item)=>item.visible.length>0));
  assert.ok(profile.tenGods.ranking.some((item)=>item.hidden.length>0));
});

test('strength profile exposes month, roots, visible stems and score breakdown',()=>{
  const {strength}=buildInterpretiveProfile(chart);
  assert.ok(strength.score>=0 && strength.score<=100);
  assert.ok(['신강','다소 신강','중화권','다소 신약','신약'].includes(strength.band));
  assert.equal(strength.breakdown.length,5);
  assert.equal(typeof strength.month.text,'string');
  assert.equal(typeof strength.supportShare,'number');
  assert.equal(typeof strength.visibleSupport,'number');
});

test('detailed interpretation starts with easy reading but keeps technical evidence',()=>{
  const mbti=calculateSajuMbti(chart);
  const year=2026;
  const report=buildDetailedInterpretation(chart,mbti,calculateYearFlows(chart,year,1)[0],calculateMonthFlows(chart,year));
  assert.ok(report.overview.quick.length>=3);
  assert.ok(report.temperament.quick.length>=3);
  assert.match(report.balance.lead,/월령·통근·생조·극설/);
  assert.match(report.technical.paragraphs.join(' '),/비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인/);
  assert.match(report.technical.paragraphs.join(' '),/절대 공식|절대적 성격 판정/);
});
