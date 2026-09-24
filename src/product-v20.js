import {
  calculateSaju,
  calculateYearFlow,
  calculateMonthFlows,
  calculateTodayFlow,
  calculateTodayTimeFlows
} from './saju-engine.js';
import { calculateDailyScores } from './daily-score.js';
import { buildCoreReading, buildYearReading, buildDailyReading } from './reading-v20.js';
import { BIRTH_LOCATIONS } from './precision.js';
import { prepareTarotFan, interpretSpread } from './tarot.js';

const $ = (id) => document.getElementById(id);
const PROFILE_KEY = 'naesaju.profile.v20';

const state = {
  profile:null,
  chart:null,
  core:null,
  year:null,
  monthFlows:[],
  route:'home',
  fortuneTab:'today',
  fortuneDate:null,
  tarotMode:'today',
  tarotFan:[],
  tarotSelected:[]
};

function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,(char)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
}

function kstNowParts(){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(new Date());
  const value=Object.fromEntries(parts.map((item)=>[item.type,item.value]));
  return {year:Number(value.year),month:Number(value.month),day:Number(value.day),iso:value.year+'-'+value.month+'-'+value.day};
}

function dateFromIso(iso){
  const match=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match) throw new RangeError('날짜를 확인해 주세요.');
  return new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]),3,0,0));
}

function shiftIso(iso,amount){
  const date=dateFromIso(iso);
  date.setUTCDate(date.getUTCDate()+amount);
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date);
  const value=Object.fromEntries(parts.map((item)=>[item.type,item.value]));
  return value.year+'-'+value.month+'-'+value.day;
}

function formatKoreanDate(iso){
  return new Intl.DateTimeFormat('ko-KR',{
    timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'
  }).format(dateFromIso(iso));
}

function parseProfileForm(){
  const date=$('birthDate').value;
  const match=date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match) throw new RangeError('생년월일을 입력해 주세요.');
  const unknown=$('timeUnknown').checked;
  const time=unknown?'12:00':$('birthTime').value;
  const timeMatch=String(time).match(/^(\d{2}):(\d{2})$/);
  if(!timeMatch) throw new RangeError('출생시간을 입력하거나 시간 모름을 선택해 주세요.');
  return {
    name:$('birthName').value.trim() || '나',
    calendar:$('calendarMode').value,
    year:Number(match[1]),
    month:Number(match[2]),
    day:Number(match[3]),
    hour:Number(timeMatch[1]),
    minute:Number(timeMatch[2]),
    isLeap:$('calendarMode').value==='lunar' && $('birthLeap').value==='true',
    gender:$('birthGender').value,
    location:$('birthLocation').value,
    dayBoundary:$('dayBoundary').value,
    precision:$('precisionMode').checked,
    timeKnown:!unknown
  };
}

function calculateAll(profile){
  const chart=calculateSaju(profile);
  const currentYear=kstNowParts().year;
  const yearFlow=calculateYearFlow(chart,currentYear);
  const previousYearMonths=calculateMonthFlows(chart,currentYear-1);
  const currentYearMonths=calculateMonthFlows(chart,currentYear);
  const monthFlows=[previousYearMonths.at(-1),...currentYearMonths.slice(0,11)];
  state.profile=profile;
  state.chart=chart;
  state.core=buildCoreReading(chart,{timeKnown:profile.timeKnown});
  state.year=buildYearReading(chart,yearFlow,monthFlows);
  state.monthFlows=monthFlows;
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));
  syncProfileHeader();
  renderCore();
  renderYear();
  renderFortuneDate(state.fortuneDate || kstNowParts().iso);
  renderHome();
}

function syncProfileHeader(){
  if(!state.profile) return;
  $('profileName').textContent=state.profile.name;
  $('profileInitial').textContent=state.profile.name.slice(0,1) || '나';
  $('homeGreeting').textContent=state.profile.name+'님의 오늘';
}

function loadProfile(){
  try{
    const value=localStorage.getItem(PROFILE_KEY);
    if(!value) return false;
    const profile=JSON.parse(value);
    calculateAll(profile);
    fillProfileForm(profile);
    return true;
  }catch(error){
    localStorage.removeItem(PROFILE_KEY);
    return false;
  }
}

