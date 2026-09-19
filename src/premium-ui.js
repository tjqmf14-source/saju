import {
  calculateSaju,
  calculateYearFlows,
  calculateMonthFlows,
  calculateTodayFlow
} from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { buildDetailedInterpretation } from './interpretation.js';
import { prepareTarotFan, interpretSpread } from './tarot.js';
import { calculateDailyScores } from './daily-score.js';
import { buildPlainChartGuide } from './plain-chart.js';
import { ROLE_LABELS, ELEMENT_LABELS, stemByName, branchByName } from './data.js';
import { buildLuckNarrativeCopy } from './luck-copy.js';

const $ = (id) => document.getElementById(id);
const form = $('birthForm');
const results = $('results');
const errorBox = $('formError');

const GROUP_COPY = {
  비겁: {
    label:'자기주도', summary:'내 기준과 독립성이 강해지는 흐름',
    opportunity:'주도권이 필요한 일, 개인 프로젝트, 결단',
    caution:'경쟁심이 강해지거나 혼자 모든 것을 해결하려는 패턴',
    money:'사람과 얽힌 지출보다 내 예산과 우선순위를 먼저 정리하세요.',
    love:'내 속도만 밀기보다 상대의 반응을 확인하며 관계의 속도를 맞춰보세요.',
    work:'독립적인 판단과 책임 범위가 분명한 일에서 힘이 실립니다.',
    health:'긴장이 오래 쌓이지 않게 의식적으로 쉬는 시간을 확보하세요.'
  },
  식상: {
    label:'표현·창작', summary:'표현과 결과물이 살아나는 흐름',
    opportunity:'발표, 콘텐츠, 디자인, 글쓰기, 결과물 공개',
    caution:'말이 앞서거나 에너지를 한꺼번에 쓰는 패턴',
    money:'아이디어와 기술을 실제 상품이나 성과로 연결하는 관점이 중요합니다.',
    love:'마음을 표현하고 반응을 보여주는 작은 행동이 관계를 움직입니다.',
    work:'생각을 보이는 결과물로 꺼낼수록 기회가 커지는 흐름입니다.',
    health:'활동량과 휴식의 균형, 특히 수면 리듬을 일정하게 유지하세요.'
  },
  재성: {
    label:'재물·성과', summary:'돈과 현실 감각이 중요해지는 흐름',
    opportunity:'예산 관리, 계약 확인, 일정과 성과 정리',
    caution:'눈앞의 이익만 보고 서두르는 선택',
    money:'수입보다 먼저 고정비와 반복 지출 구조를 확인하는 편이 좋습니다.',
    love:'말보다 약속을 지키는 행동으로 신뢰를 쌓는 방식이 잘 맞습니다.',
    work:'성과를 수치로 확인할 수 있는 일에서 만족도가 높아질 수 있습니다.',
    health:'바쁜 일정 속에서도 식사와 휴식 시간을 일정하게 유지하세요.'
  },
  관성: {
    label:'책임·직업', summary:'책임과 평판, 공식적인 역할이 커지는 흐름',
    opportunity:'공식 업무, 문서, 약속, 승진 준비, 장기 계획',
    caution:'책임을 혼자 떠안거나 완벽하게 하려는 압박',
    money:'규칙과 장기 계획을 지키는 방식이 재정 안정에도 도움이 됩니다.',
    love:'상대를 평가하기보다 서로 기대하는 바를 분명히 설명해 보세요.',
    work:'책임이 커질수록 실력을 인정받기 쉬운 흐름입니다.',
    health:'업무 긴장을 집까지 끌고 가지 않는 회복 루틴을 만드세요.'
  },
  인성: {
    label:'배움·회복', summary:'배움과 관찰, 준비가 중요해지는 흐름',
    opportunity:'공부, 리서치, 기록, 자격 준비, 재정비',
    caution:'생각만 길어지고 실행을 미루는 패턴',
    money:'새로운 투입보다 기존 지출과 정보를 점검하며 판단 근거를 쌓으세요.',
    love:'상대의 이야기를 충분히 듣고 천천히 관계를 이해하는 방식이 잘 맞습니다.',
    work:'바로 성과를 내기보다 실력을 쌓고 자료를 정리하기 좋은 흐름입니다.',
    health:'회복을 우선순위에 두고 수면과 휴식의 질을 챙기세요.'
  }
};

const ELEMENT_HINT = {
  목:{color:'딥 그린 · 청록',place:'식물이 있는 조용한 공간',action:'새 계획을 한 줄로 적고 첫 단계만 시작하기'},
  화:{color:'코랄 · 앰버',place:'밝고 따뜻한 공간',action:'생각을 말·글·결과물로 밖에 꺼내기'},
  토:{color:'샌드 · 골드',place:'정돈된 익숙한 공간',action:'책상과 일정에서 불필요한 한 가지를 정리하기'},
  금:{color:'실버 · 아이보리',place:'깔끔하고 조용한 작업 공간',action:'결정 기한을 정하고 한 가지를 마무리하기'},
  수:{color:'네이비 · 블랙',place:'조용한 카페나 물가',action:'메모로 생각을 밖에 꺼낸 뒤 작은 행동 하나 정하기'}
};

