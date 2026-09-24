import { ELEMENT_LABELS, ROLE_LABELS, stemByName } from './data.js';
import { buildInterpretiveProfile } from './interpretive-profile.js';

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

function balanceIndex(chart){
  const values=Object.values(chart.elements);
  const max=Math.max(...values);
  const min=Math.min(...values);
  const spread=max-min;
  if(spread<=0.7) return '균형형';
  if(spread<=1.5) return '약간 편중';
  return '편중이 뚜렷';
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
  const balance=balanceIndex(chart);
  const profile=buildInterpretiveProfile(chart,yearFlow,monthFlows);
  const precisionText=chart.basis?.trueSolarTime==='적용'
    ? `${chart.basis.location} 경도 ${chart.basis.longitude}°를 반영한 진태양시 정밀 보정이 적용되었습니다.`
    : '입력된 한국 표준시를 그대로 사용한 간편 계산 기준입니다.';
  const luckLead=chart.luck
    ? `${chart.luck.forward?'순행':'역행'} 대운으로, 첫 대운은 약 ${chart.luck.startYears}년 ${chart.luck.startMonths}개월 뒤 시작하는 흐름입니다.`
    : '대운 정보는 현재 입력 조건에서 별도로 표시되지 않았습니다.';

  const report = {
    overview: section(
      '전체 성향 요약',
      `${dayStem.yinYang} ${dayStem.element} 일간을 중심으로 ${ELEMENT_LABELS[strongElement].label} 기운과 ${ROLE_LABELS[strongRole]} 성향이 함께 중심을 잡는 구조입니다.`,
      [
        `한 문장으로 정리하면, ${element.gift}이 장점으로 나타나고 ${role.core}입니다. 한 가지 성격표처럼 고정해서 보기보다는, 어떤 상황에서 힘을 얻고 어떤 환경에서 피로가 커지는지를 함께 보는 편이 더 정확합니다. ${strongElement} 기운이 상대적으로 선명해 ${element.gift}이 자연스러운 강점이 되기 쉽고, 중요한 선택 앞에서는 ${ROLE_LABELS[strongRole]}의 기준이 반복해서 작동할 가능성이 큽니다. 사주 기반 성향 MBTI는 ${mbti.type}로 환산되지만, 정식 심리검사가 아니라 원국의 분포를 익숙한 언어로 풀어낸 보조 지표입니다.`,
        `다른 사람에게는 ${ROLE_LABELS[strongRole]} 성향이 먼저 보이지만, 판단의 안쪽에서는 ${ROLE_LABELS[secondRole]} 성향도 함께 작동합니다. 그래서 스스로는 충분히 고민한 뒤 결정했다고 느끼는데, 주변에서는 결론이 분명하고 자기 기준이 강한 사람으로 받아들일 수 있습니다. 이 두 층을 알고 나면 ‘어떤 일에는 과감한데 왜 어떤 일에는 오래 생각할까’ 같은 차이도 모순이 아니라 상황에 따라 다른 자원을 꺼내 쓰는 과정으로 이해할 수 있습니다.`,
        `현재 리포트는 ${precisionText} 원국의 계산값과 해석 문장을 분리해 보여주며, 올해 흐름에서는 ${ROLE_LABELS[yearFlow.group]}의 주제가 조금 더 크게 들어옵니다. 사주는 미래를 확정하는 예언이라기보다 타고난 경향과 시기별로 반복되는 질문을 정리하는 틀에 가깝습니다. 따라서 결과를 맞고 틀림으로만 보기보다, 실제 생활에서 반복되는 패턴과 대조하면서 자신에게 맞는 부분을 선별해 활용하는 방식이 가장 현실적입니다.`
      ]
    ),
    temperament: section(
      '타고난 기질',
      `일간은 ${dayStem.yinYang} ${dayStem.element}이며, 가중 오행 구성에서는 ${ELEMENT_LABELS[strongElement].label} 기운이 가장 두드러집니다.`,
      [
        `기본 기질에서는 ${element.gift}이 자연스럽게 드러나는 편입니다. 익숙한 방식이더라도 스스로 납득되지 않으면 그대로 따르기보다 구조를 다시 살피고, 한 번 방향을 잡으면 자기 방식으로 완성도를 높이려는 힘이 있습니다. 이런 성향은 환경이 맞을 때 집중력과 전문성으로 연결되지만, 내 기준을 충분히 쓸 수 없는 상황에서는 생각보다 빠르게 답답함이나 소진으로 나타날 수 있습니다.`,
        `상대적으로 약하게 잡히는 ${weakElement} 기운은 ‘없는 성격’이라기보다 의식적으로 챙기지 않으면 뒤로 밀리기 쉬운 생활 태도에 가깝습니다. 특히 ${weak.risk}이 반복된다면 단순히 의지를 더 강하게 쓰는 것보다 ${weak.use}을 생활 속 장치로 만들어 두는 편이 효과적입니다. 부족한 오행을 물건이나 색으로 채운다는 식보다 실제 행동 패턴을 조정하는 쪽이 이 리포트의 해석 원칙과도 맞습니다.`,
        `중요한 것은 강한 기운을 줄이고 약한 기운을 억지로 늘리는 것이 아닙니다. 강점이 지나치게 사용될 때 생기는 부작용을 알아차리고, 반대편의 태도를 필요할 때 꺼내 쓸 수 있게 만드는 것이 핵심입니다. 그렇게 보면 사주는 성격을 가두는 설명이 아니라 자신의 에너지를 어디에 얼마나 쓰는지 조절하는 지도에 더 가깝습니다.`
      ]
    ),
    innerOuter: section(
      '겉으로 보이는 모습과 내면',
      `${ROLE_LABELS[strongRole]}이 행동의 앞면을 만들고, ${ROLE_LABELS[secondRole]}이 판단의 안쪽에서 보조하는 조합입니다.`,
      [
        `다른 사람에게는 ${ROLE_LABELS[strongRole]} 성향이 먼저 보일 가능성이 큽니다. 책임감이 분명하거나 자기 의견이 또렷한 사람으로 인식되기 쉽지만, 실제 판단에는 ${ROLE_LABELS[secondRole]} 성향도 함께 작동합니다. 결정을 내리기 전 여러 경우의 수를 비교하거나 관계의 맥락을 살피는 시간이 필요한 이유입니다. 겉과 속이 다르다기보다, 외부에서는 결론만 보이고 그 결론에 이르기까지의 긴 과정은 잘 보이지 않는 셈입니다.`,
        `원국의 지지 관계에서는 ${relation} 신호가 확인됩니다. 합·충·형·파·해 같은 관계는 그 자체로 좋고 나쁨을 판정하는 점수가 아니라, 특정 관계나 변화 국면에서 에너지가 연결되거나 긴장이 생기는 방식을 설명하는 자료입니다. 실제 사건을 미리 단정하기보다 ‘이런 상황에서 나는 어떤 방식으로 반응하는가’를 점검하는 단서로 보는 편이 적절합니다.`
      ]
    ),
    strengths: section(
      '강점과 잠재력',
      `${element.gift}과 ${role.core}가 함께 작동할 때 가장 선명한 강점이 나옵니다.`,
      [
        `이 사주의 강점은 단순히 한 가지 재능을 잘한다는 데 있기보다, 복잡한 상황에서 자신만의 기준을 만들고 그것을 실제 결과로 연결하는 과정에 있습니다. ${ELEMENT_LABELS[strongElement].keyword}의 특성과 ${ROLE_LABELS[strongRole]} 성향이 동시에 살아나면 남들이 그냥 지나치는 문제를 구조적으로 바라보고, 필요한 순서를 정해 끝까지 다듬는 힘이 커질 수 있습니다.`,
        `특히 익숙하지 않은 문제를 만났을 때 처음부터 완벽한 답을 찾기보다 핵심 원리를 파악하고 자기 방식으로 재구성하는 능력이 장점이 되기 쉽습니다. 전문성이 쌓일수록 단순 실행자보다 방향을 설계하거나 품질 기준을 잡는 역할에서 강점이 더 잘 드러날 수 있으며, 결과물이 축적될수록 스스로의 기준도 한층 안정될 가능성이 있습니다.`,
        `다만 강점은 과하게 사용하면 가장 먼저 피로의 원인이 되기도 합니다. ${element.risk}과 ${role.stress}이 한꺼번에 나타나는 시기에는 ‘조금 더 하면 해결된다’는 방식으로 버티기보다 ${element.use}을 의도적으로 끼워 넣어야 합니다. 오래 가는 강점은 강도를 계속 높이는 힘보다 필요할 때 멈추고 다시 정렬할 수 있는 능력에서 만들어집니다.`
      ]
    ),
    balance: section(
      '오행 균형과 신강·신약 참고',
      `가중 오행 구성 지표는 ${balance}으로 나타나며 ${strongElement}이 상대적으로 높고 ${weakElement}이 낮습니다. 이 값만으로 신강·신약을 확정하지는 않습니다.`,
      [
        `화면의 오행 수치는 천간과 지지의 지장간을 일정한 가중치로 합산해 ‘구성 비중’을 비교하기 위한 지표입니다. 이 숫자는 원국을 빠르게 이해하기에는 유용하지만, 전통 명리에서 말하는 신강·신약이나 용신을 그대로 계산한 절대 점수는 아닙니다. 실제 신강·신약 판단에는 월령, 통근, 투간, 계절의 왕쇠와 생극제화 등 여러 층을 함께 살피며 학파에 따라 판단 기준도 달라질 수 있습니다.`,
        `따라서 ${strongElement}이 높다는 이유만으로 그 기운이 무조건 과다하거나 나쁘다고 보지 않습니다. 현실적으로는 ${element.gift}이 자주 사용되는 장점으로 나타날 수 있고, 반대로 피로가 쌓였을 때는 ${element.risk}이 함께 나타나는지를 확인하는 방식이 더 유용합니다. 숫자를 운세의 좋고 나쁨으로 읽기보다 자신의 행동 패턴을 관찰하는 기준으로 사용하는 것이 안전합니다.`,
        `${weakElement} 쪽은 ${weak.use}처럼 생활 속 행동으로 보완해 볼 수 있습니다. 이것은 전통적인 개운법을 사실처럼 제시하는 처방이 아니라, 한쪽으로 치우치기 쉬운 행동 습관에 다른 선택지를 추가하는 실용적 제안입니다. 실제 삶에서 이미 잘하고 있는 부분이 있다면 수치보다 그 경험을 우선해 해석하세요.`
      ]
    ),
    career: section(
      '일·직업·재능',
      `${role.career}에서 중심 강점이 살아나기 쉽고, ${second.career}도 보조 재능으로 연결될 수 있습니다.`,
      [
        `일에서는 직무 이름 자체보다 ‘얼마나 내 판단을 쓸 수 있는가’가 만족도를 크게 좌우할 가능성이 있습니다. ${role.career}처럼 자신의 기준과 경험을 실제 결정에 반영할 수 있을 때 몰입이 깊어지고, 단순히 주어진 일을 처리하는 것보다 더 나은 방식을 찾고 결과의 품질을 높이는 과정에서 성취감을 느끼기 쉽습니다.`,
        `또 하나의 포인트는 ${second.career}입니다. 주된 강점과 이 보조 성향이 함께 쓰이면 한쪽은 방향을 잡고 다른 한쪽은 내용을 채우는 식의 시너지가 생길 수 있습니다. 그래서 한 가지 기술만 반복하는 자리보다 기획과 실행, 분석과 제작처럼 서로 다른 층을 연결하는 업무에서 자신의 폭을 더 크게 느낄 가능성이 있습니다.`,
        `반대로 권한은 거의 없는데 결과 책임만 크거나, 기준이 계속 바뀌는데 설명 없이 따라야 하는 환경에서는 피로가 누적되기 쉽습니다. 직업을 고를 때는 업종이나 직함만 보지 말고 자율성, 전문성의 축적 가능성, 결과를 확인할 수 있는 구조, 피드백의 질을 함께 보는 것이 좋습니다. 이런 조건이 맞을수록 사주에서 보이는 장점을 실제 커리어 자산으로 바꾸기 수월합니다.`
      ]
    ),
    money: section(
      '돈과 현실 감각',
      `기본 재정 원칙은 ‘${role.money}’에 가깝습니다. 올해는 ‘${annual.money}’도 함께 점검할 주제입니다.`,
      [
        `재물운을 ‘큰돈이 들어온다’는 식으로 단정하기보다 돈을 다루는 습관과 선택 구조로 보면 특징이 더 분명해집니다. 재정적인 안정감을 높이는 원칙은 다음과 같습니다. ${role.money}. 수입의 크기만 보기보다 내가 통제할 수 있는 반복 지출과 고정비, 선택 기준을 먼저 정리할 때 재정적인 여유도 선명해지기 쉽습니다.`,
        `올해의 재정 키워드는 ‘${annual.money}’입니다. 돈과 관련된 결정에서는 속도보다 근거를 우선하세요. 투자, 대출, 큰 소비처럼 변동 폭이 큰 선택은 사주 문장 하나로 결정하지 말고 실제 수치와 손실 가능성, 현금 흐름을 먼저 확인해야 합니다. 사주가 할 수 있는 역할은 ‘지금 어떤 태도를 점검할 것인가’를 알려주는 데까지입니다.`,
        `특히 좋은 흐름이라는 표현을 ‘위험을 더 감수해도 된다’는 뜻으로 바꾸지 않는 것이 중요합니다. 반대로 조심하라는 흐름 역시 아무것도 하지 말라는 뜻은 아닙니다. 숫자를 확인하고 한도를 정한 뒤 움직이는 습관이 있다면 운세 해석과 무관하게 장기적인 재정 안정에 도움이 됩니다.`
      ]
    ),
    love: section(
      '연애와 가까운 관계',
      `가까운 관계에서 자연스럽게 택하는 방식은 ‘${role.love}’에 가깝습니다. 올해에는 다음 태도가 특히 중요합니다. ${annual.love}.`,
      [
        `가까운 관계에서는 사회생활에서 보이던 모습보다 본래의 속도와 기준이 더 선명하게 드러날 수 있습니다. 편안한 관계를 만드는 방법은 다음과 같습니다. ${role.love}. 다만 마음속 기준이 분명할수록 상대도 그 기준을 당연히 알고 있으리라 생각하기 쉽습니다. 기대와 불편을 짧게라도 말로 확인하는 습관이 관계의 오해를 크게 줄여줍니다.`,
        `올해는 ${annual.love}의 주제가 들어오기 때문에 새로운 만남이든 기존 관계든 ‘말과 실제 행동이 꾸준히 맞는가’를 보는 것이 중요합니다. 한두 번의 강한 감정이나 타이밍보다 반복되는 태도와 약속의 이행이 관계의 질을 더 잘 보여줍니다. 상대의 속도를 지나치게 추측하기보다 확인할 수 있는 대화를 늘리는 편이 좋습니다.`,
        `궁합이나 타로를 포함한 어떤 결과도 상대의 마음을 확정하는 근거가 될 수는 없습니다. 이 리포트는 내가 관계에서 무엇을 중요하게 여기고 어떤 상황에서 방어적이 되기 쉬운지를 이해하는 질문으로 활용하는 것이 적절합니다. 실제 관계의 판단은 두 사람의 대화와 행동, 경계와 합의를 우선하세요.`
      ]
    ),
    relationships: section(
      '인간관계와 사회적 역할',
      `${ROLE_LABELS[strongRole]} 성향이 강해 관계에서도 역할과 경계가 분명할수록 편안함을 느끼기 쉽습니다.`,
      [
        `사람을 많이 만나는가보다 어떤 관계에서 어떤 역할을 맡고 있는지가 더 중요합니다. ${role.core} 때문에 책임이 분명하고 서로 기대하는 바가 명확한 관계에서는 신뢰를 쌓기 쉽지만, 역할이 애매하거나 감정 노동만 반복되는 관계에서는 생각보다 빠르게 에너지가 줄어들 수 있습니다. 친밀함과 무경계는 같은 것이 아니므로 편안한 관계일수록 서로의 몫을 구체적으로 확인하는 편이 좋습니다.`,
        `관계 신호인 ${relation}은 변화와 조율이 필요한 지점을 알려주는 참고값입니다. 갈등이 생겼을 때 누가 맞는지를 먼저 결정하기보다 어떤 기대가 어긋났는지, 책임이 한쪽에 몰렸는지, 말하지 않은 전제가 있었는지를 분리해 보면 원국의 긴장 요소를 현실적인 협업 능력으로 바꾸는 데 도움이 됩니다.`
      ]
    ),
    recovery: section(
      '스트레스 패턴과 회복 방식',
      `${role.stress}이 대표적인 과부하 패턴으로 나타날 수 있으며, 회복에서는 ${weak.use}이 좋은 균형 장치가 됩니다.`,
      [
        `스트레스가 쌓일수록 평소의 장점을 더 강하게 쓰려는 경향이 생길 수 있습니다. 문제를 더 많이 분석하고, 더 완벽하게 정리하고, 혼자 해결하려는 식으로 버티다 보면 오히려 회복 시점이 늦어집니다. 이때는 생각을 더하는 것보다 ${weak.use}처럼 일정이나 환경에 실제 변화를 주는 작은 행동을 먼저 넣는 편이 도움이 될 수 있습니다.`,
        `건강과 관련된 사주 해석은 질병이나 체질을 진단하는 정보가 아닙니다. 컨디션 변화나 통증이 지속된다면 의료적 평가와 실제 생활 기록을 우선해야 하며, 이 부분의 해석은 ‘나는 어떤 상황에서 과부하를 오래 끌고 가는가’를 돌아보는 참고 자료로만 활용하는 것이 적절합니다.`
      ]
    ),
    year: section(
      '올해의 핵심 흐름',
      `${yearFlow.year}년은 원국 위에 ${ROLE_LABELS[yearFlow.group]}의 주제가 겹쳐지는 해로 읽힙니다.`,
      [
        `올해의 세운에서는 ${annual.core}가 상대적으로 강조됩니다. 이것은 특정 사건이 반드시 생긴다는 뜻이 아니라 여러 선택과 상황에서 비슷한 질문이 반복될 가능성이 커진다는 의미에 가깝습니다. 특히 ${annual.career}과 연결되는 장면에서 체감이 커질 수 있으므로, 중요한 결정을 앞두고 있다면 ‘지금 내가 책임져야 할 것과 굳이 떠안을 필요가 없는 것’을 구분해 보는 것이 좋습니다.`,
        `반대로 ${annual.stress}이 반복된다면 운이 나쁘다고 단정하기보다 사용하고 있는 에너지의 방식부터 점검해 보세요. 같은 흐름도 준비가 되어 있을 때는 역할 확장이나 성장의 계기가 되고, 여유가 부족할 때는 부담으로 느껴질 수 있습니다. 세운은 환경의 분위기를 설명하는 자료이지 결과를 대신 결정하는 값은 아닙니다.`,
        `월별 절기 흐름을 묶어보면 ${ROLE_LABELS[monthsTop]}의 주제가 상대적으로 자주 나타납니다. 그래서 한 해 전체를 좋다거나 나쁘다고 하나로 묶기보다 ${monthsRole.core}가 필요한 구간과 속도를 낮춰야 할 구간을 나누어 보는 편이 실용적입니다. 아래 월운은 양력 매월 1일이 아니라 실제 절입 시각을 경계로 표시하므로 달력상의 월과 정확히 일치하지 않을 수 있습니다.`
      ]
    ),
    luck: section(
      '대운의 큰 전환점',
      luckLead,
      [
        `대운은 약 10년 단위로 삶의 배경 주제가 바뀌는 흐름을 설명하는 전통 명리의 장기 프레임입니다. 한 대운 안에서도 사람마다 실제로 겪는 사건은 환경과 선택에 따라 크게 달라지므로 ‘몇 살에 무엇이 반드시 생긴다’는 방식으로 읽기보다, 어느 시기에 어떤 역할·관계·일의 질문이 더 자주 등장할 수 있는지를 보는 편이 적절합니다.`,
        `대운을 볼 때는 원국과 세운을 따로 떼지 않고 겹쳐 보는 것이 중요합니다. 원국이 기본적인 성향과 자원을 보여준다면 대운은 장기적인 배경, 세운은 그 안의 연도별 강조점에 가깝습니다. 실제 이직·투자·관계 같은 중요한 결정은 현실 조건과 검증 가능한 정보를 우선하고, 대운은 장기적인 자기 점검의 시간축으로 활용하세요.`
      ]
    ),
    technical: section(
      '계산 기준과 정확도',
      '달력·절기처럼 계산 가능한 값과, 학파에 따라 달라질 수 있는 명리 해석을 분리해 표시하는 것이 이 사이트의 정확도 원칙입니다.',
      [
        `연주와 월주는 양력 1월 1일이나 매월 1일을 경계로 단순 변경하지 않습니다. 연주의 핵심 경계는 입춘이며, 월운은 입춘·경칩·청명·입하·망종·소서·입추·백로·한로·입동·대설·소한의 실제 절입 시각을 사용합니다. 그래서 절기 경계에 가까운 날짜에서도 양력 15일 같은 대표값을 쓰는 방식보다 계산 기준을 더 명확하게 유지할 수 있습니다.`,
        `${precisionText} 음력과 윤달 변환, 선택한 자시 관법도 계산 입력에 포함됩니다. 다만 출생 시간이 경계에 매우 가까운 경우에는 출생지, 당시 표준시, 채택하는 자시 관법에 따라 다른 만세력과 결과가 달라질 수 있으므로 화면에 사용한 기준을 함께 표시합니다.`,
        `오행·십성 분포와 그에 기반한 성향 문장은 계산된 원국을 이해하기 쉽게 정리한 해석 지표입니다. 특히 오행 가중치는 전통 명리 전체를 하나의 숫자로 환산한 공식이 아니며, 신강·신약·용신처럼 학파별 판단이 필요한 항목을 절대값으로 확정하지 않습니다. 계산 사실, 구조화된 지표, 해석적 제안을 구분해 보여주는 것이 과장된 정확도 표현보다 더 중요한 신뢰 기준입니다.`
      ]
    )
  };

  const topGods=profile.tenGods.ranking.slice(0,3);
  const topGodPlacementText=topGods.map((item)=>`${item.tenGod}: ${item.locations.slice(0,3).join('·') || '원국 내부'}`).join(' / ');
  const rootText=profile.strength.rootReasons.length
    ? profile.strength.rootReasons.join(' · ')
    : '원국에서 일간과 같은 오행의 뚜렷한 통근 신호가 적습니다.';

  report.overview.quick=profile.easyFacts.slice(0,3);
  report.overview.evidence=profile.evidence;
  report.overview.lead=`쉽게 말하면, 이 원국은 ${profile.strength.band} 쪽 힘을 바탕으로 ${topGods[0]?.simple || '자기 기준'}을 가장 자주 쓰는 구조입니다.`;

  report.temperament.quick=[
    `평소에는 ${topGods[0]?.simple || '자기 기준'}이 가장 먼저 드러나고, 그 다음으로 ${topGods[1]?.simple || '다른 보조 성향'}이 따라옵니다.`,
    `그 이유는 ${topGods[0]?.tenGod || '십신'}이 ${topGods[0]?.locations.slice(0,2).join('·') || '원국'}에 반복되고, 월령은 ${profile.monthCommand.tenGod}(${profile.monthCommand.simple}) 쪽이기 때문입니다.`,
    `생활에서는 한 가지 성격으로 고정해서 보기보다 “어떤 상황에서 어떤 반응이 먼저 나오는가”를 보는 편이 더 잘 맞습니다.`
  ];
  report.temperament.evidence=[
    `월령 중심 십신: ${profile.monthCommand.tenGod} · ${profile.monthCommand.structureName} 후보`,
    `상위 십신: ${topGods.map((item)=>`${item.tenGod} ${item.score}`).join(' · ')}`,
    `천간 노출: ${profile.monthCommand.exposed?profile.monthCommand.exposedLocations.join('·'):'월령 중심 십신의 직접 노출 없음'}`
  ];

  report.strengths.quick=[
    `한 줄 요약: 가장 자주 쓰는 힘은 ${topGods[0]?.simple || element.gift}이고, ${topGods[1]?.simple || second.core}이 두 번째 축으로 받쳐줍니다.`,
    `왜 그런가요? ${topGods[0]?.tenGod || '주요 성향'}은 ${topGods[0]?.locations.slice(0,2).join('·') || '원국 여러 위치'}에서 확인되고, 강약 참고값은 ${profile.strength.band} ${profile.strength.score}점입니다.`,
    `생활에서는: ${element.gift}을 강점으로 쓰되, ${element.risk}이 보이기 시작하면 ${weak.use}으로 속도를 조절해보세요.`
  ];
  report.strengths.evidence=[
    `상위 성향: ${topGods.map((item)=>`${item.tenGod} ${item.score}`).join(' · ')}`,
    `주요 위치: ${topGodPlacementText}`,
    `강약 참고: ${profile.strength.band} ${profile.strength.score}점 · ${rootText}`
  ];

  report.balance.title='내 기운은 강한 편일까, 약한 편일까?';
  report.balance.lead=`월령·통근·천간의 도움과 소모를 함께 본 결과, 현재 참고 구간은 ${profile.strength.band} ${profile.strength.score}점입니다.`;
  report.balance.quick=[
    `한 줄 요약: ${profile.strength.band} ${profile.strength.score}점으로, 숫자보다 월령과 통근 이유를 함께 보는 것이 중요합니다.`,
    `왜 그런가요? ${profile.strength.month.text} ${profile.strength.rootCount? `통근 신호가 ${profile.strength.rootCount}곳 있습니다.`:'통근 신호는 적은 편입니다.'}`,
    `생활에서는: ${profile.balanceHint}`
  ];
  report.balance.evidence=[
    ...profile.evidence.slice(0,4),
    `판정 신뢰도: ${profile.strength.confidence} · 같은 원국도 학파에 따라 해석 차이가 날 수 있음`
  ];
  report.balance.paragraphs.unshift(
    `신강·신약은 단순히 오행이 몇 개 많은지를 세는 방식으로 계산하지 않았습니다. 월지의 계절 힘, 각 지지 속 지장간에서 일간이 실제로 뿌리를 얻는 정도, 천간에 드러난 도움과 소모를 따로 가중했습니다. 현재 참고 점수는 ${profile.strength.score}점으로 ${profile.strength.band} 구간이며, 통근 가중치는 ${profile.strength.rootScore}, 천간 도움·소모 값은 ${profile.strength.visibleSupport>=0?'+':''}${profile.strength.visibleSupport}입니다. ${profile.strength.disclaimer}`
  );
  report.balance.paragraphs.unshift(
    `월령을 먼저 보면 ${profile.monthCommand.text} 그래서 ${profile.structureHint} 이것을 ‘격국을 확정했다’는 뜻으로 사용하지 않고, 어떤 십신을 먼저 읽을지 정하는 해석 초점으로 사용합니다.`
  );

  report.career.quick=[
    `한 줄 요약: 일에서는 ${topGods[0]?.simple || '자기 기준'}과 ${topGods[1]?.simple || '보조 성향'}을 함께 쓸 수 있는 환경이 중요합니다.`,
    `왜 그런가요? 상위 십신은 ${topGods.map((item)=>item.tenGod).join(' · ')}이고, 특히 월주와 시주 배치를 함께 읽습니다.`,
    '생활에서는: 직업명을 하나 찍기보다 자율성·책임·표현·관리 중 어떤 조건에서 성과가 나는지 확인하는 것이 더 유용합니다.'
  ];
  report.career.evidence=[
    `상위 성향 배치: ${topGodPlacementText}`,
    `월령 중심: ${profile.monthCommand.tenGod} · ${profile.monthCommand.simple}`,
    `올해 직업·역할 주제: ${yearFlow.tenGod} · ${ROLE_LABELS[yearFlow.group]}`
  ];

  const wealthScore=((profile.tenGods.score.편재||0)+(profile.tenGods.score.정재||0)).toFixed(2);
  report.money.quick=[
    '한 줄 요약: 재물운은 “큰돈이 들어온다”보다 돈을 다루는 습관과 압력이 어디서 생기는지를 보는 쪽에 가깝습니다.',
    `왜 그런가요? 원국에서 편재+정재 가중치는 ${wealthScore}이고, 올해 세운의 십신까지 함께 봅니다.`,
    '생활에서는: 투자·대출·큰 소비는 사주보다 현금흐름과 손실 가능성을 우선하고, 해석은 판단 습관을 점검하는 보조 자료로 쓰세요.'
  ];
  report.money.evidence=[
    `편재+정재 가중치: ${wealthScore}`,
    `올해 세운: ${yearFlow.tenGod} · ${ROLE_LABELS[yearFlow.group]}`,
    `월령 중심: ${profile.monthCommand.tenGod} · 돈의 좋고 나쁨을 확정하는 점수가 아님`
  ];

  report.relationships.quick=[
    `한 줄 요약: 관계에서는 ${topGods[0]?.simple || role.core}이 먼저 드러나고, 역할과 기대가 명확할수록 편안함을 느끼기 쉽습니다.`,
    `왜 그런가요? 원국 관계 신호는 ${profile.relations.summary} 월령 중심은 ${profile.monthCommand.simple}입니다.`,
    '생활에서는: 상대의 마음을 추측하기보다 역할·기대·불편을 짧게 확인하고, 반복되는 행동을 기준으로 관계를 판단하세요.'
  ];
  report.relationships.evidence=profile.relations.items.slice(0,5).map((item)=>`${item.type} · ${item.pillarLabels.join('↔') || item.members.join('·')} · ${item.contexts.join(' / ')}`);
  if(!report.relationships.evidence.length) report.relationships.evidence=[`관계 신호: ${profile.relations.summary}`];

  report.recovery.quick=[
    `한 줄 요약: 과부하가 오면 ${role.stress}이 나타나기 쉬워, 평소 강점을 더 세게 쓰는 방식보다 쉬는 기준을 먼저 정하는 편이 좋습니다.`,
    `왜 그런가요? 강한 오행은 ${strongElement}, 상대적으로 약한 오행은 ${weakElement}이며 강약 참고값은 ${profile.strength.band} ${profile.strength.score}점입니다.`,
    `생활에서는: ${weak.use}을 회복 루틴으로 두고, 지속되는 통증·수면·컨디션 문제는 사주가 아니라 실제 기록과 의료적 판단을 우선하세요.`
  ];
  report.recovery.evidence=[
    `강한 오행: ${strongElement} · 상대적으로 약한 오행: ${weakElement}`,
    `대표 과부하 패턴: ${role.stress}`,
    `균형 참고: ${profile.balanceHint}`
  ];

  report.love.quick=[
    '한 줄 요약: 관계에서는 상대의 속마음을 맞히기보다 내가 가까운 관계에서 반복하는 반응을 보는 것이 핵심입니다.',
    `왜 그런가요? 원국 관계 신호는 ${profile.relations.summary} 월령 중심은 ${profile.monthCommand.simple}입니다.`,
    '생활에서는: 기대를 추측으로 두지 말고 말로 확인하고, 궁합은 두 사람 원국의 공통점과 긴장 지점을 비교하는 용도로 쓰는 것이 좋습니다.'
  ];
  report.love.evidence=profile.relations.items.slice(0,5).map((item)=>`${item.type} · ${item.pillarLabels.join('↔') || item.members.join('·')} · ${item.contexts.join(' / ')}`);

  if(profile.flow){
    report.year.lead=profile.flow.headline+` 쉽게 말하면, 올해는 ${profile.flow.annualGod} 주제가 평소보다 더 자주 드러나는 해입니다.`;
    report.year.quick=[
      `한 줄 요약: ${profile.flow.easy[0]}`,
      `왜 그런가요? ${profile.flow.easy[1]}`,
      `생활에서는: ${profile.flow.easy[2]}`
    ];
    report.year.evidence=[
      ...profile.flow.layers.map((item)=>`${item.label}: ${item.value}`),
      `원국×세운 관계: ${profile.flow.relationSummary}`
    ];
    report.year.paragraphs.unshift(
      `올해 흐름은 세운 하나만 떼어 보지 않고 원국, 현재 대운, 12개월 월운을 겹쳐서 읽었습니다. ${profile.flow.headline} 대운은 약 10년짜리 배경, 세운은 올해의 주제, 월운은 그 주제가 실제 생활에서 강해졌다 약해지는 타이밍에 가깝습니다. 그래서 같은 ${profile.flow.annualGod} 해라도 원국과 대운 조합에 따라 체감은 달라질 수 있습니다.`
    );
    report.luck.quick=[
      profile.flow.activeLuck?`한 줄 요약: ${profile.flow.activeLuck.korean} 대운이 현재 큰 배경입니다.`:'한 줄 요약: 현재 대운 정보보다 원국과 세운을 중심으로 읽습니다.',
      `왜 그런가요? 올해 ${profile.flow.annualGod} 세운과 월별 ${profile.flow.dominantMonthGroup} 반복을 함께 비교했습니다.`,
      '생활에서는: 대운을 사건 예언보다 몇 년 동안 반복되는 과제와 선택 기준으로 보는 편이 더 실용적입니다.'
    ];
    report.luck.evidence=profile.flow.layers.map((item)=>`${item.label}: ${item.value}`);
  }
  report.technical.quick=[
    '계산 가능한 달력·절기 값과 해석 규칙을 분리해 보여줍니다.',
    `신강·신약 참고: ${profile.strength.band} ${profile.strength.score}점 · 신뢰도 ${profile.strength.confidence}`,
    `월령 중심: ${profile.monthCommand.tenGod} · 주요 십신: ${topGods.map((item)=>`${item.tenGod} ${item.score}`).join(' · ')}`
  ];
  report.technical.evidence=[
    ...profile.evidence,
    `상위 십신 대표 위치: ${topGodPlacementText}`
  ];
  report.technical.paragraphs.push(
    `십신은 비견·겁재·식신·상관·편재·정재·편관·정관·편인·정인을 하나로 뭉개지 않고 천간과 지장간의 위치를 따로 기록합니다. 현재 상위 십신의 대표 위치는 ${topGodPlacementText}입니다. 같은 십신이라도 천간에 드러난 경우와 지장간에 잠재된 경우의 가중치를 다르게 두고, 월령의 중심 지장간이 천간에 실제로 드러났는지도 따로 확인합니다.`
  );

  return report;
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