function fillProfileForm(profile){
  if(!profile) return;
  $('birthName').value=profile.name==='나'?'':profile.name;
  $('calendarMode').value=profile.calendar || 'solar';
  $('birthDate').value=[
    String(profile.year).padStart(4,'0'),
    String(profile.month).padStart(2,'0'),
    String(profile.day).padStart(2,'0')
  ].join('-');
  $('birthTime').value=String(profile.hour).padStart(2,'0')+':'+String(profile.minute).padStart(2,'0');
  $('birthGender').value=profile.gender || 'male';
  $('birthLocation').value=profile.location || 'korea';
  $('dayBoundary').value=profile.dayBoundary || 'midnight';
  $('precisionMode').checked=profile.precision!==false;
  $('timeUnknown').checked=profile.timeKnown===false;
  $('birthTime').disabled=profile.timeKnown===false;
  $('birthLeap').value=profile.isLeap?'true':'false';
  syncCalendarFields();
}

function renderHome(){
  if(!state.chart) return;
  const daily=buildDailyFor(state.fortuneDate || kstNowParts().iso);
  $('homeDate').textContent=formatKoreanDate(state.fortuneDate || kstNowParts().iso);
  $('homeScore').textContent=daily.score;
  $('homeScoreState').textContent=daily.state;
  $('todayTitle').textContent=daily.title;
  $('homeSummary').textContent=daily.summary;
  $('homeOpportunity').textContent=daily.opportunity;
  $('homeCaution').textContent=daily.caution;
  $('homeDailyGrid').innerHTML=daily.categories.map(renderDailyRow).join('');
  $('homeYearTitle').textContent=state.year.title;
  $('homeYearSummary').textContent=state.year.summary;
  $('homeCoreTitle').textContent=state.core.signature.title;
  $('homeCoreSummary').textContent=state.core.signature.subtitle;
}

function renderDailyRow(item){
  return '<article class="daily-row" data-score="'+item.score+'">'+
    '<span>'+escapeHtml(item.label)+'</span>'+
    '<strong>'+item.score+'<small>/100</small></strong>'+
    '<p>'+escapeHtml(item.advice)+'</p>'+
  '</article>';
}

function renderCore(){
  const core=state.core;
  if(!core) return;
  $('sajuSignature').textContent=core.signature.subtitle;
  $('signatureTitle').textContent=core.signature.title;
  $('signatureSubtitle').textContent=core.signature.subtitle;
  $('signatureNote').textContent=core.signature.note;
  $('sajuTabs').innerHTML=core.categories.map((item,index)=>
    '<button type="button" role="tab" data-reading-id="'+item.id+'" aria-selected="'+(index===0?'true':'false')+'">'+escapeHtml(item.title)+'</button>'
  ).join('');
  renderReading(core.categories[0].id);
  $('elementBars').innerHTML=core.structure.elements.map(renderBar).join('');
  $('roleBars').innerHTML=core.structure.roles.map(renderBar).join('');
  renderEvidenceDialog();
}

function renderBar(item){
  const width=Math.max(6,Math.min(100,item.ratio));
  return '<div class="bar-row"><span>'+escapeHtml(item.label)+'</span><div class="bar-track"><i style="width:'+width+'%"></i></div><strong>'+item.ratio+'%</strong></div>';
}

function renderReading(id){
  const item=state.core?.categories.find((entry)=>entry.id===id);
  if(!item) return;
  document.querySelectorAll('#sajuTabs [role="tab"]').forEach((button)=>{
    button.setAttribute('aria-selected',button.dataset.readingId===id?'true':'false');
  });
  $('sajuReading').innerHTML=
    '<header><p class="eyebrow">'+escapeHtml(item.eyebrow)+'</p><h2>'+escapeHtml(item.headline)+'</h2><p>'+escapeHtml(item.summary)+'</p></header>'+
    '<div class="reading-columns">'+
      '<section class="reading-block"><h3>강점으로 쓰일 때</h3><ul>'+item.strength.map((line)=>'<li>'+escapeHtml(line)+'</li>').join('')+'</ul></section>'+
      '<section class="reading-block"><h3>과해질 때</h3><ul>'+item.watch.map((line)=>'<li>'+escapeHtml(line)+'</li>').join('')+'</ul></section>'+
    '</div>'+
    '<div class="practice-box"><strong>생활에서 써먹는 방법</strong><p>'+escapeHtml(item.practice)+'</p></div>'+
    '<details class="evidence-box"><summary>이 해석이 나온 근거 <span aria-hidden="true">+</span></summary><ul>'+item.evidence.map((line)=>'<li>'+escapeHtml(line)+'</li>').join('')+'</ul></details>';
}

