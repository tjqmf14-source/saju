import {
  calculateSaju,
  calculateYearFlows,
  calculateMonthFlows,
  calculateTodayFlow
} from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { ELEMENT_LABELS, ROLE_LABELS, branchByName, stemByName } from './data.js';

const $ = (id) => document.getElementById(id);
const form = $('birthForm');
const leapField = $('leapField');
const leapInput = $('isLeap');
const results = $('results');
const errorBox = $('formError');

const GROUP_COPY = {
  비겁: {
    plain:'자기 기준과 독립성이 강해지는 흐름',
    good:'스스로 결정하고 주도권을 잡는 일',
    caution:'경쟁심이 강해지거나 혼자 모든 것을 해결하려는 패턴',
    work:'독립적인 판단, 개인 프로젝트, 리더 역할에 힘이 실립니다.',
    money:'사람과 얽힌 지출이나 충동적인 선택보다 내 기준을 먼저 세우는 편이 좋습니다.',
    love:'내 의견만 앞세우기보다 상대의 속도를 함께 맞추는 것이 관계를 부드럽게 만듭니다.',
    health:'과로보다 긴장을 풀어주는 휴식과 규칙적인 생활 리듬을 챙기기 좋습니다.'
  },
  식상: {
    plain:'표현·창작·결과물이 살아나는 흐름',
    good:'말하기, 글쓰기, 디자인, 콘텐츠, 결과물 공개',
    caution:'말이 앞서거나 에너지를 한꺼번에 쓰는 패턴',
    work:'생각을 보이는 결과물로 꺼낼수록 기회가 커지는 흐름입니다.',
    money:'아이디어를 실제 상품이나 성과로 연결하는 관점이 중요합니다.',
    love:'마음을 표현하고 반응을 보여주는 것이 관계에 좋은 영향을 줍니다.',
    health:'활동량과 휴식의 균형을 맞추고 수면 리듬을 일정하게 가져가세요.'
  },
  재성: {
    plain:'돈·성과·현실 감각이 중요해지는 흐름',
    good:'예산 관리, 계약 확인, 일정과 성과 정리',
    caution:'눈앞의 이익만 보고 서두르는 선택',
    work:'성과를 수치로 확인할 수 있는 일에서 만족도가 높아질 수 있습니다.',
    money:'현금 흐름과 지출 구조를 정리하기 좋은 시기입니다. 큰 결정보다 구조를 먼저 보세요.',
    love:'말보다 행동으로 신뢰를 보여주는 방식이 잘 맞습니다.',
    health:'바쁜 일정 속에서도 식사와 휴식 시간을 일정하게 유지하는 것이 중요합니다.'
  },
  관성: {
    plain:'책임·직장·평판과 기준이 커지는 흐름',
    good:'공식적인 업무, 약속, 문서, 장기 계획',
    caution:'책임을 혼자 떠안거나 완벽하게 하려는 압박',
    work:'책임이 커질수록 실력이 드러나는 흐름입니다. 기준을 세우고 순서대로 처리하세요.',
    money:'안정적인 계획과 약속을 지키는 방식이 재정 관리에도 도움이 됩니다.',
    love:'약속과 신뢰가 중요한 시기입니다. 상대를 평가하기보다 기대를 설명해 주세요.',
    health:'일의 긴장을 오래 끌고 가지 않도록 의식적인 휴식 시간을 확보하세요.'
  },
  인성: {
    plain:'배움·관찰·회복과 준비가 중요해지는 흐름',
    good:'공부, 리서치, 기록, 자격 준비, 재정비',
    caution:'생각만 길어지고 실행을 미루는 패턴',
    work:'바로 성과를 내기보다 실력을 쌓고 자료를 정리하는 시간이 도움이 됩니다.',
    money:'새로운 투입보다 기존 지출과 정보를 점검하며 판단 근거를 쌓는 편이 좋습니다.',
    love:'상대의 이야기를 충분히 듣고 천천히 관계를 이해하는 방식이 잘 맞습니다.',
    health:'회복을 우선순위에 두고 수면과 휴식의 질을 챙기기 좋은 시기입니다.'
  }
};

