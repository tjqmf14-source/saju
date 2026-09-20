const ELEMENT_COPY={
  목:{name:'목',strength:'새로운 것을 시작하고 확장하려는 힘',risk:'하고 싶은 일을 너무 많이 벌여 마무리가 늦어질 수 있습니다.'},
  화:{name:'화',strength:'표현하고 드러내며 분위기를 움직이는 힘',risk:'속도가 빨라져 말과 행동이 앞설 수 있습니다.'},
  토:{name:'토',strength:'흐름을 안정시키고 현실적으로 정리하는 힘',risk:'안정을 지키려다 변화가 필요한 시점을 늦출 수 있습니다.'},
  금:{name:'금',strength:'기준을 세우고 잘라내며 완성도를 높이는 힘',risk:'기준이 높아지면 자신과 타인에게 지나치게 엄격해질 수 있습니다.'},
  수:{name:'수',strength:'관찰하고 생각을 깊게 이어가는 힘',risk:'생각이 길어지면 실행 시점을 놓치거나 피로가 누적될 수 있습니다.'}
};
const ROLE_COPY={
  비겁:{name:'자기주도',plain:'남의 기준보다 내 판단으로 결정하고 움직이는 성향',work:'독립적으로 책임지는 일이나 내 방식이 필요한 상황에서 힘을 쓰기 쉽습니다.',money:'재정에서도 남의 흐름보다 내 기준과 예산을 먼저 세우는 편이 안정적입니다.',relation:'관계에서 솔직하고 분명하지만, 상대 속도를 확인하지 않으면 독주처럼 보일 수 있습니다.'},
  식상:{name:'표현·결과물',plain:'생각을 말·글·디자인·성과물로 밖에 꺼내는 성향',work:'창작, 기획, 발표, 콘텐츠처럼 결과가 눈에 보이는 일에서 강점이 살아납니다.',money:'기술과 아이디어를 실제 상품이나 성과로 연결할 때 돈의 흐름이 좋아지기 쉽습니다.',relation:'마음을 표현하는 행동이 빠른 편이지만, 말이 많아질수록 상대 반응도 함께 확인하는 것이 좋습니다.'},
  재성:{name:'현실·성과',plain:'시간·돈·일정을 실제 결과로 연결하려는 성향',work:'목표와 성과가 분명한 일, 일정과 자원을 관리하는 역할에서 실용성이 드러납니다.',money:'돈을 추상적으로 보기보다 예산, 비용, 수익처럼 구체적으로 관리할 때 강점이 납니다.',relation:'말보다 약속을 지키는 행동으로 신뢰를 쌓는 편입니다.'},
  관성:{name:'책임·기준',plain:'규칙과 책임, 사회적 역할을 의식하며 움직이는 성향',work:'조직 안에서 책임 범위가 분명하거나 품질과 기준을 지키는 일에 잘 맞습니다.',money:'무리한 승부보다 계획과 규칙을 지키는 방식이 재정 안정에 유리합니다.',relation:'관계를 진지하게 대하지만 상대를 평가하거나 기준에 맞추려는 태도는 줄이는 편이 좋습니다.'},
  인성:{name:'배움·회복',plain:'먼저 이해하고 준비한 뒤 움직이려는 성향',work:'리서치, 공부, 분석, 기록처럼 정보를 축적해 품질을 높이는 일에서 장점이 큽니다.',money:'급하게 투자하기보다 정보를 충분히 확인한 뒤 결정하는 방식이 잘 맞습니다.',relation:'상대를 오래 관찰하고 천천히 신뢰를 쌓는 편이라 관계 시작은 느려도 안정적으로 이어질 수 있습니다.'}
};
const RELATION_PLAIN={합:'사람이나 상황이 서로 연결되며 협력 포인트가 생기기 쉬운 구조',삼합:'여러 기운이 한 방향으로 모여 특정 성향이 강해지는 구조',충:'서로 다른 방향이 부딪혀 변화·이동·결단이 자주 필요한 구조',형:'같은 문제를 반복해서 점검하게 되는 긴장 패턴',파:'기존 방식을 깨고 다시 조정하는 과정이 생기기 쉬운 구조',해:'겉으로 드러나지 않는 불편이나 오해를 세심하게 살펴야 하는 구조'};

