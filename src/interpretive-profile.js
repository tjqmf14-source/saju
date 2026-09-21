import { getTenGod } from 'manseryeok';
import { HIDDEN_WEIGHTS, stemByName, branchByName } from './data.js';

const PILLARS=['year','month','day','hour'];
const PILLAR_LABEL={year:'연주',month:'월주',day:'일주',hour:'시주'};
const PILLAR_CONTEXT={
  year:'초기 환경·바깥 인상', month:'사회생활·직업 환경', day:'나 자신·가까운 관계', hour:'후반 관심사·결과물'
};
const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
const SEASON_BY_BRANCH={
  인:'봄의 시작',묘:'봄의 중심',진:'봄의 마무리',
  사:'여름의 시작',오:'여름의 중심',미:'여름의 마무리',
  신:'가을의 시작',유:'가을의 중심',술:'가을의 마무리',
  해:'겨울의 시작',자:'겨울의 중심',축:'겨울의 마무리'
};
const GOD_SIMPLE={
  비견:'자기 기준·동료',겁재:'경쟁·독립심',식신:'꾸준한 표현·생산',상관:'표현·문제제기',
  편재:'기회·유동 자원',정재:'안정적 관리·현실성',편관:'압박·도전·통제',정관:'책임·규칙·신뢰',
  편인:'직관·비정형 학습',정인:'학습·보호·문서',일간:'나 자신'
};

function clamp(value,min=0,max=100){return Math.max(min,Math.min(max,value));}
function reverseLookup(map,value){return Object.keys(map).find((key)=>map[key]===value);}
function relationElement(dayElement,other){
  if(dayElement===other) return 'same';
  if(GENERATES[other]===dayElement) return 'resource';
  if(GENERATES[dayElement]===other) return 'output';
  if(CONTROLS[dayElement]===other) return 'wealth';
  if(CONTROLS[other]===dayElement) return 'officer';
  return 'neutral';
}
function godForStem(chart,stem,pillarKey=''){
  return pillarKey==='day' && stem===chart.dayMaster ? '비견' : getTenGod(chart.dayMaster,stem);
}

function tenGodPlacements(chart){
  const score={비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
  const placements=[];
  for(const pillarKey of PILLARS){
    const pillar=chart.pillars[pillarKey];
    const visibleGod=godForStem(chart,pillar.heavenlyStem,pillarKey);
    score[visibleGod]=(score[visibleGod]||0)+1;
    placements.push({
      pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],context:PILLAR_CONTEXT[pillarKey],
      layer:'천간',stem:pillar.heavenlyStem,tenGod:visibleGod,weight:1,simple:GOD_SIMPLE[visibleGod],visible:true
    });
    const branch=branchByName(pillar.earthlyBranch);
    const weights=HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((stem,index)=>{
      const tenGod=godForStem(chart,stem);
      const weight=weights[index];
      score[tenGod]=(score[tenGod]||0)+weight;
      placements.push({
        pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],context:PILLAR_CONTEXT[pillarKey],
        layer:'지장간',stem,tenGod,weight,simple:GOD_SIMPLE[tenGod],visible:false,
        branch:pillar.earthlyBranch,hiddenOrder:index
      });
    });
  }
  const ranking=Object.entries(score).sort((a,b)=>b[1]-a[1]).map(([tenGod,value])=>({
    tenGod,score:Number(value.toFixed(2)),simple:GOD_SIMPLE[tenGod],
    visibleCount:placements.filter((item)=>item.tenGod===tenGod && item.visible).length,
    locations:placements.filter((item)=>item.tenGod===tenGod).map((item)=>`${item.pillarLabel} ${item.layer}`)
  }));
  return {score,placements,ranking};
}

function monthCommandProfile(chart,tenGods){
  const branch=branchByName(chart.pillars.month.earthlyBranch);
  const mainStem=branch.hidden[0];
  const mainGod=godForStem(chart,mainStem);
  const visibleMatches=tenGods.placements.filter((item)=>item.visible && item.tenGod===mainGod && item.pillar!=='day');
  const structureName=`${mainGod} 중심형`;
  const confidence=visibleMatches.length?'높음':'중간';
  return {
    branch:branch.ko,
    element:branch.element,
    season:SEASON_BY_BRANCH[branch.ko]||'계절 전환',
    mainStem,
    tenGod:mainGod,
    simple:GOD_SIMPLE[mainGod],
    exposed:visibleMatches.length>0,
    exposedLocations:visibleMatches.map((item)=>item.pillarLabel),
    structureName,
    confidence,
    text:`월지 ${branch.ko}의 중심 지장간은 ${mainStem}이고, 일간 기준으로는 ${mainGod}(${GOD_SIMPLE[mainGod]}) 성격입니다.`
  };
}