const ELEMENT_COPY = {
  목:{ title:'성장형', strength:'새로운 시작, 기획, 연결, 확장', caution:'방향을 너무 자주 바꾸거나 서두르는 것' },
  화:{ title:'표현형', strength:'집중, 표현, 존재감, 전달력', caution:'과열된 감정이나 너무 빠른 판단' },
  토:{ title:'안정형', strength:'관리, 축적, 꾸준함, 현실감', caution:'변화를 미루거나 걱정을 오래 쌓는 것' },
  금:{ title:'정리형', strength:'판단, 기준, 완성도, 세밀함', caution:'완벽주의와 지나친 자기검열' },
  수:{ title:'탐구형', strength:'정보, 통찰, 연구, 관찰', caution:'생각이 길어지고 실행 시점이 늦어지는 것' }
};

const MBTI_ALIAS = {
  INTJ:'전략가형', INTP:'탐구자형', INFJ:'통찰가형', INFP:'이상가형',
  ISTJ:'원칙가형', ISFJ:'보호자형', ISTP:'해결사형', ISFP:'감각가형',
  ENTJ:'지휘자형', ENTP:'발명가형', ENFJ:'조율가형', ENFP:'영감가형',
  ESTJ:'관리자형', ESFJ:'관계가형', ESTP:'실행가형', ESFP:'표현가형'
};

const MBTI_DESC = {
  INTJ:'깊이 있는 생각과 자기 기준을 바탕으로 큰 그림을 설계하는 성향입니다.',
  INTP:'궁금한 것을 끝까지 파고들며 더 나은 구조와 원리를 찾는 성향입니다.',
  INFJ:'사람과 상황의 이면을 읽고 의미 있는 방향을 찾으려는 성향입니다.',
  INFP:'자기만의 가치와 감정을 중요하게 여기며 진정성을 중시하는 성향입니다.',
  ISTJ:'현실적인 기준과 책임을 바탕으로 차근차근 완성하는 성향입니다.',
  ISFJ:'주변을 세심하게 살피고 맡은 일을 꾸준하게 지켜내는 성향입니다.',
  ISTP:'복잡한 문제를 간단히 정리하고 실제 해결책을 찾는 데 강한 성향입니다.',
  ISFP:'자연스러운 감각과 자기 취향을 중시하며 부드럽게 적응하는 성향입니다.',
  ENTJ:'목표를 세우고 사람과 자원을 조직해 결과를 만드는 성향입니다.',
  ENTP:'새로운 가능성을 빠르게 발견하고 기존 방식에 질문을 던지는 성향입니다.',
  ENFJ:'사람의 장점을 발견하고 관계 속에서 좋은 방향을 만드는 성향입니다.',
  ENFP:'호기심과 영감이 풍부하고 새로운 사람과 경험에서 에너지를 얻는 성향입니다.',
  ESTJ:'명확한 기준과 실행력을 바탕으로 일을 체계적으로 정리하는 성향입니다.',
  ESFJ:'관계를 세심하게 챙기며 현실적인 도움을 주는 성향입니다.',
  ESTP:'현장에서 빠르게 판단하고 직접 부딪치며 기회를 잡는 성향입니다.',
  ESFP:'밝은 표현과 친화력을 바탕으로 분위기를 움직이는 성향입니다.'
};

function selectedCalendar() {
  return form.elements.calendar.value;
}

function syncCalendarUi() {
  const lunar = selectedCalendar() === 'lunar';
  leapField.classList.toggle('active', lunar);
  if (!lunar) leapInput.checked = false;
  $('birthDay').max = lunar ? '30' : '31';
}

form.elements.calendar.forEach((radio) => radio.addEventListener('change', syncCalendarUi));
syncCalendarUi();

function topEntries(object) {
  return Object.entries(object).sort((a,b)=>b[1]-a[1]);
}

function topEntry(object) {
  return topEntries(object)[0];
}

function formatSolar({year,month,day}) {
  return `${year}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')}`;
}

function formatLunar({year,month,day,isLeap}) {
  return `${year}년 ${isLeap?'윤':''}${month}월 ${day}일`;
}

function currentKstDate() {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone:'Asia/Seoul', year:'numeric', month:'long', day:'numeric', weekday:'short'
  }).format(new Date());
  return parts;
}

function ageFromSolar(solar) {
  const nowParts = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const now = Object.fromEntries(nowParts.map((p)=>[p.type,p.value]));
  let age = Number(now.year) - solar.year;
  if (Number(now.month) < solar.month || (Number(now.month) === solar.month && Number(now.day) < solar.day)) age -= 1;
  return age;
}

function relationWords(relations) {
  if (!relations?.length) return '큰 관계 신호 없음';
  return [...new Set(relations.map((item)=>item.type))].join('·');
}

