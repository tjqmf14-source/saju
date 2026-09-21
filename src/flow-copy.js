// Interpretation copy is deliberately separate from the deterministic calendar engine.
// These are concise reflective prompts, not claims that a particular event will occur.

const TEN_GOD_COPY = {
  비견:{focus:'내 기준',check:'혼자 결정하지 마세요.'},
  겁재:{focus:'협업·경쟁',check:'비용과 책임을 먼저 나누세요.'},
  식신:{focus:'꾸준한 생산',check:'한 번에 너무 많이 벌이지 마세요.'},
  상관:{focus:'표현·개선',check:'말보다 전달 방식을 다듬으세요.'},
  편재:{focus:'기회·유동자원',check:'조건을 숫자로 확인하세요.'},
  정재:{focus:'안정·관리',check:'고정비를 놓치지 마세요.'},
  편관:{focus:'압박·도전',check:'급한 일과 중요한 일을 나누세요.'},
  정관:{focus:'책임·신뢰',check:'약속 범위를 분명히 하세요.'},
  편인:{focus:'직관·탐색',check:'새 정보만 쫓지 마세요.'},
  정인:{focus:'학습·정리',check:'배운 것을 행동으로 옮기세요.'}
};

const BRANCH_GUIDE = {
  인:{focus:'시작 범위',action:'새 일은 한 가지로 좁혀 시작하세요.',guard:'준비만 길어지지 않는지 보세요.'},
  묘:{focus:'관계 조율',action:'협업 전 기대와 역할을 먼저 맞추세요.',guard:'상대 의도를 혼자 추측하지 마세요.'},
  진:{focus:'계획 정리',action:'흩어진 일정을 한 장에 묶어보세요.',guard:'계획만 늘고 실행이 밀리지 않게 하세요.'},
  사:{focus:'속도 조절',action:'속도가 붙어도 휴식 시간을 고정하세요.',guard:'과열되면 한 템포 늦추세요.'},
  오:{focus:'반응 확인',action:'결과를 보여주고 반응 하나를 기록하세요.',guard:'반응에 과민하게 흔들리지 마세요.'},
  미:{focus:'부담 분산',action:'책임이 몰리면 한 가지를 나눠 맡기세요.',guard:'부담을 혼자 떠안지 마세요.'},
  신:{focus:'선택 정리',action:'성과가 낮은 일 하나를 덜어내세요.',guard:'기준을 높여 기회를 닫지 마세요.'},
  유:{focus:'마감 점검',action:'마감 전 조건·수치·품질을 확인하세요.',guard:'사소한 완벽주의에 시간을 쓰지 마세요.'},
  술:{focus:'종료 판단',action:'끝낼 일과 넘길 일을 선명히 나누세요.',guard:'끝난 문제를 다시 끌고 오지 마세요.'},
  해:{focus:'회복·정리',action:'새 결정 전 잠깐 멈추고 자료를 정리하세요.',guard:'피로한 상태에서 결론내리지 마세요.'},
  자:{focus:'정보 선별',action:'들어오는 정보 중 핵심 두 가지만 남기세요.',guard:'정보량보다 신뢰도를 먼저 보세요.'},
  축:{focus:'기반 정비',action:'고정비나 미룬 일 하나부터 정리하세요.',guard:'익숙함 때문에 변화가 늦지 않게 하세요.'}
};

const RELATION_LABEL = {
  합:'연결',
  삼합:'강한 연결',
  충:'변화·충돌',
  형:'긴장',
  파:'재조정',
  해:'숨은 마찰'
};

function relationSignal(flow){
  const labels=[...new Set((flow.relations||[]).map((item)=>RELATION_LABEL[item.type]||item.type))];
  return labels.length?labels.join('·'):'큰 충돌 신호 없음';
}

export function monthFlowCopy(flow){
  const role=TEN_GOD_COPY[flow.tenGod] || TEN_GOD_COPY.정인;
  const guide=BRANCH_GUIDE[flow.branch] || {
    focus:'상황 점검',
    action:'이번 달 일정과 조건을 다시 확인하세요.',
    guard:'한 번에 너무 많은 결정을 내리지 마세요.'
  };

  return {
    focus:`${role.focus} · ${guide.focus}`,
    action:guide.action,
    check:`${guide.guard} ${role.check}`,
    signal:relationSignal(flow)
  };
}

export function quarterFlowCopy(flows){
  if(flows.length!==3) throw new RangeError('분기 해설에는 절기 월운 3개가 필요합니다.');
  const first=monthFlowCopy(flows[0]);
  const last=monthFlowCopy(flows[2]);
  return {
    steps:flows.map((flow)=>({tenGod:flow.tenGod,focus:monthFlowCopy(flow).focus})),
    summary:first.action,
    action:last.action
  };
}
