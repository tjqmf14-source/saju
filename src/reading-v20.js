import { ELEMENT_LABELS, ROLE_LABELS, stemByName } from './data.js';

const ELEMENT_STYLE = {
  목: {
    identity:'가능성을 먼저 보고 판을 넓히는 힘',
    gift:'새로운 방향을 찾고 시작점을 만드는 능력',
    risk:'범위를 넓히는 속도가 마무리 속도보다 빨라질 수 있습니다.',
    work:'새 기획, 개선안, 초기 구조 설계처럼 아직 답이 정해지지 않은 일',
    recovery:'해야 할 일을 더 추가하기보다 끝낼 것부터 정리하는 시간'
  },
  화: {
    identity:'생각과 감각을 밖으로 선명하게 드러내는 힘',
    gift:'사람의 반응을 끌어내고 결과물을 보이게 만드는 능력',
    risk:'속도와 반응이 빨라지면 말이나 결정이 앞설 수 있습니다.',
    work:'발표, 설득, 콘텐츠, 디자인처럼 결과가 눈에 보이고 피드백이 빠른 일',
    recovery:'자극을 줄이고 혼자 조용히 열을 식히는 시간'
  },
  토: {
    identity:'흩어진 것을 현실적인 순서로 묶어 안정시키는 힘',
    gift:'일정·사람·자원을 오래 유지 가능한 구조로 만드는 능력',
    risk:'안정을 지키려다 바꿔야 할 시점을 늦출 수 있습니다.',
    work:'운영, 관리, 조율, 품질 유지처럼 꾸준함이 성과를 만드는 일',
    recovery:'익숙한 루틴을 지키되 꼭 필요하지 않은 책임을 내려놓는 시간'
  },
  금: {
    identity:'기준을 세우고 불필요한 것을 덜어 완성도를 높이는 힘',
    gift:'문제의 핵심을 가르고 품질 기준을 분명하게 만드는 능력',
    risk:'기준이 높아질수록 자신과 주변을 지나치게 엄격하게 볼 수 있습니다.',
    work:'검수, 편집, 분석, 의사결정처럼 무엇을 남기고 뺄지 판단하는 일',
    recovery:'완벽하게 끝내려는 마음을 멈추고 충분한 수준에서 종료하는 시간'
  },
  수: {
    identity:'겉보다 맥락을 읽고 정보를 깊게 연결하는 힘',
    gift:'사람과 상황의 숨은 흐름을 관찰하고 의미를 찾는 능력',
    risk:'생각이 깊어질수록 실행 시점을 늦추거나 피로를 안으로 쌓을 수 있습니다.',
    work:'리서치, 전략, 분석, 기록처럼 정보의 질이 결과를 좌우하는 일',
    recovery:'정보 입력을 끊고 생각을 비우는 단순한 활동'
  }
};