function groupDominance(items) {
  const count = {비겁:0,식상:0,재성:0,관성:0,인성:0};
  for (const item of items) count[item.group] = (count[item.group] || 0) + 1;
  return topEntry(count)[0];
}

function renderToday(chart) {
  const flow = calculateTodayFlow(chart);
  const copy = GROUP_COPY[flow.group];
  $('todayDate').textContent = currentKstDate();
  $('todayHeadline').textContent = `${copy.plain}입니다.`;
  $('todaySummary').textContent = `${copy.good}에 힘을 싣고, ${copy.caution}은 줄이는 편이 좋습니다. 오늘 일진은 ${flow.korean}이며 내 사주와의 관계 신호는 ${relationWords(flow.relations)}입니다.`;
  $('todayTags').innerHTML = [flow.tenGod, ROLE_LABELS[flow.group], relationWords(flow.relations)].map((tag)=>`<span>${tag}</span>`).join('');
  return flow;
}

function renderProfile(chart, mbti, name) {
  const [topElement] = topEntry(chart.elements);
  const [topRole] = topEntry(chart.roles);
  const element = ELEMENT_COPY[topElement];
  const alias = MBTI_ALIAS[mbti.type] || '성향형';
  const age = ageFromSolar(chart.solar);
  $('reportTitle').textContent = `${name}님의 사주 종합 분석`;
  $('reportBasis').textContent = `양력 ${formatSolar(chart.solar)} · 음력 ${formatLunar(chart.lunar)} · KST 기준`;
  $('profileName').textContent = name;
  $('profileBirth').textContent = `${formatSolar(chart.solar)} 출생 · 만 ${age}세`;
  $('profileQuote').textContent = `“${element.title}의 힘으로 삶을 설계하는 ${alias}”`;
  $('profileIntro').textContent = `${element.strength}이 강점으로 드러나기 쉽고, ${GROUP_COPY[topRole].plain}이 삶의 중요한 주제로 반복될 수 있습니다. ${element.caution}은 의식적으로 조절하면 장점이 더 선명해집니다.`;
  $('profileKeywords').innerHTML = [ELEMENT_LABELS[topElement].label, ROLE_LABELS[topRole], alias, '자기이해', '생활해석'].map((tag)=>`<span>${tag}</span>`).join('');

  $('mbtiType').textContent = mbti.type;
  $('mbtiAlias').textContent = alias;
  $('mbtiDescription').textContent = `${MBTI_DESC[mbti.type] || '사주 기반 성향을 익숙한 MBTI 언어로 번역한 결과입니다.'} 정식 MBTI 검사를 대체하지 않는 참고 지표입니다.`;
  const axisNames = {EI:'에너지 방향',SN:'정보 처리',TF:'판단 방식',JP:'생활 패턴'};
  $('mbtiMini').innerHTML = Object.entries(mbti.axes).map(([key,axis])=>`<div><span>${axisNames[key]}</span><strong>${axis.selected} ${Math.max(axis.left.percent,axis.right.percent)}%</strong></div>`).join('');
}

function renderLifeSummary(chart, yearFlow) {
  const [topRole] = topEntry(chart.roles);
  const nowCopy = GROUP_COPY[yearFlow.group];
  const cards = [
    ['총운','◎',`${GROUP_COPY[topRole].plain}이 기본 성향으로 깔려 있습니다. 올해는 ${nowCopy.plain}이 더해져 자신의 장점을 어디에 집중할지 정하는 것이 중요합니다.`],
    ['재물운','◉',nowCopy.money],
    ['연애운','♡',nowCopy.love],
    ['직업운','▣',nowCopy.work],
    ['건강운','✦',nowCopy.health]
  ];
  $('lifeSummaryGrid').innerHTML = cards.map(([title,icon,text])=>`<article><span class="service-icon">${icon}</span><strong>${title}</strong><p>${text}</p></article>`).join('');
  $('overallFortune').textContent = cards[0][2];
  $('moneyFortune').textContent = cards[1][2];
  $('loveFortune').textContent = cards[2][2];
  $('careerFortune').textContent = cards[3][2];
  $('healthFortune').textContent = cards[4][2];
  $('loveDetail').textContent = `${nowCopy.love} 상대를 단정하기보다 실제 대화와 행동을 함께 보세요.`;
  $('lifeDetail').textContent = `${nowCopy.health} 사주 해석은 의료적 진단이 아니라 생활 리듬을 돌아보는 참고 정보입니다.`;
}

