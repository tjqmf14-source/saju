import {
  calculateFourPillars,
  getTenGod
} from 'manseryeok';
import { normalizeBirthDate, solarToLunar } from './calendar.js';
import {
  HIDDEN_WEIGHTS,
  TEN_GOD_GROUP,
  stemByName,
  branchByName
} from './data.js';

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
    if (branches.filter((b)=>b===self).length >= 2) result.push({type:'형',members:[self,self],text:`${self} ${typeLabel('형')} (자형)`});
  }

  const seen = new Set();
  return result.filter((item) => {
    const key = `${item.type}:${item.members.join('-')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function typeLabel(type){ return type; }

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
    gender: input.gender === 'female' ? 'female' : 'male'
  };
  if (!Number.isInteger(normalized.hour) || normalized.hour < 0 || normalized.hour > 23) throw new RangeError('출생 시각의 시는 0~23이어야 합니다.');
  if (!Number.isInteger(normalized.minute) || normalized.minute < 0 || normalized.minute > 59) throw new RangeError('출생 시각의 분은 0~59여야 합니다.');
  return normalized;
}

export function calculateSaju(rawInput) {
  const input = normalizeInput(rawInput);
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
    dayBoundary: 'midnight',
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
      timezone: 'Asia/Seoul (KST)',
      dayBoundary: '자정(00:00) 기준',
      trueSolarTime: '출생지 미입력 간편형 — 진태양시 보정 미적용',
      calendarEngine: '한국천문연구원(KASI) 기준 데이터 기반'
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

export function calculateMonthFlows(chart, year) {
  const months=[];
  for(let month=1;month<=12;month+=1){
    const detail=calculateFourPillars({year,month,day:15,hour:12,minute:0,gender:chart.input.gender,dayBoundary:'midnight'});
    const pillar=detail.month;
    const tenGod=getTenGod(chart.dayMaster,pillar.heavenlyStem);
    months.push({month,pillar,korean:pillarString(pillar),tenGod,group:TEN_GOD_GROUP[tenGod]});
  }
  return months;
}