function sorted(object){return Object.entries(object).sort((a,b)=>b[1]-a[1]);}
function pct(value,total){return Math.round(value/(total||1)*100);}

export function buildPlainChartGuide(chart){
  const elements=sorted(chart.elements);
  const roles=sorted(chart.roles);
  const [strongElement,strongElementValue]=elements[0];
  const [weakElement]=elements.at(-1);
  const [strongRole,strongRoleValue]=roles[0];
  const elementTotal=elements.reduce((sum,[,value])=>sum+value,0);
  const roleTotal=roles.reduce((sum,[,value])=>sum+value,0);
  const element=ELEMENT_COPY[strongElement];
  const role=ROLE_COPY[strongRole];
  const relationTypes=[...new Set((chart.relations||[]).map((item)=>item.type))];
  const relationSentence=relationTypes.length
    ? relationTypes.map((type)=>`${type}은 ${RELATION_PLAIN[type]||'기운 사이의 관계를 읽는 표시'}`).join(' / ')
    : '두드러진 합·충·형·파·해가 많지 않아 관계 구조가 비교적 단순한 편입니다.';
  const headline=`당신의 원국은 ${element.strength}과 ${role.plain}이 함께 두드러지는 구조로 읽힙니다.`;
  return {
    headline,
    summary:`쉽게 말하면, 복잡한 한자와 숫자보다 먼저 보아야 할 핵심은 '${element.name}의 힘'과 '${role.name}'입니다. ${element.strength}이 익숙하고, 실제 행동에서는 ${role.plain}이 반복되기 쉽습니다. 다만 ${element.risk}`,
    sections:{
      personality:{
        title:'나는 어떤 사람인가',
        summary:`기본 성향은 ${element.strength} 쪽으로 기울어 있습니다. 동시에 ${role.plain}도 강하게 작동해, 낯선 상황에서도 먼저 상황을 읽고 자신에게 맞는 방식으로 정리하려는 경향이 나타날 수 있습니다. ${element.risk}`,
        lifeExample:`생활에서는 새로운 일을 시작할 때 속도가 붙는 방식, 문제를 정리할 때 자신만의 기준을 세우는 방식처럼 반복적으로 드러날 수 있습니다. 중요한 것은 강한 성향을 줄이는 것이 아니라, 언제 힘을 쓰고 언제 쉬어야 하는지 구분하는 것입니다.`,
        evidence:`오행에서는 ${strongElement}가 약 ${pct(strongElementValue,elementTotal)}%로 가장 높고, 십성 그룹에서는 ${strongRole}가 약 ${pct(strongRoleValue,roleTotal)}%로 가장 높게 계산되었습니다.`
      },
      work:{
        title:'일에서는 어떻게 나타나는가',
        summary:`${role.work} 여기에 ${element.strength}이 더해져, 익숙한 방식만 반복하기보다 개선점이나 새 방향을 찾아내는 쪽에서 장점이 드러날 수 있습니다. 반면 한 번에 여러 일을 벌이면 완성도가 흔들릴 수 있으니 우선순위 관리가 중요합니다.`,
        lifeExample:`업무에서는 '무엇을 해야 하는지'가 분명한 상태보다, 정리가 덜 된 문제를 구조화하거나 결과물을 만드는 상황에서 강점이 보이기 쉽습니다. 맡은 일을 끝내는 기준과 중간 점검 시점을 미리 정하면 효율이 올라갑니다.`,
        evidence:`직업 해석은 가장 높은 십성 그룹 ${strongRole}의 성향과 강한 오행 ${strongElement}, 그리고 일간 ${chart.dayMaster}을 함께 참고했습니다.`
      },
      money:{
        title:'돈과 현실 감각',
        summary:`${role.money} 원국의 강한 성향이 추진력으로 쓰일 때는 수입 기회를 만들 수 있지만, 반대로 속도가 과해지면 지출이나 결정도 빨라질 수 있습니다. 큰 결정보다 반복 지출과 고정비를 먼저 관리하는 방식이 잘 맞습니다.`,
        lifeExample:`재정에서는 '좋아 보이니까 바로 결정'보다 예산 상한, 손실 가능성, 유지 비용을 숫자로 적어 보는 습관이 도움이 됩니다. 새로운 수익 아이디어는 작게 시험하고 실제 반응을 본 뒤 확대하는 방식이 안정적입니다.`,
        evidence:`재물 관련 해석은 재성의 상대 비중뿐 아니라 전체 십성 분포와 오행 편중을 함께 보고, 특정 한 요소만으로 좋고 나쁨을 단정하지 않았습니다.`
      },
      relationships:{
        title:'사람과 관계에서는',
        summary:`${role.relation} 원국의 관계 표시는 다음처럼 읽을 수 있습니다. ${relationSentence}. 이는 사건을 예언하는 문장이 아니라, 사람과 부딪히거나 연결될 때 어떤 반응이 반복되기 쉬운지 살펴보는 참고 자료입니다.`,
        lifeExample:`실제 관계에서는 상대가 내 기대를 알고 있다고 가정하기보다 기준과 감정을 말로 확인하는 것이 좋습니다. 특히 갈등이 생겼을 때 즉시 결론을 내리기보다 사실과 감정을 분리해 대화하면 같은 패턴의 반복을 줄일 수 있습니다.`,
        evidence:`지지 관계에서 확인된 표시는 ${(chart.relations||[]).length?relationTypes.join('·'):'뚜렷한 관계 신호 없음'}이며, 각각은 합·충·형·파·해의 전통적 관계 규칙을 기준으로 계산했습니다.`
      },
      recovery:{
        title:'스트레스와 회복 방식',
        summary:`강한 ${strongElement} 기운은 ${element.strength}으로 쓰이지만, 과해지면 ${element.risk} 특히 약한 ${weakElement} 요소가 상징하는 방식은 평소 잘 쓰지 않는 보완 루틴으로 참고할 수 있습니다. 회복은 운세보다 수면·휴식·생활 리듬을 우선해 해석합니다.`,
        lifeExample:`피곤할수록 더 밀어붙이는지, 생각이 길어지는지, 사람을 피하는지처럼 반복되는 반응을 관찰해 보세요. 회복 루틴은 거창하게 만들기보다 일정한 수면 시간, 짧은 산책, 작업 중단 기준처럼 실제 지킬 수 있는 행동으로 두는 편이 좋습니다.`,
        evidence:`오행 최고값은 ${strongElement}, 최저값은 ${weakElement}입니다. 이 차이는 성격의 우열이 아니라 자주 쓰는 방식과 덜 쓰는 방식을 설명하는 참고값입니다.`
      }
    },
    glossary:[
      {term:'일간',plain:'사주에서 나 자신을 보는 기준점. 네 기둥 중 일주의 천간입니다.'},
      {term:'오행',plain:'목·화·토·금·수 다섯 범주. 성격 점수가 아니라 에너지와 행동 방식을 분류하는 언어입니다.'},
      {term:'십성',plain:'나를 기준으로 사람·돈·성과·책임·배움의 관계를 분류하는 체계입니다.'},
      {term:'연주·월주·일주·시주',plain:'태어난 연·월·일·시간을 각각 두 글자의 간지로 표현한 네 기둥입니다.'},
      {term:'합·충',plain:'합은 연결과 결합, 충은 방향의 충돌과 변화를 읽는 대표적인 지지 관계입니다.'},
      {term:'형·파·해',plain:'반복 긴장, 구조 조정, 숨은 불편처럼 관계의 세부 패턴을 보는 표시입니다.'},
      {term:'신강·신약',plain:'일간이 주변 기운의 도움을 얼마나 받는지 보는 해석 틀입니다. 학파와 판단 기준에 따라 해석 차이가 있어 단정하지 않습니다.'}
    ]
  };
}
