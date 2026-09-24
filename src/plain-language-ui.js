(() => {
  const root = document.getElementById('results');
  if (!root) return;

  // Product V3 principle:
  // Calculated interpretation copy is the source of truth.
  // This layer may refine presentation labels, but it must never replace
  // personalized report paragraphs or quick-reading items with canned advice.

  const titleMap = {
    temperament: '나의 기본 성향',
    strengths: '내가 잘 쓰는 힘',
    career: '일과 진로',
    money: '돈을 다루는 방식',
    relationships: '관계에서의 나',
    recovery: '회복과 생활 리듬'
  };

  function refineReportTitles() {
    root.querySelectorAll('#detailedReport .detail-chapter[data-report-key]').forEach((chapter) => {
      const title = chapter.querySelector('summary h3');
      const mapped = titleMap[chapter.dataset.reportKey];
      if (title && mapped) title.textContent = mapped;
    });

    const panel = root.querySelector('#keywordInsight');
    const key = panel?.dataset?.reportKey;
    if (panel && titleMap[key]) {
      const title = panel.querySelector('h3');
      if (title) title.textContent = titleMap[key];
      const link = panel.querySelector('a');
      if (link) link.innerHTML = '자세히 읽기 <span aria-hidden="true">→</span>';
    }
  }

  function refineProfileLabels() {
    const reportTitle = root.querySelector('#reportTitle');
    if (reportTitle) reportTitle.textContent = reportTitle.textContent.replace('타고난 구조', '사주 리포트');

    const mbtiLabel = root.querySelector('#mbtiLabel');
    if (mbtiLabel) mbtiLabel.textContent = '성향 참고 · 정식 MBTI 아님';

    const compatibilityNote = root.querySelector('.compatibility-note');
    if (compatibilityNote) {
      compatibilityNote.textContent = '※ 두 사람의 성향 차이를 비교하는 참고 해석입니다. 관계의 미래나 상대의 감정을 단정하지 않습니다.';
    }

    const luckMeta = root.querySelector('#luckMeta');
    if (luckMeta && !luckMeta.dataset.v3Refined) {
      luckMeta.dataset.v3Refined = 'true';
      luckMeta.textContent = luckMeta.textContent
        .replace(/대운/g, '큰 흐름')
        .replace(/약 10년 단위의 장기 배경/g, '몇 년 단위로 이어지는 큰 배경');
    }
  }

  function refineMonthCards() {
    root.querySelectorAll('#monthForecast .month-card').forEach((card) => {
      const month = card.querySelector('.month-number')?.textContent?.trim();
      const focus = card.querySelector('.month-card-focus mark')?.textContent?.split('·')[0]?.trim();
      const title = card.querySelector('.month-card-head strong');
      if (month && focus && title) title.textContent = `${month}월 · ${focus}`;
    });

    root.querySelectorAll('#tojungQuarterGrid .quarter-card h3').forEach((title) => {
      title.textContent = title.textContent.replace(/\s*·.*$/, '');
    });
  }

  function markExactDuplicateParagraphs() {
    const selectors = [
      '.detail-chapter-body',
      '.daily-brief-grid',
      '.daily-action-guide',
      '.compatibility-grid',
      '.tarot-reading-grid'
    ];
    root.querySelectorAll(selectors.join(',')).forEach((container) => {
      const seen = new Set();
      container.querySelectorAll('p').forEach((paragraph) => {
        const key = paragraph.textContent.replace(/\s+/g, ' ').trim();
        if (key.length < 30) return;
        paragraph.dataset.plainDuplicate = seen.has(key) ? 'true' : 'false';
        if (!seen.has(key)) seen.add(key);
      });
    });
  }

  function apply() {
    refineReportTitles();
    refineProfileLabels();
    refineMonthCards();
    markExactDuplicateParagraphs();
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      observer.disconnect();
      apply();
      observer.observe(root, { subtree: true, childList: true });
    });
  });

  observer.observe(root, { subtree: true, childList: true });
  requestAnimationFrame(apply);
})();
