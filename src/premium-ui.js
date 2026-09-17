import {
  calculateSaju,
  calculateYearFlows,
  calculateMonthFlows,
  calculateTodayFlow
} from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { buildDetailedInterpretation } from './interpretation.js';
import { drawTarot, interpretSpread } from './tarot.js';
import { ROLE_LABELS, ELEMENT_LABELS, stemByName, branchByName } from './data.js';

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

const TAROT_SYMBOLS = ['✦','☿','☾','♀','♄','☉','♡','♜','∞','☽','◌','⚖','▽','✧','⚗','♑','⚡','☆','☾','☀','♧','⊕'];

function selectedCalendar(){ return form.elements.calendar.value; }
function currentKstYear(){ return Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date())); }
function currentKstDate(){ return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(new Date()); }
function sorted(object){ return Object.entries(object).sort((a,b)=>b[1]-a[1]); }
function dominantElement(chart){ return sorted(chart.elements)[0]?.[0] || '토'; }
function weakestElement(chart){ return sorted(chart.elements).at(-1)?.[0] || '수'; }
function dominantRole(chart){ return sorted(chart.roles)[0]?.[0] || '인성'; }
function relationLabel(relations){ return relations?.length ? [...new Set(relations.map((r)=>r.type))].join('·') : '큰 충돌 신호 없음'; }

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
  $('precisionSettings').classList.toggle('precision-off',!enabled);
  $('birthLocation').disabled=!enabled;
}

function formatSolar(solar){ return `${solar.year}.${String(solar.month).padStart(2,'0')}.${String(solar.day).padStart(2,'0')}`; }
function formatLunar(lunar){ return `${lunar.year}년 ${lunar.isLeap?'윤':''}${lunar.month}월 ${lunar.day}일`; }

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
  const ordered=['overview','temperament','innerOuter','strengths','career','money','love','relationships','recovery','year','luck'];
  $('detailedReport').innerHTML=ordered.map((key,index)=>{
    const item=report[key];
    return `<article class="detail-chapter"><header class="detail-chapter-header"><span>${String(index+1).padStart(2,'0')}</span><h3>${item.title}</h3><p>${item.lead}</p></header><div class="detail-chapter-body">${item.paragraphs.map((p)=>`<p>${p}</p>`).join('')}</div></article>`;
  }).join('');
}

function renderToday(chart,todayFlow){
  const copy=GROUP_COPY[todayFlow.group];
  $('todayDate').textContent=currentKstDate();
  $('todayHeadline').textContent=`“${copy.summary}”`;
  $('todaySummary').textContent=`오늘은 ${copy.opportunity}에 힘을 싣는 편이 좋습니다. 반대로 ${copy.caution}은 한 번 더 점검하세요. 오늘 일진 ${todayFlow.korean}과 원국의 관계 신호는 ${relationLabel(todayFlow.relations)}입니다.`;
  const cards=[['총운',`${copy.summary}입니다. 무엇을 더 할지보다 오늘 가장 중요한 한 가지를 먼저 정해보세요.`],['재물',copy.money],['연애',copy.love],['직업',copy.work],['컨디션',copy.health]];
  const icons={총운:'☀',재물:'◉',연애:'♡',직업:'▣',컨디션:'✦'};
  $('dailyFortuneGrid').innerHTML=cards.map(([title,text])=>`<article class="daily-fortune-card"><span class="daily-icon">${icons[title]}</span><strong>${title}</strong><p>${text}</p></article>`).join('');
  const strong=dominantElement(chart), weak=weakestElement(chart), hint=ELEMENT_HINT[strong];
  $('todayLucky').innerHTML=`<p class="micro">TODAY'S GUIDE</p><dl class="lucky-list"><div><dt>행동</dt><dd>${hint.action}</dd></div><div><dt>공간</dt><dd>${hint.place}</dd></div><div><dt>상징 컬러</dt><dd>${hint.color}</dd></div><div><dt>균형 포인트</dt><dd>${weak}(${ELEMENT_LABELS[weak].label}) 기운을 보완하는 휴식과 정리를 의식해 보세요.</dd></div></dl>`;
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
  $('yearAdviceGrid').innerHTML=[['올해의 기회',copy.opportunity],['주의할 패턴',copy.caution],['돈의 포인트',copy.money],['관계의 포인트',copy.love]].map(([title,text])=>`<article class="advice-card"><span>${title}</span><p>${text}</p></article>`).join('');
  const quarterNames=['1–3월 · 방향을 잡는 구간','4–6월 · 속도를 조절하는 구간','7–9월 · 중심을 다지는 구간','10–12월 · 정리와 다음 준비'];
  $('tojungQuarterGrid').innerHTML=[0,3,6,9].map((start,index)=>{
    const group=dominantGroup(monthFlows.slice(start,start+3)); const c=GROUP_COPY[group];
    return `<article class="quarter-card"><span>${String(index+1).padStart(2,'0')}</span><div><h3>${quarterNames[index]}</h3><strong>${c.summary}</strong><p>${c.opportunity}을 활용하고, ${c.caution}은 줄여보세요.</p></div></article>`;
  }).join('');
  const seasons=[['봄',monthFlows.slice(2,5)],['여름',monthFlows.slice(5,8)],['가을',monthFlows.slice(8,11)],['겨울',[monthFlows[11],monthFlows[0],monthFlows[1]]]];
  $('seasonGuide').innerHTML=seasons.map(([name,flows])=>{const group=dominantGroup(flows),c=GROUP_COPY[group];return `<article><span>${name}</span><strong>${ROLE_LABELS[group]}</strong><p>${c.summary}. ${c.opportunity}</p></article>`;}).join('');
  $('monthForecast').innerHTML=monthFlows.map((item)=>{const c=GROUP_COPY[item.group];return `<article class="month-card"><div><span class="month-number">${String(item.month).padStart(2,'0')}</span><strong>${ROLE_LABELS[item.group]}</strong></div><p>${c.summary}. ${c.opportunity}을 우선하고 ${c.caution}은 줄여보세요.</p><small>${item.korean} · ${item.tenGod}</small></article>`;}).join('');
}

