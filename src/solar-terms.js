import { getSolarTerm, getSolarTermsOfYear } from 'manseryeok';

export const JIE_TERMS = [
  { name:'소한', longitude:285, index:0, branchIndex:1 },
  { name:'입춘', longitude:315, index:2, branchIndex:2 },
  { name:'경칩', longitude:345, index:4, branchIndex:3 },
  { name:'청명', longitude:15, index:6, branchIndex:4 },
  { name:'입하', longitude:45, index:8, branchIndex:5 },
  { name:'망종', longitude:75, index:10, branchIndex:6 },
  { name:'소서', longitude:105, index:12, branchIndex:7 },
  { name:'입추', longitude:135, index:14, branchIndex:8 },
  { name:'백로', longitude:165, index:16, branchIndex:9 },
  { name:'한로', longitude:195, index:18, branchIndex:10 },
  { name:'입동', longitude:225, index:20, branchIndex:11 },
  { name:'대설', longitude:255, index:22, branchIndex:0 }
];

const BY_LONGITUDE = new Map(JIE_TERMS.map((item)=>[item.longitude,item]));
const BY_NAME = new Map(JIE_TERMS.map((item)=>[item.name,item]));

export function getSolarTermDate(year, longitude) {
  const meta = BY_LONGITUDE.get(((longitude%360)+360)%360);
  if (!meta) throw new RangeError('월주 경계용 절기가 아닙니다.');
  return new Date(getSolarTerm(year, meta.index).date);
}

export function getJieBoundariesAround(year) {
  const result=[];
  for(let y=year-1;y<=year+1;y+=1){
    if(y<1900||y>2100) continue;
    for(const term of getSolarTermsOfYear(y)){
      const meta=BY_NAME.get(term.name);
      if(meta) result.push({...meta,year:y,date:new Date(term.date)});
    }
  }
  return result.sort((a,b)=>a.date-b.date);
}

export function toKstEpochMs({year,month,day,hour=0,minute=0}){
  return Date.UTC(year,month-1,day,hour-9,minute,0);
}

export function getPreviousNextJie(parts){
  const target=toKstEpochMs(parts);
  const rows=getJieBoundariesAround(parts.year);
  let previous=null;
  let next=null;
  for(const row of rows){
    if(row.date.getTime()<=target) previous=row;
    else { next=row; break; }
  }
  return {previous,next};
}

export function getMonthBoundaryIndex(parts){
  const {previous}=getPreviousNextJie(parts);
  if(!previous) throw new Error('월주 절기 경계를 찾지 못했습니다.');
  return {branchIndex:previous.branchIndex,term:previous};
}

export function formatKst(date){
  return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
}