const DAY_MASTER_STYLE = {
  갑:{title:'곧은 기준으로 앞길을 만드는 사람',core:'갑목은 큰 나무처럼 방향과 원칙을 세운 뒤 꾸준히 밀고 가는 힘을 중심에 둡니다.',decision:'먼저 큰 방향을 정하고 세부를 뒤에서 맞추는 판단이 자연스럽습니다.',stress:'방향이 막히거나 자율성을 잃으면 답답함이 빠르게 쌓일 수 있습니다.',relation:'관계에서도 기준이 분명한 만큼 상대의 다른 속도를 기다리는 연습이 중요합니다.'},
  을:{title:'유연하게 길을 찾고 연결하는 사람',core:'을목은 덩굴과 풀처럼 상황을 읽으며 연결점을 찾고, 작은 틈에서도 성장 경로를 만드는 힘을 가집니다.',decision:'정면 돌파보다 사람과 조건을 조율해 실현 가능한 길을 고르는 편입니다.',stress:'주변을 너무 많이 맞추다 보면 자신의 우선순위가 흐려질 수 있습니다.',relation:'섬세한 관찰이 장점이지만 마음을 추측만 하지 말고 필요한 말은 분명히 하는 편이 좋습니다.'},
  병:{title:'명확하게 드러내고 분위기를 움직이는 사람',core:'병화는 태양처럼 무엇이 중요한지 밖으로 드러내고 주변의 움직임을 끌어내는 힘이 중심입니다.',decision:'정보가 충분하면 빠르게 방향을 공개하고 사람을 움직이는 결정을 내리기 쉽습니다.',stress:'반응이 없거나 표현을 막는 환경에서는 에너지가 급격히 떨어질 수 있습니다.',relation:'진심을 크게 표현하는 장점은 살리되 상대가 받아들일 여유가 있는지도 확인해야 합니다.'},
  정:{title:'세밀한 감각으로 오래 빛을 만드는 사람',core:'정화는 등불처럼 가까운 곳을 세심하게 비추며 한 사람, 한 결과물에 집중해 완성도를 높이는 힘이 있습니다.',decision:'겉으로 드러난 크기보다 의미와 디테일을 따져 선택하는 편입니다.',stress:'작은 어긋남을 오래 붙잡거나 감정을 안에서 태우면 피로가 커질 수 있습니다.',relation:'섬세함이 배려로 이어지지만 상대의 반응까지 혼자 책임지지는 않는 것이 중요합니다.'},
  무:{title:'흔들리지 않는 기반을 만드는 사람',core:'무토는 큰 산처럼 쉽게 방향을 바꾸기보다 전체 구조와 지속 가능성을 먼저 보는 힘이 중심입니다.',decision:'한 번 정한 기준을 오래 유지할 수 있는지를 확인한 뒤 움직이는 편입니다.',stress:'변화가 너무 빠르거나 통제할 수 없는 일이 겹치면 버티는 데 에너지를 과하게 쓸 수 있습니다.',relation:'든든함이 장점이지만 침묵으로 버티기보다 불편한 지점을 초기에 말하는 편이 낫습니다.'},
  기:{title:'현실을 세심하게 다듬어 살리는 사람',core:'기토는 밭과 흙처럼 사람과 자원을 실제로 굴러가게 만들고, 작은 차이를 조정해 결과를 키우는 힘이 있습니다.',decision:'현실 조건과 사람의 상태를 함께 보고 실행 가능한 선택을 고르는 편입니다.',stress:'챙길 것이 많아지면 자기 몫과 남의 몫의 경계가 흐려질 수 있습니다.',relation:'상대에게 필요한 것을 잘 읽지만 돌봄이 의무가 되지 않도록 선을 정하는 것이 중요합니다.'},
  경:{title:'기준을 세우고 결단으로 길을 내는 사람',core:'경금은 다듬기 전의 단단한 쇠처럼 무엇을 남기고 무엇을 끊을지 분명히 판단하는 힘이 중심입니다.',decision:'핵심 조건이 정리되면 오래 망설이기보다 결론을 내리고 실행하는 편입니다.',stress:'기준이 너무 높아지면 자신과 주변의 작은 부족함까지 문제로 확대해서 볼 수 있습니다.',relation:'솔직하고 명확한 태도가 신뢰를 만들지만, 맞는 말보다 전달 순서가 더 중요한 순간도 있습니다.'},
  신:{title:'정교한 기준으로 완성도를 끌어올리는 사람',core:'신금은 잘 다듬어진 금속이나 보석처럼 작은 차이를 구분하고 품질을 세밀하게 높이는 힘이 중심입니다.',decision:'대충 괜찮은 답보다 정확한 조건과 완성도를 비교해 선택하는 편입니다.',stress:'완벽한 기준을 놓지 못하면 결정과 마감이 늦어지고 스스로를 과하게 평가할 수 있습니다.',relation:'세심함은 큰 장점이지만 상대의 부족함보다 관계 전체의 균형을 먼저 보는 연습이 도움이 됩니다.'},
  임:{title:'넓게 보고 흐름을 바꾸는 사람',core:'임수는 큰 물처럼 정보와 사람을 넓게 연결하고 상황 변화에 맞춰 새로운 길을 찾는 힘이 중심입니다.',decision:'한 가지 답에 고정되기보다 여러 가능성을 비교한 뒤 가장 흐름이 좋은 쪽을 선택합니다.',stress:'생각과 선택지가 너무 많아지면 방향을 정하지 못한 채 에너지만 분산될 수 있습니다.',relation:'상대를 이해하는 폭은 넓지만 중요한 관계에서는 자신의 의도도 선명하게 보여줄 필요가 있습니다.'},
  계:{title:'깊이 관찰해 정확한 타이밍을 찾는 사람',core:'계수는 비와 이슬처럼 미세한 변화와 감정을 읽고 필요한 곳에 조용히 스며드는 힘이 중심입니다.',decision:'겉으로 보이는 정보보다 맥락과 뉘앙스를 충분히 확인한 뒤 움직이는 편입니다.',stress:'불확실한 상황을 오래 생각하면 실제 문제보다 가능성 자체에 지칠 수 있습니다.',relation:'상대의 감정을 잘 읽는 만큼 추측과 사실을 분리해서 확인하는 습관이 중요합니다.'}
};

