import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, calculateMonthFlows } from '../src/saju-engine.js';
import { monthFlowCopy, quarterFlowCopy } from '../src/flow-copy.js';

const chart=calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male',precision:true,location:'busan'});
const months=calculateMonthFlows(chart,2026);

test('all twelve solar-term months have distinct concise narrative content',()=>{
  const narratives=months.map((flow)=>monthFlowCopy(flow));
  assert.equal(narratives.length,12);
  assert.equal(new Set(narratives.map(({focus})=>focus)).size,12);
  assert.equal(new Set(narratives.map(({action})=>action)).size,12);
  assert.equal(new Set(narratives.map(({check})=>check)).size,12);
  for(const copy of narratives){
    assert.ok(copy.focus.length>=5 && copy.focus.length<=24);
    assert.ok(copy.action.length>=10 && copy.action.length<=32);
    assert.ok(copy.check.length>=10 && copy.check.length<=48);
    assert.ok(copy.signal.length>=2 && copy.signal.length<=30);
    assert.doesNotMatch(`${copy.focus}${copy.action}${copy.check}`,/반복되는지 점검|이 월운은 양력/);
  }
});

test('months in one ten-god group still differ by ten god or monthly branch',()=>{
  const candidates=months.filter((flow)=>flow.group==='관성');
  assert.ok(candidates.length>=2);
  const copy=candidates.map((flow)=>monthFlowCopy(flow));
  assert.equal(new Set(copy.map((item)=>`${item.focus}|${item.check}`)).size,copy.length);
});

test('repeated ten gods still get distinct visible month headline and action',()=>{
  const sameRole=months.filter((flow)=>flow.tenGod===months[0].tenGod);
  assert.ok(sameRole.length>=2);
  const copy=sameRole.map((flow)=>monthFlowCopy(flow));
  assert.equal(new Set(copy.map((item)=>item.focus)).size,copy.length);
  assert.equal(new Set(copy.map((item)=>item.action)).size,copy.length);
});

test('quarter copy follows the three calculated month flows',()=>{
  const quarters=[0,3,6,9].map((start)=>quarterFlowCopy(months.slice(start,start+3)));
  assert.equal(new Set(quarters.map((item)=>item.summary)).size,4);
  for(const [index,quarter] of quarters.entries()){
    assert.equal(quarter.steps.length,3);
    assert.deepEqual(quarter.steps.map((step)=>step.tenGod),months.slice(index*3,index*3+3).map((month)=>month.tenGod));
    assert.doesNotMatch(quarter.summary,/기을|기으로|보기으로/);
  }
});


test('monthly advice carries natal relation evidence without making it verbose',()=>{
  for(const month of months){
    const copy=monthFlowCopy(month);
    assert.ok(Array.isArray(month.relations));
    assert.equal(typeof copy.signal,'string');
    assert.ok(copy.signal.length<=30);
  }
});
