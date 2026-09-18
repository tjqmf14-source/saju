const STEM_ELEMENT = {
  갑:'목', 을:'목', 병:'화', 정:'화', 무:'토', 기:'토', 경:'금', 신:'금', 임:'수', 계:'수'
};

const BRANCH_ELEMENT = {
  자:'수', 축:'토', 인:'목', 묘:'목', 진:'토', 사:'화', 오:'화', 미:'토', 신:'금', 유:'금', 술:'토', 해:'수'
};

const ELEMENT_TONE = {
  목:{
    short:'성장과 확장',
    direction:'새로운 가능성을 키우고 바깥으로 뻗어가려는 힘',
    action:'작게 시작한 것을 꾸준히 키우는 방식',
    caution:'시작을 너무 많이 벌여 중심이 흐려지는 것'
  },
  화:{
    short:'표현과 가시성',
    direction:'생각과 능력을 밖으로 드러내고 사람들의 반응을 얻는 힘',
    action:'보여주고 말하고 실행해 결과를 눈에 보이게 만드는 방식',
    caution:'속도와 감정이 앞서 체력이 먼저 소진되는 것'
  },
  토:{
    short:'기반과 정착',
    direction:'흩어진 일을 현실적인 구조와 생활 기반으로 묶는 힘',
    action:'일정·돈·공간·관계를 오래 유지할 수 있는 구조로 다듬는 방식',
    caution:'안정만 지키려다 필요한 변화까지 늦추는 것'
  },
  금:{
    short:'선택과 정리',
    direction:'기준을 세우고 불필요한 것을 덜어내며 완성도를 높이는 힘',
    action:'우선순위를 선명하게 정하고 기준에 맞지 않는 것을 정리하는 방식',
    caution:'완벽한 기준 때문에 사람이나 기회를 너무 빨리 잘라내는 것'
  },
  수:{
    short:'탐색과 연결',
    direction:'정보를 넓게 읽고 유연하게 이동하며 새로운 연결을 만드는 힘',
    action:'관찰·학습·대화를 통해 다음 선택의 가능성을 넓히는 방식',
    caution:'생각과 선택지가 많아져 결정 시점을 계속 미루는 것'
  }
};

const GROUP_TONE = {
  비겁:{
    label:'자기주도',
    core:'내 기준, 독립성, 동료와의 힘 관계를 다시 정리하는 것',
    opportunity:'내 이름으로 책임질 일과 주도권이 필요한 프로젝트를 선명하게 잡을 수 있습니다',
    caution:'비교와 경쟁에 몰입하거나 도움을 받을 수 있는 상황에서도 혼자 버티려는 패턴',
    advice:'남보다 앞서는 것보다 어떤 선택을 내 기준으로 오래 유지할 수 있는지 확인하는 편이 중요합니다'
  },
  식상:{
    label:'표현·창작',
    core:'생각과 재능을 말, 글, 콘텐츠, 기술, 결과물로 밖에 꺼내는 것',
    opportunity:'오랫동안 머릿속에만 있던 생각을 실제 결과물로 만들고 사람들에게 보여줄 수 있습니다',
    caution:'흥미가 생기는 일마다 손을 대다가 집중력과 체력이 분산되는 패턴',
    advice:'완벽한 한 번보다 반복해서 보여줄 수 있는 결과물과 루틴을 만드는 편이 더 큰 자산이 됩니다'
  },
  재성:{
    label:'현실·성과',
    core:'돈, 시간, 자원, 성과를 현실적인 숫자와 구조로 관리하는 것',
    opportunity:'수입 구조와 업무 효율, 생활 기반을 구체적으로 정비해 눈에 보이는 성과를 쌓을 수 있습니다',
    caution:'성과를 서두르다가 지출과 책임까지 함께 늘어나거나 손해를 감수하면서 결과를 쫓는 패턴',
    advice:'큰 한 번을 기대하기보다 반복 비용과 반복 수익, 시간 배분을 먼저 다듬는 편이 안정적입니다'
  },
  관성:{
    label:'책임·규칙',
    core:'직업적 역할, 책임, 사회적 기준과 나의 경계를 다시 세우는 것',
    opportunity:'직업적 신뢰와 전문성을 쌓고 맡은 일을 내 방식의 기준과 체계로 정리할 수 있습니다',
    caution:'책임을 성실함으로 착각해 필요 이상으로 떠안거나 평가와 규칙에 지나치게 긴장하는 패턴',
    advice:'모든 기대를 충족하려 하기보다 내가 책임질 범위와 내려놓을 범위를 먼저 구분하는 것이 중요합니다'
  },
  인성:{
    label:'학습·회복',
    core:'배움, 사고, 문서, 회복과 내면의 기반을 깊게 만드는 것',
    opportunity:'새로운 지식과 경험을 흡수하고 장기적으로 쓸 전문성이나 내공을 차분히 축적할 수 있습니다',
    caution:'준비와 생각이 길어져 실제 행동을 미루거나 익숙한 안전지대 안에서만 머무르는 패턴',
    advice:'더 많이 아는 것보다 배운 것을 생활과 일에 실제로 적용하는 작은 실행을 꾸준히 만드는 편이 좋습니다'
  }
};

