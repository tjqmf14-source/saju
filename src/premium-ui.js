import '../premium.css';
import {
  calculateSaju,
  calculateYearFlows,
  calculateMonthFlows,
  calculateTodayFlow
} from './saju-engine.js';
import { ROLE_LABELS, ELEMENT_LABELS } from './data.js';

const $ = (id) => document.getElementById(id);
const form = $('birthForm');

const GROUP_COPY = {
  비겁: {
    label: '자기주도',
    summary: '내 기준과 독립성이 강해지는 흐름',
    opportunity: '주도권이 필요한 일, 개인 프로젝트, 결단',
    caution: '경쟁심, 독단, 혼자 모든 것을 해결하려는 태도',
    money: '지인과 얽힌 지출보다 내 예산 기준을 분명히 정하는 편이 좋습니다.',
    love: '내 속도만 밀기보다 상대의 반응을 확인하면서 관계를 맞춰가세요.',
    work: '책임 범위가 명확한 일에서 실력이 잘 드러납니다.',
    health: '긴장이 오래 쌓이지 않게 휴식 시간을 미리 확보해 두세요.'
  },
  식상: {
    label: '표현·창작',
    summary: '표현과 결과물이 살아나는 흐름',
    opportunity: '발표, 콘텐츠, 디자인, 글쓰기, 결과물 공개',
    caution: '말이 앞서거나 체력을 한꺼번에 쓰는 패턴',
    money: '아이디어를 실제 상품과 성과로 연결하는 시도가 잘 맞습니다.',
    love: '마음을 표현하는 작은 행동이 관계 분위기를 바꾸기 쉽습니다.',
    work: '생각을 보이는 결과물로 꺼낼수록 기회가 커집니다.',
    health: '활동과 휴식의 균형, 특히 수면 리듬을 일정하게 유지하세요.'
  },
  재성: {
    label: '재물·성과',
    summary: '돈과 현실 감각이 중요해지는 흐름',
    opportunity: '예산 관리, 계약 확인, 성과 정리, 현금 흐름 점검',
    caution: '눈앞의 이익만 보고 서두르는 선택',
    money: '수입보다 먼저 지출 구조와 반복 비용을 정리해 보세요.',
    love: '말보다 약속을 지키는 행동이 신뢰를 높이는 시기입니다.',
    work: '수치와 결과가 보이는 일에서 만족도가 높아질 수 있습니다.',
    health: '바쁜 일정 속에서도 식사와 휴식 시간을 일정하게 유지하세요.'
  },
  관성: {
    label: '책임·직업',
    summary: '책임과 평판, 공식적인 역할이 커지는 흐름',
    opportunity: '문서, 약속, 승진 준비, 장기 계획, 공식 업무',
    caution: '책임을 혼자 떠안거나 완벽하게 하려는 압박',
    money: '안정적인 계획과 원칙을 지키는 방식이 재정에도 도움이 됩니다.',
    love: '상대를 평가하기보다 서로의 기대를 분명하게 설명해 보세요.',
    work: '책임이 커질수록 능력을 인정받기 쉬운 흐름입니다.',
    health: '업무 긴장을 집까지 끌고 가지 않는 회복 루틴이 중요합니다.'
  },
  인성: {
    label: '배움·회복',
    summary: '배움과 관찰, 준비가 중요해지는 흐름',
    opportunity: '공부, 리서치, 자격 준비, 기록, 재정비',
    caution: '생각만 길어지고 실행을 미루는 패턴',
    money: '새 투입보다 기존 지출과 정보를 점검하며 판단 근거를 쌓으세요.',
    love: '서두르기보다 상대의 이야기를 충분히 들을수록 관계가 편해집니다.',
    work: '바로 성과를 내기보다 실력을 쌓고 자료를 정리하기 좋습니다.',
    health: '회복과 수면의 질을 우선순위에 두는 편이 좋습니다.'
  }
};

const ELEMENT_HINT = {
  목: { color:'초록·청록', place:'공원, 산책로, 식물이 있는 공간', action:'새 계획을 한 줄로 적기' },
  화: { color:'코랄·레드', place:'밝고 따뜻한 공간', action:'생각을 말이나 결과물로 표현하기' },
  토: { color:'베이지·옐로', place:'정돈된 익숙한 공간', action:'책상과 일정부터 정리하기' },
  금: { color:'화이트·실버', place:'깔끔하고 조용한 작업 공간', action:'결정 기한을 정하고 마무리하기' },
  수: { color:'네이비·블랙', place:'조용한 카페나 물가', action:'메모하며 생각을 정리하기' }
};

const iconMap = { 총운:'☀', 재물:'◉', 연애:'♡', 직업:'▣', 컨디션:'✦' };

function selectedCalendar() {
  return form.elements.calendar.value;
}

function collectInput() {
  const [hour, minute] = $('birthTime').value.split(':').map(Number);
  return {
    calendar: selectedCalendar(),
    year: Number($('birthYear').value),
    month: Number($('birthMonth').value),
    day: Number($('birthDay').value),
    hour,
    minute,
    gender: $('gender').value,
    isLeap: $('isLeap').checked
  };
}

