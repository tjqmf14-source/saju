import {
  calculateFourPillars,
  getSolarTerm,
  getTenGod
} from 'manseryeok';
import { normalizeBirthDate, solarToLunar } from './calendar.js';
import {
  HIDDEN_WEIGHTS,
  TEN_GOD_GROUP,
  stemByName,
  branchByName
} from './data.js';
import { resolvePrecision, DAY_BOUNDARY_LABELS } from './precision.js';

const PILLAR_KEYS = ['year', 'month', 'day', 'hour'];

function add(score, key, amount) {
  score[key] = (score[key] || 0) + amount;
}

function pillarString(pillar) {
  return `${pillar.heavenlyStem}${pillar.earthlyBranch}`;
}

function weightedElementScores(pillars) {
  const score = { 목:0, 화:0, 토:0, 금:0, 수:0 };
  for (const key of PILLAR_KEYS) {
    const pillar = pillars[key];
    add(score, stemByName(pillar.heavenlyStem).element, 1);
    const branch = branchByName(pillar.earthlyBranch);
    const weights = HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((hiddenStem, index) => {
      add(score, stemByName(hiddenStem).element, weights[index]);
    });
  }
  return score;
}

function weightedRoleScores(pillars) {
  const dayMaster = pillars.day.heavenlyStem;
  const score = { 비겁:0, 식상:0, 재성:0, 관성:0, 인성:0 };
  for (const key of PILLAR_KEYS) {
    const pillar = pillars[key];
    const stemGod = key === 'day' ? '비견' : getTenGod(dayMaster, pillar.heavenlyStem);
    add(score, TEN_GOD_GROUP[stemGod] || '비겁', 1);
    const branch = branchByName(pillar.earthlyBranch);
    const weights = HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((hiddenStem, index) => {
      const tenGod = getTenGod(dayMaster, hiddenStem);
      add(score, TEN_GOD_GROUP[tenGod], weights[index]);
    });
  }
  return score;
}

function hasAll(branches, members) {
  const set = new Set(branches);
  return members.every((m) => set.has(m));
}

function pairPresent(branches, a, b) {
  return branches.includes(a) && branches.includes(b);
}