function renderQuote(todayFlow, name) {
  const quoteMap = {
    비겁:'“내 기준은 지키되, 사람과의 간격은 부드럽게.”',
    식상:'“생각만 하지 말고, 오늘 하나는 밖으로 꺼내기.”',
    재성:'“작은 숫자를 정리하면 큰 흐름이 보입니다.”',
    관성:'“해야 할 일을 줄 세우면 마음도 함께 정리됩니다.”',
    인성:'“서두르지 않아도 됩니다. 이해가 깊어지면 길이 보입니다.”'
  };
  $('dailyQuote').textContent = quoteMap[todayFlow.group];
  $('dailyQuoteBody').textContent = `${name}님에게 오늘은 ${GROUP_COPY[todayFlow.group].good}이 잘 맞는 날로 읽힙니다.`;
}

function renderTojung(chart, yearFlow, monthFlows, year) {
  const quarterGroups = [0,3,6,9].map((start)=>groupDominance(monthFlows.slice(start,start+3)));
  const quarterNames = ['초반','봄 이후','하반기 초입','연말'];
  const quarterText = quarterGroups.map((group,index)=>`${quarterNames[index]}에는 ${GROUP_COPY[group].plain}`).join(', ');
  $('tojungTitle').textContent = `${year}년 토정비결식 연간 리포트`;
  $('tojungSummary').textContent = `${yearFlow.korean} 세운은 ${ROLE_LABELS[yearFlow.group]} 주제를 강조합니다. ${quarterText} 흐름이 이어집니다. 한 해 전체를 좋고 나쁨으로 단정하기보다, 시기마다 커지는 주제를 미리 알고 준비하는 방식으로 활용하세요.`;
}

function renderYear(chart, yearFlow, year) {
  const copy = GROUP_COPY[yearFlow.group];
  $('yearTitle').textContent = `${year}년 · ${ROLE_LABELS[yearFlow.group]}의 해`;
  $('yearSummary').textContent = `${copy.plain}입니다. ${copy.good}에 집중하면 강점을 쓰기 좋고, ${copy.caution}은 한 번 더 점검하는 것이 좋습니다. 원국과의 관계 신호는 ${relationWords(yearFlow.relations)}입니다.`;
  $('yearTags').innerHTML = [yearFlow.tenGod, ROLE_LABELS[yearFlow.group], relationWords(yearFlow.relations)].map((tag)=>`<span>${tag}</span>`).join('');
}

function renderMonths(months) {
  $('monthForecast').innerHTML = months.map((item)=>{
    const copy = GROUP_COPY[item.group];
    return `<article class="month-card"><div><span class="month-number">${String(item.month).padStart(2,'0')}</span><strong>${item.month}월 · ${ROLE_LABELS[item.group]}</strong></div><p>${copy.plain}. ${copy.good}을 우선하고 ${copy.caution}은 줄여보세요.</p><small>${item.korean} · ${item.tenGod}</small></article>`;
  }).join('');
}

function renderLuck(chart) {
  if (!chart.luck) {
    $('luckMeta').textContent = '대운 정보를 계산할 수 없습니다.';
    $('luckTimeline').innerHTML = '';
    return;
  }
  const luck = chart.luck;
  $('luckMeta').textContent = `${luck.forward?'순행':'역행'} · 첫 대운 약 ${luck.startYears}년 ${luck.startMonths}개월 후 시작`;
  $('luckTimeline').innerHTML = luck.pillars.slice(0,9).map((item,index)=>{
    const stem = item.pillar.heavenlyStem;
    const tenGod = chart.dayMaster ? (()=>{
      const relation = Object.entries(chart.roles).length ? '' : '';
      return relation;
    })() : '';
    return `<article class="luck-step"><span>${item.age}세~</span><strong>${item.korean}</strong><p>${index===0?'첫 번째 큰 환경 변화의 시작점':`${item.age}세 전후부터 새로운 10년 주제가 시작되는 구간`}</p></article>`;
  }).join('');
}

function renderPillars(chart) {
  const labels = {year:'연주',month:'월주',day:'일주',hour:'시주'};
  $('pillarGrid').innerHTML = Object.entries(chart.pillars).map(([key,pillar])=>{
    const stem = stemByName(pillar.heavenlyStem);
    const branch = branchByName(pillar.earthlyBranch);
    const gods = chart.tenGods[key];
    return `<article class="pillar-card"><span>${labels[key]}</span><div class="pillar-letters">${stem.hanja}${branch.hanja}</div><dl><div><dt>한글</dt><dd>${chart.pillarStrings[key]}</dd></div><div><dt>천간 오행</dt><dd>${stem.element}</dd></div><div><dt>지지 오행</dt><dd>${branch.element}</dd></div><div><dt>천간 십성</dt><dd>${gods.stem}</dd></div><div><dt>지지 십성</dt><dd>${gods.branch}</dd></div></dl></article>`;
  }).join('');
}

