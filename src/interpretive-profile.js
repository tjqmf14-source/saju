import { getTenGod } from 'manseryeok';
import { HIDDEN_WEIGHTS, stemByName, branchByName } from './data.js';

const PILLARS=['year','month','day','hour'];
const PILLAR_LABEL={year:'연주',month:'월주',day:'일주',hour:'시주'};
const PILLAR_SCOPE={
  year:'바깥 환경·초기 관계에서 먼저 보이는 모습',
  month:'사회생활·일·현실 적응에서 반복되는 모습',
  day:'나 자신과 가까운 관계에서 드러나는 모습',
  hour:'장기 계획·내면의 욕구·후반부 목표에서 드러나는 모습'
};
const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
const GOD_SIMPLE={
  비견:'자기 기준·동료',겁재:'경쟁·독립심',식신:'꾸준한 표현·생산',상관:'표현·문제제기',
  편재:'기회·유동 자원',정재:'안정적 관리·현실성',편관:'압박·도전·통제',정관:'책임·규칙·신뢰',
  편인:'직관·비정형 학습',정인:'학습·보호·문서',일간:'나 자신'
};
const GOD_PLAIN={
  비견:{easy:'내 기준을 지키고 스스로 결정하려는 힘',when:'혼자 판단하거나 동료와 역할을 나눌 때'},
  겁재:{easy:'경쟁 상황에서 밀리지 않고 주도권을 잡으려는 힘',when:'속도 경쟁·협상·독립적인 선택이 필요할 때'},
  식신:{easy:'생각을 꾸준히 결과물로 만들어 내는 힘',when:'제작·표현·반복 작업을 실제 성과로 쌓을 때'},
  상관:{easy:'불합리한 점을 찾아내고 다른 방식을 제안하는 힘',when:'기획·개선·비판적 검토·창작에서'},
  편재:{easy:'사람과 기회를 넓게 보고 빠르게 자원을 움직이는 힘',when:'영업·프로젝트·변동이 큰 현실 판단에서'},
  정재:{easy:'돈·시간·약속을 안정적으로 관리하려는 힘',when:'예산·일정·생활 기반을 꾸준히 유지할 때'},
  편관:{easy:'압박 속에서도 결정을 내리고 버티는 힘',when:'책임이 크거나 경쟁과 긴장이 높은 상황에서'},
  정관:{easy:'규칙과 책임을 지키며 신뢰를 쌓는 힘',when:'조직·공식 역할·장기 약속을 유지할 때'},
  편인:{easy:'정형화되지 않은 정보를 빠르게 연결하는 힘',when:'새로운 분야·직관적 문제 해결·비정형 학습에서'},
  정인:{easy:'충분히 이해하고 준비한 뒤 안정적으로 움직이는 힘',when:'공부·문서·분석·전문성 축적에서'}
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
      pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],scope:PILLAR_SCOPE[pillarKey],
      layer:'천간',stem:pillar.heavenlyStem,tenGod:visibleGod,weight:1,
      simple:GOD_SIMPLE[visibleGod],plain:GOD_PLAIN[visibleGod]
    });
    const branch=branchByName(pillar.earthlyBranch);
    const weights=HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((stem,index)=>{
      const tenGod=getTenGod(chart.dayMaster,stem);
      const weight=weights[index];
      score[tenGod]=(score[tenGod]||0)+weight;
      placements.push({
        pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],scope:PILLAR_SCOPE[pillarKey],
        layer:'지장간',stem,tenGod,weight,simple:GOD_SIMPLE[tenGod],plain:GOD_PLAIN[tenGod]
      });
    });
  }
  const ranking=Object.entries(score).sort((a,b)=>b[1]-a[1]).map(([tenGod,value])=>{
    const matches=placements.filter((item)=>item.tenGod===tenGod);
    return {
      tenGod,score:Number(value.toFixed(2)),simple:GOD_SIMPLE[tenGod],plain:GOD_PLAIN[tenGod],
      visible:matches.filter((item)=>item.layer==='천간'),
      hidden:matches.filter((item)=>item.layer==='지장간'),
      locations:matches.map((item)=>`${item.pillarLabel} ${item.layer}`)
    };
  });
  return {score,placements,ranking};
}

