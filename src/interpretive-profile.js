import { getTenGod } from 'manseryeok';
import { HIDDEN_WEIGHTS, stemByName, branchByName } from './data.js';

const PILLARS=['year','month','day','hour'];
const PILLAR_LABEL={year:'연주',month:'월주',day:'일주',hour:'시주'};
const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
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

function tenGodPlacements(chart){
  const score={비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
  const placements=[];
  for(const pillarKey of PILLARS){
    const pillar=chart.pillars[pillarKey];
    const visibleGod=pillarKey==='day'?'비견':getTenGod(chart.dayMaster,pillar.heavenlyStem);
    score[visibleGod]=(score[visibleGod]||0)+1;
    placements.push({
      pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],layer:'천간',stem:pillar.heavenlyStem,
      tenGod:visibleGod,weight:1,simple:GOD_SIMPLE[visibleGod]
    });
    const branch=branchByName(pillar.earthlyBranch);
    const weights=HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((stem,index)=>{
      const tenGod=getTenGod(chart.dayMaster,stem);
      const weight=weights[index];
      score[tenGod]=(score[tenGod]||0)+weight;
      placements.push({
        pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],layer:'지장간',stem,
        tenGod,weight,simple:GOD_SIMPLE[tenGod]
      });
    });
  }
  const ranking=Object.entries(score).sort((a,b)=>b[1]-a[1]).map(([tenGod,value])=>({
    tenGod,score:Number(value.toFixed(2)),simple:GOD_SIMPLE[tenGod],
    locations:placements.filter((item)=>item.tenGod===tenGod).map((item)=>`${item.pillarLabel} ${item.layer}`)
  }));
  return {score,placements,ranking};
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
    const sameHidden=branch.hidden.filter((stem)=>stemByName(stem).element===dayElement);
    if(sameHidden.length){
      const exact=sameHidden.includes(chart.dayMaster);
      const value=rootWeight[key]+(exact?2:0);
      rootScore+=value;
      rootReasons.push(`${PILLAR_LABEL[key]} ${branch.ko}에서 ${dayElement} 기운에 뿌리를 둡니다`);
    }
  }

  let visibleSupport=0;
  for(const key of PILLARS){
    if(key==='day') continue;
    const element=stemByName(chart.pillars[key].heavenlyStem).element;
    const relation=relationElement(dayElement,element);
    if(relation==='same') visibleSupport+=5;
    if(relation==='resource') visibleSupport+=4;
    if(relation==='officer') visibleSupport-=4;
    if(relation==='wealth') visibleSupport-=3;
    if(relation==='output') visibleSupport-=2;
  }

  const score=clamp(50+(supportShare-.4)*55+seasonDelta+Math.min(rootScore,20)+visibleSupport);
  const rounded=Math.round(score);
  const band=rounded>=72?'신강':rounded>=58?'다소 신강':rounded>=43?'중화권':rounded>=28?'다소 신약':'신약';
  const distance=Math.abs(rounded-50);
  const confidence=distance>=22?'높음':distance>=11?'중간':'낮음';

  const seasonText={
    same:'월지의 계절 기운이 일간과 같은 오행이라 힘을 보탭니다.',
    resource:'월지의 계절 기운이 일간을 생하는 쪽이라 도움을 줍니다.',
    output:'월지에서 일간의 기운이 밖으로 빠져나가는 계절 성향이 있습니다.',
    wealth:'월지에서 일간이 감당해야 할 현실·재성 쪽 힘이 커집니다.',
    officer:'월지에서 일간을 제어하는 관성 쪽 힘이 강해집니다.',
    neutral:'월지의 계절 영향은 한쪽으로 강하게 치우치지 않습니다.'
  }[monthRelation];

  const helpful=rounded<43
    ? [dayElement,resourceElement]
    : rounded>57
      ? [outputElement,wealthElement,officerElement]
      : [resourceElement,outputElement];

  return {
    score:rounded,band,confidence,dayElement,resourceElement,outputElement,wealthElement,officerElement,
    supportShare:Number((supportShare*100).toFixed(1)),
    month:{branch:monthBranch.ko,element:monthBranch.element,relation:monthRelation,text:seasonText},
    rootCount:rootReasons.length,rootReasons,
    helpfulElements:[...new Set(helpful.filter(Boolean))],
    disclaimer:'신강·신약은 학파별 판단 차이가 있어 월령·통근·생조·극설을 구조화한 참고 지표로 표시합니다.'
  };
}

export function buildInterpretiveProfile(chart){
  const strength=strengthProfile(chart);
  const tenGods=tenGodPlacements(chart);
  const top=tenGods.ranking.slice(0,3);
  const easyFacts=[
    `일간은 ${chart.dayMaster}(${strength.dayElement})이고, 신강·신약 참고 지표는 ${strength.band} ${strength.score}점입니다.`,
    `${strength.month.text}${strength.rootCount? ` 원국에서 일간과 같은 기운의 통근 신호는 ${strength.rootCount}곳 확인됩니다.`:' 뚜렷한 통근 신호는 적은 편입니다.'}`,
    `십신은 ${top.map((item)=>`${item.tenGod}(${item.simple})`).join(' · ')} 순으로 두드러집니다.`
  ];
  return {
    strength,
    tenGods,
    easyFacts,
    balanceHint:`균형 관점에서 ${strength.helpfulElements.join('·')} 기운을 무조건적인 용신으로 단정하지 않고, 현재 원국의 과부하를 조절하는 후보로 참고합니다.`
  };
}

export const INTERPRETIVE_META={GOD_SIMPLE,PILLAR_LABEL};