const ROLE_STYLE = {
  비겁: {
    label:'자기주도',
    identity:'내 기준이 분명하고 스스로 결정권을 가질 때 힘이 살아나는 편',
    strength:'주도권이 필요한 상황에서 빠르게 기준을 세울 수 있습니다.',
    friction:'협업에서도 혼자 결론을 끝낸 뒤 설명하면 상대가 배제됐다고 느낄 수 있습니다.',
    work:'권한과 책임이 함께 주어지고, 자기 방식으로 개선할 수 있는 환경',
    money:'남의 수익 방식보다 자신의 예산과 손실 한도를 먼저 정하는 방식',
    relation:'상대의 반응을 추측하기보다 기대와 경계를 먼저 말로 맞추는 것',
    recovery:'혼자 해결하려는 습관을 멈추고 도움을 요청할 기준을 미리 정하는 것'
  },
  식상: {
    label:'표현·결과',
    identity:'생각을 말·글·디자인·행동으로 꺼내야 에너지가 순환되는 편',
    strength:'머릿속 아이디어를 실제 결과물로 바꾸는 과정에서 장점이 드러납니다.',
    friction:'표현량이 많아질수록 상대의 반응과 마감 기준을 놓치기 쉽습니다.',
    work:'창작·기획·콘텐츠처럼 만든 결과가 바로 보이고 개선할 수 있는 환경',
    money:'기술이나 아이디어를 작은 상품·서비스로 시험하고 반응을 확인하는 방식',
    relation:'마음을 크게 설명하기보다 짧고 명확한 표현을 꾸준히 보여주는 것',
    recovery:'새 아이디어를 더 만들기보다 이미 시작한 일을 하나 끝내는 것'
  },
  재성: {
    label:'현실·성과',
    identity:'시간·돈·일정을 실제 결과로 바꾸는 감각이 중요한 편',
    strength:'목표와 자원을 구체적인 수치와 일정으로 관리할 때 강합니다.',
    friction:'성과가 보이지 않으면 조급해져 과정 자체를 과소평가할 수 있습니다.',
    work:'목표, 일정, 비용, 결과가 선명하고 성과를 확인할 수 있는 환경',
    money:'현금흐름·고정비·유지비를 먼저 보고 결정하는 방식',
    relation:'말보다 약속을 지키는 행동으로 신뢰를 쌓되 감정 표현을 생략하지 않는 것',
    recovery:'성과가 없는 시간도 필요하다는 것을 인정하고 쉬는 시간을 일정에 넣는 것'
  },
  관성: {
    label:'책임·기준',
    identity:'해야 할 일과 지켜야 할 기준이 분명할 때 안정적으로 힘을 쓰는 편',
    strength:'책임 범위를 정하고 품질과 신뢰를 지키는 능력이 강점입니다.',
    friction:'책임을 과하게 떠안거나 스스로 만든 기준에 눌릴 수 있습니다.',
    work:'역할과 기준이 분명하고 전문성을 오래 쌓을 수 있는 환경',
    money:'규칙·한도·장기 계획을 먼저 만들고 예외를 최소화하는 방식',
    relation:'상대를 평가하기보다 서로에게 기대하는 역할과 약속을 구체적으로 말하는 것',
    recovery:'해야 한다는 문장을 줄이고 지금 꼭 필요한 책임만 남기는 것'
  },
  인성: {
    label:'이해·축적',
    identity:'충분히 이해하고 준비한 뒤 움직일 때 실수가 줄어드는 편',
    strength:'자료를 모으고 구조를 이해해 판단의 질을 높이는 능력이 강합니다.',
    friction:'정보를 더 모으는 일이 결정을 미루는 방식이 될 수 있습니다.',
    work:'리서치·분석·교육·전문직처럼 배운 것이 곧 품질로 이어지는 환경',
    money:'충분히 확인한 뒤 움직이되 확인 기간과 결정 시점을 미리 정하는 방식',
    relation:'상대를 오래 관찰하는 장점은 살리되 중요한 감정은 너무 늦기 전에 말하는 것',
    recovery:'생각을 해결하려 하기보다 몸의 리듬을 먼저 회복하는 것'
  }
};

