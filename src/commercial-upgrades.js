import { calculateSaju, calculateTodayFlow } from './saju-engine.js';

const $=(id)=>document.getElementById(id);
const PROFILE_KEY='naesaju.profiles.v1';
const STREAK_KEY='naesaju.daily-streak.v1';
let latest=null;
let deferredInstall=null;

const ELEMENT_BY_STEM={갑:'목',을:'목',병:'화',정:'화',무:'토',기:'토',경:'금',신:'금',임:'수',계:'수'};
const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};
const DAY_BRANCH_RELATIONS={
  '자-축':'합','인-해':'합','묘-술':'합','진-유':'합','사-신':'합','오-미':'합',
  '자-오':'충','축-미':'충','인-신':'충','묘-유':'충','진-술':'충','사-해':'충',
  '자-미':'해','축-오':'해','인-사':'해','묘-진':'해','신-해':'해','유-술':'해'
};
const DAILY_COPY={
  비겁:['주도권을 잡되 상대의 속도도 확인하세요.','혼자 밀어붙이기보다 한 번 더 의견을 묻는 편이 좋습니다.'],
  식상:['표현과 결과물에 힘이 실리는 날입니다.','아이디어를 작게라도 완성해 밖으로 꺼내보세요.'],
  재성:['돈과 일정처럼 현실적인 기준을 먼저 정리하세요.','작은 지출과 약속을 정확히 관리할수록 흐름이 안정됩니다.'],
  관성:['책임과 약속을 분명히 할수록 일이 정돈됩니다.','완벽함보다 우선순위를 정해 하나씩 끝내세요.'],
  인성:['배우고 정리하고 회복하는 시간이 도움이 됩니다.','성급히 결론내기보다 자료와 생각을 한 번 더 정리하세요.']
};