function placementInsight(item,index){
  const visible=item.visible.map((p)=>p.pillarLabel);
  const hidden=item.hidden.map((p)=>p.pillarLabel);
  const main=item.visible[0]||item.hidden[0];
  const visibility=visible.length
    ? `겉으로 드러나는 천간에 ${visible.join('·')} 위치가 있어 실제 행동에서 비교적 쉽게 보입니다.`
    : `천간보다 지장간(${hidden.join('·')||'원국 내부'})에 있어 처음부터 겉으로 강하게 보이기보다 상황이 만들어질 때 드러날 수 있습니다.`;
  const scope=main?.scope||'여러 생활 영역';
  return {
    rank:index+1,
    tenGod:item.tenGod,
    score:item.score,
    headline:`${item.tenGod} · ${item.plain?.easy||item.simple}`,
    easy:`${item.plain?.easy||item.simple}이 원국에서 ${index===0?'가장':'상대적으로'} 눈에 띕니다.`,
    visibility,
    life:`${scope}에서 특히 체감하기 쉽고, ${item.plain?.when||'실제 선택이 필요한 상황'}에 이 성향이 반복될 가능성이 있습니다.`
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
    const sameHidden=branch.hidden.filter((stem)=>stemByName(stem).element===dayElement);
    if(sameHidden.length){
      const exact=sameHidden.includes(chart.dayMaster);
      const value=rootWeight[key]+(exact?2:0);
      rootScore+=value;
      rootReasons.push(`${PILLAR_LABEL[key]} ${branch.ko}에서 ${dayElement} 기운에 뿌리를 둡니다`);
    }
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
    if(delta!==0) visibleReasons.push(`${PILLAR_LABEL[key]} 천간 ${stem}은 ${relation==='same'?'같은 기운':relation==='resource'?'도움이 되는 인성':relation==='output'?'표현·식상':relation==='wealth'?'재성':relation==='officer'?'관성':'중립'} 쪽으로 작용합니다`);
  }

  const supportDelta=(supportShare-.4)*55;
  const raw=50+supportDelta+seasonDelta+Math.min(rootScore,20)+visibleSupport;
  const score=clamp(raw);
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
    score:rounded,raw:Number(raw.toFixed(2)),band,confidence,dayElement,resourceElement,outputElement,wealthElement,officerElement,
    supportShare:Number((supportShare*100).toFixed(1)),
    month:{branch:monthBranch.ko,element:monthBranch.element,relation:monthRelation,text:seasonText,delta:seasonDelta},
    rootCount:rootReasons.length,rootScore:Math.min(rootScore,20),rootReasons,
    visibleSupport,visibleReasons,
    supportDelta:Number(supportDelta.toFixed(1)),
    helpfulElements:[...new Set(helpful.filter(Boolean))],
    breakdown:[
      {label:'기본점',value:50,plain:'판단을 시작하는 중간값'},
      {label:'생조 비중',value:Number(supportDelta.toFixed(1)),plain:`일간과 인성 계열이 전체 오행에서 ${(supportShare*100).toFixed(1)}%를 차지합니다`},
      {label:'월령',value:seasonDelta,plain:seasonText},
      {label:'통근',value:Math.min(rootScore,20),plain:rootReasons.length?rootReasons.join(' · '):'같은 오행의 뚜렷한 뿌리가 적습니다'},
      {label:'투간·극설',value:visibleSupport,plain:visibleReasons.length?visibleReasons.join(' · '):'천간에서 강한 추가 보정이 적습니다'}
    ],
    disclaimer:'신강·신약은 학파별 판단 차이가 있어 월령·통근·생조·극설을 구조화한 참고 지표로 표시합니다. 점수 자체를 전통 명리의 절대 공식으로 보지 않습니다.'
  };
}