const TEN_GOD_YEAR = {
  비견:{title:'내 기준을 다시 세우는 해',opportunity:'내가 직접 결정하고 책임질 영역을 분명하게 만들기',risk:'모든 문제를 혼자 해결하려고 버티기'},
  겁재:{title:'경쟁과 협업의 선을 정하는 해',opportunity:'사람·비용·역할을 초기에 분명하게 나누기',risk:'비교심 때문에 필요 없는 승부에 에너지를 쓰기'},
  식신:{title:'꾸준한 결과가 자산이 되는 해',opportunity:'작아도 반복 가능한 결과물을 계속 쌓기',risk:'하고 싶은 일을 너무 많이 벌려 마감이 흐려지기'},
  상관:{title:'표현 방식을 바꾸면 길이 열리는 해',opportunity:'불편한 구조를 개선안과 결과물로 바꾸기',risk:'맞는 말을 너무 세게 전달해 관계 비용을 키우기'},
  편재:{title:'기회는 넓지만 조건 확인이 필요한 해',opportunity:'새 기회를 작게 시험하고 실제 반응을 확인하기',risk:'가능성만 보고 비용·시간·손실 한도를 놓치기'},
  정재:{title:'쌓이는 구조를 만드는 해',opportunity:'반복 수입·고정비·저축처럼 지속 가능한 틀 만들기',risk:'안정에 집착해 필요한 투자나 변화를 계속 미루기'},
  편관:{title:'압박을 실력으로 바꾸는 해',opportunity:'어려운 과제를 작은 기준과 일정으로 쪼개기',risk:'긴장 상태를 정상으로 여기며 과부하를 오래 끌기'},
  정관:{title:'신뢰와 책임이 평가받는 해',opportunity:'약속·품질·역할을 명확히 해 평판을 쌓기',risk:'남의 기대까지 모두 책임지려 하기'},
  편인:{title:'관점을 바꾸면 답이 보이는 해',opportunity:'익숙한 방식 밖의 정보와 방법을 시험하기',risk:'새 정보만 계속 찾고 기존 계획을 자주 갈아엎기'},
  정인:{title:'배운 것을 내 것으로 만드는 해',opportunity:'공부·정리·기록을 실제 실력과 결과로 연결하기',risk:'준비가 충분해질 때까지 실행을 계속 미루기'}
};