function strengthProfile(chart){
  const dayElement=stemByName(chart.dayMaster).element;
  const resourceElement=reverseLookup(GENERATES,dayElement);
  const outputElement=GENERATES[dayElement];
  const wealthElement=CONTROLS[dayElement];
  const officerElement=reverseLookup(CONTROLS,dayElement);
  const total=Object.values(chart.elements).reduce((a,b)=>a+b,0)||1;
  const support=(chart.elements[dayElement]||0)+(chart.elements[resourceElement]||0);
  const supportShare=support/total;

  const monthBranch=branchByName(chart.pillars.month.earthlyBranch);
  const monthRelation=relationElement(dayElement,monthBranch.element);
  const seasonDelta={same:18,resource:13,output:-8,wealth:-11,officer:-13,neutral:0}[monthRelation]||0;

  const rootWeight={year:5,month:10,day:12,hour:6};
  let rootScore=0;
  const rootReasons=[];
  for(const key of PILLARS){
    const branch=branchByName(chart.pillars[key].earthlyBranch);
    const weights=HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((stem,index)=>{
      if(stemByName(stem).element!==dayElement) return;
      const hiddenWeight=weights[index];
      const exact=stem===chart.dayMaster;
      const value=rootWeight[key]*hiddenWeight+(exact?1.5:0);
      rootScore+=value;
      rootReasons.push(
        `${PILLAR_LABEL[key]} ${branch.ko}의 ${stem}에서 ${dayElement} 기운이 ${index===0?'주기운':'보조기운'}으로 받쳐줍니다`
      );
    });
  }

  let visibleSupport=0;
  const visibleReasons=[];
  for(const key of PILLARS){
    if(key==='day') continue;
    const stem=chart.pillars[key].heavenlyStem;
    const element=stemByName(stem).element;
    const relation=relationElement(dayElement,element);
    const delta={same:5,resource:4,officer:-4,wealth:-3,output:-2,neutral:0}[relation]||0;
    visibleSupport+=delta;
    if(delta!==0) visibleReasons.push(`${PILLAR_LABEL[key]} 천간 ${stem}은 ${relation==='same'||relation==='resource'?'일간을 돕는':'일간의 힘을 쓰게 하는'} 쪽입니다`);
  }

  const rawScore=50+(supportShare-.4)*55+seasonDelta+Math.min(rootScore,20)+visibleSupport;
  const rounded=Math.round(clamp(rawScore));
  const band=rounded>=78?'강한 신강':rounded>=64?'신강':rounded>=55?'다소 신강':rounded>=46?'중화권':rounded>=36?'다소 신약':rounded>=23?'신약':'강한 신약';
  const distance=Math.abs(rounded-50);
  const confidence=distance>=25?'높음':distance>=12?'중간':'낮음';

  const seasonText={
    same:'월지의 계절 기운이 일간과 같은 오행이라 기본 체력을 보탭니다.',
    resource:'월지의 계절 기운이 일간을 생하는 쪽이라 도움을 줍니다.',
    output:'월지에서 일간의 기운이 표현·생산 쪽으로 빠져나가기 쉽습니다.',
    wealth:'월지에서 현실·재성 쪽 요구를 감당하는 힘이 커집니다.',
    officer:'월지에서 일간을 제어하는 책임·규칙 쪽 압력이 커집니다.',
    neutral:'월지의 계절 영향이 일간을 한쪽으로 강하게 밀지는 않습니다.'
  }[monthRelation];

  const helpful=rounded<46
    ? [dayElement,resourceElement]
    : rounded>55
      ? [outputElement,wealthElement,officerElement]
      : [resourceElement,outputElement];

  return {
    score:rounded,band,confidence,dayElement,resourceElement,outputElement,wealthElement,officerElement,
    supportShare:Number((supportShare*100).toFixed(1)),
    month:{branch:monthBranch.ko,element:monthBranch.element,relation:monthRelation,text:seasonText,season:SEASON_BY_BRANCH[monthBranch.ko]},
    rootScore:Number(rootScore.toFixed(1)),rootCount:rootReasons.length,rootReasons,
    visibleSupport,visibleReasons,
    helpfulElements:[...new Set(helpful.filter(Boolean))],
    disclaimer:'신강·신약과 용신 판단은 명리 학파마다 기준 차이가 있습니다. 이 앱은 월령·통근·투간·생조·극설을 수치화해 해석 근거를 일관되게 보여주는 참고 모델입니다.'
  };
}