function renderEvidenceDialog(){
  if(!state.core || !state.chart) return;
  const structure=state.core.structure;
  const basis=structure.basis || {};
  $('evidenceContent').innerHTML=
    '<section class="evidence-group"><h3>사주 네 기둥</h3><code>'+escapeHtml(structure.pillars)+'</code><p>'+escapeHtml(structure.timeKnown?'출생시간 포함':'출생시간 미상 · 시주 해석 제한')+'</p></section>'+
    '<section class="evidence-group"><h3>계산 환경</h3>'+
      '<p>시간대: '+escapeHtml(basis.timezone||'Asia/Seoul')+'</p>'+
      '<p>출생지역: '+escapeHtml(basis.location||'대한민국 평균')+'</p>'+
      '<p>진태양시: '+escapeHtml(basis.trueSolarTime||'미적용')+'</p>'+
      '<p>날짜 경계: '+escapeHtml(basis.dayBoundary||'자정 기준')+'</p>'+
      '<p>달력 엔진: '+escapeHtml(basis.calendarEngine||'manseryeok')+'</p>'+
    '</section>'+
    '<section class="evidence-group"><h3>해석 범위</h3><p>오행·십성·지지 관계와 절기 흐름을 계산 근거로 사용합니다. 전통 명리 해석은 학파별 차이가 있으므로 미래 사건을 확정적으로 단정하지 않습니다.</p></section>';
}

function buildDailyFor(iso){
  if(!state.chart) return null;
  const date=dateFromIso(iso);
  const flow=calculateTodayFlow(state.chart,date);
  const scores=calculateDailyScores(state.chart,flow);
  return buildDailyReading(state.chart,flow,scores);
}

function renderFortuneDate(iso){
  if(!state.chart) return;
  state.fortuneDate=iso;
  $('fortuneDate').value=iso;
  const daily=buildDailyFor(iso);
  $('fortuneScore').textContent=daily.score;
  $('fortuneState').textContent=daily.state;
  $('fortuneTitle').textContent=daily.title;
  $('fortuneSummary').textContent=daily.summary;
  $('fortuneEvidence').textContent='계산 신호: '+daily.signal+' · 힘을 쓸 곳: '+daily.opportunity+' · 경계할 것: '+daily.caution;
  $('fortuneDailyList').innerHTML=daily.categories.map(renderDailyRow).join('');
  renderTimeFlow(dateFromIso(iso));
  if(iso===kstNowParts().iso) renderHome();
}

function renderTimeFlow(date){
  const flows=calculateTodayTimeFlows(state.chart,date);
  $('timeFlow').innerHTML=flows.map((flow)=>
    '<article class="time-card"><span>'+escapeHtml(flow.label)+' · '+escapeHtml(flow.range)+'</span><strong>'+escapeHtml(flow.tenGod)+'</strong><p>'+escapeHtml(flow.relations?.length?'관계 신호 '+[...new Set(flow.relations.map((item)=>item.type))].join('·'):'큰 충돌 신호 없음')+'</p></article>'
  ).join('');
}

function renderYear(){
  if(!state.year) return;
  $('yearTitle').textContent=state.year.title;
  $('yearSummary').textContent=state.year.summary;
  $('yearOpportunity').textContent=state.year.opportunity;
  $('yearCaution').textContent=state.year.caution;
  $('monthList').innerHTML=state.year.months.map((month)=>
    '<article class="month-item">'+
      '<div><span class="month-no">'+month.month+'월</span><span class="month-signal">'+escapeHtml(month.signal)+'</span></div>'+
      '<div><h3>'+escapeHtml(month.title.replace(/^\d+월\s*·\s*/,''))+'</h3><p class="month-headline">'+escapeHtml(month.headline)+'</p></div>'+
      '<div class="month-copy"><p><b>해볼 것</b> '+escapeHtml(month.action)+'</p><p><b>주의할 것</b> '+escapeHtml(month.caution)+'</p><p class="month-evidence">'+escapeHtml(month.evidence)+'</p></div>'+
    '</article>'
  ).join('');
}