const ROLE_BY_ELEMENT = {
  목:{목:'비겁',화:'식상',토:'재성',금:'관성',수:'인성'},
  화:{화:'비겁',토:'식상',금:'재성',수:'관성',목:'인성'},
  토:{토:'비겁',금:'식상',수:'재성',목:'관성',화:'인성'},
  금:{금:'비겁',수:'식상',목:'재성',화:'관성',토:'인성'},
  수:{수:'비겁',목:'식상',화:'재성',토:'관성',금:'인성'}
};

function selectedCalendar(){ return form.elements.calendar.value; }
function currentKstYear(){ return Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date())); }
function currentKstDate(){ return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(new Date()); }
function sorted(object){ return Object.entries(object).sort((a,b)=>b[1]-a[1]); }
function dominantElement(chart){ return sorted(chart.elements)[0]?.[0] || '토'; }
function weakestElement(chart){ return sorted(chart.elements).at(-1)?.[0] || '수'; }
function dominantRole(chart){ return sorted(chart.roles)[0]?.[0] || '인성'; }
function relationLabel(relations){ return relations?.length ? [...new Set(relations.map((r)=>r.type))].join('·') : '큰 충돌 신호 없음'; }
function escapeHtml(value=''){ return value.replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[char])); }

function collectInput(){
  const [hour,minute] = $('birthTime').value.split(':').map(Number);
  return {
    calendar:selectedCalendar(),
    year:Number($('birthYear').value), month:Number($('birthMonth').value), day:Number($('birthDay').value),
    hour, minute, gender:$('gender').value, isLeap:$('isLeap').checked,
    precision:$('precisionToggle').checked,
    location:$('birthLocation').value,
    dayBoundary:$('dayBoundary').value
  };
}

function syncCalendarUi(){
  const lunar=selectedCalendar()==='lunar';
  $('leapField').classList.toggle('active',lunar);
  if(!lunar) $('isLeap').checked=false;
  $('birthDay').max=lunar?'30':'31';
}

function syncPrecisionUi(){
  const enabled=$('precisionToggle').checked;
  const location=$('birthLocation');
  location.disabled=!enabled;
  location.closest('label')?.classList.toggle('field-disabled',!enabled);
}

function formatSolar(solar){ return `${solar.year}.${String(solar.month).padStart(2,'0')}.${String(solar.day).padStart(2,'0')}`; }
function formatLunar(lunar){ return `${lunar.year}년 ${lunar.isLeap?'윤':''}${lunar.month}월 ${lunar.day}일`; }
function formatKstBoundary(date){ return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date); }
function kstMonthNumber(date){
  const part=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',month:'2-digit'}).formatToParts(date).find((item)=>item.type==='month');
  return part?.value || '—';
}