const BRANCH_MONTH = {
  인:{title:'시작 범위',use:'새 일은 한 가지로 좁혀 첫 결과를 만드세요.',avoid:'준비 목록만 길어지지 않게 하세요.'},
  묘:{title:'관계 조율',use:'협업 전에 기대와 역할을 먼저 맞추세요.',avoid:'상대 의도를 혼자 추측하지 마세요.'},
  진:{title:'계획 정리',use:'흩어진 일정과 돈을 한 번에 정리하세요.',avoid:'계획 수정만 반복하지 마세요.'},
  사:{title:'속도 조절',use:'속도가 붙어도 쉬는 시간을 먼저 확보하세요.',avoid:'과열된 상태에서 중요한 결정을 밀어붙이지 마세요.'},
  오:{title:'반응 확인',use:'결과를 보여주고 실제 반응을 한 가지 기록하세요.',avoid:'칭찬이나 비판 하나에 방향 전체를 바꾸지 마세요.'},
  미:{title:'부담 분산',use:'책임이 몰리면 하나는 나누거나 미루세요.',avoid:'좋은 사람 역할 때문에 무리하지 마세요.'},
  신:{title:'선택 정리',use:'효율이 낮은 일 하나를 과감히 덜어내세요.',avoid:'기준을 높여 기회 자체를 닫지 마세요.'},
  유:{title:'마감 점검',use:'조건·수치·품질을 마감 전에 다시 확인하세요.',avoid:'사소한 완벽주의에 핵심 시간을 쓰지 마세요.'},
  술:{title:'종료 판단',use:'끝낼 일과 이어갈 일을 선명하게 나누세요.',avoid:'이미 끝난 문제를 다시 끌고 오지 마세요.'},
  해:{title:'회복과 정리',use:'새 결정보다 자료와 컨디션을 먼저 정리하세요.',avoid:'피로한 상태에서 결론을 내리지 마세요.'},
  자:{title:'정보 선별',use:'들어오는 정보 중 신뢰할 두 가지만 남기세요.',avoid:'정보량을 확신으로 착각하지 마세요.'},
  축:{title:'기반 정비',use:'고정비나 미룬 일 하나부터 정리하세요.',avoid:'익숙함 때문에 변화 시점을 늦추지 마세요.'}
};

const MONTH_OPENERS = [
  '방향을 정하기 좋은 달입니다.',
  '사람과 조건을 맞추는 과정이 중요합니다.',
  '흩어진 것을 정리해야 다음 단계가 보입니다.',
  '속도보다 지속 가능한 리듬이 중요합니다.',
  '결과를 밖에 보여주고 반응을 확인할 때입니다.',
  '책임과 에너지를 적절히 나눌 필요가 있습니다.',
  '무엇을 더할지보다 무엇을 뺄지 판단할 때입니다.',
  '완성도와 현실 조건을 동시에 확인해야 합니다.',
  '마무리와 다음 준비의 경계를 세울 때입니다.',
  '회복하면서 다음 선택을 준비하기 좋은 달입니다.',
  '정보를 줄이고 핵심 판단만 남길 때입니다.',
  '기반을 다시 점검하며 새 주기를 준비할 때입니다.'
];

const RELATION_COPY = {
  합:'연결과 협력이 자연스럽게 붙는 신호',
  삼합:'여러 요소가 한 방향으로 힘을 모으는 신호',
  충:'기존 방향을 바꾸거나 조정해야 하는 압력이 생기는 신호',
  형:'같은 문제를 반복 점검하게 만드는 긴장 신호',
  파:'익숙한 구조를 다시 조립하게 만드는 신호',
  해:'겉으로 잘 보이지 않는 오해나 불편을 살펴야 하는 신호'
};

function sorted(object){ return Object.entries(object || {}).sort((a,b)=>b[1]-a[1]); }
function total(object){ return Object.values(object || {}).reduce((sum,value)=>sum+Number(value||0),0) || 1; }
function ratio(object,key){ return Math.round((Number(object?.[key]||0)/total(object))*100); }
function unique(values){ return [...new Set(values.filter(Boolean))]; }
function relationTypes(relations){ return unique((relations||[]).map((item)=>item.type)); }
function relationSentence(relations){
  const types=relationTypes(relations);
  if(!types.length) return '원국에서 크게 튀는 합·충 신호가 적어, 관계 변화는 사건 하나보다 누적된 선택에서 드러나는 편입니다.';
  return types.map((type)=>RELATION_COPY[type] || type).join(' / ') + '가 함께 보입니다.';
}
function monthNumber(flow){
  if(!(flow?.start instanceof Date)) return Number(flow?.month||0);
  return Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',month:'numeric'}).format(flow.start));
}
function pillarText(chart){ return ['year','month','day','hour'].map((key)=>chart.pillarStrings?.[key]).filter(Boolean).join(' · '); }

