import { ELEMENT_LABELS, ROLE_LABELS, stemByName } from './data.js';

const ELEMENT_TEXT = {
  목:{gift:'새로운 방향을 만들고 사람과 아이디어를 연결하는 힘',risk:'관심사가 늘어나면 에너지가 여러 갈래로 흩어질 수 있는 점',use:'시작할 일을 한두 개로 줄이고, 성장 과정을 기록으로 남기는 방식'},
  화:{gift:'생각과 감정을 밖으로 드러내고 분위기를 움직이는 힘',risk:'몰입이 강해질수록 속도가 빨라지고 말과 감정이 앞설 수 있는 점',use:'표현할 때와 쉬어갈 때를 나누고, 중요한 결정은 한 번 식힌 뒤 확정하는 방식'},
  토:{gift:'흔들리는 상황에서도 중심을 잡고 현실적인 기반을 만드는 힘',risk:'안정성을 지키려다 변화 시점을 늦추거나 걱정을 오래 붙잡을 수 있는 점',use:'큰 변화보다 작은 루틴을 먼저 바꾸고, 눈에 보이는 기준으로 진행 상황을 확인하는 방식'},
  금:{gift:'복잡한 것을 정리하고 기준을 세워 완성도를 끌어올리는 힘',risk:'기준이 높아질수록 자기검열과 완벽주의가 강해질 수 있는 점',use:'완벽한 결과보다 마감 가능한 기준을 먼저 정하고, 수정은 두 번째 단계로 분리하는 방식'},
  수:{gift:'정보를 깊게 읽고 흐름을 연결해 본질을 찾아내는 힘',risk:'생각이 깊어질수록 실행 시점을 늦추고 혼자 정리하는 시간이 길어질 수 있는 점',use:'생각을 메모로 밖에 꺼내고, 작은 실험을 먼저 실행해 판단 근거를 쌓는 방식'}
};

const ROLE_TEXT = {
  비겁:{core:'자기 기준과 독립성이 삶의 중요한 축이 되는 구조',career:'개인 판단이 존중되는 역할, 리더십, 독립 프로젝트',money:'남의 흐름보다 내 예산과 우선순위를 분명하게 정하는 관리',love:'가까워질수록 각자의 공간과 속도를 존중하는 관계',stress:'혼자 해결하려고 버티다가 피로가 한꺼번에 몰리는 패턴'},
  식상:{core:'표현과 창작, 결과물을 세상 밖으로 꺼내는 힘이 중요한 구조',career:'기획, 디자인, 콘텐츠, 발표, 제작처럼 결과물이 보이는 역할',money:'아이디어나 기술을 실제 가치와 수익으로 연결하는 방식',love:'마음을 말과 행동으로 표현할 때 관계가 살아나는 방식',stress:'표현 에너지를 한꺼번에 쓰고 난 뒤 급격히 지치는 패턴'},
  재성:{core:'현실 감각과 성과, 시간과 돈을 관리하는 능력이 중요한 구조',career:'성과 지표가 분명하고 운영 감각을 발휘할 수 있는 역할',money:'현금 흐름과 반복 비용을 꾸준히 점검하는 방식',love:'말보다 꾸준한 행동과 약속 이행으로 신뢰를 쌓는 방식',stress:'눈앞의 결과와 책임을 너무 많이 챙기느라 여유가 줄어드는 패턴'},
  관성:{core:'책임과 기준, 사회적 역할과 신뢰를 중요하게 여기는 구조',career:'조직 운영, 관리, 전문직, 기준과 책임이 분명한 역할',money:'규칙과 계획을 세우고 장기적으로 안정성을 높이는 방식',love:'약속과 신뢰가 분명할수록 편안해지는 관계',stress:'잘해야 한다는 압박을 스스로 높여 긴장을 오래 유지하는 패턴'},
  인성:{core:'배움과 관찰, 이해와 회복이 삶의 중요한 기반이 되는 구조',career:'연구, 분석, 기록, 교육, 전문성을 깊게 쌓는 역할',money:'정보를 충분히 확인하고 근거가 쌓인 뒤 움직이는 방식',love:'천천히 이해하고 대화를 통해 신뢰를 확인하는 관계',stress:'생각이 많아지며 실행보다 준비와 고민에 오래 머무는 패턴'}
};

