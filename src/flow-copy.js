// Interpretation copy is deliberately separate from the deterministic calendar engine.
// These are reflective prompts, not claims that a particular event will occur.
const TEN_GOD_COPY = {
  비견:{focus:'내 기준을 확인하기',action:'혼자 결정할 일과 함께 의논할 일을 나눠 보세요.'},
  겁재:{focus:'협업의 경계 세우기',action:'공동 비용과 책임 범위를 시작 전에 합의해 보세요.'},
  식신:{focus:'꾸준한 결과 쌓기',action:'매일 이어갈 수 있는 작은 결과물 하나를 정해 보세요.'},
  상관:{focus:'표현 방식 다듬기',action:'전달할 메시지를 한 문장으로 줄여 보세요.'},
  편재:{focus:'새 제안의 조건 살피기',action:'제안의 비용·시간·회수 조건을 숫자로 확인해 보세요.'},
  정재:{focus:'반복 수입과 지출 정리하기',action:'고정비와 저축 계획을 실제 금액으로 적어 보세요.'},
  편관:{focus:'압박과 우선순위 조정하기',action:'급한 요구와 꼭 지켜야 할 일의 경계를 정해 보세요.'},
  정관:{focus:'약속과 신뢰 쌓기',action:'마감과 담당 범위를 문서로 확정해 보세요.'},
  편인:{focus:'익숙한 틀 다시 보기',action:'새 정보 하나를 기존 계획과 비교해 보세요.'},
  정인:{focus:'배운 것을 생활에 쓰기',action:'정리한 내용을 실제 행동 하나로 연결해 보세요.'}
};

const BRANCH_CHECK = {
  자:'들어오는 정보가 많다면 중요한 것 두 가지만 남겨 보세요.',
  축:'미뤄 둔 정리와 유지 비용을 먼저 확인해 보세요.',
  인:'새로 시작할 일의 범위를 작게 잡아 보세요.',
  묘:'사람과 아이디어를 연결할 때 기대를 말로 확인해 보세요.',
  진:'흩어진 계획을 일정표 하나로 묶어 보세요.',
  사:'속도가 붙을수록 휴식 시간을 먼저 확보해 보세요.',
  오:'결과를 보여주고 실제 반응을 기록해 보세요.',
  미:'일과 생활의 부담이 한쪽에 몰리지 않는지 살펴보세요.',
  신:'불필요한 일을 하나 덜어 내고 기준을 선명히 해 보세요.',
  유:'마무리 단계의 작은 조건과 품질을 점검해 보세요.',
  술:'끝낼 일과 다음으로 넘길 일을 분명히 나눠 보세요.',
  해:'다음 선택을 서두르기보다 회복과 정보 정리에 시간을 써 보세요.'
};

const BRANCH_FOCUS = {
  자:'정보 추리기',축:'밀린 일 정리',인:'시작 범위 정하기',묘:'기대 확인하기',
  진:'계획 묶기',사:'속도 조절',오:'반응 기록',미:'부담 나누기',
  신:'불필요한 일 덜기',유:'조건 점검',술:'마무리 구분',해:'회복 시간 확보'
};

export function monthFlowCopy(flow){
  const role=TEN_GOD_COPY[flow.tenGod] || TEN_GOD_COPY.정인;
  const branch=flow.branch;
  return {
    focus:`${role.focus} · ${BRANCH_FOCUS[branch] || '상황 살피기'}`,
    action:BRANCH_CHECK[branch] || '그달의 실제 일정과 조건을 함께 확인해 보세요.',
    check:role.action
  };
}

export function quarterFlowCopy(flows){
  if(flows.length!==3) throw new RangeError('분기 해설에는 절기 월운 3개가 필요합니다.');
  const last=monthFlowCopy(flows[2]);
  const opening=TEN_GOD_COPY[flows[0].tenGod] || TEN_GOD_COPY.정인;
  return {
    steps:flows.map((flow)=>({tenGod:flow.tenGod,focus:monthFlowCopy(flow).focus})),
    summary:opening.action,
    action:last.action
  };
}