export function detectBranchRelations(branches) {
  const result = [];
  const pushPair = (type, pairs) => {
    for (const [a,b] of pairs) {
      if (pairPresent(branches,a,b)) result.push({type,members:[a,b],text:`${a}·${b} ${type}`});
    }
  };

  pushPair('합', [['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']]);
  pushPair('충', [['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']]);
  pushPair('파', [['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']]);
  pushPair('해', [['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']]);

  const triple = [
    ['삼합',['신','자','진'],'수'],
    ['삼합',['해','묘','미'],'목'],
    ['삼합',['인','오','술'],'화'],
    ['삼합',['사','유','축'],'금'],
    ['형',['인','사','신'],null],
    ['형',['축','미','술'],null]
  ];
  for (const [type,members,element] of triple) {
    if (hasAll(branches,members)) result.push({type,members:[...members],element,text:`${members.join('·')} ${type}${element?`(${element})`:''}`});
  }
  pushPair('형', [['자','묘']]);
  for (const self of ['진','오','유','해']) {
    if (branches.filter((b)=>b===self).length >= 2) result.push({type:'형',members:[self,self],text:`${self} 형 (자형)`});
  }

  const seen = new Set();
  return result.filter((item) => {
    const key = `${item.type}:${item.members.join('-')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeInput(input) {
  const required = ['year','month','day','hour','minute'];
  for (const key of required) {
    if (input[key] === '' || input[key] === null || input[key] === undefined) throw new RangeError(`${key} 값이 필요합니다.`);
  }
  const normalized = {
    calendar: input.calendar === 'lunar' ? 'lunar' : 'solar',
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: Number(input.hour),
    minute: Number(input.minute),
    isLeap: Boolean(input.isLeap),
    gender: input.gender === 'female' ? 'female' : 'male',
    precision: input.precision !== false,
    location: input.location || 'korea',
    dayBoundary: input.dayBoundary || 'midnight'
  };
  if (!Number.isInteger(normalized.hour) || normalized.hour < 0 || normalized.hour > 23) throw new RangeError('출생 시각의 시는 0~23이어야 합니다.');
  if (!Number.isInteger(normalized.minute) || normalized.minute < 0 || normalized.minute > 59) throw new RangeError('출생 시각의 분은 0~59여야 합니다.');
  return normalized;
}

export function calculateSaju(rawInput) {
  const input = normalizeInput(rawInput);
  const precision = resolvePrecision(input);
  const solar = normalizeBirthDate(input);
  const lunar = solarToLunar(solar);
  const detail = calculateFourPillars({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    isLunar: input.calendar === 'lunar',
    isLeapMonth: input.isLeap,
    trueSolarTime: precision.trueSolarTime,
    dayBoundary: precision.dayBoundary,
    gender: input.gender
  });

  const pillars = {
    year: detail.year,
    month: detail.month,
    day: detail.day,
    hour: detail.hour
  };
  const pillarStrings = {
    year: pillarString(pillars.year),
    month: pillarString(pillars.month),
    day: pillarString(pillars.day),
    hour: pillarString(pillars.hour)
  };
  const branches = PILLAR_KEYS.map((key)=>pillars[key].earthlyBranch);

  return {
    input,
    solar,
    lunar,
    pillars,
    pillarStrings,
    dayMaster: pillars.day.heavenlyStem,
    elements: weightedElementScores(pillars),
    roles: weightedRoleScores(pillars),
    tenGods: detail.tenGods,
    voidBranches: detail.voidBranches || [],
    relations: detectBranchRelations(branches),
    luck: detail.luckPillars || null,
    basis: {
      timezone: 'Asia/Seoul',
      location: precision.locationLabel,
      longitude: precision.longitude,
      dayBoundary: DAY_BOUNDARY_LABELS[precision.dayBoundary],
      trueSolarTime: precision.enabled ? '적용' : '미적용',
      equationOfTime: precision.enabled ? '적용' : '미적용',
      historicalDst: precision.enabled ? 'IANA Asia/Seoul 기준 적용' : '미적용',
      calendarEngine: 'manseryeok 2.0 · KASI 정본/정밀 절기 기반'
    }
  };
}

export function calculateYearFlow(chart, year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new RangeError('세운 연도는 1900~2100 범위여야 합니다.');
  const annual = calculateFourPillars({year,month:3,day:1,hour:12,minute:0,gender:chart.input.gender,dayBoundary:'midnight'});
  const pillar = annual.year;
  const tenGod = getTenGod(chart.dayMaster,pillar.heavenlyStem);
  const relations = detectBranchRelations([
    ...PILLAR_KEYS.map((key)=>chart.pillars[key].earthlyBranch),
    pillar.earthlyBranch
  ]).filter((r)=>r.members.includes(pillar.earthlyBranch));
  return {year,pillar,korean:pillarString(pillar),tenGod,group:TEN_GOD_GROUP[tenGod],relations};
}

export function calculateYearFlows(chart, startYear = new Date().getFullYear(), count = 8) {
  return Array.from({length:count},(_,index)=>calculateYearFlow(chart,startYear+index));
}

function kstDateTimeParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone:'Asia/Seoul',
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part)=>[part.type,part.value]));
  return {
    year:Number(value.year), month:Number(value.month), day:Number(value.day),
    hour:Number(value.hour), minute:Number(value.minute)
  };
}

function monthBoundary(year, sajuMonth) {
  if (sajuMonth <= 11) return getSolarTerm(year, sajuMonth * 2).date;
  return getSolarTerm(year + 1, 0).date;
}

function nextMonthBoundary(year, sajuMonth) {
  if (sajuMonth <= 10) return getSolarTerm(year, (sajuMonth + 1) * 2).date;
  if (sajuMonth === 11) return getSolarTerm(year + 1, 0).date;
  return getSolarTerm(year + 1, 2).date;
}

export function calculateMonthFlows(chart, year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2099) throw new RangeError('월운 연도는 1900~2099 범위여야 합니다.');
  const months=[];
  for(let sajuMonth=1;sajuMonth<=12;sajuMonth+=1){
    const start=monthBoundary(year,sajuMonth);
    const end=nextMonthBoundary(year,sajuMonth);
    const sample=kstDateTimeParts(new Date(start.getTime()+60_000));
    const detail=calculateFourPillars({
      ...sample,
      gender:chart.input.gender,
      dayBoundary:'midnight'
    });
    const pillar=detail.month;
    const tenGod=getTenGod(chart.dayMaster,pillar.heavenlyStem);
    months.push({
      month:sajuMonth,
      sajuMonth,
      branch:pillar.earthlyBranch,
      start,
      end,
      pillar,
      korean:pillarString(pillar),
      tenGod,
      group:TEN_GOD_GROUP[tenGod]
    });
  }
  return months;
}

function kstParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit'
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part)=>[part.type,part.value]));
  return { year:Number(value.year), month:Number(value.month), day:Number(value.day) };
}

export function calculateTodayTimeFlows(chart, now = new Date()) {
  const date = kstParts(now);
  const slots=[
    {hour:1,label:'새벽',range:'00~04시'},
    {hour:5,label:'아침',range:'04~08시'},
    {hour:9,label:'오전',range:'08~12시'},
    {hour:13,label:'오후',range:'12~16시'},
    {hour:17,label:'저녁',range:'16~20시'},
    {hour:21,label:'밤',range:'20~24시'}
  ];
  return slots.map((slot)=>{
    const detail=calculateFourPillars({
      year:date.year,month:date.month,day:date.day,
      hour:slot.hour,minute:0,gender:chart.input.gender,dayBoundary:'midnight'
    });
    const pillar=detail.hour;
    const tenGod=getTenGod(chart.dayMaster,pillar.heavenlyStem);
    const group=TEN_GOD_GROUP[tenGod];
    const relations=detectBranchRelations([
      ...PILLAR_KEYS.map((key)=>chart.pillars[key].earthlyBranch),
      pillar.earthlyBranch
    ]).filter((relation)=>relation.members.includes(pillar.earthlyBranch));
    return {...slot,pillar,korean:pillarString(pillar),tenGod,group,relations};
  });
}

export function calculateTodayFlow(chart, now = new Date()) {
  const date = kstParts(now);
  const detail = calculateFourPillars({
    year:date.year, month:date.month, day:date.day,
    hour:12, minute:0, gender:chart.input.gender, dayBoundary:'midnight'
  });
  const pillar = detail.day;
  const tenGod = getTenGod(chart.dayMaster,pillar.heavenlyStem);
  const group = TEN_GOD_GROUP[tenGod];
  const relations = detectBranchRelations([
    ...PILLAR_KEYS.map((key)=>chart.pillars[key].earthlyBranch),
    pillar.earthlyBranch
  ]).filter((relation)=>relation.members.includes(pillar.earthlyBranch));
  return { date, pillar, korean:pillarString(pillar), tenGod, group, relations };
}
