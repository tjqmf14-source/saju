import { getTenGod } from 'manseryeok';
import { HIDDEN_WEIGHTS, stemByName, branchByName } from './data.js';

const PILLARS=['year','month','day','hour'];
const PILLAR_LABEL={year:'연주',month:'월주',day:'일주',hour:'시주'};
const PILLAR_MEANING={
  year:'초기 환경·바깥 배경',
  month:'사회생활·직업 환경',
  day:'나 자신·가까운 관계',
  hour:'내면의 계획·후반 관심사'
};
const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
const GOD_SIMPLE={
  비견:'자기 기준·동료',겁재:'경쟁·독립심',식신:'꾸준한 표현·생산',상관:'표현·문제제기',
  편재:'기회·유동 자원',정재:'안정적 관리·현실성',편관:'압박·도전·통제',정관:'책임·규칙·신뢰',
  편인:'직관·비정형 학습',정인:'학습·보호·문서',일간:'나 자신'
};
const GOD_LIFE={
  비견:{
    work:'내 판단권이 있고 결과에 내 이름을 걸 수 있을 때 힘이 잘 납니다.',
    money:'남의 소비 속도보다 내 기준과 예산선을 분명히 정할수록 안정적입니다.',
    relation:'가까워도 각자의 영역을 존중할 때 관계가 편안해집니다.',
    recovery:'혼자 해결하려는 시간을 줄이고 도움을 요청하는 것이 회복에 중요합니다.'
  },
  겁재:{
    work:'경쟁이 있는 환경에서 추진력이 커지지만 비교가 과해지면 소모도 빨라집니다.',
    money:'즉흥적인 승부나 관계성 지출보다 손실 한도를 먼저 정하는 편이 좋습니다.',
    relation:'주도권 싸움보다 역할을 분명히 나누면 에너지가 건설적으로 쓰입니다.',
    recovery:'계속 이겨야 한다는 긴장을 내려놓고 경쟁 없는 시간을 확보하는 것이 좋습니다.'
  },
  식신:{
    work:'꾸준히 만들고 개선하는 일에서 실력이 축적되며 결과물이 쌓일수록 강점이 커집니다.',
    money:'기술과 생산성을 반복 가능한 수익 구조로 연결할 때 안정감이 생깁니다.',
    relation:'부드러운 표현과 생활 속 배려를 반복할수록 친밀감이 깊어집니다.',
    recovery:'잘 먹고 자고 쉬는 기본 리듬을 지키는 것이 생각보다 큰 회복 자원입니다.'
  },
  상관:{
    work:'문제점을 발견하고 더 나은 방식을 제안하는 역할에서 존재감이 커질 수 있습니다.',
    money:'새로운 아이디어가 기회가 되지만 감정적으로 큰 결정을 내리는 것은 피하는 편이 좋습니다.',
    relation:'솔직함은 강점이지만 상대가 받아들일 속도까지 고려하면 관계 소모가 줄어듭니다.',
    recovery:'머릿속 비판과 분석을 멈추는 시간, 몸을 쓰는 활동이 과열을 낮추는 데 도움이 됩니다.'
  },
  편재:{
    work:'사람·정보·기회를 빠르게 연결하고 여러 자원을 동시에 다루는 상황에 강점이 있습니다.',
    money:'기회를 보는 눈과 별개로 현금흐름과 손실 한도를 숫자로 관리해야 장점이 살아납니다.',
    relation:'폭넓은 관계에는 익숙하지만 깊은 관계에서는 일정한 관심과 약속이 더 중요합니다.',
    recovery:'일정을 빽빽하게 채우기보다 아무것도 하지 않는 빈 시간을 의도적으로 남겨두는 편이 좋습니다.'
  },
  정재:{
    work:'정해진 자원과 일정 안에서 정확하게 완성하는 능력이 강점으로 이어지기 쉽습니다.',
    money:'수입보다 반복 지출과 저축률을 관리하는 방식이 잘 맞습니다.',
    relation:'약속을 지키고 생활을 함께 맞춰가는 과정에서 신뢰를 느끼기 쉽습니다.',
    recovery:'해야 할 일을 잠시 내려놓아도 괜찮다는 허용이 필요합니다.'
  },
  편관:{
    work:'난도가 높고 책임이 분명한 문제를 돌파할 때 집중력이 크게 올라갈 수 있습니다.',
    money:'압박감이 큰 시기에 만회 심리로 위험을 늘리지 않는 것이 중요합니다.',
    relation:'강한 책임감이 통제로 보이지 않도록 상대의 선택권을 확인하는 습관이 도움이 됩니다.',
    recovery:'긴장 상태를 오래 유지하지 않도록 운동·산책처럼 몸에서 압박을 빼는 시간이 필요합니다.'
  },
  정관:{
    work:'기준과 책임이 명확한 조직에서 신뢰를 쌓고 체계를 관리하는 힘이 잘 드러납니다.',
    money:'규칙적인 관리와 장기 계획을 지킬수록 재정 스트레스가 줄어듭니다.',
    relation:'애매한 관계보다 서로의 약속과 역할이 분명한 관계에서 안정감을 느끼기 쉽습니다.',
    recovery:'잘해야 한다는 기준을 잠시 낮추고 완료 기준을 현실적으로 조정하는 것이 필요합니다.'
  },
  편인:{
    work:'정형화되지 않은 문제를 독특한 관점으로 연결하고 깊게 파고드는 역할에 강점이 있습니다.',
    money:'이해가 충분하지 않은 대상에는 돈보다 먼저 학습 시간을 투자하는 방식이 잘 맞습니다.',
    relation:'혼자 생각을 정리할 시간이 필요하다는 점을 미리 설명하면 오해가 줄어듭니다.',
    recovery:'정보 입력을 줄이고 조용히 생각을 정리하는 시간이 회복에 도움이 됩니다.'
  },
  정인:{
    work:'자료를 정리하고 배우고 가르치며 전문성을 누적하는 과정에서 강점이 커집니다.',
    money:'충분히 조사하고 근거를 확인한 뒤 움직이는 방식이 안정적입니다.',
    relation:'상대의 이야기를 오래 듣고 이해하려는 태도가 관계의 신뢰를 높입니다.',
    recovery:'계속 준비만 하기보다 작은 실행으로 생각을 밖에 꺼내는 것이 정체감을 줄여줍니다.'
  }
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
  const visibleScore={비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
  const hiddenScore={비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
  const placements=[];
  for(const pillarKey of PILLARS){
    const pillar=chart.pillars[pillarKey];
    const visibleGod=pillarKey==='day'?'비견':getTenGod(chart.dayMaster,pillar.heavenlyStem);
    score[visibleGod]=(score[visibleGod]||0)+1;
    visibleScore[visibleGod]=(visibleScore[visibleGod]||0)+1;
    placements.push({
      pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],pillarMeaning:PILLAR_MEANING[pillarKey],
      layer:'천간',stem:pillar.heavenlyStem,tenGod:visibleGod,weight:1,simple:GOD_SIMPLE[visibleGod]
    });
    const branch=branchByName(pillar.earthlyBranch);
    const weights=HIDDEN_WEIGHTS[branch.hidden.length];
    branch.hidden.forEach((stem,index)=>{
      const tenGod=getTenGod(chart.dayMaster,stem);
      const weight=weights[index];
      score[tenGod]=(score[tenGod]||0)+weight;
      hiddenScore[tenGod]=(hiddenScore[tenGod]||0)+weight;
      placements.push({
        pillar:pillarKey,pillarLabel:PILLAR_LABEL[pillarKey],pillarMeaning:PILLAR_MEANING[pillarKey],
        layer:'지장간',stem,tenGod,weight,simple:GOD_SIMPLE[tenGod]
      });
    });
  }
  const total=Object.values(score).reduce((a,b)=>a+b,0)||1;
  const ranking=Object.entries(score).sort((a,b)=>b[1]-a[1]).map(([tenGod,value])=>({
    tenGod,score:Number(value.toFixed(2)),share:Number((value/total*100).toFixed(1)),
    visible:Number((visibleScore[tenGod]||0).toFixed(2)),
    hidden:Number((hiddenScore[tenGod]||0).toFixed(2)),
    simple:GOD_SIMPLE[tenGod],
    locations:placements.filter((item)=>item.tenGod===tenGod).map((item)=>`${item.pillarLabel} ${item.layer}`)
  }));
  return {score,visibleScore,hiddenScore,placements,ranking,total};
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
    if(delta!==0) visibleReasons.push(`${PILLAR_LABEL[key]} 천간 ${stem}(${element}) ${delta>0?'보강':'소모'} ${Math.abs(delta)}`);
  }

  const shareDelta=(supportShare-.4)*55;
  const rootDelta=Math.min(rootScore,20);
  const score=clamp(50+shareDelta+seasonDelta+rootDelta+visibleSupport);
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

  const components=[
    {key:'season',label:'월령',delta:seasonDelta,reason:seasonText},
    {key:'roots',label:'통근',delta:rootDelta,reason:rootReasons.length?rootReasons.join(' · '):'일간과 같은 오행의 뚜렷한 통근 신호가 적습니다.'},
    {key:'visible',label:'천간 생극',delta:visibleSupport,reason:visibleReasons.length?visibleReasons.join(' · '):'천간의 보강·소모 신호가 한쪽으로 크게 치우치지 않습니다.'},
    {key:'distribution',label:'생조·극설 분포',delta:Number(shareDelta.toFixed(1)),reason:`일간과 인성 쪽 생조 비중이 전체 오행 가중치의 ${(supportShare*100).toFixed(1)}%입니다.`}
  ];

  return {
    score:rounded,band,confidence,dayElement,resourceElement,outputElement,wealthElement,officerElement,
    supportShare:Number((supportShare*100).toFixed(1)),
    month:{branch:monthBranch.ko,element:monthBranch.element,relation:monthRelation,text:seasonText},
    rootCount:rootReasons.length,rootReasons,visibleReasons,components,
    helpfulElements:[...new Set(helpful.filter(Boolean))],
    disclaimer:'신강·신약은 학파별 판단 차이가 있어 월령·통근·생조·극설을 구조화한 참고 지표로 표시합니다.'
  };
}

