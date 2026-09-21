import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju } from '../src/saju-engine.js';
import { calculateSajuMbti } from '../src/mbti.js';
import { calculateYearFlows, calculateMonthFlows } from '../src/saju-engine.js';
import { buildInterpretiveProfile } from '../src/interpretive-profile.js';
import { buildDetailedInterpretation } from '../src/interpretation.js';

const chart=calculateSaju({
  calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,
  gender:'male',precision:true,location:'busan'
});

test('layered interpretation keeps all ten gods separate with placements',()=>{
  const profile=buildInterpretiveProfile(chart);
  assert.equal(profile.tenGods.ranking.length,10);
  assert.ok(profile.tenGods.placements.length>=12);
  assert.ok(profile.tenGods.ranking.every((item)=>Number.isFinite(item.score)));
  assert.ok(profile.tenGods.ranking.some((item)=>item.locations.some((location)=>/월주|일주|시주|연주/.test(location))));
});

test('strength profile combines month season roots and support evidence',()=>{
  const {strength}=buildInterpretiveProfile(chart);
  assert.ok(strength.score>=0 && strength.score<=100);
  assert.match(strength.band,/신강|신약|중화/);
  assert.match(strength.confidence,/높음|중간|낮음/);
  assert.ok(strength.month.text.length>20);
  assert.ok(Array.isArray(strength.rootReasons));
  assert.ok(strength.helpfulElements.length>=1);
  assert.ok(Number.isFinite(strength.rootScore));
  assert.ok(Number.isFinite(strength.visibleSupport));
  assert.match(strength.disclaimer,/학파|참고/);
});

test('reader report exposes easy summary before deep evidence',()=>{
  const mbti=calculateSajuMbti(chart);
  const yearFlow=calculateYearFlows(chart,2026,1)[0];
  const months=calculateMonthFlows(chart,2026);
  const report=buildDetailedInterpretation(chart,mbti,yearFlow,months);
  for(const key of ['overview','temperament','balance','career','money','love','technical']){
    assert.ok(Array.isArray(report[key].quick),key);
    assert.ok(report[key].quick.length>=3,key);
    assert.ok(report[key].quick.every((line)=>typeof line==='string' && line.length>=12),key);
  }
  assert.match(report.balance.lead,/신강|신약|중화/);
  assert.match(report.balance.lead,/점/);
  assert.match(report.technical.paragraphs.join(' '),/비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인/);
});


test('interpretive profile exposes month command, structure hint and pillar-aware relations',()=>{
  const profile=buildInterpretiveProfile(chart);
  assert.ok(profile.monthCommand);
  assert.match(profile.monthCommand.structureName,/중심형/);
  assert.match(profile.monthCommand.confidence,/높음|중간/);
  assert.equal(profile.pillars.length,4);
  assert.ok(profile.pillars.every((item)=>item.context && item.stemGod && item.branchMainGod));
  assert.ok(Array.isArray(profile.evidence) && profile.evidence.length>=5);
  assert.match(profile.structureHint,/해석|월령/);
  assert.ok(Array.isArray(profile.relations.items));
});

test('reader report separates plain-language summary from calculation evidence',()=>{
  const mbti=calculateSajuMbti(chart);
  const yearFlow=calculateYearFlows(chart,2026,1)[0];
  const months=calculateMonthFlows(chart,2026);
  const report=buildDetailedInterpretation(chart,mbti,yearFlow,months);
  assert.match(report.overview.lead,/쉽게 말하면/);
  assert.ok(report.overview.evidence.length>=4);
  assert.ok(report.balance.evidence.length>=4);
  assert.match(report.balance.paragraphs.join(' '),/월령|통근|지장간/);
});