function renderBars(targetId, object, labels) {
  const max = Math.max(...Object.values(object),1);
  $(targetId).innerHTML = Object.entries(object).map(([key,value])=>`<div class="bar-row"><strong>${labels[key] || key}</strong><div class="bar-track"><span class="bar-fill" style="width:${Math.max(3,value/max*100)}%"></span></div><span>${value.toFixed(2)}</span></div>`).join('');
}

function renderRelations(chart) {
  if (!chart.relations.length) {
    $('relationGrid').innerHTML = '<div class="empty-state">두드러진 지지 합·충·형·파·해 조합이 확인되지 않습니다.</div>';
    return;
  }
  const plain = {
    합:'서로 다른 기운이 연결되며 관계와 협업이 중요한 구조로 봅니다.',
    충:'서로 다른 방향이 부딪혀 변화와 이동의 계기가 생기기 쉬운 구조로 봅니다.',
    형:'반복되는 긴장이나 자기 안의 기준 충돌을 점검하는 신호로 봅니다.',
    파:'기존 방식이 깨지고 새 방식으로 조정되는 과정을 상징합니다.',
    해:'겉으로 드러나지 않는 불편이나 오해를 세심하게 살피는 신호로 봅니다.',
    삼합:'여러 기운이 한 방향으로 모이며 특정 주제가 강화되는 구조로 봅니다.'
  };
  $('relationGrid').innerHTML = chart.relations.map((item)=>`<article class="relation-card"><strong>${item.type} · ${item.members.join('·')}</strong><p>${plain[item.type] || item.text}</p></article>`).join('');
}

function renderMbtiAxes(mbti) {
  const names = {EI:'에너지',SN:'정보',TF:'판단',JP:'생활'};
  $('mbtiAxes').innerHTML = Object.entries(mbti.axes).map(([key,axis])=>`<div class="axis-row"><div class="axis-side">${axis.left.letter}<br><small>${axis.left.percent}%</small></div><div><strong>${names[key]} 방향 · ${axis.selected} 우세</strong><div class="axis-track"><span class="axis-left" style="width:${axis.left.percent}%"></span><span class="axis-right" style="width:${axis.right.percent}%"></span></div><p>${axis.reasons.join(' · ')}</p></div><div class="axis-side">${axis.right.letter}<br><small>${axis.right.percent}%</small></div></div>`).join('');
}

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  errorBox.textContent = '';
  try {
    const [hour,minute] = $('birthTime').value.split(':').map(Number);
    const input = {
      calendar:selectedCalendar(),
      year:Number($('birthYear').value),
      month:Number($('birthMonth').value),
      day:Number($('birthDay').value),
      hour,
      minute,
      gender:$('gender').value,
      isLeap:leapInput.checked
    };
    const name = $('name').value.trim() || '당신';
    const chart = calculateSaju(input);
    const mbti = calculateSajuMbti(chart);
    const todayFlow = renderToday(chart);
    const currentYear = Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date()));
    const yearFlow = calculateYearFlows(chart,currentYear,1)[0];
    const months = calculateMonthFlows(chart,currentYear);

    renderProfile(chart,mbti,name);
    renderQuote(todayFlow,name);
    renderLifeSummary(chart,yearFlow);
    renderTojung(chart,yearFlow,months,currentYear);
    renderYear(chart,yearFlow,currentYear);
    renderMonths(months);
    renderLuck(chart);
    renderPillars(chart);
    renderBars('elementChart',chart.elements,Object.fromEntries(Object.entries(ELEMENT_LABELS).map(([k,v])=>[k,`${k} · ${v.label}`])));
    renderBars('roleChart',chart.roles,ROLE_LABELS);
    renderRelations(chart);
    renderMbtiAxes(mbti);

    results.hidden = false;
    $('analysis').scrollIntoView({behavior:'smooth',block:'start'});
  } catch (error) {
    results.hidden = true;
    errorBox.textContent = error?.message || '입력값을 확인해주세요.';
  }
});

$('todayDate').textContent = currentKstDate();

requestAnimationFrame(()=>form.requestSubmit());
