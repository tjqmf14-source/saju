import { calculateSaju, calculateYearFlows, calculateMonthFlows } from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { buildInterpretation } from './interpretation.js';
import { ELEMENT_LABELS, ROLE_LABELS, branchByName, stemByName } from './data.js';

const $ = (id) => document.getElementById(id);
const form = $('birthForm');
const leapField = $('leapField');
const leapInput = $('isLeap');
const results = $('results');
const errorBox = $('formError');

function selectedCalendar() {
  return form.elements.calendar.value;
}

function syncCalendarUi() {
  const lunar = selectedCalendar() === 'lunar';
  leapField.classList.toggle('active', lunar);
  if (!lunar) leapInput.checked = false;
  $('day').max = lunar ? '30' : '31';
}

form.elements.calendar.forEach((radio) => radio.addEventListener('change', syncCalendarUi));
syncCalendarUi();

function topEntry(object) {
  return Object.entries(object).sort((a,b)=>b[1]-a[1])[0];
}

function pct(value,total=8) {
  return Math.round(value/total*100);
}

function formatSolar({year,month,day}) {
  return `${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')}`;
}

function formatLunar({year,month,day,isLeap}) {
  return `${year}년 ${isLeap?'윤':''}${month}월 ${day}일`;
}

function renderSummary(chart,mbti) {
  const [element] = topEntry(chart.elements);
  const [role] = topEntry(chart.roles);
  const cards = [
    ['일간', chart.dayMaster, `${stemByName(chart.dayMaster).element} 기운을 중심으로 원국을 읽습니다.`],
    ['사주 기반 MBTI', mbti.type, '오행·십성 분포를 4개 성향 축으로 변환한 참고 유형입니다.'],
    ['강한 오행', `${element} · ${ELEMENT_LABELS[element].label}`, `${ELEMENT_LABELS[element].keyword} 성향이 상대적으로 두드러집니다.`],
    ['강한 십성 그룹', ROLE_LABELS[role], `${role} 그룹의 상대 비중이 가장 높습니다.`]
  ];
  $('summaryGrid').innerHTML = cards.map(([label,title,text])=>`<article class="summary-card"><span>${label}</span><strong>${title}</strong><p>${text}</p></article>`).join('');
  $('basisText').textContent = `양력 ${formatSolar(chart.solar)} · 음력 ${formatLunar(chart.lunar)} · ${chart.basis.timezone} · ${chart.basis.dayBoundary}`;
}

function renderMbti(mbti) {
  $('mbtiHero').innerHTML = `<span class="kicker">${mbti.label}</span><div class="mbti-type">${mbti.type}</div><p>${mbti.disclaimer}</p>`;
  $('mbtiAxes').innerHTML = Object.entries(mbti.axes).map(([key,axis])=>`<div class="axis-row"><div class="axis-side">${axis.left.letter}<br>${axis.left.percent}%</div><div class="axis-track" aria-label="${key} 성향 비율"><span class="axis-left" style="width:${axis.left.percent}%"></span><span class="axis-right" style="width:${axis.right.percent}%"></span></div><div class="axis-side">${axis.right.letter}<br>${axis.right.percent}%</div><p class="axis-note">${axis.reasons.join(' · ')}</p></div>`).join('');
}

function renderPillars(chart) {
  const labels = {year:'연주',month:'월주',day:'일주',hour:'시주'};
  $('pillarGrid').innerHTML = Object.entries(chart.pillars).map(([key,pillar])=>{
    const stem = stemByName(pillar.heavenlyStem);
    const branch = branchByName(pillar.earthlyBranch);
    const gods = chart.tenGods[key];
    return `<article class="pillar-card"><span class="label">${labels[key]}</span><div class="pillar-letters">${stem.hanja}${branch.hanja}</div><dl><div><dt>한글</dt><dd>${chart.pillarStrings[key]}</dd></div><div><dt>천간 오행</dt><dd>${stem.element}</dd></div><div><dt>지지 오행</dt><dd>${branch.element}</dd></div><div><dt>천간 십성</dt><dd>${gods.stem}</dd></div><div><dt>지지 십성</dt><dd>${gods.branch}</dd></div></dl></article>`;
  }).join('');
}

