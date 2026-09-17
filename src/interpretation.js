import { ELEMENT_LABELS, ROLE_LABELS } from './data.js';

function topEntry(object) {
  return Object.entries(object).sort((a,b)=>b[1]-a[1])[0];
}

const ROLE_TEXT = {
  비겁:'자기 기준과 독립성이 강하게 작동하는 편입니다. 협업에서는 역할과 경계를 명확히 할수록 장점이 살아납니다.',
  식상:'생각을 결과물로 표현하고 새 방식을 시도하는 힘이 두드러집니다. 말·글·기획·창작처럼 밖으로 드러나는 활동과 잘 맞습니다.',
  재성:'현실적인 성과, 자원 관리, 실행 가능성을 중시하는 경향이 있습니다. 목표를 수치와 일정으로 구체화할 때 강점이 살아납니다.',
  관성:'기준, 책임, 약속, 완성도를 중요하게 보는 경향이 있습니다. 체계가 있는 환경에서 신뢰를 쌓기 쉽습니다.',
  인성:'관찰, 학습, 자료 정리, 깊이 있는 사고가 강점으로 나타납니다. 충분히 이해한 뒤 움직일 때 안정감이 커집니다.'
};

const ELEMENT_TEXT = {
  목:'성장과 확장 방향이 강합니다. 새로운 기획이나 관계를 시작하는 힘으로 쓰기 좋습니다.',
  화:'표현과 가시성이 강합니다. 몰입과 전달력이 장점이지만 속도를 조절하면 균형이 좋아집니다.',
  토:'안정과 관리 성향이 강합니다. 꾸준함과 현실 감각이 장점이며 변화가 필요할 때 작은 실험이 도움이 됩니다.',
  금:'정리와 판단 성향이 강합니다. 기준을 세우고 품질을 높이는 데 강점이 있습니다.',
  수:'탐구와 정보 처리 성향이 강합니다. 관찰과 분석이 장점이며 생각을 실제 행동으로 연결하는 장치가 중요합니다.'
};

export function buildInterpretation(chart, mbti) {
  const [topElement] = topEntry(chart.elements);
  const [topRole] = topEntry(chart.roles);
  const relationText = chart.relations.length
    ? `원국에서는 ${chart.relations.map((r)=>r.text).slice(0,4).join(', ')} 관계가 확인됩니다. 관계 자체를 길흉으로 단정하기보다 상황 변화와 반응 패턴을 읽는 참고 신호로 봅니다.`
    : '원국에서 강하게 겹치는 합·충·형·파·해 신호가 적습니다. 특정 관계 하나보다 전체 오행과 십성 균형을 함께 보는 편이 적절합니다.';

  const axisText = Object.values(mbti.axes)
    .map((axis)=>`${axis.selected} ${Math.max(axis.left.percent,axis.right.percent)}%`)
    .join(' · ');

  return [
    {title:'핵심 성향',text:`${ROLE_LABELS[topRole]} 성향이 가장 두드러집니다. ${ROLE_TEXT[topRole]}`},
    {title:'오행 중심',text:`${topElement}(${ELEMENT_LABELS[topElement].label}) 기운의 비중이 가장 큽니다. ${ELEMENT_TEXT[topElement]}`},
    {title:'성향 MBTI',text:`사주 기반 변환 결과는 ${mbti.type}이며 축 강도는 ${axisText}입니다. 실제 MBTI 검사 결과와 다를 수 있으므로 성향을 설명하는 보조 언어로만 사용합니다.`},
    {title:'구조 해석',text:relationText},
    {title:'활용 포인트',text:'사주는 미래를 확정하는 도구가 아니라 전통 명리 규칙에 따른 패턴 해석입니다. 중요한 돈·건강·법률·관계 결정은 실제 정보와 전문가 판단을 우선하고, 이 결과는 자기이해 참고 자료로 활용하세요.'}
  ];
}
