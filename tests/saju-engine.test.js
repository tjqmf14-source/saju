import test from 'node:test';
import assert from 'node:assert/strict';
import { getSolarTerm } from 'manseryeok';
import { calculateSaju, calculateYearFlow, calculateMonthFlows, calculateTodayTimeFlows, detectBranchRelations } from '../src/saju-engine.js';

test('1987-06-14 11:45 KST 원국을 검증된 간지로 계산한다', () => {
  const chart = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male',precision:false});
  assert.deepEqual(chart.pillarStrings,{year:'정묘',month:'병오',day:'갑오',hour:'경오'});
  assert.equal(chart.dayMaster,'갑');
  assert.equal(chart.lunar.month,5);
  assert.equal(chart.lunar.day,18);
});

test('1990-05-15 independent manse reference matches year month day and 2026 annual pillar', () => {
  const chart = calculateSaju({calendar:'solar',year:1990,month:5,day:15,hour:9,minute:20,gender:'male',precision:false});
  assert.equal(chart.pillarStrings.year,'경오');
  assert.equal(chart.pillarStrings.month,'신사');
  assert.equal(chart.pillarStrings.day,'경진');
  assert.equal(chart.dayMaster,'경');
  assert.equal(calculateYearFlow(chart,2026).korean,'병오');
});

test('동일 날짜의 음력 입력은 같은 원국을 만든다', () => {
  const solar = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male',precision:false});
  const lunar = calculateSaju({calendar:'lunar',year:1987,month:5,day:18,hour:11,minute:45,isLeap:false,gender:'male',precision:false});
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

test('월운은 양력 15일이 아니라 실제 12개 절입 순간을 경계로 계산한다', () => {
  const chart = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});
  const flows = calculateMonthFlows(chart,2026);
  assert.equal(flows.length,12);
  assert.equal(flows[0].sajuMonth,1);
  assert.equal(flows[0].branch,'인');
  assert.equal(flows[0].start.toISOString(),getSolarTerm(2026,2).date.toISOString());
  assert.equal(flows[1].start.toISOString(),getSolarTerm(2026,4).date.toISOString());
  assert.equal(flows[10].start.toISOString(),getSolarTerm(2026,22).date.toISOString());
  assert.equal(flows[11].start.toISOString(),getSolarTerm(2027,0).date.toISOString());
  assert.equal(flows[11].end.toISOString(),getSolarTerm(2027,2).date.toISOString());
  for (const flow of flows) assert.ok(flow.end > flow.start);
});


test('지정일 시간대별 흐름은 6개 생활 시간대로 계산한다', () => {
  const chart = calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male'});
  const flows = calculateTodayTimeFlows(chart,new Date('2026-09-21T03:00:00Z'));
  assert.equal(flows.length,6);
  assert.deepEqual(flows.map((flow)=>flow.label),['새벽','아침','오전','오후','저녁','밤']);
  assert.ok(flows.every((flow)=>typeof flow.tenGod==='string' && typeof flow.group==='string'));
  assert.ok(flows.every((flow)=>typeof flow.korean==='string' && flow.korean.length===2));
});


test('independent fortune-service reference sample matches pillars ten-gods and decade cycle',()=>{
  const chart=calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male',precision:false});
  assert.deepEqual(chart.pillarStrings,{year:'정묘',month:'병오',day:'갑오',hour:'경오'});
  assert.equal(chart.tenGods.year.stem,'상관');
  assert.equal(chart.tenGods.year.branch,'겁재');
  assert.equal(chart.tenGods.month.stem,'식신');
  assert.equal(chart.tenGods.month.branch,'상관');
  assert.ok(['일간','비견'].includes(chart.tenGods.day.stem)); // day master = self/비견; providers label this differently
  assert.equal(chart.tenGods.day.branch,'상관');
  assert.equal(chart.tenGods.hour.stem,'편관');
  assert.equal(chart.tenGods.hour.branch,'상관');
  const luck33=chart.luck.pillars.find((item)=>item.age===33);
  const luck43=chart.luck.pillars.find((item)=>item.age===43);
  assert.equal(luck33?.korean,'임인');
  assert.equal(luck43?.korean,'신축');
});

test('each monthly flow includes relations against the natal branches',()=>{
  const chart=calculateSaju({calendar:'solar',year:1987,month:6,day:14,hour:11,minute:45,gender:'male',precision:false});
  const flows=calculateMonthFlows(chart,2026);
  assert.ok(flows.every((flow)=>Array.isArray(flow.relations)));
  assert.ok(flows.some((flow)=>flow.relations.length>0));
});