function dominantElement(chart) {
  return Object.entries(chart.elements).sort((a,b)=>b[1]-a[1])[0]?.[0] || '토';
}

function dominantGroup(items) {
  const count = {비겁:0,식상:0,재성:0,관성:0,인성:0};
  for (const item of items) count[item.group] = (count[item.group] || 0) + 1;
  return Object.entries(count).sort((a,b)=>b[1]-a[1])[0][0];
}

function relationLabel(relations) {
  if (!relations?.length) return '안정적인 흐름';
  return [...new Set(relations.map((item)=>item.type))].join('·');
}

function renderDailyFortune(chart, todayFlow) {
  const copy = GROUP_COPY[todayFlow.group];
  const cards = [
    ['총운', `${copy.summary}입니다. ${copy.opportunity}에 힘을 쓰면 하루의 흐름을 잘 활용할 수 있습니다.`],
    ['재물', copy.money],
    ['연애', copy.love],
    ['직업', copy.work],
    ['컨디션', copy.health]
  ];
  $('dailyFortuneGrid').innerHTML = cards.map(([title,text])=>`
    <article class="daily-fortune-card">
      <span class="daily-icon">${iconMap[title]}</span>
      <div><strong>${title}</strong><p>${text}</p></div>
    </article>
  `).join('');
}

function renderTodayLucky(chart, todayFlow) {
  const strong = dominantElement(chart);
  const hint = ELEMENT_HINT[strong];
  const copy = GROUP_COPY[todayFlow.group];
  $('todayLucky').innerHTML = `
    <p class="mini-label">오늘의 행운 포인트</p>
    <h3>${ROLE_LABELS[todayFlow.group]}의 흐름을 부드럽게 쓰는 법</h3>
    <dl class="lucky-list">
      <div><dt>행운 행동</dt><dd>${hint.action}</dd></div>
      <div><dt>잘 맞는 공간</dt><dd>${hint.place}</dd></div>
      <div><dt>상징 컬러</dt><dd>${hint.color}</dd></div>
      <div><dt>오늘의 주의</dt><dd>${copy.caution}</dd></div>
    </dl>
    <p class="lucky-note">오늘 일진 ${todayFlow.korean} · ${todayFlow.tenGod} · ${relationLabel(todayFlow.relations)}</p>
  `;
}

function renderTojungQuarters(monthFlows) {
  const names = ['1~3월 · 문을 여는 시기','4~6월 · 속도를 내는 시기','7~9월 · 중심을 잡는 시기','10~12월 · 정리하는 시기'];
  const seasons = ['초반','봄·초여름','하반기 초입','연말'];
  $('tojungQuarterGrid').innerHTML = [0,3,6,9].map((start,index)=>{
    const group = dominantGroup(monthFlows.slice(start,start+3));
    const copy = GROUP_COPY[group];
    return `<article class="quarter-card"><span>${String(index+1).padStart(2,'0')}</span><div><h3>${names[index]}</h3><strong>${copy.summary}</strong><p>${seasons[index]}에는 ${copy.opportunity}을 의식해 보세요. ${copy.caution}은 한 번 더 점검하는 편이 좋습니다.</p></div></article>`;
  }).join('');
}

function renderYearAdvice(chart, yearFlow) {
  const copy = GROUP_COPY[yearFlow.group];
  const cards = [
    ['올해의 기회', copy.opportunity],
    ['올해의 주의점', copy.caution],
    ['돈의 포인트', copy.money],
    ['관계의 포인트', copy.love]
  ];
  $('yearAdviceGrid').innerHTML = cards.map(([title,text])=>`<article class="advice-card"><span class="mini-label">${title}</span><p>${text}</p></article>`).join('');
}

function renderSeasonGuide(monthFlows) {
  const blocks = [
    ['봄', monthFlows.slice(2,5)],
    ['여름', monthFlows.slice(5,8)],
    ['가을', monthFlows.slice(8,11)],
    ['겨울', [monthFlows[11],monthFlows[0],monthFlows[1]]]
  ];
  $('seasonGuide').innerHTML = blocks.map(([name,flows])=>{
    const group = dominantGroup(flows);
    const copy = GROUP_COPY[group];
    return `<article><span>${name}</span><strong>${ROLE_LABELS[group]}</strong><p>${copy.summary}. ${copy.opportunity}</p></article>`;
  }).join('');
}

function renderPremium() {
  if (!$('results') || $('results').hidden) return;
  try {
    const chart = calculateSaju(collectInput());
    const todayFlow = calculateTodayFlow(chart);
    const currentYear = Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date()));
    const yearFlow = calculateYearFlows(chart,currentYear,1)[0];
    const monthFlows = calculateMonthFlows(chart,currentYear);
    renderDailyFortune(chart,todayFlow);
    renderTodayLucky(chart,todayFlow);
    renderTojungQuarters(monthFlows);
    renderYearAdvice(chart,yearFlow);
    renderSeasonGuide(monthFlows);
  } catch {
    // 기존 app.js가 입력 오류 메시지를 담당한다.
  }
}

form?.addEventListener('submit',()=>requestAnimationFrame(renderPremium));
requestAnimationFrame(()=>requestAnimationFrame(renderPremium));