export function buildCoreReading(chart,{timeKnown=true}={}){
  const elements=sorted(chart.elements);
  const roles=sorted(chart.roles);
  const strongElement=elements[0]?.[0] || '토';
  const weakElement=elements.at(-1)?.[0] || '수';
  const strongRole=roles[0]?.[0] || '인성';
  const secondRole=roles[1]?.[0] || strongRole;
  const stem=stemByName(chart.dayMaster);
  const element=ELEMENT_STYLE[strongElement];
  const weak=ELEMENT_STYLE[weakElement];
  const dayMaster=DAY_MASTER_STYLE[chart.dayMaster] || DAY_MASTER_STYLE.무;
  const role=ROLE_STYLE[strongRole];
  const second=ROLE_STYLE[secondRole];
  const rel=relationSentence(chart.relations);
  const wealthRatio=ratio(chart.roles,'재성');
  const roleRatio=ratio(chart.roles,strongRole);
  const elementRatio=ratio(chart.elements,strongElement);
  const timeNote=timeKnown
    ? '출생시간을 포함한 네 기둥을 모두 계산했습니다.'
    : '출생시간을 모르는 설정이므로 시주 관련 해석은 확정적으로 사용하지 않습니다.';

  const categories=[
    {
      id:'personality',title:'성향',eyebrow:'나를 움직이는 방식',
      headline:dayMaster.title+'.',
      summary:dayMaster.core+' '+dayMaster.decision+' 여기에 '+element.gift+'과 '+role.label+' 성향이 겹치면서, 같은 상황에서도 무엇을 먼저 보고 어떤 방식으로 결론을 내리는지가 더 선명해집니다.',
      strength:[dayMaster.decision,element.gift,role.strength],
      watch:[dayMaster.stress,element.risk,role.friction],
      practice:'중요한 결정은 “내가 원하는 것 / 확인해야 할 사실 / 지금 하지 않을 것” 세 줄로 나누면 강점은 살리고 과부하는 줄이기 쉽습니다.',
      evidence:['나를 보는 기준점: '+stem.hanja+'('+chart.dayMaster+') · '+stem.yinYang+' '+stem.element,'가장 두드러진 오행: '+strongElement+' '+elementRatio+'%','가장 두드러진 역할: '+ROLE_LABELS[strongRole]+' '+roleRatio+'%',rel]
    },
    {
      id:'work',title:'일',eyebrow:'잘하는 방식과 맞는 환경',
      headline:element.work+'에서 '+role.label+'의 장점이 가장 잘 살아납니다.',
      summary:'직업명보다 중요한 것은 일하는 구조입니다. '+dayMaster.decision+' '+role.work+'이 맞고, 보조 성향인 '+second.label+'이 함께 쓰일 때 방향을 잡는 힘과 내용을 채우는 힘이 균형을 이루기 쉽습니다.',
      strength:['정리가 덜 된 문제를 자기 기준으로 구조화하는 능력',second.strength],
      watch:['권한은 없는데 결과 책임만 큰 환경','기준이 자주 바뀌는데 설명이나 피드백이 없는 환경'],
      practice:'새 역할을 볼 때 직함보다 “결정권 / 전문성 축적 / 결과 확인 / 피드백 질” 네 가지를 먼저 확인하세요.',
      evidence:['주 역할: '+ROLE_LABELS[strongRole],'보조 역할: '+ROLE_LABELS[secondRole],'강한 오행이 만드는 업무 방식: '+ELEMENT_LABELS[strongElement].keyword]
    },
    {
      id:'money',title:'돈',eyebrow:'돈을 다루는 습관',
      headline:wealthRatio>=25?'돈과 성과를 현실적으로 계산하려는 힘이 비교적 선명합니다.':wealthRatio<=14?'수익 자체보다 다른 가치가 먼저 움직일 수 있어 숫자를 의식적으로 확인하는 편이 좋습니다.':'재물 성향은 한쪽으로 치우치기보다 상황에 따라 달라지는 편입니다.',
      summary:role.money+'이 기본 원칙과 잘 맞습니다. 좋은 흐름이라는 이유로 위험을 크게 가져가기보다 수입·고정비·손실 한도·회수 기간을 숫자로 확인할 때 판단이 안정됩니다.',
      strength:['돈을 한 번의 행운보다 반복 가능한 구조로 바라보기','자신의 기준을 세운 뒤 지출과 선택을 정리하기'],
      watch:['운세 문장을 투자·대출·큰 소비의 단독 근거로 사용하기','손실 가능성을 확인하지 않은 채 기회만 크게 해석하기'],
      practice:'큰 결정은 “최대 손실 / 월 유지비 / 되돌릴 수 있는지”를 적은 뒤 판단하세요.',
      evidence:['재성 비중: '+wealthRatio+'%','전체 역할 분포 안에서 재성을 함께 비교','재물운은 사건 예측이 아니라 선택 습관 중심으로 해석']
    },
    {
      id:'relationship',title:'관계',eyebrow:'가까운 사람과 부딪히는 지점',
      headline:role.relation+'이 관계를 편하게 만드는 핵심입니다.',
      summary:'가까운 관계에서는 사회적 역할보다 본래의 속도와 기준이 더 선명하게 드러납니다. '+dayMaster.relation+' '+rel+' 이 표시는 상대의 마음을 예언하는 것이 아니라, 갈등이나 연결이 생길 때 내가 어떤 방식으로 반응하기 쉬운지 보는 단서입니다.',
      strength:['관계에서도 자기 기준을 잃지 않는 힘','반복되는 행동을 통해 신뢰 여부를 판단하는 현실감'],
      watch:['상대가 내 기대를 이미 알고 있다고 가정하기','한 번의 강한 감정으로 관계 전체를 결론내리기'],
      practice:'불편함이 생기면 “사실 / 내가 느낀 점 / 원하는 다음 행동” 순서로 짧게 말해 보세요.',
      evidence:['원국 지지 관계: '+(relationTypes(chart.relations).join('·')||'뚜렷한 관계 신호 적음'),'주 역할의 관계 방식: '+role.label]
    },
    {
      id:'recovery',title:'회복',eyebrow:'지칠 때 나타나는 패턴',
      headline:'강점인 '+strongElement+'의 힘이 과해질 때 '+element.risk.replace('수 있습니다.','기 쉽습니다.'),
      summary:'회복은 부족한 오행을 물건이나 색으로 채우는 방식보다 생활 패턴을 조정하는 쪽이 더 실용적입니다. 상대적으로 덜 쓰는 '+weakElement+'의 태도는 “없는 성격”이 아니라 피곤할 때 의식적으로 꺼내 쓸 보완 전략으로 보는 편이 좋습니다.',
      strength:['자신이 익숙하게 쓰는 에너지 방식을 빠르게 파악하기',role.recovery],
      watch:['피곤할수록 같은 방식으로 더 세게 밀어붙이기',weak.risk],
      practice:element.recovery+'을 회복 루틴으로 고정해 보세요.',
      evidence:['강한 오행: '+strongElement,'상대적으로 낮은 오행: '+weakElement,timeNote]
    }
  ];

  return {
    signature:{
      title:dayMaster.title,
      subtitle:stem.hanja+'('+chart.dayMaster+')의 판단 방식 위에 '+role.label+' 성향이 중심을 잡고 '+second.label+' 성향이 보조합니다.',
      note:'사주는 미래를 확정하는 예언이 아니라 전통 명리 규칙으로 성향과 시기별 질문을 정리하는 참고 도구입니다.'
    },
    categories,
    structure:{
      strongElement,weakElement,strongRole,secondRole,
      elements:elements.map(([key,value])=>({key,label:ELEMENT_LABELS[key]?.label||key,value,ratio:ratio(chart.elements,key)})),
      roles:roles.map(([key,value])=>({key,label:ROLE_LABELS[key]||key,value,ratio:ratio(chart.roles,key)})),
      pillars:pillarText(chart),
      basis:chart.basis,
      timeKnown
    }
  };
}