function relationSummary(chart){
  const relations=chart.relations||[];
  const supportive=relations.filter((r)=>r.type==='합'||r.type==='삼합');
  const tension=relations.filter((r)=>['충','형','파','해'].includes(r.type));
  return {
    supportive,
    tension,
    plain:supportive.length&&tension.length
      ? '연결되는 힘과 부딪히는 힘이 함께 있어, 상황에 따라 집중력과 긴장감이 번갈아 나타날 수 있습니다.'
      : supportive.length
        ? '원국 안에서 서로 연결되는 신호가 있어 사람·일·환경을 이어 쓰는 힘이 비교적 잘 보입니다.'
        : tension.length
          ? '원국 안에 긴장 신호가 있어 변화가 생길 때 반응이 빠르거나 한 번에 많은 것을 조정하려는 경향이 나타날 수 있습니다.'
          : '원국의 지지 관계는 특정 합이나 충이 과도하게 몰리지 않은 비교적 단순한 편입니다.'
  };
}

function patternProfile(tenGods,strength,chart){
  const top=tenGods.ranking.slice(0,4);
  const score=tenGods.score;
  const pair=(a,b)=>(score[a]||0)+(score[b]||0);
  const flags=[];

  if(pair('식신','상관')>=2.2 && pair('정관','편관')>=1.6){
    flags.push({
      key:'expression-rules',title:'표현력과 규칙이 함께 강한 구조',
      plain:'내 방식으로 더 잘하고 싶은 마음과, 책임·기준을 맞춰야 한다는 압박이 동시에 작동할 수 있습니다.',
      evidence:`식상 ${pair('식신','상관').toFixed(1)} · 관성 ${pair('정관','편관').toFixed(1)}`
    });
  }
  if(pair('식신','상관')>=2 && pair('정재','편재')>=1.5){
    flags.push({
      key:'output-wealth',title:'아이디어를 현실 성과로 연결하는 구조',
      plain:'생각이나 기술을 결과물로 만든 뒤 실제 가치·성과로 연결할 때 만족감이 커지기 쉽습니다.',
      evidence:`식상 ${pair('식신','상관').toFixed(1)} · 재성 ${pair('정재','편재').toFixed(1)}`
    });
  }
  if(pair('정인','편인')>=2.2){
    flags.push({
      key:'resource',title:'생각과 학습이 깊어지는 구조',
      plain:'정보를 충분히 이해하고 자기 식으로 정리한 뒤 움직이는 편이라 준비가 강점이지만, 생각이 길어지면 시작이 늦어질 수 있습니다.',
      evidence:`인성 ${pair('정인','편인').toFixed(1)}`
    });
  }
  if(pair('비견','겁재')>=2.2){
    flags.push({
      key:'peer',title:'자기 기준과 독립성이 강한 구조',
      plain:'남이 정한 답보다 직접 판단하고 책임질 때 힘이 나며, 협업에서는 역할과 결정권을 분명히 할수록 편합니다.',
      evidence:`비겁 ${pair('비견','겁재').toFixed(1)}`
    });
  }
  if(pair('정재','편재')>=2.2){
    flags.push({
      key:'wealth',title:'현실 감각과 자원 관리가 중요한 구조',
      plain:'시간·돈·성과처럼 눈에 보이는 자원을 어떻게 배분하느냐가 생활 만족도에 큰 영향을 줄 수 있습니다.',
      evidence:`재성 ${pair('정재','편재').toFixed(1)}`
    });
  }
  if(pair('정관','편관')>=2.2){
    flags.push({
      key:'officer',title:'책임과 기준을 크게 느끼는 구조',
      plain:'맡은 일을 대충 넘기기보다 기준을 맞추려는 힘이 강하지만, 책임 범위가 불분명하면 긴장도 같이 커질 수 있습니다.',
      evidence:`관성 ${pair('정관','편관').toFixed(1)}`
    });
  }

  if(!flags.length){
    const first=top[0];
    flags.push({
      key:'dominant',title:`${first.tenGod}이 중심을 잡는 구조`,
      plain:`${first.simple}의 성향이 비교적 자주 전면에 나오지만 다른 십신과 함께 작동하므로 한 가지 성격으로 고정해서 볼 필요는 없습니다.`,
      evidence:`${first.tenGod} ${first.score} · ${first.locations.slice(0,2).join('·')}`
    });
  }

  const topVisible=top.find((item)=>item.visible>0) || top[0];
  const topHidden=top.find((item)=>item.hidden>0) || top[0];
  const placementStory={
    headline:`겉에서는 ${topVisible.tenGod}, 안쪽에서는 ${topHidden.tenGod}의 쓰임이 눈에 띕니다.`,
    plain:`천간처럼 밖으로 드러난 자리에서는 ${topVisible.simple}이 보이기 쉽고, 지장간처럼 내부에 깔린 층에서는 ${topHidden.simple}이 반복적으로 작동할 수 있습니다.`
  };

  const relations=relationSummary(chart);
  return {
    flags:flags.slice(0,3),
    placementStory,
    relations,
    strengthTone:strength.band==='중화권'
      ? '한쪽으로 밀기보다 상황에 맞춰 자원을 바꿔 쓰는 것이 중요합니다.'
      : strength.score>50
        ? '이미 가진 힘을 더 키우기보다 표현·성과·책임 쪽으로 적절히 흘려 보내는 것이 균형에 도움이 됩니다.'
        : '무리해서 버티기보다 내 편이 되는 환경·자료·루틴을 먼저 확보하는 것이 균형에 도움이 됩니다.'
  };
}

