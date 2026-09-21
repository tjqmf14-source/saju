import { getTenGod } from 'manseryeok';
import { HIDDEN_WEIGHTS, TEN_GOD_GROUP, stemByName, branchByName } from './data.js';

const PILLAR_KEYS=['year','month','day','hour'];
const SUPPORTS={목:'수',화:'목',토:'화',금:'토',수:'금'};
const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
const CONTROLLED_BY={목:'금',화:'수',토:'목',금:'화',수:'토'};

const SEASONAL_POWER={
  인:{목:1.8,화:.6,토:.1,금:-.7,수:.2}, 묘:{목:2,화:.7,토:0,금:-.9,수:.1}, 진:{목:.7,화:.3,토:.9,금:-.2,수:.1},
  사:{목:.2,화:1.8,토:.7,금:-.6,수:-.8}, 오:{목:.1,화:2,토:.8,금:-.8,수:-1}, 미:{목:.1,화:.7,토:1.2,금:.1,수:-.5},
  신:{목:-.7,화:-.4,토:.4,금:1.8,수:.7}, 유:{목:-.9,화:-.6,토:.2,금:2,수:.6}, 술:{목:-.4,화:.1,토:1.2,금:.7,수:.1},
  해:{목:.7,화:-.8,토:-.4,금:.2,수:1.8}, 자:{목:.6,화:-1,토:-.5,금:.1,수:2}, 축:{목:.1,화:-.5,토:1,금:.4,수:.8}
};

const TEN_GOD_EASY={
  비견:'내 기준·자기주도',겁재:'경쟁·동료·분배',식신:'꾸준한 표현·생산',상관:'아이디어·비판·돌파',
  편재:'기회·외부 자원',정재:'안정적 성과·관리',편관:'압박·도전·책임',정관:'규칙·신뢰·직업',
  편인:'직감·탐구·독창성',정인:'학습·보호·축적',일간:'나 자신'
};

function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function round1(value){return Math.round(value*10)/10;}

function hiddenWeight(branch,index){
  const weights=HIDDEN_WEIGHTS[branch.hidden.length]||[];
  return weights[index]||0;
}

function detailedTenGodScores(chart){
  const dayMaster=chart.dayMaster;
  const scores={비견:0,겁재:0,식신:0,상관:0,편재:0,정재:0,편관:0,정관:0,편인:0,정인:0};
  const positions=[];
  for(const key of PILLAR_KEYS){
    const pillar=chart.pillars[key];
    if(key!=='day'){
      const god=getTenGod(dayMaster,pillar.heavenlyStem);
      if(scores[god]!==undefined) scores[god]+=1;
      positions.push({pillar:key,layer:'천간',stem:pillar.heavenlyStem,tenGod:god,weight:1});
    }
    const branch=branchByName(pillar.earthlyBranch);
    branch.hidden.forEach((stem,index)=>{
      const god=getTenGod(dayMaster,stem);
      const weight=hiddenWeight(branch,index);
      if(scores[god]!==undefined) scores[god]+=weight;
      positions.push({pillar:key,layer:'지장간',branch:branch.ko,stem,tenGod:god,weight});
    });
  }
  return {
    scores:Object.fromEntries(Object.entries(scores).map(([k,v])=>[k,round1(v)])),
    positions,
    top:Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([name,score])=>({name,score:round1(score),easy:TEN_GOD_EASY[name]}))
  };
}