function renderAccuracyBasis(chart){
  const items=[
    ['CALENDAR',chart.basis.calendarEngine],
    ['LOCATION',`${chart.basis.location} · ${chart.basis.longitude}°E`],
    ['TIME CORRECTION',`${chart.basis.trueSolarTime} · ${chart.basis.historicalDst}`],
    ['DAY BOUNDARY',chart.basis.dayBoundary]
  ];
  $('accuracyBasis').innerHTML=items.map(([label,value])=>`<div class="basis-item"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderProfile(chart,mbti,report,name,todayFlow){
  const strongElement=dominantElement(chart);
  const strongRole=dominantRole(chart);
  $('profileBirth').textContent=`양력 ${formatSolar(chart.solar)} · 음력 ${formatLunar(chart.lunar)} · ${chart.basis.location}`;
  $('reportTitle').textContent=`${name}님의 타고난 구조`;
  $('reportLead').textContent=report.overview.lead;
  $('profileTags').innerHTML=[`${strongElement} · ${ELEMENT_LABELS[strongElement].label}`,ROLE_LABELS[strongRole],mbti.type,relationLabel(chart.relations)].map((v)=>`<span>${v}</span>`).join('');
  $('mbtiType').textContent=mbti.type;
  $('mbtiLabel').textContent='사주 기반 성향 · 비공식 참고';
  $('heroMessage').textContent=`“오늘은 ${GROUP_COPY[todayFlow.group].label}의 흐름을 어떻게 쓰느냐가 포인트입니다.”`;
  $('heroSub').textContent=`${name}님의 오늘 일진은 ${todayFlow.korean}. ${GROUP_COPY[todayFlow.group].opportunity}에 힘을 실어보세요.`;
  renderAccuracyBasis(chart);
}

function renderDetailedReport(report){
  const ordered=['overview','temperament','innerOuter','strengths','balance','career','money','love','relationships','recovery','year','luck','technical'];
  $('detailedReport').innerHTML=ordered.map((key,index)=>{
    const item=report[key];
    const open=index<2?' open':'';
    return `<article class="detail-chapter detail-chapter-${String(index+1).padStart(2,'0')}">
      <div class="detail-visual" aria-hidden="true"></div>
      <details class="detail-disclosure"${open}>
        <summary>
          <span>${String(index+1).padStart(2,'0')}</span>
          <div><h3>${item.title}</h3><p>${item.lead}</p></div>
          <b class="detail-toggle" aria-hidden="true">+</b>
        </summary>
        <div class="detail-chapter-body">${item.paragraphs.map((p)=>`<p>${p}</p>`).join('')}</div>
      </details>
    </article>`;
  }).join('');
}

function renderToday(chart,todayFlow){
  const copy=GROUP_COPY[todayFlow.group];
  const scores=calculateDailyScores(chart,todayFlow);
  $('todayDate').textContent=currentKstDate();
  $('todayHeadline').textContent=`“${copy.summary}”`;
  $('todayQuoteTitle').textContent=copy.summary;
  $('todayQuoteBody').textContent=`${copy.opportunity}에 힘을 싣고, ${copy.caution}은 한 번 더 점검하세요.`;

  const overall=scores.overall;
  $('dailyPrimary').innerHTML=`<div class="daily-primary-score"><span class="section-kicker">TODAY'S INDEX</span><strong>${overall.score}</strong><small>/100 · ${overall.label}</small></div><p id="todaySummary" class="daily-summary">오늘은 ${copy.opportunity}에 힘을 싣는 편이 좋습니다. 반대로 ${copy.caution}은 한 번 더 점검하세요. 이 수치는 원국과 오늘 일진의 관계를 0–100으로 정리한 ‘오늘의 흐름 지수’이며 확률이나 객관적 예측값이 아닙니다.</p><div id="todayLucky" class="lucky-strip"></div>`;

  const metrics=[
    ['money','02','재물',copy.money,'icon-coin'],
    ['love','03','연애',copy.love,'icon-heart'],
    ['work','04','직업',copy.work,'icon-briefcase'],
    ['condition','05','컨디션',copy.health,'icon-health']
  ];
  $('dailyMetrics').innerHTML=metrics.map(([key,index,title,body,icon])=>{
    const flow=scores[key];
    return `<article class="metric-row"><span class="daily-index" aria-hidden="true">${index}</span><div class="metric-name"><svg class="ui-icon metric-icon" aria-hidden="true"><use href="#${icon}"/></svg><div><strong class="metric-label">${title}</strong><div class="metric-score">${flow.score}<small>/100</small></div></div></div><div class="metric-copy"><p>${body}</p><small>${flow.label} · ${flow.reason}</small><div class="metric-track" aria-label="${title} 오늘의 흐름 지수 ${flow.score}점"><span style="width:${flow.score}%"></span></div></div></article>`;
  }).join('');

  const strong=dominantElement(chart), weak=weakestElement(chart), hint=ELEMENT_HINT[strong];
  $('todayLucky').innerHTML=`<p class="section-kicker">PRACTICAL GUIDE</p><dl class="lucky-list"><div><dt>오늘의 행동</dt><dd>${hint.action}</dd></div><div><dt>어울리는 공간</dt><dd>${hint.place}</dd></div><div><dt>상징 컬러</dt><dd>${hint.color}</dd></div><div><dt>균형 포인트</dt><dd>${weak}(${ELEMENT_LABELS[weak].label}) 기운을 보완하는 휴식과 정리를 의식해 보세요.</dd></div></dl>`;
}

function dominantGroup(flows){
  const count={비겁:0,식상:0,재성:0,관성:0,인성:0};
  flows.forEach((flow)=>{count[flow.group]=(count[flow.group]||0)+1;});
  return sorted(count)[0][0];
}

function renderYear(yearFlow,monthFlows){
  const copy=GROUP_COPY[yearFlow.group];
  $('yearTitle').textContent=`${yearFlow.year} · ${ROLE_LABELS[yearFlow.group]}의 해`;
  $('yearSummary').textContent=`${copy.summary}입니다. ${copy.opportunity}에 집중하면 흐름을 활용하기 좋고, ${copy.caution}은 올해 반복해서 점검할 주제입니다. 원국과의 관계 신호는 ${relationLabel(yearFlow.relations)}입니다.`;
  $('annualQuote').textContent=copy.summary;
  $('annualGuide').textContent=`${copy.opportunity}에 집중하고, ${copy.caution}은 올해의 반복 체크포인트로 두세요.`;
  $('yearDeepDive').innerHTML=`<article class="year-essay"><span class="micro">YEAR IN DEPTH</span><h3>올해 전체 흐름</h3><p>${copy.summary}이라는 말은 단순히 좋은 일이 생긴다는 뜻이 아니라, 올해 여러 선택에서 ${copy.label}의 주제가 반복해서 나타날 가능성이 높다는 뜻입니다. ${copy.opportunity}을 실제 행동으로 연결할수록 체감이 좋아질 수 있고, 반대로 ${copy.caution}이 반복될 때는 속도를 늦추고 방향을 다시 확인하는 편이 좋습니다.</p><p><strong>현실적인 조언.</strong> ${copy.work} 중요한 선택을 한 번에 크게 벌이기보다 지금 가진 시간·돈·관계 자원을 점검한 뒤, 성과가 확인되는 영역부터 단계적으로 넓혀가세요.</p><p><strong>주의할 점.</strong> ${copy.caution}은 불안해하라는 경고가 아니라 올해의 체크리스트에 가깝습니다. 계약·지출·관계 결정은 감정이 가장 큰 순간보다 자료와 조건을 다시 본 뒤 결정하는 편이 안전합니다.</p></article>`;
  $('yearAdviceGrid').innerHTML=[['올해의 기회',copy.opportunity],['주의할 패턴',copy.caution],['돈의 포인트',copy.money],['관계의 포인트',copy.love]].map(([title,body])=>`<article class="advice-card"><span>${title}</span><p>${body}</p></article>`).join('');
  const quarterStarts=[0,3,6,9];
  $('tojungQuarterGrid').innerHTML=quarterStarts.map((start,index)=>{
    const slice=monthFlows.slice(start,start+3);
    const group=dominantGroup(slice); const c=GROUP_COPY[group];
    const from=kstMonthNumber(slice[0].start), to=kstMonthNumber(slice.at(-1).start);
    return `<article class="quarter-card"><span>${String(index+1).padStart(2,'0')}</span><div><h3>${from}월~${to}월 · 절기 기준</h3><strong>${c.summary}</strong><p>${c.opportunity}을 생활에서 실제로 실행해 보고, ${c.caution}이 반복되면 우선순위를 줄여보세요. 여기의 월 구간은 양력 1일이 아니라 각 절입 시각부터 시작합니다.</p></div></article>`;
  }).join('');
  $('monthForecast').innerHTML=monthFlows.map((item)=>{const c=GROUP_COPY[item.group];const month=kstMonthNumber(item.start);return `<article class="month-card"><div class="month-card-head"><span class="month-number">${month}</span><strong>${month}월 절기운 · ${ROLE_LABELS[item.group]}</strong></div><p>${c.summary}. ${c.opportunity}을 우선하고 ${c.caution}은 줄여보세요. 이 월운은 양력 월초가 아니라 아래 절입 시각부터 다음 절입 직전까지의 흐름입니다. 반복해서 같은 문제가 생길 때 이 문장을 행동 기준으로 활용해 보세요.</p><small>절입 기준 ${formatKstBoundary(item.start)} ~ ${formatKstBoundary(item.end)} · ${item.korean} · ${item.tenGod}</small></article>`;}).join('');
}

function luckGroup(chart,item,index){
  const luckStem=item.korean?.[0];
  const dayElement=stemByName(chart.dayMaster)?.element;
  const luckElement=luckStem ? stemByName(luckStem)?.element : null;
  return ROLE_BY_ELEMENT[dayElement]?.[luckElement] || ['비겁','식상','재성','관성','인성'][index%5];
}

function buildLuckNarrative(chart,item,index,isActive){
  const group=luckGroup(chart,item,index);
  return buildLuckNarrativeCopy({
    group,
    pillar:item.korean,
    age:item.age,
    active:isActive
  });
}

function renderLuck(chart){
  if(!chart.luck){ $('luckMeta').textContent='대운 정보를 표시할 수 없습니다.'; $('luckOverview').innerHTML=''; $('luckTimeline').innerHTML=''; return; }
  const items=chart.luck.pillars.slice(0,9);
  const currentAge=Math.max(0,currentKstYear()-chart.solar.year);
  $('luckMeta').textContent=`${chart.luck.forward?'순행':'역행'} · 첫 대운 약 ${chart.luck.startYears}년 ${chart.luck.startMonths}개월 후 시작 · 대운은 약 10년 단위의 장기 배경으로 읽습니다.`;
  $('luckOverview').innerHTML=items.map((item,index)=>{
    const next=items[index+1];
    const active=currentAge>=item.age && (!next || currentAge<next.age);
    const narrative=buildLuckNarrative(chart,item,index,active);
    return `<article class="luck-overview-item${active?' active':''}"><span>${active?'현재 대운':`${item.age}세부터`}</span><strong>${item.korean}</strong><small>${ROLE_LABELS[narrative.group]}</small><p>${narrative.overview}</p></article>`;
  }).join('');
  $('luckTimeline').innerHTML=items.map((item,index)=>{
    const next=items[index+1];
    const active=currentAge>=item.age && (!next || currentAge<next.age);
    const narrative=buildLuckNarrative(chart,item,index,active);
    return `<article class="luck-step${active?' active':''}"><div class="luck-step-head"><span>${active?'현재 지나고 있는 대운':'DECADE FLOW'}</span><strong>${item.korean}</strong><small>${item.age}세부터 · ${ROLE_LABELS[narrative.group]}</small></div><div class="luck-step-body"><div class="luck-theme">큰 주제 · ${narrative.theme}</div><p>${narrative.lead}</p><div class="luck-narrative-grid"><div><strong>기회</strong><p>${narrative.opportunity}</p></div><div><strong>주의할 점</strong><p>${narrative.caution}</p></div><div><strong>조언</strong><p>${narrative.advice}</p></div></div></div></article>`;
  }).join('');
}

function renderPillars(chart){
  const labels={year:'연주',month:'월주',day:'일주',hour:'시주'};
  $('pillarGrid').innerHTML=Object.entries(chart.pillars).map(([key,pillar])=>{
    const stem=stemByName(pillar.heavenlyStem),branch=branchByName(pillar.earthlyBranch),gods=chart.tenGods[key];
    return `<article class="pillar-card"><span>${labels[key]}</span><div class="pillar-letters">${stem.hanja}${branch.hanja}</div><dl><div><dt>한글</dt><dd>${chart.pillarStrings[key]}</dd></div><div><dt>오행</dt><dd>${stem.element} / ${branch.element}</dd></div><div><dt>천간 십성</dt><dd>${gods.stem}</dd></div><div><dt>지지 십성</dt><dd>${gods.branch}</dd></div></dl></article>`;
  }).join('');
}

function renderBars(id,object,labels){
  const max=Math.max(...Object.values(object),1);
  $(id).innerHTML=Object.entries(object).map(([key,value])=>`<div class="bar-row"><strong>${labels[key]||key}</strong><div class="bar-track"><span class="bar-fill" style="width:${Math.max(3,value/max*100)}%"></span></div><span>${value.toFixed(2)}</span></div>`).join('');
}

function renderRelations(chart){
  const plain={합:'서로 다른 기운이 연결되며 관계와 협업의 힘이 커지는 구조입니다.',충:'방향이 부딪혀 변화와 이동의 계기가 생기기 쉬운 구조입니다.',형:'반복되는 긴장이나 자기 기준의 충돌을 점검하는 신호입니다.',파:'기존 방식을 깨고 조정하는 과정을 상징합니다.',해:'겉으로 잘 드러나지 않는 불편과 오해를 세심하게 볼 필요가 있습니다.',삼합:'여러 기운이 한 방향으로 모이며 특정 주제가 강화되는 구조입니다.'};
  $('relationGrid').innerHTML=chart.relations.length?chart.relations.map((item)=>`<article class="relation-card"><strong>${item.type} · ${item.members.join('·')}</strong><p>${plain[item.type]||item.text}</p></article>`).join(''):'<div class="empty-state">두드러진 합·충·형·파·해 조합이 확인되지 않습니다.</div>';
}

function renderMbtiAxes(mbti){
  const names={EI:'에너지 방향',SN:'정보 처리',TF:'판단 방식',JP:'생활 패턴'};
  $('mbtiAxes').innerHTML=Object.entries(mbti.axes).map(([key,axis])=>`<div class="axis-row"><div class="axis-side">${axis.left.letter}<br><small>${axis.left.percent}%</small></div><div><strong>${names[key]} · ${axis.selected} 우세</strong><div class="axis-track"><span class="axis-left" style="width:${axis.left.percent}%"></span><span class="axis-right" style="width:${axis.right.percent}%"></span></div><p>${axis.reasons.join(' · ')}</p></div><div class="axis-side">${axis.right.letter}<br><small>${axis.right.percent}%</small></div></div>`).join('');
}

function renderExpertGuide(chart){
  const guide=buildPlainChartGuide(chart);
  const sectionOrder=['personality','work','money','relationships','recovery'];
  $('expertGuide').innerHTML=`<div class="expert-guide-head"><div><span class="micro">MY CHART IN PLAIN KOREAN</span><h3>${guide.headline}</h3></div><p>${guide.summary}</p></div><div class="expert-story-grid">${sectionOrder.map((key,index)=>{const section=guide.sections[key];return `<article class="expert-story-card"><span>${String(index+1).padStart(2,'0')}</span><h4>${section.title}</h4><p class="story-summary">${section.summary}</p><div class="life-example"><strong>생활에서는 이렇게 보일 수 있어요</strong><p>${section.lifeExample}</p></div><details class="expert-evidence"><summary>왜 이렇게 해석했나요?</summary><p>${section.evidence}</p></details></article>`;}).join('')}</div><div class="expert-glossary"><div><span class="micro">TERMS, SIMPLIFIED</span><h4>전문용어를 한 문장으로</h4></div><dl>${guide.glossary.map((item)=>`<div><dt>${item.term}</dt><dd>${item.plain}</dd></div>`).join('')}</dl></div><p class="expert-raw-intro"><strong>아래부터는 계산 원자료입니다.</strong> 위 해설이 어떤 데이터에서 나왔는지 확인하고 싶을 때만 펼쳐보세요.</p>`;
}

function renderExpert(chart,mbti){
  renderExpertGuide(chart);
  renderPillars(chart);
  renderBars('elementChart',chart.elements,Object.fromEntries(Object.entries(ELEMENT_LABELS).map(([k,v])=>[k,`${k} · ${v.label}`])));
  renderBars('roleChart',chart.roles,ROLE_LABELS);
  renderRelations(chart);
  renderMbtiAxes(mbti);
}

function renderAll(){
  errorBox.textContent='';
  try{
    const input=collectInput();
    const chart=calculateSaju(input);
    const mbti=calculateSajuMbti(chart);
    const todayFlow=calculateTodayFlow(chart);
    const year=currentKstYear();
    const yearFlow=calculateYearFlows(chart,year,1)[0];
    const monthFlows=calculateMonthFlows(chart,year);
    const report=buildDetailedInterpretation(chart,mbti,yearFlow,monthFlows);
    const name=$('name').value.trim()||'당신';
    renderProfile(chart,mbti,report,name,todayFlow);
    renderDetailedReport(report);
    renderToday(chart,todayFlow);
    renderYear(yearFlow,monthFlows);
    renderLuck(chart);
    renderExpert(chart,mbti);
    results.hidden=false;
  }catch(error){
    results.hidden=true;
    errorBox.textContent=error?.message||'입력값을 확인해 주세요.';
  }
}

let tarotSession=null;
let tarotRevealTimer=null;
let tarotDealTimer=null;

function tarotPickCount(mode){ return mode==='today'?1:3; }

function cancelTarotRoll(){
  if(tarotDealTimer){
    clearTimeout(tarotDealTimer);
    tarotDealTimer=null;
  }
  const deck=$('tarotDeck');
  deck?.classList.remove('is-dealing');
}

function setTarotFanActive(index){
  if(!tarotSession) return;
  const deck=$('tarotDeck');
  const max=tarotSession.fan.length-1;
  const next=Math.max(0,Math.min(max,index));
  tarotSession.activeIndex=next;
  deck?.querySelectorAll('.tarot-pick').forEach((card,cardIndex)=>{
    card.classList.toggle('is-active',cardIndex===next);
    card.setAttribute('aria-selected',cardIndex===next?'true':'false');
  });
  const activeLabel=$('tarotFanActive');
  if(activeLabel) activeLabel.textContent=`카드 ${String(next+1).padStart(2,'0')} / ${tarotSession.fan.length}`;
  const stage=deck?.querySelector('.tarot-fan-stage');
  if(stage) stage.setAttribute('aria-activedescendant',`tarot-pick-${next}`);
}

function tarotFanIndexFromPoint(stage,clientX){
  if(!tarotSession || !stage) return 0;
  const rect=stage.getBoundingClientRect();
  const inset=Math.min(44,Math.max(18,rect.width*.07));
  const usable=Math.max(1,rect.width-inset*2);
  const ratio=Math.max(0,Math.min(1,(clientX-rect.left-inset)/usable));
  return Math.round(ratio*(tarotSession.fan.length-1));
}

function runTarotRoll(){
  const deck=$('tarotDeck');
  if(!deck) return;
  cancelTarotRoll();
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  deck.classList.remove('is-spread');
  if(reduced){
    deck.classList.add('is-spread');
    return;
  }
  deck.classList.add('is-dealing');
  requestAnimationFrame(()=>requestAnimationFrame(()=>deck.classList.add('is-spread')));
  tarotDealTimer=setTimeout(()=>{
    tarotDealTimer=null;
    deck.classList.remove('is-dealing');
  },1450);
}

function renderTarotFan(){
  if(!tarotSession) return;
  const {fan,selected,count}=tarotSession;
  const deck=$('tarotDeck');
  tarotSession.activeIndex=Math.min(tarotSession.activeIndex ?? Math.floor(fan.length/2),fan.length-1);
  deck.className='tarot-deck tarot-fan-deck';
  deck.innerHTML=`
    <div class="tarot-fan-head">
      <div class="tarot-fan-copy">
        <span class="section-kicker">FULL 78-CARD DECK</span>
        <strong>78장의 카드를 한 번에 펼칩니다.</strong>
        <small>카드 위를 천천히 훑고, 마음이 멈추는 지점에서 선택하세요. 스크롤바 없이 전체 덱을 한 장면에서 보여줍니다.</small>
      </div>
      <div class="tarot-fan-meta">
        <span id="tarotFanActive">카드 40 / ${fan.length}</span>
        <small>드래그 · 탭 · ← →</small>
      </div>
    </div>
    <div class="tarot-fan-stage" tabindex="0" role="listbox" aria-label="78장 타로 카드 펼침 선택 영역">
      <div class="tarot-fan-table" aria-hidden="true"></div>
      <div class="tarot-fan-track">
        ${fan.map((item,index)=>{
          const picked=selected.includes(index);
          const p=index/(fan.length-1);
          const x=(p*100).toFixed(4);
          const shift=(-p*100).toFixed(4);
          const rotation=((p-.5)*12).toFixed(3);
          const drop=(Math.pow((p-.5)*2,2)*20).toFixed(2);
          const delay=Math.min(620,index*8);
          return `<button id="tarot-pick-${index}" type="button" tabindex="-1" role="option"
            class="tarot-pick${picked?' selected':''}" data-pick="${index}"
            aria-pressed="${picked}" aria-selected="false"
            aria-label="섞인 타로 카드 ${index+1}번"
            style="--x:${x}%;--shift:${shift}%;--rot:${rotation}deg;--drop:${drop}px;--delay:${delay}ms;--z:${index+1}">
            <span class="tarot-pick-back" aria-hidden="true"><i></i></span>
          </button>`;
        }).join('')}
      </div>
      <div class="tarot-fan-glow" aria-hidden="true"></div>
    </div>`;
  $('tarotResult').innerHTML=`<div class="tarot-pick-status"><strong>${count}장 중 ${selected.length}장 선택</strong><span>${selected.length<count?'카드 위를 훑다가 끌리는 지점에서 손을 떼거나 클릭하세요.':'선택한 카드를 펼치는 중입니다.'}</span></div>`;

  const stage=deck.querySelector('.tarot-fan-stage');
  let pointerDown=false;
  let pointerId=null;

  const updateFromPointer=(event)=>{
    const index=tarotFanIndexFromPoint(stage,event.clientX);
    setTarotFanActive(index);
  };

  stage.addEventListener('pointerdown',(event)=>{
    if(event.button!==undefined && event.button!==0) return;
    pointerDown=true;
    pointerId=event.pointerId;
    stage.setPointerCapture?.(event.pointerId);
    updateFromPointer(event);
  });
  stage.addEventListener('pointermove',(event)=>{
    if(event.pointerType==='mouse' || pointerDown) updateFromPointer(event);
  });
  stage.addEventListener('pointerup',(event)=>{
    if(pointerId!==null && event.pointerId!==pointerId) return;
    updateFromPointer(event);
    pointerDown=false;
    pointerId=null;
    selectTarotCard(tarotSession.activeIndex);
  });
  stage.addEventListener('pointercancel',()=>{
    pointerDown=false;
    pointerId=null;
  });
  stage.addEventListener('keydown',(event)=>{
    const current=tarotSession?.activeIndex ?? Math.floor(fan.length/2);
    if(event.key==='ArrowLeft'){event.preventDefault();setTarotFanActive(current-1);}
    if(event.key==='ArrowRight'){event.preventDefault();setTarotFanActive(current+1);}
    if(event.key==='PageUp'){event.preventDefault();setTarotFanActive(current-7);}
    if(event.key==='PageDown'){event.preventDefault();setTarotFanActive(current+7);}
    if(event.key==='Home'){event.preventDefault();setTarotFanActive(0);}
    if(event.key==='End'){event.preventDefault();setTarotFanActive(fan.length-1);}
    if(event.key==='Enter' || event.key===' '){event.preventDefault();selectTarotCard(tarotSession.activeIndex);}
  });

  requestAnimationFrame(()=>{
    setTarotFanActive(tarotSession.activeIndex);
    runTarotRoll();
  });
}

function renderTarot(mode,draw,reading,question){
  cancelTarotRoll();
  const deck=$('tarotDeck');
  deck.className=`tarot-deck tarot-reveal-deck${draw.length===1?' one-card':''}`;
  deck.innerHTML=draw.map((item,index)=>`<article class="tarot-card" data-card="${index}"><div class="tarot-card-inner"><div class="tarot-face tarot-back"></div><div class="tarot-face tarot-front"><div><span class="arcana-no">${item.card.arcana==='major'?String(item.card.rank).padStart(2,'0'):item.card.en}</span><div class="tarot-illustration"><img class="tarot-card-image" src="${item.card.image}" alt="${item.card.en} Rider-Waite-Smith 카드" loading="eager"></div><strong>${item.card.name}</strong><small>${item.card.en}<br>${item.reversed?'REVERSED · 역방향':'UPRIGHT · 정방향'}</small></div></div></div></article>`).join('');
  requestAnimationFrame(()=>setTimeout(()=>deck.querySelectorAll('.tarot-card').forEach((card)=>card.classList.add('revealed')),60));
  const questionLine=question?`<p class="tarot-question-line">질문 · ${escapeHtml(question)}</p>`:'';
  $('tarotResult').innerHTML=questionLine+reading.map((item)=>`<article class="tarot-reading"><div class="tarot-reading-head"><span>${item.position}</span><div><h3>${item.card.name} · ${item.orientation}</h3><p class="tarot-keywords">${item.card.keywords}</p></div></div><div class="tarot-reading-grid"><div><strong>카드의 뜻</strong><p>${item.meaning}</p></div><div><strong>그림이 말하는 상징</strong><p>${item.symbolism}</p></div><div><strong>지금 적용할 조언</strong><p>${item.advice}</p></div></div><p class="tarot-reading-note">타로는 미래를 확정하는 예언이 아니라 현재 질문을 다른 각도에서 살펴보기 위한 상징적 참고 도구입니다.</p></article>`).join('');
  $('tarotHelp').textContent='선택한 카드를 펼쳤습니다. 같은 질문으로 다시 보고 싶다면 78장을 다시 섞어 직접 선택하세요.';
}

function renderTarotFan(){
  if(!tarotSession) return;
  const {fan,selected,count}=tarotSession;
  const deck=$('tarotDeck');
  deck.className='tarot-deck tarot-roller-deck';
  deck.innerHTML=`
    <div class="tarot-roller-head">
      <div class="tarot-roller-copy">
        <span class="section-kicker">FULL 78-CARD DECK</span>
        <strong>78장의 카드를 모두 펼쳤습니다.</strong>
        <small>롤 애니메이션으로 78장을 훑습니다. 언제든 직접 멈추고 좌우로 밀거나 화살표·키보드로 이동해 카드를 선택하세요.</small>
      </div>
      <div class="tarot-roller-actions" aria-label="타로 카드 이동">
        <button id="tarotRollPrev" type="button" aria-label="이전 카드 묶음 보기">←</button>
        <span id="tarotRollPosition" aria-live="polite">01–01 / ${fan.length}</span>
        <button id="tarotRollNext" type="button" aria-label="다음 카드 묶음 보기">→</button>
      </div>
    </div>
    <div class="tarot-roller-viewport" tabindex="0" aria-label="78장 타로 카드 선택 영역">
      <div class="tarot-roller-track">
        ${fan.map((item,index)=>{
          const picked=selected.includes(index);
          return `<button type="button" class="tarot-pick${picked?' selected':''}" data-pick="${index}" aria-pressed="${picked}" aria-label="섞인 타로 카드 ${index+1}번 선택">
            <span class="tarot-pick-back" aria-hidden="true"><i></i></span>
            <span class="tarot-pick-number">${String(index+1).padStart(2,'0')}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  $('tarotResult').innerHTML=`<div class="tarot-pick-status"><strong>${count}장 중 ${selected.length}장 선택</strong><span>${selected.length<count?'78장 전체에서 끌리는 카드를 직접 골라주세요.':'선택한 카드를 펼치는 중입니다.'}</span></div>`;

  const viewport=deck.querySelector('.tarot-roller-viewport');
  const stopRoll=()=>cancelTarotRoll();
  viewport.addEventListener('scroll',()=>tarotRollStatus(viewport),{passive:true});
  viewport.addEventListener('pointerdown',stopRoll,{passive:true});
  viewport.addEventListener('wheel',stopRoll,{passive:true});
  viewport.addEventListener('keydown',(event)=>{
    if(event.key==='ArrowLeft'){event.preventDefault();scrollTarotRoll(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();scrollTarotRoll(1);}
    if(event.key==='PageUp'){event.preventDefault();scrollTarotRoll(-1);}
    if(event.key==='PageDown'){event.preventDefault();scrollTarotRoll(1);}
    if(event.key==='Home'){event.preventDefault();cancelTarotRoll();viewport.scrollTo({left:0,behavior:'smooth'});}
    if(event.key==='End'){event.preventDefault();cancelTarotRoll();viewport.scrollTo({left:viewport.scrollWidth,behavior:'smooth'});}
  });
  $('tarotRollPrev')?.addEventListener('click',()=>scrollTarotRoll(-1));
  $('tarotRollNext')?.addEventListener('click',()=>scrollTarotRoll(1));
  deck.querySelectorAll('.tarot-pick').forEach((button)=>button.addEventListener('click',()=>selectTarotCard(Number(button.dataset.pick))));
  requestAnimationFrame(()=>{tarotRollStatus(viewport);runTarotRoll();});
}

function selectTarotCard(index){
  if(!tarotSession || tarotSession.selected.includes(index) || tarotSession.selected.length>=tarotSession.count) return;
  cancelTarotRoll();
  tarotSession.selected.push(index);
  const button=$('tarotDeck').querySelector(`[data-pick="${index}"]`);
  if(button){
    button.classList.add('selected');
    button.setAttribute('aria-pressed','true');
    button.disabled=true;
  }
  const status=$('tarotResult').querySelector('.tarot-pick-status');
  if(status){
    status.innerHTML=`<strong>${tarotSession.count}장 중 ${tarotSession.selected.length}장 선택</strong><span>${tarotSession.selected.length<tarotSession.count?'78장 전체 덱에서 카드를 계속 골라주세요.':'선택한 카드를 펼치는 중입니다.'}</span>`;
  }
  if(tarotSession.selected.length===tarotSession.count){
    const chosen=tarotSession.selected.map((i)=>tarotSession.fan[i]);
    const mode=tarotSession.mode;
    const reading=interpretSpread(mode,chosen);
    const question=tarotSession.question;
    const delay=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:360;
    tarotRevealTimer=setTimeout(()=>{ tarotRevealTimer=null; renderTarot(mode,chosen,reading,question); },delay);
  }
}

function handleTarot(){
  if(tarotRevealTimer){
    clearTimeout(tarotRevealTimer);
    tarotRevealTimer=null;
  }
  cancelTarotRoll();
  const mode=$('tarotMode').value;
  tarotSession={
    mode,
    count:tarotPickCount(mode),
    fan:prepareTarotFan(78),
    selected:[],
    question:$('tarotQuestion').value.trim()
  };
  $('tarotHelp').textContent=`78장의 전체 타로 덱을 섞어 한 번에 펼칩니다. 카드 위를 훑고 마음이 멈추는 지점에서 ${tarotSession.count}장을 직접 선택하세요. 정·역방향은 섞는 순간 정해집니다.`;
  $('drawTarot').innerHTML='78장 다시 펼치기 <b aria-hidden="true">↻</b>';
  renderTarotFan();
}

function setupFullReportAccess(){
  const report=$('full-report');
  if(!report) return;
  document.querySelectorAll('a[href="#full-report"]').forEach((link)=>{
    link.addEventListener('click',()=>{ report.open=true; });
  });
  if(location.hash==='#full-report') report.open=true;
}

function setupSectionSpy(){
  const links=[...document.querySelectorAll('.topnav a[href^="#"], .report-nav a[href^="#"]')];
  const targets=[...new Set(links.map((link)=>document.querySelector(link.getAttribute('href'))).filter(Boolean))];
  if(!('IntersectionObserver' in window) || !targets.length) return;
  const setCurrent=(id)=>{
    links.forEach((link)=>{
      const active=link.getAttribute('href')===`#${id}`;
      if(active) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
    });
  };
  const observer=new IntersectionObserver((entries)=>{
    const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
    if(visible[0]?.target?.id) setCurrent(visible[0].target.id);
  },{rootMargin:'-20% 0px -65% 0px',threshold:[0,.15,.35,.6]});
  targets.forEach((target)=>observer.observe(target));
}

form.elements.calendar.forEach((radio)=>radio.addEventListener('change',syncCalendarUi));
$('precisionToggle').addEventListener('change',syncPrecisionUi);
form.addEventListener('submit',(event)=>{
  event.preventDefault();
  renderAll();
  if(event.isTrusted){
    const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(()=>document.querySelector('.visual-keyword-showcase')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
  }
});
$('drawTarot').addEventListener('click',handleTarot);
syncCalendarUi();
syncPrecisionUi();
setupSectionSpy();
setupFullReportAccess();
requestAnimationFrame(()=>form.requestSubmit());