function readProfiles(){
  try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'[]');}catch{return [];}
}
function writeProfiles(items){
  localStorage.setItem(PROFILE_KEY,JSON.stringify(items.slice(0,8)));
  renderProfileOptions();
}
function formSnapshot(){
  return {
    name:$('name').value.trim(),
    calendar:document.querySelector('input[name="calendar"]:checked')?.value||'solar',
    birthDate:$('birthDate').value,
    birthYear:$('birthYear').value,
    birthMonth:$('birthMonth').value,
    birthDay:$('birthDay').value,
    birthTime:$('birthTime').value,
    gender:$('gender').value,
    isLeap:$('isLeap').checked,
    precision:$('precisionToggle').checked,
    location:$('birthLocation').value,
    dayBoundary:$('dayBoundary').value
  };
}
function renderProfileOptions(){
  const select=$('profileSelect');
  if(!select)return;
  const current=select.value;
  const profiles=readProfiles();
  select.innerHTML='<option value="">새 프로필</option>'+profiles.map((p,i)=>'<option value="'+i+'">'+escapeHtml(p.name||('프로필 '+(i+1)))+' · '+escapeHtml(p.birthDate||p.birthYear+'년')+'</option>').join('');
  if(current!==''&&profiles[Number(current)])select.value=current;
  const del=$('deleteProfile');
  if(del)del.disabled=profiles.length===0||select.value==='';
}
function applyProfile(p){
  if(!p)return;
  $('name').value=p.name||'';
  const radio=document.querySelector('input[name="calendar"][value="'+(p.calendar||'solar')+'"]');
  if(radio){radio.checked=true;radio.dispatchEvent(new Event('change',{bubbles:true}));}
  if(p.birthDate)$('birthDate').value=p.birthDate;
  if(p.birthYear)$('birthYear').value=p.birthYear;
  if(p.birthMonth)$('birthMonth').value=p.birthMonth;
  if(p.birthDay)$('birthDay').value=p.birthDay;
  $('birthTime').value=p.birthTime||'12:00';
  $('gender').value=p.gender||'male';
  $('isLeap').checked=!!p.isLeap;
  $('precisionToggle').checked=p.precision!==false;
  $('birthLocation').value=p.location||'korea';
  $('dayBoundary').value=p.dayBoundary||'midnight';
  ['birthDate','birthYear','birthMonth','birthDay','precisionToggle'].forEach(id=>$(id)?.dispatchEvent(new Event('input',{bubbles:true})));
}
function saveCurrentProfile(){
  const snap=formSnapshot();
  const profiles=readProfiles();
  const select=$('profileSelect');
  const idx=select.value===''?-1:Number(select.value);
  if(idx>=0&&profiles[idx])profiles[idx]=snap;
  else profiles.unshift(snap);
  writeProfiles(profiles);
  select.value=idx>=0?String(idx):'0';
  flashButton($('saveProfile'),'저장됨');
}
function deleteCurrentProfile(){
  const select=$('profileSelect');
  if(select.value==='')return;
  const profiles=readProfiles();
  profiles.splice(Number(select.value),1);
  writeProfiles(profiles);
  select.value='';
}
function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function flashButton(button,text){
  if(!button)return;
  const before=button.textContent;
  button.textContent=text;
  setTimeout(()=>button.textContent=before,1200);
}
function dateParts(value){
  const m=String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return null;
  return {year:Number(m[1]),month:Number(m[2]),day:Number(m[3])};
}
function branchRelation(a,b){return DAY_BRANCH_RELATIONS[a+'-'+b]||DAY_BRANCH_RELATIONS[b+'-'+a]||'';}
function compatibilityText(a,b){
  const ae=ELEMENT_BY_STEM[a.dayMaster],be=ELEMENT_BY_STEM[b.dayMaster];
  const relation=branchRelation(a.pillars.day.earthlyBranch,b.pillars.day.earthlyBranch);
  let strength='서로의 방식을 이해하고 역할을 나눌수록 안정되는 관계입니다.';
  let caution='감정이 올라올 때 결론부터 내리기보다 사실과 감정을 나눠 말하는 편이 좋습니다.';
  if(ae===be)strength='기본적인 판단 기준과 반응 속도가 비슷해 서로를 빠르게 이해하기 쉽습니다.';
  else if(GENERATES[ae]===be||GENERATES[be]===ae)strength='한쪽의 강점이 다른 쪽의 실행이나 회복을 자연스럽게 돕는 상생 흐름이 있습니다.';
  else if(CONTROLS[ae]===be||CONTROLS[be]===ae)caution='주도권과 기준이 충돌하기 쉬워, 중요한 결정은 역할과 경계를 먼저 합의하는 편이 좋습니다.';
  if(relation==='합')strength+=' 일지 사이에는 합 관계가 보여 친밀감과 협력 포인트를 만들기 쉽습니다.';
  if(relation==='충')caution+=' 일지 충이 있어 생활 리듬이나 감정 표현 방식이 강하게 부딪힐 수 있습니다.';
  if(relation==='해')caution+=' 일지 해 관계가 있어 말하지 않은 기대가 서운함으로 쌓이지 않도록 확인 대화가 중요합니다.';
  return {ae,be,relation,strength,caution};
}
function renderCompatibility(event){
  event.preventDefault();
  const box=$('compatibilityResult');
  try{
    if(!latest||!latest.isPersonal)throw new Error('먼저 본인의 출생정보로 사주 리포트를 생성해 주세요.');
    const date=dateParts($('partnerDate').value);
    if(!date)throw new Error('상대 생년월일을 확인해 주세요.');
    const time=($('partnerTime').value||'12:00').split(':').map(Number);
    const partner=calculateSaju({
      calendar:'solar',year:date.year,month:date.month,day:date.day,hour:time[0],minute:time[1],
      gender:$('partnerGender').value,precision:true,location:latest.input.location,dayBoundary:latest.input.dayBoundary
    });
    const read=compatibilityText(latest.chart,partner);
    const who=escapeHtml($('partnerName').value.trim()||'상대');
    box.innerHTML='<div class="compat-summary"><span>두 사람의 관계 구조</span><strong>'+escapeHtml(latest.chart.dayMaster)+'일간 × '+escapeHtml(partner.dayMaster)+'일간</strong><small>'+read.ae+' 기운과 '+read.be+' 기운'+(read.relation?' · 일지 '+read.relation:'')+'</small></div>'+
      '<article><b>잘 맞는 지점</b><p>'+escapeHtml(read.strength)+'</p></article>'+
      '<article><b>조율이 필요한 지점</b><p>'+escapeHtml(read.caution)+'</p></article>'+
      '<article><b>'+who+'님과의 대화 팁</b><p>누가 맞는지를 정하기보다 서로 다르게 반응하는 지점을 먼저 이름 붙이고, 돈·시간·연락·휴식처럼 반복되는 생활 기준을 구체적으로 합의해 보세요.</p></article>'+
      '<small class="compat-note">궁합은 두 원국의 상호작용을 정리한 참고 해석이며 관계의 결과를 단정하지 않습니다.</small>';
  }catch(error){
    box.innerHTML='<p class="inline-error">'+escapeHtml(error.message||'궁합 정보를 확인해 주세요.')+'</p>';
  }
}
function kstDayKey(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const o=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return o.year+'-'+o.month+'-'+o.day;
}
function updateDailyStreak(){
  const today=kstDayKey();
  const yesterday=kstDayKey(new Date(Date.now()-86400000));
  let data={day:'',count:0};
  try{data=JSON.parse(localStorage.getItem(STREAK_KEY)||'{}');}catch{}
  if(data.day!==today){
    data={day:today,count:data.day===yesterday?Math.max(1,Number(data.count)||0)+1:1};
    localStorage.setItem(STREAK_KEY,JSON.stringify(data));
  }
  return Math.max(1,Number(data.count)||1);
}