function structureProfile(tenGods){
  const [first,second,third]=tenGods.ranking;
  const gap=Number(((first?.score||0)-(second?.score||0)).toFixed(2));
  const mode=gap>=1.2?'한 축이 선명한 원국':gap<=0.35?'여러 축이 비슷한 복합형 원국':'두세 축이 함께 움직이는 원국';
  return {
    mode,
    gap,
    headline:first?`${first.tenGod}을 중심으로 ${second?.tenGod||first.tenGod}이 함께 작동합니다.`:'십신 분포를 확인합니다.',
    plain:gap>=1.2
      ? '한 가지 반응 방식이 비교적 먼저 나오기 쉬우므로, 강점과 과사용 패턴이 모두 선명할 수 있습니다.'
      : gap<=0.35
        ? '상황에 따라 서로 다른 반응을 꺼내 쓰기 쉬워 한 가지 성격표로 설명하면 실제 체감과 어긋날 수 있습니다.'
        : '주된 성향은 있지만 두 번째·세 번째 성향도 실제 선택에 자주 개입하는 구조입니다.',
    top:[first,second,third].filter(Boolean).map((x)=>x.tenGod)
  };
}

export function buildInterpretiveProfile(chart){
  const strength=strengthProfile(chart);
  const tenGods=tenGodPlacements(chart);
  const top=tenGods.ranking.slice(0,3);
  const placements=top.map(placementInsight);
  const structure=structureProfile(tenGods);
  const stemSignals=(chart.stemRelations||[]);
  const easyFacts=[
    `나는 ${chart.dayMaster} 일간이며, 쉽게 말하면 ${stemByName(chart.dayMaster).yinYang} ${strength.dayElement}의 방식으로 상황을 받아들이는 사람으로 봅니다.`,
    `기운의 버팀 정도는 ${strength.band} 쪽입니다. 이유는 월령·통근·생조 비중을 함께 봤기 때문이며, 참고 점수는 ${strength.score}점입니다.`,
    `성향은 한 가지가 아니라 ${top.map((item)=>`${item.tenGod}(${item.simple})`).join(' · ')} 순으로 겹쳐 있습니다.`,
    stemSignals.length
      ? `천간에서는 ${stemSignals.map((item)=>item.text).join(' · ')} 신호가 있으며, 합화가 실제 성립한다고 단정하지 않고 원국의 연결 포인트로만 봅니다.`
      : '천간에서 두드러진 오합 신호는 확인되지 않아 십신과 지지 관계를 중심으로 읽습니다.'
  ];
  return {
    strength,
    tenGods,
    stemSignals,
    placements,
    structure,
    easyFacts,
    readingOrder:[
      {step:'1',title:'나는 어떤 기운으로 태어났나',body:`일간 ${chart.dayMaster}과 월령을 먼저 봅니다.`},
      {step:'2',title:'그 기운이 버틸 힘이 충분한가',body:`${strength.band} 참고값과 통근·생조를 확인합니다.`},
      {step:'3',title:'생활에서는 어떤 방식으로 쓰이나',body:`${top.map((item)=>item.tenGod).join('·')}의 위치와 역할을 봅니다.`},
      {step:'4',title:'지금 시기와 만나면 무엇이 강조되나',body:'대운·세운·월운에서 원국과 새로 생기는 관계를 겹쳐 봅니다.'}
    ],
    balanceHint:`균형 관점에서 ${strength.helpfulElements.join('·')} 기운을 무조건적인 용신으로 단정하지 않고, 현재 원국의 과부하를 조절하는 후보로 참고합니다.`
  };
}

export const INTERPRETIVE_META={GOD_SIMPLE,GOD_PLAIN,PILLAR_LABEL,PILLAR_SCOPE};