function sorted(object){ return Object.entries(object).sort((a,b)=>b[1]-a[1]); }
function strongest(object){ return sorted(object)[0]?.[0]; }
function weakest(object){ return sorted(object).at(-1)?.[0]; }
function relationNames(chart){ return chart.relations?.length ? [...new Set(chart.relations.map((r)=>r.type))].join('·') : '두드러진 충돌 신호 없음'; }
function section(title, lead, paragraphs){ return {title,lead,paragraphs}; }

function monthDominance(monthFlows){
  const count={비겁:0,식상:0,재성:0,관성:0,인성:0};
  monthFlows.forEach((m)=>{count[m.group]=(count[m.group]||0)+1;});
  return strongest(count);
}

export function buildDetailedInterpretation(chart, mbti, yearFlow, monthFlows){
  const strongElement=strongest(chart.elements);
  const weakElement=weakest(chart.elements);
  const strongRole=strongest(chart.roles);
  const secondRole=sorted(chart.roles)[1]?.[0] || strongRole;
  const element=ELEMENT_TEXT[strongElement];
  const weak=ELEMENT_TEXT[weakElement];
  const role=ROLE_TEXT[strongRole];
  const second=ROLE_TEXT[secondRole];
  const dayStem=stemByName(chart.dayMaster);
  const annual=ROLE_TEXT[yearFlow.group];
  const monthsTop=monthDominance(monthFlows);
  const monthsRole=ROLE_TEXT[monthsTop];
  const relation=relationNames(chart);
  const precisionText=chart.basis?.trueSolarTime==='적용'
    ? `${chart.basis.location} 경도 ${chart.basis.longitude}°를 반영한 진태양시 정밀 보정이 적용되었습니다.`
    : '입력된 한국 표준시를 그대로 사용한 간편 계산 기준입니다.';
  const luckLead=chart.luck
    ? `${chart.luck.forward?'순행':'역행'} 대운으로, 첫 대운은 약 ${chart.luck.startYears}년 ${chart.luck.startMonths}개월 뒤 시작하는 흐름입니다.`
    : '대운 정보는 현재 입력 조건에서 별도로 표시되지 않았습니다.';

  return {
    overview: section('전체 성향 요약', `${ELEMENT_LABELS[strongElement].label} 기운과 ${ROLE_LABELS[strongRole]} 성향이 중심을 이루며, 사주 기반 MBTI는 ${mbti.type}로 나타납니다.`, [
      `이 원국은 ${element.gift}이 비교적 분명하게 드러나는 편입니다. 동시에 ${role.core}가 반복적인 삶의 주제로 작동할 가능성이 있어, 단순히 성격 한두 단어로 설명하기보다 무엇을 선택하고 어떻게 지속하는지가 중요합니다. 사주 기반 MBTI ${mbti.type} 결과는 이런 기질을 익숙한 성향 언어로 번역한 참고 지표입니다.`,
      `${precisionText} 현재 계산 기준은 ${chart.basis.dayBoundary}이며, 명리학에서는 진태양시와 자시 관법에 학파 차이가 있으므로 결과 화면에 계산 기준을 함께 표시합니다. 이 리포트는 계산 사실과 해석을 구분해, 사용자가 어떤 기준으로 결과가 나왔는지 확인할 수 있도록 구성됩니다.`
    ]),
    temperament: section('타고난 기질', `${dayStem.yinYang} ${dayStem.element} 일간을 중심으로 ${ELEMENT_LABELS[strongElement].label} 기운이 강하게 작동합니다.`, [
      `기본적으로 ${element.gift}이 장점으로 나타나기 쉽습니다. 주변에서 보기에는 자기 방식이 분명하고, 익숙한 틀을 그대로 따르기보다 스스로 납득할 수 있는 구조를 만들려는 사람으로 보일 수 있습니다. 이 성향은 환경이 맞을 때 집중력과 추진력으로 이어지지만, 맞지 않는 환경에서는 답답함이나 피로로 느껴질 수 있습니다.`,
      `반대로 ${weakElement} 기운이 상대적으로 약하게 나타나는 만큼 ${weak.risk}을 의식적으로 보완하는 것이 좋습니다. 부족한 요소를 억지로 늘린다는 의미보다, 생활 속에서 ${weak.use}을 습관화하면 전체 성향이 한쪽으로 치우치는 것을 줄이는 데 도움이 됩니다.`
    ]),
    innerOuter: section('겉으로 보이는 모습과 내면', `${ROLE_LABELS[strongRole]}이 겉의 행동을 만들고, ${ROLE_LABELS[secondRole]}이 그 안의 판단 방식에 영향을 주는 조합입니다.`, [
      `겉으로는 ${role.core}가 먼저 보일 수 있습니다. 그래서 다른 사람은 당신을 분명하고 자기 기준이 있는 사람으로 느끼기 쉽지만, 실제 내면에서는 ${second.core}도 함께 움직여 결정을 내리기 전에 생각을 여러 번 정리하거나 관계의 맥락을 세심하게 살피는 순간이 생길 수 있습니다.`,
      `원국의 지지 관계에서는 ${relation} 신호가 확인됩니다. 이런 관계 구조는 반드시 좋고 나쁨을 뜻하지 않고, 같은 사람이 상황에 따라 다른 태도를 보이거나 변화 시점에 긴장과 성장이 동시에 나타날 수 있음을 보여주는 참고 포인트로 보는 편이 적절합니다.`
    ]),
    strengths: section('강점과 잠재력', `${element.gift}과 ${role.core}가 결합될 때 가장 큰 장점이 드러납니다.`, [
      `강점은 단순히 잘하는 기술 하나보다, 복잡한 상황에서 자기 기준을 세우고 결과를 만들어 가는 과정에 있습니다. ${ELEMENT_LABELS[strongElement].keyword}과 ${ROLE_LABELS[strongRole]}이 함께 살아나면 남들이 놓친 문제를 발견하고, 그것을 실제 결과물이나 운영 방식으로 바꾸는 힘이 커질 수 있습니다.`,
      `다만 강점은 과하게 사용할 때 약점처럼 보일 수 있습니다. 특히 ${element.risk}과 ${role.stress}이 겹치면 스스로에게 부담을 크게 줄 수 있으므로, ${element.use}을 통해 속도를 조절하는 것이 장점을 오래 유지하는 방법입니다.`
    ]),
    career: section('일·직업·재능', `${role.career}에서 강점이 살아나기 쉽고, ${second.career}도 보조 재능으로 활용할 수 있습니다.`, [
      `직업에서는 단순 반복보다 판단권과 개선 여지가 있는 일이 잘 맞는 편입니다. ${role.career}처럼 내가 가진 기준과 경험을 실제 결정에 반영할 수 있을 때 몰입도가 높아지며, 결과를 축적할수록 주변의 신뢰도 함께 커질 가능성이 있습니다.`,
      `반대로 권한은 적고 책임만 과도하게 큰 환경에서는 피로가 빠르게 쌓일 수 있습니다. 잘 맞는 일을 고를 때 직무명만 보기보다 얼마나 자율적으로 판단할 수 있는지, 전문성을 축적할 수 있는지, 완성된 결과를 확인할 수 있는지를 함께 보는 것이 중요합니다.`
    ]),
    money: section('돈과 현실 감각', `${role.money}이 기본적인 재정 관리 스타일과 잘 맞습니다.`, [
      `재물운은 큰돈이 들어온다는 식의 단정적 예측보다 돈을 다루는 습관과 선택 방식으로 보는 편이 현실적입니다. 이 원국은 ${role.money}이 안정감을 높이는 방식이며, 수입이 늘어날 때도 반복 지출과 고정비를 먼저 정리하면 체감되는 여유가 커질 수 있습니다.`,
      `올해는 ${annual.money} 흐름이 겹칩니다. 따라서 투자나 큰 소비처럼 결과 변동이 큰 선택은 사주 해석만으로 결정하지 말고 실제 수치와 위험을 먼저 확인해야 합니다. 사주는 우선순위를 돌아보는 참고 자료로 활용하는 것이 적절합니다.`
    ]),
    love: section('연애와 가까운 관계', `${role.love}이 자연스러운 관계 방식으로 나타나기 쉽습니다.`, [
      `연애에서는 상대와 가까워질수록 자신의 기본 성향이 더 분명하게 드러나는 편입니다. ${role.love}이 편안한 관계를 만드는 데 도움이 되며, 상대가 내 마음을 알아서 이해해 주길 기다리기보다 기대와 불편을 짧게라도 말로 표현하는 것이 오해를 줄이는 데 효과적입니다.`,
      `올해 관계 흐름은 ${annual.love} 쪽에 초점이 있습니다. 새로운 만남이든 기존 관계든 결과를 서두르기보다 실제 행동과 대화가 꾸준히 맞는지를 보는 편이 좋습니다. 궁합이나 사주 결과는 상대를 단정하는 기준이 아니라 관계를 이해하는 질문으로 활용해야 합니다.`
    ]),
    relationships: section('인간관계와 사회적 역할', `${ROLE_LABELS[strongRole]}이 강해 관계에서도 역할과 경계가 분명할수록 편안함을 느끼기 쉽습니다.`, [
      `사람을 많이 만나는 것 자체보다 어떤 관계에서 내가 어떤 역할을 맡는지가 중요합니다. ${role.core} 때문에 책임이 분명한 관계에서는 신뢰를 얻기 쉽지만, 역할이 애매하거나 감정 노동이 반복되면 생각보다 빠르게 에너지가 소모될 수 있습니다.`,
      `관계 신호인 ${relation}은 변화와 조율이 필요한 순간을 알려주는 참고값입니다. 갈등이 생길 때 누가 맞는지를 먼저 정하기보다 기대와 역할을 구체적으로 나누면 원국의 긴장 요소를 현실적인 협업 능력으로 바꾸는 데 도움이 됩니다.`
    ]),
    recovery: section('스트레스 패턴과 회복 방식', `${role.stress}이 대표적인 과부하 패턴으로 나타날 수 있습니다.`, [
      `스트레스가 쌓일 때는 ${role.stress}이 반복될 수 있습니다. 이때 문제를 더 많이 생각하는 것만으로는 회복이 늦어질 수 있으므로, ${weak.use}처럼 몸과 일정에 직접 변화를 주는 작은 행동을 먼저 넣는 편이 효과적입니다.`,
      `건강 관련 해석은 질병이나 체질을 진단하는 정보가 아닙니다. 실제 증상이 있거나 컨디션 변화가 지속되면 사주 해석보다 의료적 평가와 생활 기록을 우선하고, 이 리포트는 휴식과 생활 리듬을 점검하는 참고 자료로만 활용하는 것이 적절합니다.`
    ]),
    year: section('올해의 핵심 흐름', `${yearFlow.year}년은 ${ROLE_LABELS[yearFlow.group]} 주제가 커지는 해로 읽힙니다.`, [
      `올해의 세운에서는 ${annual.core}가 강조됩니다. 따라서 ${annual.career}과 연결된 선택에서 체감이 커질 수 있으며, 반대로 ${annual.stress}이 반복되면 중요한 일과 그렇지 않은 일을 다시 구분할 필요가 있습니다.`,
      `월별 흐름을 묶어보면 ${ROLE_LABELS[monthsTop]}이 가장 자주 나타납니다. 즉 한 해 전체를 하나의 좋고 나쁨으로 판단하기보다, ${monthsRole.core}가 필요한 달과 쉬어가야 할 달을 나누어 보는 방식이 더 실용적입니다.`
    ]),
    luck: section('대운의 큰 전환점', luckLead, [
      `대운은 10년 단위로 삶의 배경 주제가 바뀌는 흐름을 설명하는 전통 명리 개념입니다. 실제 사건을 미리 확정하는 예언이 아니라, 특정 시기에 어떤 역할과 관계, 일의 주제가 커질 수 있는지 보는 장기 프레임으로 활용하는 편이 적절합니다.`,
      `현재 대운을 볼 때는 세운과 월운을 따로 떼어 해석하기보다 원국과 함께 겹쳐 봐야 합니다. 큰 방향은 대운이 만들고, 그 안에서 해마다 강조점이 달라진다고 이해하면 좋으며, 현실의 선택과 환경 변화가 언제나 사주 결과보다 우선합니다.`
    ])
  };
}

export function buildInterpretation(chart, mbti) {
  const topElement=strongest(chart.elements);
  const topRole=strongest(chart.roles);
  return [
    {title:'핵심 성향',text:`${ROLE_LABELS[topRole]} 성향이 가장 두드러집니다. ${ROLE_TEXT[topRole].core}입니다.`},
    {title:'오행 중심',text:`${topElement}(${ELEMENT_LABELS[topElement].label}) 기운의 비중이 가장 큽니다. ${ELEMENT_TEXT[topElement].gift}이 장점으로 나타나기 쉽습니다.`},
    {title:'성향 MBTI',text:`사주 기반 변환 결과는 ${mbti.type}입니다. 정식 MBTI 검사 결과와 다를 수 있으므로 성향을 설명하는 보조 언어로만 사용합니다.`}
  ];
}