export function buildYearReading(chart,yearFlow,monthFlows){
  const year=TEN_GOD_YEAR[yearFlow.tenGod] || TEN_GOD_YEAR.정인;
  const relTypes=relationTypes(yearFlow.relations);
  const relation=relTypes.length
    ? relTypes.map((type)=>RELATION_COPY[type]||type).join(' / ')
    : '원국과 세운 사이의 큰 충돌 신호가 두드러지지 않음';
  const months=monthFlows.map((flow,index)=>{
    const branch=BRANCH_MONTH[flow.branch] || BRANCH_MONTH.축;
    const god=TEN_GOD_YEAR[flow.tenGod] || TEN_GOD_YEAR.정인;
    const rel=relationTypes(flow.relations);
    const display=monthNumber(flow);
    return {
      key:String(flow.sajuMonth||index+1),
      month:display,
      title:display+'월 · '+branch.title,
      headline:MONTH_OPENERS[index%MONTH_OPENERS.length],
      focus:god.opportunity,
      action:branch.use,
      caution:branch.avoid+' '+god.risk+'를 함께 경계하세요.',
      signal:rel.length?rel.join('·')+' 신호':'큰 충돌 신호 없음',
      evidence:flow.korean+' · '+flow.tenGod+' · 절입 '+new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'short',day:'numeric'}).format(flow.start)
    };
  });
  return {
    year:yearFlow.year,
    title:year.title,
    summary:'올해의 중심 주제는 '+year.opportunity+'입니다. 흐름이 좋다는 말보다 “어디에 힘을 쓰고 무엇을 경계할지”를 분리해서 보는 편이 실제 생활에 더 도움이 됩니다.',
    opportunity:year.opportunity,
    caution:year.risk,
    relation,
    months
  };
}