function relationProfile(chart){
  const branchByPillar=Object.fromEntries(PILLARS.map((key)=>[key,chart.pillars[key].earthlyBranch]));
  const items=(chart.relations||[]).map((relation)=>{
    const pillars=PILLARS.filter((key)=>relation.members.includes(branchByPillar[key]));
    return {
      ...relation,
      pillars,
      pillarLabels:pillars.map((key)=>PILLAR_LABEL[key]),
      contexts:pillars.map((key)=>PILLAR_CONTEXT[key])
    };
  });
  const tension=items.filter((item)=>['충','형','파','해'].includes(item.type));
  const connection=items.filter((item)=>['합','삼합'].includes(item.type));
  return {
    items,tension,connection,
    summary:items.length
      ? `연결 신호 ${connection.length}개, 긴장·변화 신호 ${tension.length}개가 원국에 잡힙니다.`
      : '원국에서 두드러진 합·충·형·파·해 신호는 적습니다.'
  };
}

function pillarProfile(chart,tenGods){
  return PILLARS.map((key)=>{
    const pillar=chart.pillars[key];
    const stemGod=tenGods.placements.find((item)=>item.pillar===key && item.visible)?.tenGod || '비견';
    const branch=branchByName(pillar.earthlyBranch);
    const mainGod=godForStem(chart,branch.hidden[0]);
    return {
      key,label:PILLAR_LABEL[key],context:PILLAR_CONTEXT[key],pillar:chart.pillarStrings[key],
      stemGod,stemSimple:GOD_SIMPLE[stemGod],branchMainGod:mainGod,branchSimple:GOD_SIMPLE[mainGod]
    };
  });
}

export function buildInterpretiveProfile(chart){
  const tenGods=tenGodPlacements(chart);
  const strength=strengthProfile(chart);
  const monthCommand=monthCommandProfile(chart,tenGods);
  const relations=relationProfile(chart);
  const pillars=pillarProfile(chart,tenGods);
  const top=tenGods.ranking.slice(0,3);
  const rootEasy=strength.rootCount
    ? `일간과 같은 기운이 지지 속 ${strength.rootCount}곳에서 받쳐줘, 쉽게 흔들리기만 하는 구조는 아닙니다.`
    : '일간과 같은 기운의 뿌리가 두드러지지 않아 환경의 도움 여부에 따라 체감 차이가 커질 수 있습니다.';
  const easyFacts=[
    `쉽게 말하면, 내 중심의 힘은 ${strength.band} 쪽입니다. 점수는 ${strength.score}점이지만 숫자 자체보다 왜 그렇게 나왔는지가 더 중요합니다.`,
    `${strength.month.text} ${rootEasy}`,
    `생활에서 자주 보이는 십신은 ${top.map((item)=>`${item.tenGod}(${item.simple})`).join(' · ')} 순입니다.`
  ];
  const evidence=[
    `월령: ${monthCommand.season} · ${monthCommand.text}`,
    `통근: ${strength.rootCount}개 신호 · 통근 가중치 ${strength.rootScore}`,
    `천간 도움/소모: ${strength.visibleSupport>=0?'+':''}${strength.visibleSupport}점`,
    `월령 중심 해석: ${monthCommand.structureName} 후보 · ${monthCommand.exposed?'천간에 드러남':'지장간 중심'}`,
    `원국 관계: ${relations.summary}`
  ];
  return {
    strength,
    tenGods,
    monthCommand,
    relations,
    pillars,
    easyFacts,
    evidence,
    balanceHint:`균형 관점에서는 ${strength.helpfulElements.join('·')} 기운을 ‘무조건 좋은 용신’이라고 단정하지 않고, 현재 구조의 과부하를 조절할 후보로 봅니다.`,
    structureHint:`${monthCommand.structureName}을 1차 해석 초점으로 삼되, ${monthCommand.exposed?'월령 중심 십신이 천간에도 드러나 있어 해석 우선도가 높습니다.':'월령 중심 십신이 천간에 직접 드러나지 않아 다른 십신 배치와 함께 봐야 합니다.'}`
  };
}

export const INTERPRETIVE_META={GOD_SIMPLE,PILLAR_LABEL,PILLAR_CONTEXT};