function lifeStage(age){
  if(age < 20) return {
    label:'성장기',
    theme:'경험을 넓히며 자기 기준을 만들어가는 시기',
    context:'학교·가족·첫 사회경험처럼 주변 환경의 영향이 큰 때'
  };
  if(age < 30) return {
    label:'사회 진입기',
    theme:'가능성을 현실의 선택으로 바꾸는 시기',
    context:'직업·독립·관계에서 첫 장기 선택이 쌓이기 시작하는 때'
  };
  if(age < 40) return {
    label:'확장기',
    theme:'내가 선택한 방향을 넓히고 정체성을 굳히는 시기',
    context:'커리어·자산·관계의 방향이 실제 생활 구조로 자리 잡는 때'
  };
  if(age < 50) return {
    label:'전환기',
    theme:'쌓아온 것을 재평가하고 우선순위를 다시 세우는 시기',
    context:'책임은 커지지만 동시에 앞으로 무엇을 남길지 선택해야 하는 때'
  };
  if(age < 60) return {
    label:'재정비기',
    theme:'성과보다 지속 가능성과 삶의 균형을 다시 설계하는 시기',
    context:'경험을 활용하면서 불필요한 부담을 줄여야 체감이 좋아지는 때'
  };
  if(age < 70) return {
    label:'전수기',
    theme:'경험을 정리해 사람과 다음 세대에 전달하는 시기',
    context:'직접 뛰는 일과 함께 조언·관리·전수의 역할이 커질 수 있는 때'
  };
  return {
    label:'정리와 통합기',
    theme:'삶의 경험을 자기 방식으로 통합하고 의미를 남기는 시기',
    context:'속도보다 건강한 리듬과 관계의 질, 마음의 여유가 더 중요해지는 때'
  };
}

function pillarProfile(pillar=''){
  const stem = pillar[0] || '';
  const branch = pillar[1] || '';
  const stemElement = STEM_ELEMENT[stem] || '토';
  const branchElement = BRANCH_ELEMENT[branch] || stemElement;
  return {
    stem,
    branch,
    stemElement,
    branchElement,
    outward:ELEMENT_TONE[stemElement],
    foundation:ELEMENT_TONE[branchElement]
  };
}

export function buildLuckNarrativeCopy({group,pillar,age,active=false}){
  const role = GROUP_TONE[group] || GROUP_TONE.인성;
  const stage = lifeStage(Number(age) || 0);
  const profile = pillarProfile(pillar);

  const overview = `${stage.label}의 ${role.label} 흐름입니다. 겉으로는 ${profile.outward.short}이 강해지고, 생활에서는 ${profile.foundation.short}을 다루는 일이 핵심이 됩니다.`;

  const theme = `${stage.theme}에 ${role.core}이 중요한 과제가 됩니다. ${profile.outward.direction}과 ${profile.foundation.direction}이 함께 작동하는 흐름입니다.`;

  const lead = `${age}세부터의 ${pillar} 대운은 ${stage.context}입니다. 이때는 ${role.core}이 반복해서 중요한 선택 기준으로 떠오를 수 있습니다. 겉으로 드러나는 움직임은 ${profile.outward.direction}에 가깝고, 실제 생활에서는 ${profile.foundation.action}이 안정감을 만들어 줍니다.`;

  const opportunity = `${role.opportunity}. 특히 ${profile.outward.action}과 ${profile.foundation.action}을 함께 가져가면 단기 성과보다 오래 남는 기반을 만들기 좋습니다. 이 시기에는 잘하는 것을 더 많이 늘리는 것보다 어디에 힘을 집중할지 분명히 정하는 것이 중요합니다.`;

  const caution = `${role.caution}을 주의하세요. 여기에 ${profile.outward.caution}과 ${profile.foundation.caution}이 겹치면 피로감이나 판단의 흔들림이 커질 수 있습니다. 문제가 반복될 때는 운이 나쁘다고 단정하기보다 일정·돈·관계·책임 중 어디에서 과부하가 생기는지 먼저 확인하는 편이 좋습니다.`;

  const advice = `${role.advice}. ${stage.label}에는 ${profile.outward.action}을 통해 방향을 만들고, ${profile.foundation.action}으로 그것을 생활 속에 정착시키는 순서가 잘 맞습니다.${active?' 지금 실제로 지나고 있는 대운이므로, 올해와 이번 달의 선택도 이 큰 흐름 안에서 무엇을 오래 남길지 기준으로 점검해 보세요.':' 아직 현재 대운이 아니라면 미래를 확정적으로 예측하기보다, 그 시기에 중요해질 수 있는 생활 과제를 미리 이해하는 참고 자료로 활용하세요.'}`;

  return {
    group,
    pillar,
    stage:stage.label,
    overview,
    theme,
    lead,
    opportunity,
    caution,
    advice
  };
}

export const LUCK_COPY_META = {
  elements:ELEMENT_TONE,
  groups:GROUP_TONE
};