export function buildDailyReading(chart,todayFlow,scores){
  const god=TEN_GOD_YEAR[todayFlow.tenGod] || TEN_GOD_YEAR.정인;
  const branch=BRANCH_MONTH[todayFlow.branch] || BRANCH_MONTH.축;
  const rel=relationTypes(todayFlow.relations);
  const categoryMap=[
    ['work','일','오늘은 결과보다 우선순위를 먼저 정하세요.'],
    ['money','돈','돈과 관련된 선택은 조건과 한도를 먼저 확인하세요.'],
    ['love','관계','상대의 마음을 추측하기보다 확인 가능한 행동을 보세요.'],
    ['condition','컨디션','집중력이 떨어지기 전에 쉬는 시간을 먼저 확보하세요.']
  ];
  const categories=categoryMap.map(([key,label,fallback])=>{
    const score=scores[key];
    let direction=fallback;
    if(key==='work') direction=score.score>=70?god.opportunity:branch.use;
    if(key==='money') direction=score.score>=70?'계획한 범위 안의 현실적인 기회를 검토하세요.':'새 지출보다 고정비와 손실 한도를 먼저 점검하세요.';
    if(key==='love') direction=score.score>=70?'짧더라도 먼저 마음을 표현하고 상대 반응을 확인하세요.':'관계의 결론보다 오해가 생긴 지점을 한 번 더 확인하세요.';
    if(key==='condition') direction=score.score>=70?'컨디션이 괜찮을 때 중요한 일을 앞쪽에 배치하세요.':'일정을 줄이고 회복 시간을 확보하는 편이 낫습니다.';
    return {key,label,score:score.score,state:score.label,advice:direction};
  });
  return {
    score:scores.overall.score,
    state:scores.overall.label,
    title:branch.title+'에 초점을 두는 날',
    summary:MONTH_OPENERS[(Number(todayFlow.branch?.charCodeAt?.(0)||0)+todayFlow.date.day)%MONTH_OPENERS.length]+' '+branch.use,
    opportunity:god.opportunity,
    caution:branch.avoid+' '+god.risk+'를 함께 경계하세요.',
    signal:rel.length?rel.join('·')+' 신호':'큰 충돌 신호 없음',
    categories
  };
}