function renderBars(targetId,object,labels) {
  const max = Math.max(...Object.values(object),1);
  $(targetId).innerHTML = Object.entries(object).map(([key,value])=>`<div class="bar-row"><strong>${labels[key] || key}</strong><div class="bar-track"><span class="bar-fill" style="width:${Math.max(3,value/max*100)}%"></span></div><span class="bar-value">${value.toFixed(2)} · ${pct(value)}%</span></div>`).join('');
}

function renderRelations(chart) {
  if (!chart.relations.length) {
    $('relationGrid').innerHTML = '<div class="empty-state">두드러진 지지 합·충·형·파·해 조합이 확인되지 않습니다.</div>';
    return;
  }
  $('relationGrid').innerHTML = chart.relations.map((item)=>`<article class="relation-card"><strong>${item.type}</strong><p>${item.text}</p></article>`).join('');
}

function renderLuck(chart) {
  if (!chart.luck) {
    $('luckMeta').textContent = '대운 정보를 계산할 수 없습니다.';
    $('luckGrid').innerHTML = '';
    return;
  }
  const luck = chart.luck;
  $('luckMeta').textContent = `${luck.forward?'순행':'역행'} · 첫 대운 약 ${luck.startYears}년 ${luck.startMonths}개월 후 시작 (표시 나이 ${luck.startAge}세)`;
  $('luckGrid').innerHTML = luck.pillars.slice(0,10).map((item)=>`<article class="luck-card"><strong>${item.korean}</strong><span>${item.age}세 전후 시작</span></article>`).join('');
}

function renderFlows(chart) {
  const startYear = new Date().getFullYear();
  const years = calculateYearFlows(chart,startYear,8);
  $('yearFlow').innerHTML = years.map((item)=>`<article class="flow-card"><strong>${item.year}</strong><strong>${item.korean}</strong><p>${item.tenGod} · ${item.relations.length?item.relations.map((r)=>r.type).join('·'):'큰 관계 신호 없음'}</p></article>`).join('');
  const months = calculateMonthFlows(chart,startYear);
  $('monthFlowTitle').textContent = `${startYear} 월운 흐름`;
  $('monthFlow').innerHTML = months.map((item)=>`<article class="month-card"><strong>${item.month}월 · ${item.korean}</strong><span>${item.tenGod} / ${ROLE_LABELS[item.group] || item.group}</span></article>`).join('');
}

function renderInterpretation(chart,mbti) {
  $('interpretationGrid').innerHTML = buildInterpretation(chart,mbti).map((item)=>`<article class="interpretation-card"><h3>${item.title}</h3><p>${item.text}</p></article>`).join('');
}

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  errorBox.textContent = '';
  try {
    const [hour,minute] = $('time').value.split(':').map(Number);
    const input = {
      calendar:selectedCalendar(),
      year:Number($('year').value),
      month:Number($('month').value),
      day:Number($('day').value),
      hour,
      minute,
      gender:$('gender').value,
      isLeap:leapInput.checked
    };
    const chart = calculateSaju(input);
    const mbti = calculateSajuMbti(chart);
    renderSummary(chart,mbti);
    renderMbti(mbti);
    renderPillars(chart);
    renderBars('elementChart',chart.elements,Object.fromEntries(Object.entries(ELEMENT_LABELS).map(([k,v])=>[k,`${k} · ${v.label}`])));
    renderBars('roleChart',chart.roles,ROLE_LABELS);
    renderRelations(chart);
    renderLuck(chart);
    renderFlows(chart);
    renderInterpretation(chart,mbti);
    results.hidden = false;
    results.scrollIntoView({behavior:'smooth',block:'start'});
  } catch (error) {
    results.hidden = true;
    errorBox.textContent = error?.message || '입력값을 확인해주세요.';
  }
});