function lifeLens(tenGods,strength){
  const top=tenGods.ranking.slice(0,3);
  const first=GOD_LIFE[top[0].tenGod];
  const second=GOD_LIFE[top[1]?.tenGod]||first;
  return {
    work:`${first.work} 동시에 ${second.work}`,
    money:`${first.money} 여기에 ${second.money}`,
    relation:`${first.relation} 또 ${second.relation}`,
    recovery:`${first.recovery} 특히 ${strength.score>57?'에너지가 충분할 때 일을 더 늘리기보다 멈출 기준을 정하는 것':'에너지가 떨어질 때 의지로 밀어붙이기보다 회복 자원을 먼저 채우는 것'}이 중요합니다.`
  };
}

export function buildInterpretiveProfile(chart){
  const strength=strengthProfile(chart);
  const tenGods=tenGodPlacements(chart);
  const top=tenGods.ranking.slice(0,3);
  const patterns=patternProfile(tenGods,strength,chart);
  const lens=lifeLens(tenGods,strength);
  const easyFacts=[
    `쉽게 말하면, ${chart.dayMaster} 일간의 기본 힘은 ${strength.band} 쪽에 가깝고 한쪽으로 단정하기보다 월령과 뿌리를 함께 봐야 합니다.`,
    `${strength.month.text}${strength.rootCount? ` 일간이 기대는 뿌리는 ${strength.rootCount}곳 확인됩니다.`:' 뚜렷한 통근 신호는 적은 편입니다.'}`,
    `성향을 만드는 십신은 ${top.map((item)=>`${item.tenGod}(${item.simple})`).join(' · ')} 순으로 두드러집니다.`
  ];
  return {
    strength,
    tenGods,
    patterns,
    lens,
    easyFacts,
    balanceHint:`균형 관점에서 ${strength.helpfulElements.join('·')} 기운은 절대적인 용신으로 단정하지 않고, 과부하를 줄이는 후보로만 참고합니다. ${patterns.strengthTone}`
  };
}

export const INTERPRETIVE_META={GOD_SIMPLE,GOD_LIFE,PILLAR_LABEL,PILLAR_MEANING};