function addTodayExplorer(detail){
  const panel=$('today');
  if(!panel)return;
  let explorer=$('todayExplorer');
  if(!explorer){
    explorer=document.createElement('div');
    explorer.id='todayExplorer';
    explorer.className='today-explorer';
    panel.append(explorer);
  }
  const streak=updateDailyStreak();
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(Date.now()+i*86400000);
    const flow=calculateTodayFlow(detail.chart,d);
    const copy=DAILY_COPY[flow.group]||DAILY_COPY.인성;
    days.push('<article class="'+(i===0?'is-today':'')+'"><span>'+(i===0?'오늘':new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',weekday:'short',timeZone:'Asia/Seoul'}).format(d))+'</span><strong>'+escapeHtml(flow.tenGod)+'</strong><p>'+escapeHtml(copy[0])+'</p></article>');
  }
  const base=DAILY_COPY[detail.todayFlow.group]||DAILY_COPY.인성;
  const periods=[
    ['아침 06–11','정리','하루의 우선순위를 2~3개로 줄여 시작하세요.'],
    ['낮 11–17','실행',base[0]],
    ['저녁 17–21','관계','말의 속도를 조금 늦추고 상대 반응을 확인하세요.'],
    ['밤 21–24','회복',base[1]]
  ];
  explorer.innerHTML='<div class="today-explorer-head"><div><span class="section-kicker">7 DAY FLOW</span><h3>오늘부터 7일 흐름</h3></div><div class="today-return-meta"><strong>연속 '+streak+'일 확인</strong><p>일진과 원국의 관계를 날짜별로 비교합니다.</p></div></div>'+
    '<div class="seven-day-strip">'+days.join('')+'</div>'+
    '<div class="time-flow-grid">'+periods.map(p=>'<article><span>'+p[0]+'</span><strong>'+p[1]+'</strong><p>'+escapeHtml(p[2])+'</p></article>').join('')+'</div><p class="time-flow-note">시간대별 카드는 당일 흐름을 생활 리듬에 적용한 행동 가이드이며, 시주 단위의 길흉을 단정하지 않습니다.</p>';
}
function addAnnualNavigator(){
  const year=$('year');
  if(!year||year.querySelector('.annual-navigator'))return;
  const nav=document.createElement('div');
  nav.className='annual-navigator';
  nav.innerHTML='<strong>올해 운세 한 번에 보기</strong><div><a href="#yearTitle">핵심</a><a href="#tojungQuarterGrid">분기</a><a href="#annualDetailReport" data-open-report>월별</a><a href="#luck" data-open-report>대운</a></div><p>흩어진 연간 해석을 한 흐름으로 이어 읽을 수 있습니다.</p>';
  year.querySelector('.annual-content')?.prepend(nav);
}
function enhanceTrust(detail){
  const box=$('accuracyBasis');
  if(!box||box.querySelector('.trust-proof'))return;
  const proof=document.createElement('div');
  proof.className='trust-proof';
  proof.innerHTML='<strong>이 리포트의 계산 기준</strong><span>'+escapeHtml(detail.chart.basis.calendarEngine)+'</span><span>'+escapeHtml(detail.chart.basis.location)+' · 진태양시 '+escapeHtml(detail.chart.basis.trueSolarTime)+'</span><span>월운은 양력 1일이 아닌 절입 시각 기준</span>';
  box.prepend(proof);
}
function renderResultHome(detail){
  const box=$('resultHomeCards');
  if(!box)return;
  const overview=detail.report.overview;
  const todayCopy=(DAILY_COPY[detail.todayFlow.group]||DAILY_COPY.인성)[0];
  const yearItem=detail.report.year||detail.report.overview;
  box.innerHTML=
    (!detail.isPersonal?'<div class="demo-report-note">예시 리포트입니다. 위에서 내 출생정보를 입력하면 개인 리포트로 바뀝니다.</div>':'')+
    '<article><span>01 · 나의 핵심</span><strong>'+escapeHtml(overview.title)+'</strong><p>'+escapeHtml(overview.lead)+'</p><a href="#report-overview" data-open-report>핵심 해석 →</a></article>'+
    '<article><span>02 · 오늘</span><strong>'+escapeHtml(detail.todayFlow.tenGod)+' · '+escapeHtml(detail.todayFlow.group)+'</strong><p>'+escapeHtml(todayCopy)+'</p><a href="#today">오늘 흐름 →</a></article>'+
    '<article><span>03 · 올해</span><strong>'+escapeHtml(yearItem.title)+'</strong><p>'+escapeHtml(yearItem.lead)+'</p><a href="#year">연간 흐름 →</a></article>';
}
function questionKey(query){
  const q=String(query||'').toLowerCase();
  if(/돈|재물|수입|지출|투자|금전/.test(q))return 'money';
  if(/연애|사랑|관계|결혼|인연|상대/.test(q))return 'love';
  if(/건강|휴식|회복|피곤|스트레스/.test(q))return 'recovery';
  if(/올해|내년|연운|시기|언제/.test(q))return 'year';
  if(/직업|일|이직|퇴사|커리어|회사|업무/.test(q))return 'career';
  return 'overview';
}
function answerCustomQuestion(){
  const answer=$('sajuAnswer');
  const query=$('sajuQuestionInput')?.value.trim();
  if(!latest||!latest.isPersonal){answer.textContent='먼저 본인의 출생정보로 사주 리포트를 생성해 주세요.';return;}
  if(!query){answer.textContent='궁금한 내용을 한 문장으로 입력해 주세요.';return;}
  const key=questionKey(query);
  const item=latest.report[key]||latest.report.overview;
  const second=item.paragraphs?.[1]||item.paragraphs?.[0]||'';
  answer.innerHTML='<strong>'+escapeHtml(query)+'</strong><p>'+escapeHtml(item.lead)+'</p><p>'+escapeHtml(second)+'</p><small>입력한 질문의 핵심 주제를 현재 사주 리포트에서 찾아 요약한 로컬 답변입니다.</small><br><a href="#report-'+key+'" data-open-report>근거가 된 정밀 해석 읽기 →</a>';
}

function setupQuestions(){
  document.querySelectorAll('[data-saju-question]').forEach(btn=>btn.addEventListener('click',()=>{
    const answer=$('sajuAnswer');
    if(!latest||!latest.isPersonal){answer.textContent='먼저 본인의 출생정보로 사주 리포트를 생성해 주세요.';return;}
    const key=btn.dataset.sajuQuestion;
    const item=latest.report[key]||latest.report.relationships||latest.report.overview;
    answer.innerHTML='<strong>'+escapeHtml(item.title)+'</strong><p>'+escapeHtml(item.lead)+'</p><p>'+escapeHtml(item.paragraphs?.[0]||'')+'</p><a href="#report-'+key+'" data-open-report>정밀 해석 이어보기 →</a>';
  }));
  $('askSaju')?.addEventListener('click',answerCustomQuestion);
  $('sajuQuestionInput')?.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();answerCustomQuestion();}});
}
function wrapCanvasText(ctx,text,maxWidth){
  const words=String(text||'').split(/\s+/);
  const lines=[];let line='';
  for(const word of words){
    const next=line?line+' '+word:word;
    if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);
  return lines;
}
async function makeShareCard(){
  const canvas=document.createElement('canvas');
  canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');
  if(!ctx)return null;
  const grad=ctx.createLinearGradient(0,0,0,1350);
  grad.addColorStop(0,'#071a29');grad.addColorStop(1,'#020b13');
  ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1350);
  ctx.strokeStyle='#d8a75f';ctx.lineWidth=2;ctx.strokeRect(58,58,964,1234);
  ctx.fillStyle='#d8a75f';ctx.font='700 32px serif';ctx.fillText('내사주 · SAJU & TAROT',92,132);
  ctx.fillStyle='#f5efe4';ctx.font='700 58px serif';
  wrapCanvasText(ctx,(latest.name||'당신')+'님의 사주 리포트',860).slice(0,2).forEach((line,i)=>ctx.fillText(line,92,260+i*72));
  ctx.fillStyle='#f0cf8e';ctx.font='700 34px sans-serif';ctx.fillText('오늘의 핵심',92,430);
  ctx.fillStyle='#dfe4e8';ctx.font='400 30px sans-serif';
  wrapCanvasText(ctx,latest.report.overview?.lead||'',860).slice(0,5).forEach((line,i)=>ctx.fillText(line,92,490+i*48));
  ctx.fillStyle='#f0cf8e';ctx.font='700 30px sans-serif';ctx.fillText('올해의 흐름',92,790);
  ctx.fillStyle='#c8d2dc';ctx.font='400 28px sans-serif';
  const yearItem=latest.report.year||latest.report.overview;
  wrapCanvasText(ctx,yearItem.lead||'',860).slice(0,4).forEach((line,i)=>ctx.fillText(line,92,846+i*45));
  ctx.fillStyle='#8494a3';ctx.font='400 24px sans-serif';ctx.fillText('계산은 브라우저에서 수행 · 자기이해를 위한 참고 리포트',92,1220);
  ctx.fillStyle='#d8a75f';ctx.font='700 26px sans-serif';ctx.fillText('NAESAJU',92,1268);
  return await new Promise((resolve)=>canvas.toBlob(resolve,'image/png',.92));
}
async function shareReport(){
  if(!latest||!latest.isPersonal){flashButton($('shareReport'),'내 정보로 먼저 생성');return;}
  const text='내사주 · '+latest.name+'님의 리포트\n'+(latest.report.overview?.lead||'')+'\n'+location.href.split('#')[0];
  try{
    const blob=await makeShareCard();
    const file=blob&&typeof File!=='undefined'?new File([blob],'naesaju-report.png',{type:'image/png'}):null;
    if(file&&navigator.canShare?.({files:[file]})&&navigator.share){
      await navigator.share({title:'내사주 리포트',text,files:[file]});
    }else if(navigator.share){
      await navigator.share({title:'내사주 리포트',text,url:location.href.split('#')[0]});
    }else{
      await navigator.clipboard.writeText(text);flashButton($('shareReport'),'복사됨');
    }
  }catch(error){if(error?.name!=='AbortError')flashButton($('shareReport'),'공유 실패');}
}
function setupReportLinks(){
  document.addEventListener('click',(event)=>{
    const link=event.target.closest?.('[data-open-report]');
    if(!link)return;
    const report=$('full-report');
    if(report)report.open=true;
  });
}
function setupMobileSpy(){
  const links=[...document.querySelectorAll('.mobile-bottom-nav a')];
  const targets=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(!('IntersectionObserver'in window))return;
  const ob=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    links.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+visible.target.id));
  },{rootMargin:'-20% 0px -65%',threshold:[0,.1,.3]});
  targets.forEach(t=>ob.observe(t));
}
function setupInstall(){
  window.addEventListener('beforeinstallprompt',(event)=>{
    event.preventDefault();
    deferredInstall=event;
    $('installApp').hidden=false;
  });
  $('installApp')?.addEventListener('click',async()=>{
    if(!deferredInstall)return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall=null;
    $('installApp').hidden=true;
  });
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
}
function repositionMbti(){
  const meta=document.querySelector('.report-mini-meta');
  const expert=$('expert');
  if(meta&&expert&&!expert.querySelector('.report-mini-meta'))expert.querySelector('header')?.append(meta);
}

$('saveProfile')?.addEventListener('click',saveCurrentProfile);
$('deleteProfile')?.addEventListener('click',deleteCurrentProfile);
$('profileSelect')?.addEventListener('change',()=>{
  const value=$('profileSelect').value;
  const del=$('deleteProfile');
  if(del)del.disabled=value==='';
  if(value==='')return;
  applyProfile(readProfiles()[Number(value)]);
});
$('compatibilityForm')?.addEventListener('submit',renderCompatibility);
$('shareReport')?.addEventListener('click',shareReport);
$('resultShare')?.addEventListener('click',shareReport);
renderProfileOptions();
setupQuestions();
setupReportLinks();
setupMobileSpy();
setupInstall();
addAnnualNavigator();

document.addEventListener('saju:rendered',(event)=>{
  latest={...event.detail,isPersonal:$('results')?.dataset.mode==='personal'};
  $('resultHome')?.classList.toggle('is-demo',!latest.isPersonal);
  renderResultHome(latest);
  addTodayExplorer(latest);
  enhanceTrust(latest);
  repositionMbti();
});