function setRoute(route){
  const allowed=new Set(['home','saju','fortune','tarot']);
  const next=allowed.has(route)?route:'home';
  state.route=next;
  document.querySelectorAll('[data-screen]').forEach((screen)=>screen.hidden=screen.dataset.screen!==next);
  document.querySelectorAll('[data-route]').forEach((button)=>{
    if(button.dataset.route===next) button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
  window.scrollTo({top:0,behavior:'auto'});
}

function setFortuneTab(tab){
  state.fortuneTab=tab==='year'?'year':'today';
  document.querySelectorAll('[data-fortune-tab]').forEach((button)=>{
    if(button.getAttribute('role')==='tab') button.setAttribute('aria-selected',button.dataset.fortuneTab===state.fortuneTab?'true':'false');
  });
  $('fortuneToday').hidden=state.fortuneTab!=='today';
  $('fortuneYear').hidden=state.fortuneTab!=='year';
}

function syncCalendarFields(){
  const lunar=$('calendarMode').value==='lunar';
  $('leapField').hidden=!lunar;
}

function openProfile(){
  if(!state.profile){
    $('birthLocation').value='korea';
    $('birthGender').value='male';
    $('calendarMode').value='solar';
    $('precisionMode').checked=true;
    $('timeUnknown').checked=false;
  }else{
    fillProfileForm(state.profile);
  }
  syncCalendarFields();
  $('profileDialog').showModal();
}

function setFormError(message=''){
  $('profileError').hidden=!message;
  $('profileError').textContent=message;
}

function initLocations(){
  $('birthLocation').innerHTML=Object.entries(BIRTH_LOCATIONS).map(([key,item])=>
    '<option value="'+escapeHtml(key)+'">'+escapeHtml(item.label)+'</option>'
  ).join('');
}

function tarotRequiredCount(){ return state.tarotMode==='today'?1:3; }

function setTarotMode(mode){
  state.tarotMode=['today','question','love','money','career'].includes(mode)?mode:'today';
  document.querySelectorAll('[data-tarot-mode]').forEach((button)=>button.setAttribute('aria-pressed',button.dataset.tarotMode===state.tarotMode?'true':'false'));
  $('tarotQuestionWrap').hidden=state.tarotMode!=='question';
  state.tarotFan=[];
  state.tarotSelected=[];
  $('tarotPicker').hidden=true;
  $('tarotResult').innerHTML='';
}

function shuffleTarot(){
  state.tarotFan=prepareTarotFan(12);
  state.tarotSelected=[];
  $('tarotPicker').hidden=false;
  $('tarotPickTitle').textContent=tarotRequiredCount()===1?'한 장을 선택하세요':'세 장을 순서대로 선택하세요';
  renderTarotDeck();
  $('tarotResult').innerHTML='';
}

function renderTarotDeck(){
  const selectedSet=new Set(state.tarotSelected.map((item)=>item.card.id));
  $('tarotPickStatus').textContent=state.tarotSelected.length+' / '+tarotRequiredCount()+' 선택';
  $('tarotDeck').innerHTML=state.tarotFan.map((item,index)=>
    '<button type="button" class="tarot-card-back" role="option" data-tarot-index="'+index+'" aria-label="'+(index+1)+'번째 카드" aria-selected="'+(selectedSet.has(item.card.id)?'true':'false')+'"></button>'
  ).join('');
}

function chooseTarot(index){
  if(state.tarotSelected.length>=tarotRequiredCount()) return;
  const item=state.tarotFan[index];
  if(!item || state.tarotSelected.some((entry)=>entry.card.id===item.card.id)) return;
  state.tarotSelected.push(item);
  renderTarotDeck();
  if(state.tarotSelected.length===tarotRequiredCount()) renderTarotResult();
}

function renderTarotResult(){
  const reading=interpretSpread(state.tarotMode,state.tarotSelected);
  const question=$('tarotQuestion').value.trim();
  $('tarotResult').innerHTML=
    (question?'<p class="lead">질문: '+escapeHtml(question)+'</p>':'')+
    reading.map((item)=>
      '<article class="tarot-reading-card">'+
        '<div class="tarot-image-wrap"><img class="'+(item.reversed?'is-reversed':'')+'" src="'+escapeHtml(item.card.image)+'" alt="'+escapeHtml(item.card.name)+' 타로 카드"></div>'+
        '<div><span class="tarot-position">'+escapeHtml(item.position)+' · '+escapeHtml(item.orientation)+'</span><h2>'+escapeHtml(item.card.name)+'</h2>'+
        '<p class="tarot-keywords">'+escapeHtml(item.card.keywords)+'</p>'+
        '<p>'+escapeHtml(item.meaning)+'</p>'+
        '<p>'+escapeHtml(item.symbolism)+'</p>'+
        '<p class="tarot-advice"><strong>지금의 조언</strong><br>'+escapeHtml(item.advice)+'</p></div>'+
      '</article>'
    ).join('');
  $('tarotResult').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}

function shareReport(){
  if(!state.chart) return;
  const text='['+state.profile.name+'의 내사주] '+state.core.signature.title+' · '+state.year.title;
  const bridge=globalThis.NaesajuNative;
  if(bridge?.shareText){
    bridge.shareText('내사주 리포트',text);
    return;
  }
  if(navigator.share){
    navigator.share({title:'내사주 리포트',text}).catch(()=>{});
    return;
  }
  if(bridge?.copyText) bridge.copyText(text);
  else navigator.clipboard?.writeText(text).catch(()=>{});
}

function bindEvents(){
  document.addEventListener('click',(event)=>{
    const route=event.target.closest('[data-route]');
    if(route){
      if(!state.chart){ openProfile(); return; }
      setRoute(route.dataset.route);
      if(route.dataset.fortuneTab){
        setFortuneTab(route.dataset.fortuneTab);
        setRoute('fortune');
      }
      return;
    }
    const reading=event.target.closest('[data-reading-id]');
    if(reading){ renderReading(reading.dataset.readingId); return; }
    const fortuneTab=event.target.closest('[data-fortune-tab]');
    if(fortuneTab && fortuneTab.getAttribute('role')==='tab'){ setFortuneTab(fortuneTab.dataset.fortuneTab); return; }
    const tarotMode=event.target.closest('[data-tarot-mode]');
    if(tarotMode){ setTarotMode(tarotMode.dataset.tarotMode); return; }
    const tarotCard=event.target.closest('[data-tarot-index]');
    if(tarotCard){ chooseTarot(Number(tarotCard.dataset.tarotIndex)); return; }
    const close=event.target.closest('[data-close-dialog]');
    if(close){ $(close.dataset.closeDialog)?.close(); return; }
  });

  $('profileButton').addEventListener('click',openProfile);
  $('evidenceButton').addEventListener('click',()=>state.chart && $('evidenceDialog').showModal());
  $('calendarMode').addEventListener('change',syncCalendarFields);
  $('timeUnknown').addEventListener('change',()=>{
    $('birthTime').disabled=$('timeUnknown').checked;
    if($('timeUnknown').checked) $('birthTime').value='12:00';
  });
  $('profileForm').addEventListener('submit',(event)=>{
    event.preventDefault();
    setFormError('');
    try{
      const profile=parseProfileForm();
      calculateAll(profile);
      fillProfileForm(profile);
      $('profileDialog').close();
      setRoute('home');
    }catch(error){
      setFormError(error?.message || '입력값을 확인해 주세요.');
    }
  });
  $('fortuneDate').addEventListener('change',()=>state.chart && renderFortuneDate($('fortuneDate').value));
  $('prevDay').addEventListener('click',()=>state.chart && renderFortuneDate(shiftIso(state.fortuneDate,-1)));
  $('nextDay').addEventListener('click',()=>state.chart && renderFortuneDate(shiftIso(state.fortuneDate,1)));
  $('shuffleTarot').addEventListener('click',shuffleTarot);
  globalThis.naesajuShareReport=shareReport;
}

function init(){
  initLocations();
  state.fortuneDate=kstNowParts().iso;
  $('fortuneDate').value=state.fortuneDate;
  bindEvents();
  setRoute('home');
  setFortuneTab('today');
  if(!loadProfile()){
    requestAnimationFrame(openProfile);
  }
}

init();
