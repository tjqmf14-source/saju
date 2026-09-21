const CATEGORY_LABELS={overall:'총운',money:'재물',love:'연애',work:'직업',condition:'건강',study:'학업',emotion:'감정'};
const GROUP_AFFINITY={
  비겁:{overall:5,money:-2,love:5,work:4,condition:5,study:2,emotion:3},
  식상:{overall:7,money:5,love:6,work:8,condition:2,study:5,emotion:7},
  재성:{overall:7,money:12,love:5,work:8,condition:0,study:2,emotion:2},
  관성:{overall:6,money:5,love:3,work:12,condition:-2,study:6,emotion:-2},
  인성:{overall:5,money:1,love:4,work:6,condition:10,study:12,emotion:8}
};
const RELATION_EFFECT={합:4,삼합:6,충:-7,형:-5,파:-4,해:-4};

function clamp(value,min=0,max=100){return Math.max(min,Math.min(max,Math.round(value)));}
function labelFor(score){
  if(score>=86)return '매우 좋음';
  if(score>=72)return '좋음';
  if(score>=58)return '무난';
  if(score>=44)return '조절 필요';
  return '신중';
}
function spread(values){return Math.max(...values)-Math.min(...values);}
function relationDelta(relations=[]){return clamp(relations.reduce((sum,item)=>sum+(RELATION_EFFECT[item.type]||0),0),-14,14);}
function natalRoleBonus(chart,category){
  const roles=chart.roles||{};
  const total=Object.values(roles).reduce((a,b)=>a+b,0)||1;
  const map={money:'재성',work:'관성',condition:'인성',study:'인성',love:'비겁',emotion:'인성'};
  const key=map[category];
  if(!key)return 0;
  const share=(roles[key]||0)/total;
  return (share-.2)*18;
}
function reasonFor(category,score,flow,relation,balance){
  const relationText=relation>2?'원국과 오늘 지지의 연결 신호가 보탬이 됩니다.':relation<-2?'원국과 오늘 지지 사이의 긴장 신호가 있어 속도 조절이 필요합니다.':'원국과 오늘의 관계 신호는 비교적 중립적입니다.';
  const balanceText=balance>=0?'오행 분포의 균형도는 오늘 흐름을 무리 없이 쓰는 쪽에 가깝습니다.':'원국의 오행 편중이 있어 에너지 배분을 의식하는 편이 좋습니다.';
  return `${CATEGORY_LABELS[category]} 지수 ${score}점은 오늘의 ${flow.tenGod}(${flow.group}) 흐름과 원국 구조를 함께 반영한 참고값입니다. ${relationText} ${balanceText}`;
}

export function calculateDailyScores(chart,todayFlow){
  const relation=relationDelta(todayFlow.relations);
  const elementSpread=spread(Object.values(chart.elements||{목:0,화:0,토:0,금:0,수:0}));
  const balance=elementSpread<=1?4:elementSpread<=2?1:-4;
  const affinity=GROUP_AFFINITY[todayFlow.group]||GROUP_AFFINITY.인성;
  const individual={};
  for(const category of ['money','love','work','condition','study','emotion']){
    const score=clamp(62+affinity[category]+relation+balance+natalRoleBonus(chart,category));
    individual[category]={score,label:labelFor(score),reason:reasonFor(category,score,todayFlow,relation,balance)};
  }
  const mean=Object.values(individual).reduce((sum,item)=>sum+item.score,0)/6;
  const overallScore=clamp(mean+affinity.overall/2);
  return {
    overall:{score:overallScore,label:labelFor(overallScore),reason:reasonFor('overall',overallScore,todayFlow,relation,balance)},
    money:individual.money,
    love:individual.love,
    work:individual.work,
    condition:individual.condition,
    study:individual.study,
    emotion:individual.emotion
  };
}