function renderLuck(chart){
  if(!chart.luck){ $('luckMeta').textContent='대운 정보를 표시할 수 없습니다.'; $('luckTimeline').innerHTML=''; return; }
  $('luckMeta').textContent=`${chart.luck.forward?'순행':'역행'} · 첫 대운 약 ${chart.luck.startYears}년 ${chart.luck.startMonths}개월 후 시작`;
  $('luckTimeline').innerHTML=chart.luck.pillars.slice(0,9).map((item,index)=>`<article class="luck-step"><span>${item.age}세부터</span><strong>${item.korean}</strong><p>${index===0?'첫 번째 큰 환경 변화의 배경이 시작되는 구간입니다.':'이 시기부터 새로운 10년의 배경 주제가 시작됩니다.'}</p></article>`).join('');
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

function renderExpert(chart,mbti){
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

function renderTarot(mode,draw,reading,question){
  $('tarotDeck').innerHTML=draw.map((item,index)=>`<article class="tarot-card" data-card="${index}"><div class="tarot-card-inner"><div class="tarot-face tarot-back"></div><div class="tarot-face tarot-front${item.reversed?' reversed':''}"><div><span class="arcana-no">${String(item.card.id).padStart(2,'0')}</span><div class="arcana-symbol">${TAROT_SYMBOLS[item.card.id]}</div><strong>${item.card.name}</strong><small>${item.card.en}<br>${item.reversed?'REVERSED':'UPRIGHT'}</small></div></div></div></article>`).join('');
  requestAnimationFrame(()=>setTimeout(()=>document.querySelectorAll('.tarot-card').forEach((card)=>card.classList.add('revealed')),60));
  const questionLine=question?`<p class="tarot-question-line">질문 · ${question.replace(/[<>]/g,'')}</p>`:'';
  $('tarotResult').innerHTML=questionLine+reading.map((item)=>`<article class="tarot-reading"><span>${item.position}</span><h3>${item.card.name} · ${item.orientation}</h3><p>${item.text}</p></article>`).join('');
}

function handleTarot(){
  const mode=$('tarotMode').value;
  const count=mode==='today'?1:3;
  const draw=drawTarot(count);
  const reading=interpretSpread(mode,draw);
  renderTarot(mode,draw,reading,$('tarotQuestion').value.trim());
}

form.elements.calendar.forEach((radio)=>radio.addEventListener('change',syncCalendarUi));
$('precisionToggle').addEventListener('change',syncPrecisionUi);
form.addEventListener('submit',(event)=>{event.preventDefault();renderAll();});
$('drawTarot').addEventListener('click',handleTarot);
syncCalendarUi();
syncPrecisionUi();
requestAnimationFrame(()=>form.requestSubmit());
