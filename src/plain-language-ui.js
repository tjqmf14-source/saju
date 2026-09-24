(() => {
  const root = document.getElementById('results');
  if (!root) return;

  const replacements = [
    [/편관|정관/g, '책임과 규칙'],
    [/편인|정인/g, '배움과 회복'],
    [/편재|정재/g, '현실과 재정'],
    [/식신|상관/g, '표현과 실행'],
    [/비견|겁재/g, '자기주도'],
    [/비겁/g, '자기주도'],
    [/식상/g, '표현과 실행'],
    [/재성/g, '현실과 재정'],
    [/관성/g, '책임과 규칙'],
    [/인성/g, '배움과 회복'],
    [/신강/g, '자기 힘이 강한 편'],
    [/신약/g, '주변 영향에 민감한 편'],
    [/용신|희신/g, '균형에 도움이 되는 요소'],
    [/기신/g, '과해지기 쉬운 요소'],
    [/격국/g, '전체 성향'],
    [/신살/g, '참고 신호'],
    [/공망/g, '비어 있는 흐름'],
    [/간여지동/g, '겉과 속의 방향이 비슷한 성향'],
    [/조후/g, '계절 균형'],
    [/천간/g, '겉으로 드러나는 성향'],
    [/지지/g, '내면에 자리한 성향'],
    [/연주|월주|일주|시주/g, '출생정보'],
    [/원국/g, '타고난 성향'],
    [/십신/g, '생활 성향'],
    [/오행/g, '성향 균형'],
    [/일간/g, '기본 성향'],
    [/대운/g, '장기 흐름'],
    [/세운|연운/g, '올해 흐름'],
    [/월운/g, '이달 흐름'],
    [/절입/g, '월 흐름 시작'],
    [/절기/g, '계절 변화'],
    [/진태양시/g, '출생시간 보정'],
    [/자시/g, '날짜 경계'],
    [/계산 근거/g, '해석 이유'],
    [/계산 참고/g, '참고'],
    [/전문 해설/g, '더 자세한 설명'],
    [/정밀 해설/g, '쉬운 설명'],
    [/가중 성향 균형 구성에서는/g, '전체 성향을 함께 보면'],
    [/표현 기운/g, '표현하고 실행하는 성향'],
    [/자기기준·동료/g, '내 기준과 독립성'],
    [/직관·비정형 학습/g, '직감적으로 이해하고 스스로 방법을 찾는 방식'],
    [/양 성향/g, '반응이 빠른 편'],
    [/음 성향/g, '신중하게 반응하는 편'],
    [/양\\s*화/g, '표현이 빠르고 활발한 편'],
    [/음\\s*화/g, '차분하게 표현하는 편'],
    [/양\\s*목/g, '새로운 일을 먼저 시작하는 편'],
    [/음\\s*목/g, '유연하게 방향을 넓히는 편'],
    [/양\\s*토/g, '현실적으로 밀고 나가는 편'],
    [/음\\s*토/g, '차분히 정리하고 지키는 편'],
    [/양\\s*금/g, '기준이 분명하고 결단이 빠른 편'],
    [/음\\s*금/g, '세밀하게 판단하고 다듬는 편'],
    [/양\\s*수/g, '생각을 넓게 확장하는 편'],
    [/음\\s*수/g, '깊이 생각하고 신중히 움직이는 편'],
    [/합·충·형·파·해/g, '변화 신호'],
    [/기운/g, '성향'],
    [/타고난 구조/g, '성향 리포트'],
    [/관계를 오래 쓰는 방법/g, '관계를 편하게 이어가는 방법']
  ];


  const ROLE_GUIDE = {
    '자기주도': {
      temperament:['내 기준이 분명하고 스스로 결정할 때 힘이 나는 편입니다.','혼자 빠르게 결론내리기보다 중요한 일은 한 번 더 확인하면 실수가 줄어듭니다.','내 방식을 지키되 상대의 속도와 의견도 함께 확인해보세요.'],
      career:['자율성이 있고 책임 범위가 분명한 일에서 강점을 내기 쉽습니다.','지시를 기다리기보다 목표를 정하고 직접 움직일 때 효율이 올라갑니다.','혼자 다 떠안지 말고 중간 점검 시점을 정해 협업 부담을 줄여보세요.'],
      money:['돈에서도 남의 분위기보다 내 기준과 예산을 먼저 세우는 편이 안정적입니다.','큰 지출은 즉시 결정하지 말고 상한선을 정한 뒤 하루 정도 다시 보세요.','수입을 늘리는 것만큼 반복 지출을 줄이는 습관이 중요합니다.'],
      relationships:['솔직하고 분명한 관계를 편하게 느끼는 편입니다.','상대가 내 생각을 이미 안다고 가정하지 말고 말로 확인해보세요.','갈등이 생기면 누가 맞는지보다 서로 원하는 것을 먼저 정리해보세요.'],
      recovery:['스스로 해결하려는 힘이 강해 피곤해도 버티기 쉬운 편입니다.','지치기 전에 쉬는 시간을 일정에 먼저 넣는 것이 좋습니다.','혼자 정리하는 시간과 가벼운 움직임을 함께 두면 회복에 도움이 됩니다.'],
      balance:['내 기준을 지키는 힘은 장점이지만 너무 오래 혼자 끌고 가지 않는 균형이 필요합니다.','결정 전 한 번 확인하고 쉬어갈 시점을 미리 정해두세요.','잘하는 방식을 줄이기보다 과해질 때 멈추는 기준을 만드는 것이 핵심입니다.']
    },
    '표현·창작': {
      temperament:['생각을 말이나 결과물로 밖에 꺼낼 때 강점이 잘 드러나는 편입니다.','아이디어가 많을수록 한 번에 하나씩 끝내는 기준이 필요합니다.','표현은 빠르게 하되 상대 반응을 확인하며 속도를 맞춰보세요.'],
      career:['기획, 디자인, 콘텐츠처럼 눈에 보이는 결과를 만드는 일에서 힘을 쓰기 쉽습니다.','완벽하게 준비한 뒤 시작하기보다 작은 결과물을 먼저 만들어보는 방식이 잘 맞습니다.','아이디어 수보다 끝낸 결과물 수를 기준으로 우선순위를 정해보세요.'],
      money:['기술과 아이디어를 실제 가치로 연결할 때 돈의 흐름을 만들기 쉽습니다.','새로운 기회가 보여도 먼저 작은 규모로 시험해보는 편이 안전합니다.','수익 아이디어와 소비 욕구를 분리해서 기록해보세요.'],
      relationships:['마음을 표현하는 속도가 빠르고 반응도 분명한 편입니다.','말이 많아질수록 상대가 받아들일 시간을 함께 주는 것이 좋습니다.','중요한 대화에서는 설명보다 먼저 상대의 반응을 확인해보세요.'],
      recovery:['계속 생각하고 표현하다 보면 머리가 쉬지 못할 수 있습니다.','작업을 멈추는 시간과 수면 시간을 일정하게 두는 것이 중요합니다.','짧은 산책이나 화면에서 벗어나는 시간을 의식적으로 만들어보세요.'],
      balance:['표현력은 강점이지만 속도가 너무 빨라지면 피로와 실수가 함께 늘 수 있습니다.','시작하는 힘만큼 마무리하는 시간을 따로 확보해보세요.','하루에 꼭 끝낼 일의 수를 줄이면 강점이 더 선명해집니다.']
    },
    '현실·성과': {
      temperament:['현실적인 기준과 결과를 중요하게 보는 편입니다.','막연한 계획보다 일정과 숫자가 분명할 때 마음이 편해집니다.','효율만 보지 말고 사람과 상황의 여유도 함께 살펴보세요.'],
      career:['목표와 성과가 분명한 일, 일정과 자원을 관리하는 역할에서 강점이 드러나기 쉽습니다.','해야 할 일을 수치와 기한으로 정리하면 집중력이 좋아집니다.','성과를 높이려다 휴식과 관계를 뒤로 미루지 않도록 주의하세요.'],
      money:['예산, 비용, 수익처럼 구체적인 숫자로 돈을 관리할 때 안정적입니다.','큰 결정은 예상 수익보다 손실 가능성과 유지 비용을 먼저 확인하세요.','고정비와 반복 지출을 정리하면 체감 효과가 큽니다.'],
      relationships:['말보다 약속을 지키는 행동으로 신뢰를 쌓는 편입니다.','상대가 원하는 것이 해결책인지 공감인지 먼저 확인해보세요.','관계를 효율로만 판단하지 말고 감정을 표현하는 시간도 필요합니다.'],
      recovery:['할 일을 끝내야 쉰다고 느끼기 쉬워 휴식이 늦어질 수 있습니다.','쉬는 시간을 할 일 목록의 마지막이 아니라 일정의 일부로 넣어보세요.','식사와 수면처럼 기본 루틴을 먼저 지키는 것이 회복에 도움이 됩니다.'],
      balance:['현실 감각은 강점이지만 결과만 보다가 과정의 피로를 놓치지 않는 균형이 필요합니다.','숫자로 관리할 일과 감정으로 살펴볼 일을 구분해보세요.','성과를 유지하려면 쉬는 시간도 계획에 포함해야 합니다.']
    },
    '책임·규칙': {
      temperament:['책임과 기준을 중요하게 생각하고 약속을 지키려는 편입니다.','맡은 일을 잘하려는 마음이 커서 필요 이상으로 부담을 안을 수 있습니다.','내가 꼭 해야 하는 일과 다른 사람에게 맡겨도 되는 일을 나눠보세요.'],
      career:['책임 범위와 기준이 분명한 환경에서 꾸준한 강점을 내기 쉽습니다.','품질과 약속을 지키는 능력이 장점으로 작용합니다.','모든 문제를 내 책임으로 받아들이지 말고 역할의 경계를 분명히 하세요.'],
      money:['무리한 승부보다 계획과 규칙을 지키는 방식이 재정 안정에 잘 맞습니다.','정기 지출과 장기 계획을 먼저 정리한 뒤 새로운 결정을 보세요.','안전만 고집해 필요한 기회까지 미루지 않는 균형도 필요합니다.'],
      relationships:['관계를 진지하게 대하고 신뢰를 오래 쌓는 편입니다.','상대를 평가하거나 기준에 맞추려 하기보다 기대를 말로 설명해보세요.','해야 할 말은 미루지 말되 부드러운 표현을 함께 사용해보세요.'],
      recovery:['긴장 상태가 오래 이어지면 쉬는 중에도 일을 생각하기 쉽습니다.','업무를 끝내는 시간을 분명히 정하고 집에서는 다른 리듬을 만들어보세요.','완벽하게 해내는 것보다 충분히 해낸 뒤 멈추는 연습이 필요합니다.'],
      balance:['책임감은 강점이지만 모든 일을 책임질 필요는 없습니다.','맡을 일과 내려놓을 일을 분리하면 오래 안정적으로 갈 수 있습니다.','기준을 지키되 상황에 따라 조금 유연해져도 괜찮습니다.']
    },
    '학습·사고': {
      temperament:['먼저 이해하고 충분히 생각한 뒤 움직이는 편입니다.','정보가 많아질수록 시작이 늦어질 수 있어 결정 시점을 정하는 것이 좋습니다.','완벽히 이해한 뒤 시작하기보다 필요한 만큼 알고 먼저 움직여보세요.'],
      career:['분석, 리서치, 기록처럼 정보를 정리해 품질을 높이는 일에서 강점이 큽니다.','복잡한 문제를 오래 살펴보고 구조를 찾는 데 잘 맞습니다.','준비가 길어지지 않도록 중간 결과를 정해두고 실행으로 옮겨보세요.'],
      money:['급하게 결정하기보다 정보를 충분히 확인한 뒤 움직이는 방식이 잘 맞습니다.','정보를 더 찾기 전에 투자·지출 기준부터 먼저 적어보세요.','결정 후에도 계속 비교하기보다 정한 기준을 일정 기간 유지해보세요.'],
      relationships:['사람을 오래 관찰하고 천천히 신뢰를 쌓는 편입니다.','생각만으로 상대 마음을 추측하지 말고 궁금한 점은 직접 확인해보세요.','혼자 정리할 시간이 필요하다는 것을 미리 말하면 오해가 줄어듭니다.'],
      recovery:['생각이 많아질수록 쉬는 시간에도 머리가 계속 움직일 수 있습니다.','잠들기 전 화면과 정보 입력을 줄이는 것이 도움이 됩니다.','몸을 움직이는 짧은 활동으로 생각의 흐름을 끊어보세요.'],
      balance:['깊이 생각하는 힘은 장점이지만 실행 시점을 놓치지 않는 균형이 필요합니다.','결정에 필요한 정보의 양을 미리 정해두세요.','생각이 길어질 때는 아주 작은 행동 하나부터 시작해보세요.']
    }
  };

  const FRIENDLY_TITLES = {
    temperament:'성격', strengths:'강점', career:'일과 진로', money:'돈',
    relationships:'관계', recovery:'회복', balance:'균형'
  };

  function currentRole() {
    const tags=[...root.querySelectorAll('#profileTags span')];
    const label=tags[1]?.textContent?.trim();
    return ROLE_GUIDE[label] ? label : '학습·사고';
  }

  function guideFor(key) {
    return ROLE_GUIDE[currentRole()]?.[key] || ROLE_GUIDE['학습·사고'][key] || [];
  }

  function rewriteFriendlyAdvice() {
    for (const key of ['temperament','strengths','career','money','relationships','recovery']) {
      const chapter=root.querySelector(`#detailedReport [data-report-key="${key}"]`);
      const lines=guideFor(key);
      if(!chapter || !lines.length) continue;
      const heading=chapter.querySelector('summary h3');
      const summary=chapter.querySelector('summary p');
      const takeaway=chapter.querySelector('.chapter-takeaway mark');
      if(heading) heading.textContent=FRIENDLY_TITLES[key];
      if(summary) summary.textContent=lines[0];
      if(takeaway) takeaway.textContent=lines[0];
      const labels=['핵심','조금 더 쉽게','생활 조언'];
      chapter.querySelectorAll('.chapter-quick-list li').forEach((item,index)=>{
        const label=item.querySelector('strong');
        const body=item.querySelector('span');
        if(label) label.textContent=labels[index] || '참고';
        if(body) body.textContent=lines[index] || lines.at(-1);
      });
    }

    const panel=root.querySelector('#keywordInsight');
    const key=panel?.dataset?.reportKey;
    if(panel && FRIENDLY_TITLES[key]){
      const lines=guideFor(key);
      const heading=panel.querySelector('h3');
      const body=panel.querySelector('p');
      const link=panel.querySelector('a');
      if(heading) heading.textContent=FRIENDLY_TITLES[key];
      if(body) body.textContent=[lines[0],lines[2]].filter(Boolean).join(' ');
      if(link){
        if(key==='balance') link.hidden=true;
        else{
          link.hidden=false;
          link.href='#report-'+key;
          link.innerHTML='쉽게 이어 읽기 <span aria-hidden="true">→</span>';
        }
      }
    }
  }

  for (const guide of Object.values(ROLE_GUIDE)) {
    guide.strengths = guide.strengths || [
      guide.balance?.[0] || '잘하는 방식이 분명한 편입니다.',
      guide.temperament?.[1] || '강점이 과해질 때만 한 번 더 점검해보세요.',
      guide.balance?.[2] || '잘하는 방식을 상황에 맞게 조절하면 더 안정적입니다.'
    ];
  }

  const skipTags = new Set(['SCRIPT','STYLE','SVG','PATH','SYMBOL','USE']);
  const simplifyText = (value) => {
    let text = String(value || '');
    for (const [pattern, replacement] of replacements) text = text.replace(pattern, replacement);
    return text.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1');
  };

  function simplifyTextNodes(scope) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName)) continue;
      const next = simplifyText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function simplifyDailyTime() {
    root.querySelectorAll('#dailyTimeFlow article').forEach((article) => {
      const strong = article.querySelector('strong');
      const body = article.querySelector('p');
      if (strong) {
        const parts = strong.textContent.split('·').map((part) => part.trim()).filter(Boolean);
        strong.textContent = simplifyText(parts.at(-1) || strong.textContent);
      }
      if (body) body.textContent = simplifyText(body.textContent.split(' · ')[0]);
    });
  }

  function simplifyMonthAndQuarter() {
    root.querySelectorAll('#monthForecast .month-card').forEach((card) => {
      const month = card.querySelector('.month-number')?.textContent?.trim();
      const title = card.querySelector('.month-card-head strong');
      const focus = card.querySelector('.month-card-focus mark')?.textContent?.split('·')[0]?.trim();
      if (month && title) title.textContent = focus ? `${month}월 · ${simplifyText(focus)}` : month + '월';
    });
    root.querySelectorAll('#tojungQuarterGrid .quarter-card h3').forEach((title) => {
      title.textContent = title.textContent.replace(/\s*·.*$/, '');
    });
  }

  function simplifyDetailedReport() {
    const labels = ['핵심', '근거', '생활 조언'];
    root.querySelectorAll('#detailedReport .chapter-quick-list').forEach((list) => {
      list.querySelectorAll('li strong').forEach((label, index) => {
        label.textContent = labels[index] || '참고';
      });
    });
    root.querySelectorAll('#keywordInsight a').forEach((link) => {
      link.innerHTML = '쉽게 이어 읽기 <span aria-hidden="true">→</span>';
    });
  }

  function simplifyProductCopy() {
    const reportTitle = root.querySelector('#reportTitle');
    if (reportTitle) reportTitle.textContent = reportTitle.textContent.replace('타고난 구조','성향 리포트');
    const reportLead = root.querySelector('#reportLead');
    if (reportLead) reportLead.textContent = simplifyText(reportLead.textContent);
    root.querySelectorAll('.compatibility-card strong').forEach((el)=>{
      el.textContent = el.textContent.replace('관계를 오래 쓰는 방법','관계를 편하게 이어가는 방법');
    });
  }

  function simplifyHeadings() {
    const yearTitle = root.querySelector('#yearTitle');
    if (yearTitle) {
      const year = yearTitle.textContent.match(/\d{4}/)?.[0];
      if (year) yearTitle.textContent = year + '년, 이렇게 보내보세요';
    }
    const mbtiLabel = root.querySelector('#mbtiLabel');
    if (mbtiLabel) mbtiLabel.textContent = '성향 참고 · 가볍게 참고하세요';
    const compatibilityNote = root.querySelector('.compatibility-note');
    if (compatibilityNote) compatibilityNote.textContent = '※ 두 사람의 성향 차이를 생활 언어로 정리한 참고 해석입니다. 관계의 미래나 감정을 단정하지 않습니다.';
    const luckMeta = root.querySelector('#luckMeta');
    if (luckMeta) luckMeta.textContent = '몇 년 단위로 달라지는 큰 흐름에서 지금 무엇에 힘을 쓰면 좋은지 간단히 정리합니다.';
    root.querySelectorAll('#luckTimeline .luck-step').forEach((step) => {
      const label = step.querySelector('.luck-step-head > span');
      if (label) label.textContent = step.classList.contains('active') ? '지금의 큰 흐름' : '앞으로의 큰 흐름';
    });
  }

  function removeExactRepetition() {
    const containers = root.querySelectorAll('.detail-chapter-body,.daily-brief-grid,.daily-action-guide,.compatibility-grid,.tarot-reading-grid');
    containers.forEach((container) => {
      const seen = new Set();
      container.querySelectorAll('p').forEach((paragraph) => {
        const key = paragraph.textContent.replace(/\s+/g, ' ').trim();
        if (key.length < 22) return;
        if (seen.has(key)) paragraph.dataset.plainDuplicate = 'true';
        else seen.add(key);
      });
    });
  }

  function apply() {
    simplifyTextNodes(root);
    simplifyDailyTime();
    simplifyMonthAndQuarter();
    simplifyDetailedReport();
    simplifyHeadings();
    simplifyProductCopy();
    rewriteFriendlyAdvice();
    removeExactRepetition();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      observer.disconnect();
      apply();
      observer.observe(root, {subtree:true, childList:true, characterData:true});
    });
  });

  observer.observe(root, {subtree:true, childList:true, characterData:true});
  requestAnimationFrame(apply);
})();