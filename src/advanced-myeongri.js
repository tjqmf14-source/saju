import { getTenGod } from 'manseryeok';
import { branchByName } from './data.js';
import { buildInterpretiveProfile } from './interpretive-profile.js';

const PILLAR_KEYS=['year','month','day','hour'];
const STEM_COMBOS=[['갑','기'],['을','경'],['병','신'],['정','임'],['무','계']];

function stemRelations(chart){
  const stems=PILLAR_KEYS.map((key)=>({pillar:key,stem:chart.pillars[key].heavenlyStem}));
  const result=[];
  for(let i=0;i<stems.length;i+=1){
    for(let j=i+1;j<stems.length;j+=1){
      const pair=[stems[i].stem,stems[j].stem];
      if(STEM_COMBOS.some(([a,b])=>pair.includes(a)&&pair.includes(b))){
        result.push({type:'천간합',members:pair,pillars:[stems[i].pillar,stems[j].pillar]});
      }
    }
  }
  return result;
}

function monthStructure(chart,profile){
  const branch=branchByName(chart.pillars.month.earthlyBranch);
  const mainStem=branch.hidden[0];
  const tenGod=getTenGod(chart.dayMaster,mainStem);
  const exposed=profile.tenGods.placements.some((item)=>item.layer==='천간'&&item.stem===mainStem);
  const visibleSameGod=profile.tenGods.placements.filter((item)=>item.layer==='천간'&&item.tenGod===tenGod).length;
  const confidence=exposed?'높음':visibleSameGod?'중간':'참고';

  return {
    monthBranch:branch.ko,
    mainStem,
    tenGod,
    label:`${tenGod} 중심 구조`,
    confidence,
    exposed,
    explanation:exposed
      ?`월지 ${branch.ko}의 중심 지장간 ${mainStem}이 천간에도 드러나 있어 ${tenGod}의 성격이 비교적 선명하게 밖으로 나타납니다.`
      : visibleSameGod
        ?`월지 ${branch.ko}의 중심 기운은 ${mainStem}·${tenGod}이고, 같은 십신이 다른 천간에도 보여 생활에서 반복될 가능성이 있습니다.`
        : `월지 ${branch.ko}의 중심 지장간은 ${mainStem}이며 ${tenGod}의 성격이 바탕에 깔리지만 천간에 직접 드러난 정도는 제한적입니다.`
  };
}

function flowCrossSignals(chart){
  const relations=chart.relations||[];
  const supportive=relations.filter((item)=>item.type==='합'||item.type==='삼합');
  const tension=relations.filter((item)=>['충','형','파','해'].includes(item.type));
  return {
    supportive,
    tension,
    summary:supportive.length&&tension.length
      ?'연결과 긴장 신호가 함께 있어 상황에 따라 장점과 부담이 교차하는 구조입니다.'
      : supportive.length
        ?'연결 신호가 상대적으로 두드러져 자원을 묶어 쓰는 방식이 중요합니다.'
        : tension.length
          ?'긴장 신호가 상대적으로 두드러져 변화·경계·속도 조절을 중요하게 봅니다.'
          :'합충형파해가 강하게 겹치지 않아 월령과 십신 배치의 비중을 더 크게 봅니다.'
  };
}

export function analyzeAdvancedMyeongri(chart){
  const profile=buildInterpretiveProfile(chart);
  const structure=monthStructure(chart,profile);
  const stems=stemRelations(chart);
  const cross=flowCrossSignals(chart);
  return {
    strength:profile.strength,
    tenGodDetail:{
      scores:profile.tenGods.score,
      positions:profile.tenGods.placements,
      top:profile.tenGods.ranking.slice(0,4)
    },
    structure,
    stemRelations:stems,
    branchRelations:chart.relations||[],
    cross,
    meta:{
      method:'기존 단일 신강·신약 판정에 월령 중심 십신, 10십신 위치, 천간합, 지지 관계를 추가한 설명형 분석',
      caution:'격국·용신은 학파별 조건이 달라 월령 중심 구조와 후보 신뢰도를 먼저 보여주고 단일 절대 판정은 피합니다.'
    }
  };
}