function strengthAssessment(chart){
  const dm=stemByName(chart.dayMaster);
  const dmElement=dm.element;
  const monthBranch=chart.pillars.month.earthlyBranch;
  const season=SEASONAL_POWER[monthBranch]||{};
  const seasonal=season[dmElement]||0;

  let roots=0, visibleSupport=0, hiddenSupport=0, drain=0, control=0;
  for(const key of PILLAR_KEYS){
    const pillar=chart.pillars[key];
    const stemElement=stemByName(pillar.heavenlyStem).element;
    if(key!=='day'){
      if(stemElement===dmElement || stemElement===SUPPORTS[dmElement]) visibleSupport+=1;
      if(stemElement===GENERATES[dmElement]) drain+=.8;
      if(stemElement===CONTROLS[dmElement] || stemElement===CONTROLLED_BY[dmElement]) control+=.7;
    }
    const branch=branchByName(pillar.earthlyBranch);
    branch.hidden.forEach((stem,index)=>{
      const element=stemByName(stem).element;
      const weight=hiddenWeight(branch,index);
      if(stem===chart.dayMaster) roots+=1.3*weight;
      else if(element===dmElement) roots+=.9*weight;
      if(element===SUPPORTS[dmElement]) hiddenSupport+=.7*weight;
      if(element===GENERATES[dmElement]) drain+=.45*weight;
      if(element===CONTROLS[dmElement] || element===CONTROLLED_BY[dmElement]) control+=.35*weight;
    });
  }

  const score=clamp(50+seasonal*12+roots*8+visibleSupport*5+hiddenSupport*4-drain*4-control*3,15,85);
  let label='중화에 가까움';
  if(score>=72) label='신강이 뚜렷';
  else if(score>=60) label='신강 쪽';
  else if(score<=28) label='신약이 뚜렷';
  else if(score<=40) label='신약 쪽';

  return {
    score:Math.round(score),
    label,
    monthBranch,
    seasonal:round1(seasonal),
    roots:round1(roots),
    visibleSupport:round1(visibleSupport),
    hiddenSupport:round1(hiddenSupport),
    drain:round1(drain),
    control:round1(control),
    evidence:[
      `월지 ${monthBranch}에서 일간 ${chart.dayMaster}의 계절 힘을 ${seasonal>0?'받는':'강하게 받지는 않는'} 편입니다.`,
      roots>1.1?`지지에 일간과 같은 기운의 뿌리가 ${round1(roots)} 수준으로 잡혀 버티는 힘이 있습니다.`:`통근이 아주 강한 편은 아니어서 환경과 운의 영향을 비교적 민감하게 받을 수 있습니다.`,
      visibleSupport+hiddenSupport>drain+control
        ?'나를 돕는 생조 기운이 소모·제어 기운보다 상대적으로 우세합니다.'
        :'생조보다 설기·제어 쪽 작용도 함께 커서 에너지 배분이 중요합니다.'
    ]
  };
}

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

function monthStructure(chart,tenGodDetail){
  const branch=branchByName(chart.pillars.month.earthlyBranch);
  const mainStem=branch.hidden[0];
  const tenGod=getTenGod(chart.dayMaster,mainStem);
  const exposed=tenGodDetail.positions.some((item)=>item.layer==='천간'&&item.stem===mainStem);
  return {
    monthBranch:branch.ko,
    mainStem,
    tenGod,
    group:TEN_GOD_GROUP[tenGod],
    label:`${tenGod} 중심 구조`,
    confidence:exposed?'높음':'중간',
    exposed,
    explanation:exposed
      ?`월지 ${branch.ko}의 중심 지장간 ${mainStem}이 천간에도 드러나 있어 ${tenGod}의 성격이 비교적 선명하게 밖으로 나타납니다.`
      :`월지 ${branch.ko}의 중심 지장간은 ${mainStem}이며 ${tenGod}의 성격이 바탕에 깔리지만, 천간에 직접 드러난 정도는 제한적입니다.`
  };
}

function practicalBalance(chart,strength){
  const dmElement=stemByName(chart.dayMaster).element;
  const same=dmElement;
  const resource=SUPPORTS[dmElement];
  const output=GENERATES[dmElement];
  const wealth=CONTROLS[dmElement];
  const officer=CONTROLLED_BY[dmElement];

  if(strength.score>=60){
    return {
      direction:'강한 자기 기운을 밖으로 쓰는 쪽',
      helpful:[output,wealth,officer],
      cautious:[same,resource],
      note:'신강 쪽에서는 표현·성과·책임처럼 에너지를 실제 결과로 흘려보내는 작용을 우선 참고합니다.'
    };
  }
  if(strength.score<=40){
    return {
      direction:'나를 보완하고 기반을 채우는 쪽',
      helpful:[same,resource],
      cautious:[output,wealth,officer],
      note:'신약 쪽에서는 무리한 소모보다 자기 기반·회복·지원 자원을 먼저 확보하는 작용을 우선 참고합니다.'
    };
  }
  return {
    direction:'한쪽을 과하게 밀지 않는 균형 유지',
    helpful:[same,resource,output,wealth,officer],
    cautious:[],
    note:'중화에 가까워 특정 오행 하나를 절대적인 용신으로 단정하기보다 상황에 따른 균형을 우선 보는 편이 안전합니다.'
  };
}

export function analyzeAdvancedMyeongri(chart){
  const tenGodDetail=detailedTenGodScores(chart);
  const strength=strengthAssessment(chart);
  const structure=monthStructure(chart,tenGodDetail);
  const balance=practicalBalance(chart,strength);
  return {
    strength,
    tenGodDetail,
    structure,
    balance,
    stemRelations:stemRelations(chart),
    branchRelations:chart.relations||[],
    meta:{
      method:'월령·통근·천간/지장간 생조·설기·제어를 함께 반영한 설명형 휴리스틱',
      caution:'전통 명리의 신강·격국·용신 판단은 학파 차이가 있어 단일 절대값이 아니라 근거와 함께 제시합니다.'
    }
  };
}
