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
    [/합·충·형·파·해/g, '변화 신호']
  ];

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
      if (month && title) title.textContent = month + '월';
    });
    root.querySelectorAll('#tojungQuarterGrid .quarter-card h3').forEach((title) => {
      title.textContent = title.textContent.replace(/\s*·.*$/, '');
    });
  }

  function simplifyDetailedReport() {
    const labels = ['핵심', '쉽게 말하면', '생활 조언'];
    root.querySelectorAll('#detailedReport .chapter-quick-list').forEach((list) => {
      list.querySelectorAll('li strong').forEach((label, index) => {
        label.textContent = labels[index] || '참고';
      });
    });
    root.querySelectorAll('#keywordInsight a').forEach((link) => {
      link.innerHTML = '쉽게 이어 읽기 <span aria-hidden="true">→</span>';
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