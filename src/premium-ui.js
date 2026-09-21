import {
  calculateSaju,
  calculateYearFlows,
  calculateMonthFlows,
  calculateTodayFlow,
  calculateTodayTimeFlows
} from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { buildDetailedInterpretation } from './interpretation.js';
import { prepareTarotFan, interpretSpread } from './tarot.js';
import { calculateDailyScores } from './daily-score.js';
import { buildPlainChartGuide } from './plain-chart.js';
import { ROLE_LABELS, ELEMENT_LABELS, stemByName, branchByName } from './data.js';
import { buildLuckNarrativeCopy } from './luck-copy.js';
import { solarToLunar, lunarToSolar, isLeapMonth } from './calendar.js';
import { monthFlowCopy, quarterFlowCopy } from './flow-copy.js';

const $ = (id) => document.getElementById(id);
const form = $('birthForm');
const results = $('results');
const errorBox = $('formError');
let currentReport = null;
let currentChart = null;
let currentDisplayName = '당신';
let dailyOffset = 0;
let calendarUiMode = form.elements.calendar.value;
const PROFILE_STORAGE_KEY='naesaju.profiles.v1';

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

const ROLE_BY_ELEMENT = {
  목:{목:'비겁',화:'식상',토:'재성',금:'관성',수:'인성'},
  화:{화:'비겁',토:'식상',금:'재성',수:'관성',목:'인성'},
  토:{토:'비겁',금:'식상',수:'재성',목:'관성',화:'인성'},
  금:{금:'비겁',수:'식상',목:'재성',화:'관성',토:'인성'},
  수:{수:'비겁',목:'식상',화:'재성',토:'관성',금:'인성'}
};

function selectedCalendar(){ return form.elements.calendar.value; }
function currentKstYear(){ return Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date())); }
function currentKstDate(date=new Date()){ return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'short'}).format(date); }
function kstIsoDate(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const value=Object.fromEntries(parts.map((part)=>[part.type,part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
function dailyDate(offset=dailyOffset){ const date=new Date(); date.setUTCDate(date.getUTCDate()+offset); return date; }
function syncFortuneDate(){ const field=$('fortuneDate'); if(field) field.value=kstIsoDate(dailyDate()); }
function setDailyOffsetFromIso(value){
  const match=value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match) return false;
  const today=kstIsoDate(new Date()).split('-').map(Number);
  const target=match.slice(1).map(Number);
  const baseUtc=Date.UTC(today[0],today[1]-1,today[2]);
  const targetUtc=Date.UTC(target[0],target[1]-1,target[2]);
  dailyOffset=Math.round((targetUtc-baseUtc)/86400000);
  return true;
}
function sorted(object){ return Object.entries(object).sort((a,b)=>b[1]-a[1]); }
function dominantElement(chart){ return sorted(chart.elements)[0]?.[0] || '토'; }
function dominantRole(chart){ return sorted(chart.roles)[0]?.[0] || '인성'; }
function relationLabel(relations){ return relations?.length ? [...new Set(relations.map((r)=>r.type))].join('·') : '큰 충돌 신호 없음'; }
function escapeHtml(value=''){ return value.replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function firstSentence(value=''){ return value.split(/(?<=[.!?])\s+/)[0] || value; }

const YEAR_HEADLINE={
  비겁:'내 기준을 세우는 해',식상:'아이디어를 결과로 잇는 해',재성:'돈과 시간을 정리하는 해',
  관성:'책임의 경계를 분명히 할 해',인성:'배움과 회복을 쌓는 해'
};

function inputError(fieldId,message){
  const error=new RangeError(message);
  error.fieldId=fieldId;
  throw error;
}

function integerInput(fieldId,label,min,max){
  const field=$(fieldId);
  const raw=field.value.trim();
  if(!raw) inputError(fieldId,`${label}을 입력해 주세요.`);
  const value=Number(raw);
  if(!Number.isInteger(value) || value<min || value>max){
    inputError(fieldId,`${label}은 ${min}~${max} 범위로 입력해 주세요.`);
  }
  return value;
}

function solarDateInput(){
  const field=$('birthDate');
  const match=field.value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match) inputError('birthDate','양력 생년월일을 달력에서 선택해 주세요.');
  const [,yearText,monthText,dayText]=match;
  const year=Number(yearText),month=Number(monthText),day=Number(dayText);
  const date=new Date(Date.UTC(year,month-1,day));
  if(year<1900 || year>2100 || date.getUTCFullYear()!==year || date.getUTCMonth()!==month-1 || date.getUTCDate()!==day){
    inputError('birthDate','1900년부터 2100년 사이의 올바른 생년월일을 선택해 주세요.');
  }
  return {year,month,day};
}

function syncQuickYearFromActive(){
  const quick=$('birthYearQuick');
  if(!quick) return;
  if(calendarUiMode==='solar'){
    const match=$('birthDate').value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(match) quick.value=match[1];
    return;
  }
  const year=$('birthYear').value.trim();
  if(year) quick.value=year;
}

function applyQuickYear(rawYear){
  const year=Number(rawYear);
  if(!Number.isInteger(year) || year<1900 || year>2100){
    inputError('birthYearQuick','출생연도는 1900~2100 사이의 4자리 숫자로 입력해 주세요.');
  }

  if(calendarUiMode==='solar'){
    const field=$('birthDate');
    const match=field.value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const month=match?Number(match[2]):1;
    const day=match?Number(match[3]):1;
    const maxDay=new Date(Date.UTC(year,month,0)).getUTCDate();
    const safeDay=Math.min(day,maxDay);
    field.value=`${year}-${String(month).padStart(2,'0')}-${String(safeDay).padStart(2,'0')}`;
  }else{
    $('birthYear').value=String(year);
    syncLeapAvailability();
  }
  $('birthYearQuick').value=String(year);
}

function commitQuickYear(){
  try{
    applyQuickYear($('birthYearQuick').value.trim());
    $('birthYearQuick').removeAttribute('aria-invalid');
    $('birthYearQuick').removeAttribute('aria-errormessage');
    errorBox.textContent='';
  }catch(error){
    errorBox.textContent=error?.message||'출생연도를 다시 확인해 주세요.';
    const field=$('birthYearQuick');
    field.setAttribute('aria-invalid','true');
    field.setAttribute('aria-errormessage','formError');
    field.focus();
  }
}

function collectInput(){
  const calendar=selectedCalendar();
  const solar=calendar==='solar' ? solarDateInput() : null;
  const year=solar?.year ?? integerInput('birthYear','출생연도',1900,2100);
  const month=solar?.month ?? integerInput('birthMonth','출생월',1,12);
  const day=solar?.day ?? integerInput('birthDay','출생일',1,30);
  const isLeap=calendar==='lunar' && $('isLeap').checked;

  if(calendar==='lunar'){
    if(isLeap && !isLeapMonth(year,month)){
      inputError('isLeap',`${year}년 음력 ${month}월에는 윤달이 없습니다.`);
    }
    try{
      lunarToSolar(year,month,day,isLeap);
    }catch(error){
      inputError(isLeap?'isLeap':'birthDay',error?.message?.includes('윤달')?error.message:'존재하지 않는 음력 생년월일입니다. 날짜를 다시 확인해 주세요.');
    }
  }

  const time=$('birthTime').value.trim();
  if(!/^\d{2}:\d{2}$/.test(time)) inputError('birthTime','출생시간을 입력해 주세요.');
  const [hour,minute]=time.split(':').map(Number);
  if(!Number.isInteger(hour) || hour<0 || hour>23 || !Number.isInteger(minute) || minute<0 || minute>59){
    inputError('birthTime','출생시간은 00:00~23:59 범위로 입력해 주세요.');
  }

  return {
    calendar,year,month,day,hour,minute,
    gender:$('gender').value,
    isLeap,
    precision:$('precisionToggle').checked,
    location:$('birthLocation').value,
    dayBoundary:$('dayBoundary').value
  };
}

function setCalendarRadio(value){
  const radio=form.querySelector(`input[name="calendar"][value="${value}"]`);
  if(radio) radio.checked=true;
}

function syncLeapAvailability(){
  const checkbox=$('isLeap');
  const hint=$('leapHint');
  const year=Number($('birthYear').value);
  const month=Number($('birthMonth').value);
  const available=calendarUiMode==='lunar' && Number.isInteger(year) && year>=1900 && year<=2100 && Number.isInteger(month) && month>=1 && month<=12 && isLeapMonth(year,month);
  checkbox.disabled=!available;
  if(!available) checkbox.checked=false;
  if(hint) hint.textContent=available?'윤달로 입력':'이 달은 윤달 없음';
}

function applyCalendarUi(mode){
  const lunar=mode==='lunar';
  const dateField=document.querySelector('.birth-date-field');
  dateField?.classList.toggle('is-lunar',lunar);
  $('leapField').classList.toggle('active',lunar);
  $('birthDay').max='30';
  syncLeapAvailability();
  syncQuickYearFromActive();
}

function syncCalendarUi(){
  const targetMode=selectedCalendar();
  if(targetMode===calendarUiMode){
    applyCalendarUi(targetMode);
    return;
  }

  try{
    if(targetMode==='lunar'){
      const lunar=solarToLunar(solarDateInput());
      if(lunar.year<1900 || lunar.year>2100){
        inputError('birthDate','음력 전환은 1900년 1월 31일 이후 날짜부터 지원합니다.');
      }
      $('birthYear').value=String(lunar.year);
      $('birthMonth').value=String(lunar.month);
      $('birthDay').value=String(lunar.day);
      $('isLeap').checked=lunar.isLeap;
    }else{
      const year=integerInput('birthYear','출생연도',1900,2100);
      const month=integerInput('birthMonth','출생월',1,12);
      const day=integerInput('birthDay','출생일',1,30);
      const isLeap=$('isLeap').checked;
      if(isLeap && !isLeapMonth(year,month)){
        inputError('isLeap',`${year}년 음력 ${month}월에는 윤달이 없습니다.`);
      }
      const solar=lunarToSolar(year,month,day,isLeap);
      $('birthDate').value=`${solar.year}-${String(solar.month).padStart(2,'0')}-${String(solar.day).padStart(2,'0')}`;
    }

    calendarUiMode=targetMode;
    applyCalendarUi(calendarUiMode);
    errorBox.textContent='';
  }catch(error){
    setCalendarRadio(calendarUiMode);
    applyCalendarUi(calendarUiMode);
    errorBox.textContent=error?.message||'달력 전환을 위해 생년월일을 다시 확인해 주세요.';
    const fallbackId=calendarUiMode==='solar'?'birthDate':'birthDay';
    const field=$(error?.fieldId||fallbackId);
    if(field){
      field.setAttribute('aria-invalid','true');
      field.setAttribute('aria-errormessage','formError');
      field.focus();
    }
  }
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

function safeProfiles(){
  try{
    const parsed=JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)||'[]');
    return Array.isArray(parsed)?parsed.slice(0,5):[];
  }catch{ return []; }
}

function writeProfiles(profiles){
  try{ localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(profiles.slice(0,5))); return true; }
  catch{ return false; }
}

function captureProfile(){
  return {
    id:String(Date.now()),
    label:$('name').value.trim()||$('birthDate').value||'내 사주',
    name:$('name').value,
    calendar:selectedCalendar(),
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

function renderProfileSelect(selectedId=''){
  const select=$('profileSelect');
  if(!select) return;
  const profiles=safeProfiles();
  const options=profiles.map((p)=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.label)}</option>`).join('');
  select.innerHTML='<option value="">현재 입력</option>'+options;
  select.value=profiles.some((p)=>p.id===selectedId)?selectedId:'';
  $('deleteProfile').disabled=!select.value;
  const partnerSelect=$('partnerProfileSelect');
  if(partnerSelect){
    const previous=partnerSelect.value;
    partnerSelect.innerHTML='<option value="">직접 입력</option>'+options;
    if(profiles.some((p)=>p.id===previous)) partnerSelect.value=previous;
  }
}

function loadProfile(id){
  const profile=safeProfiles().find((item)=>item.id===id);
  if(!profile) return;
  $('name').value=profile.name||'';
  $('birthDate').value=profile.birthDate||'1990-01-01';
  $('birthYear').value=profile.birthYear||String(Number(profile.birthDate?.slice(0,4))||1990);
  $('birthMonth').value=profile.birthMonth||'1';
  $('birthDay').value=profile.birthDay||'1';
  $('birthTime').value=profile.birthTime||'12:00';
  $('gender').value=profile.gender||'male';
  $('isLeap').checked=!!profile.isLeap;
  $('precisionToggle').checked=profile.precision!==false;
  $('birthLocation').value=profile.location||'korea';
  $('dayBoundary').value=profile.dayBoundary||'midnight';
  setCalendarRadio(profile.calendar||'solar');
  calendarUiMode=profile.calendar||'solar';
  applyCalendarUi(calendarUiMode);
  syncPrecisionUi();
  syncQuickYearFromActive();
  dailyOffset=0;
  renderAll();
}

function loadPartnerProfile(id){
  const profile=safeProfiles().find((item)=>item.id===id);
  if(!profile) return;
  let date=profile.birthDate||'1990-01-01';
  if(profile.calendar==='lunar'){
    try{
      const solar=lunarToSolar(Number(profile.birthYear),Number(profile.birthMonth),Number(profile.birthDay),Boolean(profile.isLeap));
      date=`${solar.year}-${String(solar.month).padStart(2,'0')}-${String(solar.day).padStart(2,'0')}`;
    }catch{}
  }
  $('partnerName').value=profile.name||profile.label||'';
  $('partnerDate').value=date;
  $('partnerTime').value=profile.birthTime||'12:00';
  $('partnerGender').value=profile.gender||'female';
}

function saveCurrentProfile(){
  const status=$('profileStatus');
  const profile=captureProfile();
  let profiles=safeProfiles();
  const signature=`${profile.calendar}|${profile.birthDate}|${profile.birthYear}|${profile.birthMonth}|${profile.birthDay}|${profile.birthTime}|${profile.name}`;
  const existing=profiles.findIndex((p)=>`${p.calendar}|${p.birthDate}|${p.birthYear}|${p.birthMonth}|${p.birthDay}|${p.birthTime}|${p.name}`===signature);
  if(existing>=0){
    profile.id=profiles[existing].id;
    profiles[existing]=profile;
  }else{
    profiles=[profile,...profiles].slice(0,5);
  }
  if(writeProfiles(profiles)){
    renderProfileSelect(profile.id);
    status.textContent='이 기기에 프로필을 저장했습니다. 서버로 전송되지 않습니다.';
  }else status.textContent='브라우저 저장소를 사용할 수 없어 저장하지 못했습니다.';
}

function deleteSelectedProfile(){
  const select=$('profileSelect');
  const id=select?.value;
  if(!id) return;
  const profiles=safeProfiles().filter((p)=>p.id!==id);
  writeProfiles(profiles);
  renderProfileSelect('');
  $('profileStatus').textContent='저장된 프로필을 삭제했습니다.';
}

function reportShareText(){
  const overview=currentReport?.overview;
  const headline=overview?.lead||'내 사주 리포트';
  return `내사주 · ${currentDisplayName}의 리포트\n${headline}\n\n사주와 타로는 자기이해를 위한 참고 정보입니다.`;
}

function nativeBridge(){
  const bridge=globalThis.NaesajuNative;
  return bridge && typeof bridge.platform==='function' ? bridge : null;
}

async function copyText(text){
  const bridge=nativeBridge();
  if(bridge && typeof bridge.copyText==='function'){ bridge.copyText(text); return; }
  if(navigator.clipboard?.writeText){ await navigator.clipboard.writeText(text); return; }
  const area=document.createElement('textarea'); area.value=text; document.body.append(area); area.select(); document.execCommand('copy'); area.remove();
}

async function shareReport(){
  const text=reportShareText();
  const status=$('shareStatus');
  try{
    const bridge=nativeBridge();
    if(bridge && typeof bridge.shareText==='function'){
      bridge.shareText('내사주 리포트',text);
      status.textContent='공유 창을 열었습니다.';
    }else if(navigator.share) await navigator.share({title:'내사주 리포트',text});
    else{ await copyText(text); status.textContent='공유용 요약을 클립보드에 복사했습니다.'; }
  }catch(error){
    if(error?.name!=='AbortError') status.textContent='공유하지 못했습니다. 요약 복사를 이용해 주세요.';
  }
}

async function copyReportSummary(){
  try{ await copyText(reportShareText()); $('shareStatus').textContent='리포트 요약을 복사했습니다.'; }
  catch{ $('shareStatus').textContent='복사하지 못했습니다.'; }
}

const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'};
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};

function compatibilityElementCopy(a,b){
  if(a===b) return {title:'비슷한 속도의 공감',body:`${ELEMENT_LABELS[a].label} 기운을 함께 써서 판단 속도와 중요하게 보는 기준이 비슷할 수 있습니다. 다만 둘 다 같은 방식으로 밀어붙일 때는 다른 관점을 의식적으로 확인하는 것이 좋습니다.`};
  if(GENERATES[a]===b || GENERATES[b]===a) return {title:'서로 이어주는 보완',body:`${ELEMENT_LABELS[a].label}과 ${ELEMENT_LABELS[b].label}은 생의 흐름으로 이어지는 조합입니다. 한 사람이 시작한 것을 다른 사람이 확장하거나 현실화하는 방식으로 장점이 연결되기 쉽습니다.`};
  if(CONTROLS[a]===b || CONTROLS[b]===a) return {title:'긴장 속에서 기준을 만드는 관계',body:`${ELEMENT_LABELS[a].label}과 ${ELEMENT_LABELS[b].label}은 서로 제어하는 관계가 생길 수 있습니다. 잘 쓰면 균형과 현실 점검이 되지만, 상대를 바꾸려는 방식으로 사용하면 피로가 커질 수 있습니다.`};
  return {title:'서로 다른 자원을 나누는 관계',body:`${ELEMENT_LABELS[a].label}과 ${ELEMENT_LABELS[b].label}의 강점이 다르므로 역할을 나누면 폭이 넓어질 수 있습니다. 갈등이 생길 때는 결론보다 판단 과정의 차이를 먼저 설명하는 편이 좋습니다.`};
}

function renderCompatibility(){
  const target=$('compatibilityResult');
  if(!currentChart){
    target.innerHTML='<div class="compatibility-empty"><strong>먼저 내 사주 리포트를 만들어 주세요.</strong><p>기준이 되는 내 원국이 있어야 상대와의 관계 패턴을 비교할 수 있습니다.</p></div>';
    return;
  }
  const date=$('partnerDate').value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const time=$('partnerTime').value.match(/^(\d{2}):(\d{2})$/);
  if(!date || !time){ target.innerHTML='<div class="compatibility-empty"><strong>상대의 생년월일과 시간을 확인해 주세요.</strong></div>'; return; }
  try{
    const partner=calculateSaju({
      calendar:'solar',year:Number(date[1]),month:Number(date[2]),day:Number(date[3]),
      hour:Number(time[1]),minute:Number(time[2]),gender:$('partnerGender').value,isLeap:false,
      precision:$('precisionToggle').checked,location:$('birthLocation').value,dayBoundary:$('dayBoundary').value
    });
    const mineElement=dominantElement(currentChart), partnerElement=dominantElement(partner);
    const mineRole=dominantRole(currentChart), partnerRole=dominantRole(partner);
    const element=compatibilityElementCopy(mineElement,partnerElement);
    const sameRole=mineRole===partnerRole;
    const roleTitle=sameRole?'생활에서 중요하게 보는 기준이 비슷합니다':'관계 안에서 맡는 역할이 자연스럽게 나뉠 수 있습니다';
    const roleBody=sameRole
      ? `두 사람 모두 ${ROLE_LABELS[mineRole]} 성향이 중심이라 서로의 선택을 빠르게 이해할 수 있습니다. 반대로 같은 약점을 동시에 보일 수 있으므로 한쪽이 의식적으로 다른 역할을 맡는 것이 도움이 됩니다.`
      : `나는 ${ROLE_LABELS[mineRole]}, 상대는 ${ROLE_LABELS[partnerRole]} 성향이 중심입니다. 서로의 방식이 다르다는 점을 전제로 역할과 기대를 말로 확인하면 차이가 보완으로 작동하기 쉽습니다.`;
    const myStem=stemByName(currentChart.dayMaster), partnerStem=stemByName(partner.dayMaster);
    const partnerName=$('partnerName').value.trim()||'상대';
    target.innerHTML=`<div class="compatibility-result-head"><div><span>RELATIONSHIP MAP</span><h3>${escapeHtml(currentDisplayName)} × ${escapeHtml(partnerName)}</h3></div><div class="compatibility-tags"><span>${escapeHtml(currentChart.dayMaster)} 일간</span><span>${escapeHtml(partner.dayMaster)} 일간</span></div></div>
      <div class="compatibility-grid">
        <article class="compatibility-card"><strong>${escapeHtml(element.title)}</strong><p>${escapeHtml(element.body)}</p></article>
        <article class="compatibility-card"><strong>${escapeHtml(roleTitle)}</strong><p>${escapeHtml(roleBody)}</p></article>
        <article class="compatibility-card"><strong>감정 표현의 결</strong><p>${escapeHtml(myStem.yinYang)} 성향의 나와 ${escapeHtml(partnerStem.yinYang)} 성향의 상대는 감정을 드러내는 속도가 다를 수 있습니다. 마음을 추측하기보다 필요한 반응과 시간을 구체적으로 말하는 방식이 관계 안정에 유리합니다.</p></article>
        <article class="compatibility-card"><strong>관계를 오래 쓰는 방법</strong><p>궁합을 좋고 나쁜 점수로 고정하지 않고 반복되는 상호작용을 살피는 것이 핵심입니다. 서로 편한 역할만 맡지 말고 중요한 결정에서는 상대의 판단 근거를 한 번 더 확인하세요.</p></article>
      </div>
      <p class="compatibility-note">※ 두 원국의 오행·십성·일간 관계를 비교한 참고 해석이며 관계의 미래나 감정을 확정하지 않습니다.</p>`;
  }catch(error){
    target.innerHTML=`<div class="compatibility-empty"><strong>궁합 계산을 완료하지 못했습니다.</strong><p>${escapeHtml(error?.message||'입력값을 다시 확인해 주세요.')}</p></div>`;
  }
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
  renderAccuracyBasis(chart);
}

function renderDetailedReport(report){
  const ordered=['overview','temperament','innerOuter','strengths','balance','career','money','love','relationships','recovery','year','luck','technical'];
  $('detailedReport').innerHTML=ordered.map((key,index)=>{
    const item=report[key];
    const open=index===0?' open':'';
    const labels=['핵심','살펴볼 점','실천'];
    const quick=(item.quick?.length?item.quick:item.paragraphs.map(firstSentence).slice(0,3));
    return `<article id="report-${key}" class="detail-chapter detail-chapter-${String(index+1).padStart(2,'0')}" data-report-key="${key}">
      <details class="detail-disclosure"${open}>
        <summary>
          <span>${String(index+1).padStart(2,'0')}</span>
          <div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.lead)}</p></div>
          <b class="detail-toggle" aria-hidden="true">+</b>
        </summary>
        <div class="detail-chapter-body">
          <p class="chapter-takeaway"><mark>${escapeHtml(item.lead)}</mark></p>
          <div class="easy-reading-label"><span>먼저 이것만 보세요</span><small>쉬운 해설</small></div>
          <ul class="chapter-quick-list">${quick.map((p,i)=>`<li><strong>${labels[i]||'근거'}</strong><span>${escapeHtml(p)}</span></li>`).join('')}</ul>
          <details class="chapter-full-analysis"><summary>왜 이렇게 해석했는지 자세히 보기</summary>${item.paragraphs.map((p)=>`<p>${escapeHtml(p)}</p>`).join('')}</details>
        </div>
      </details>
    </article>`;
  }).join('');
}

function renderKeywordInsight(report,key='temperament'){
  const item=report?.[key] || report?.temperament;
  const panel=$('keywordInsight');
  if(!item || !panel) return;
  document.querySelectorAll('.visual-keyword-card[data-report-key]').forEach((button)=>{
    const active=button.dataset.reportKey===key;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',active?'true':'false');
  });
  panel.dataset.reportKey=key;
  const easy=item.quick?.[0] || firstSentence(item.paragraphs[0]);
  panel.innerHTML=`<div><span class="section-kicker">SELECTED INSIGHT</span><h3>${escapeHtml(item.title)}</h3></div><p><mark>${escapeHtml(item.lead)}</mark><br>${escapeHtml(easy)}</p><a href="#report-${key}">정밀 해설 이어 읽기 <span aria-hidden="true">→</span></a>`;
}

function setupKeywordCards(){
  document.querySelectorAll('.visual-keyword-card[data-report-key]').forEach((button)=>{
    button.addEventListener('click',()=>{
      if(!currentReport) return;
      renderKeywordInsight(currentReport,button.dataset.reportKey);
      const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(()=>$('keywordInsight')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'}));
    });
  });
}

function renderToday(chart,todayFlow){
  const copy=GROUP_COPY[todayFlow.group];
  const scores=calculateDailyScores(chart,todayFlow);
  const flowDate=new Date(Date.UTC(todayFlow.date.year,todayFlow.date.month-1,todayFlow.date.day,3));
  $('todayDate').textContent=currentKstDate(flowDate);
  $('todayHeadline').textContent=`“${copy.summary}”`;
  $('todayQuoteTitle').textContent=copy.summary;
  $('todayQuoteBody').textContent=`${copy.opportunity}에 힘을 싣고, ${copy.caution}은 한 번 더 점검하세요.`;

  const overall=scores.overall;
  $('dailyPrimary').innerHTML=`<div class="daily-primary-score" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${overall.score}" aria-label="오늘의 종합 운세">
    <svg class="daily-score-svg" viewBox="0 0 220 220" aria-hidden="true" focusable="false">
      <circle class="daily-score-track" cx="110" cy="110" r="92" pathLength="100" />
      <circle class="daily-score-progress" cx="110" cy="110" r="92" pathLength="100" stroke-dasharray="${overall.score} ${100-overall.score}" />
    </svg>
    <span class="section-kicker">TODAY'S INDEX</span><strong>${overall.score}</strong><small>/100 · ${overall.label}</small>
  </div>`;

  const metrics=[
    ['money','02','재물',copy.money,'icon-coin'],
    ['love','03','연애',copy.love,'icon-heart'],
    ['work','04','직업',copy.work,'icon-briefcase'],
    ['condition','05','건강',copy.health,'icon-health'],
    ['study','06','학업',copy.summary,'icon-chart']
  ];
  $('dailyMetrics').innerHTML=metrics.map(([key,index,title,body,icon])=>{
    const flow=scores[key];
    return `<article class="metric-row"><span class="daily-index" aria-hidden="true">${index}</span><div class="metric-name"><svg class="ui-icon metric-icon" aria-hidden="true"><use href="#${icon}"/></svg><div><strong class="metric-label">${title}</strong><div class="metric-score">${flow.score}<small>/100</small></div></div></div><div class="metric-copy"><div class="metric-track" role="img" aria-label="${title} 오늘의 흐름 지수 ${flow.score}점 · ${flow.label}"><span style="width:${flow.score}%"></span></div></div></article>`;
  }).join('');

  $('dailyActionGuide').innerHTML=[
    ['힘을 쓸 곳',copy.opportunity],
    ['속도를 낮출 때',copy.caution],
    ['회복 포인트',copy.health]
  ].map(([title,body],index)=>`<article><span>0${index+1}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></article>`).join('');

  const trendOffsets=[-2,-1,0,1,2];
  const trendLabels=['그제','어제','선택일','내일','모레'];
  const trend=trendOffsets.map((extra,index)=>{
    const date=dailyDate();
    date.setUTCDate(date.getUTCDate()+extra);
    const flow=calculateTodayFlow(chart,date);
    const dayScore=calculateDailyScores(chart,flow).overall;
    return {index,label:trendLabels[index],date,flow,score:dayScore.score,grade:dayScore.label};
  });
  const trendMin=Math.min(...trend.map((item)=>item.score));
  const trendMax=Math.max(...trend.map((item)=>item.score));
  const trendSpan=Math.max(12,trendMax-trendMin);
  $('dailyTrend').innerHTML=trend.map((item,index)=>{
    const height=34+Math.round(((item.score-trendMin)/trendSpan)*56);
    const selected=index===2;
    const dateLabel=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric'}).format(item.date);
    return `<article class="daily-trend-item${selected?' is-selected':''}">
      <div class="daily-trend-bar" style="--trend-height:${height}px" aria-hidden="true"><i></i></div>
      <strong>${item.score}</strong><span>${escapeHtml(item.label)}</span><small>${escapeHtml(dateLabel)} · ${escapeHtml(item.grade)}</small>
    </article>`;
  }).join('');

  const timeFlows=calculateTodayTimeFlows(chart,dailyDate());
  $('dailyTimeFlow').innerHTML=timeFlows.map((slot)=>{
    const slotCopy=GROUP_COPY[slot.group]||GROUP_COPY.인성;
    const signal=slot.relations?.length?` · ${relationLabel(slot.relations)}`:'';
    return `<article><span>${escapeHtml(slot.label)}</span><small>${escapeHtml(slot.range)}</small><strong>${escapeHtml(slot.tenGod)} · ${escapeHtml(slotCopy.label)}</strong><p>${escapeHtml(slotCopy.summary)}${escapeHtml(signal)}</p></article>`;
  }).join('');
  syncFortuneDate();
}

function renderYear(yearFlow,monthFlows){
  const copy=GROUP_COPY[yearFlow.group];
  $('yearTitle').textContent=`${yearFlow.year} · ${yearFlow.tenGod}의 해`;
  $('annualQuote').textContent=YEAR_HEADLINE[yearFlow.group];
  $('yearSummary').innerHTML=`<strong>기회</strong> ${escapeHtml(copy.work)}`;
  $('annualGuide').innerHTML=`<strong>주의</strong> ${escapeHtml(copy.caution)}이 보이면 잠시 속도를 낮춰 보세요.`;
  $('yearDeepDive').innerHTML=`<article class="year-essay"><span class="micro">YEAR IN DEPTH</span><h3>올해, 무엇을 살펴볼까요?</h3><div class="year-essay-points"><p><strong>중심</strong> <mark>${escapeHtml(YEAR_HEADLINE[yearFlow.group])}</mark></p><p><strong>생활에 적용</strong> ${escapeHtml(copy.work)}</p><p><strong>계산 근거</strong> ${yearFlow.year}년 ${escapeHtml(yearFlow.korean)} · ${escapeHtml(yearFlow.tenGod)}. 원국과의 관계는 ${escapeHtml(relationLabel(yearFlow.relations))}입니다.</p></div></article>`;
  const firstMonthFor=(groups)=>monthFlows.find((flow)=>groups.includes(flow.group));
  const monthBasis=(flow)=>flow?`${kstMonthNumber(flow.start)}월 ${flow.tenGod} 월운 · ${flow.korean}`:`${yearFlow.tenGod} 세운 · ${yearFlow.korean}`;
  const advice=[
    ['올해의 기회',copy.opportunity,`${yearFlow.tenGod} 세운 · ${yearFlow.korean}`],
    ['주의할 패턴',copy.caution,`원국 관계 · ${relationLabel(yearFlow.relations)}`],
    ['돈의 포인트',copy.money,monthBasis(firstMonthFor(['재성']))],
    ['관계의 포인트',copy.love,monthBasis(firstMonthFor(['비겁','관성']))]
  ];
  $('yearAdviceGrid').innerHTML=advice.map(([title,body,basis])=>`<article class="advice-card"><span>${escapeHtml(title)}</span><p>${escapeHtml(body)}</p><small>계산 참고 · ${escapeHtml(basis)}</small></article>`).join('');
  const quarterStarts=[0,3,6,9];
  $('tojungQuarterGrid').innerHTML=quarterStarts.map((start,index)=>{
    const slice=monthFlows.slice(start,start+3);
    const narrative=quarterFlowCopy(slice);
    const from=kstMonthNumber(slice[0].start), to=kstMonthNumber(slice.at(-1).start);
    return `<article class="quarter-card"><span>${String(index+1).padStart(2,'0')}</span><div><h3>${from}월~${to}월 · 절기 기준</h3><div class="quarter-steps">${narrative.steps.map((step,offset)=>`<span>${kstMonthNumber(slice[offset].start)}월 ${escapeHtml(step.tenGod)}</span>`).join('')}</div><p><strong>시작</strong> ${escapeHtml(narrative.summary)}</p><p><strong>마무리</strong> ${escapeHtml(narrative.action)}</p></div></article>`;
  }).join('');
  $('monthForecast').innerHTML=monthFlows.map((item)=>{const c=monthFlowCopy(item);const month=kstMonthNumber(item.start);return `<article class="month-card" data-month-pillar="${escapeHtml(item.korean)}"><div class="month-card-head"><span class="month-number">${month}</span><strong>${month}월 · ${escapeHtml(item.tenGod)}</strong></div><p class="month-card-focus"><mark>${escapeHtml(c.focus)}</mark></p><p class="month-card-action"><strong>해볼 일</strong> ${escapeHtml(c.action)}</p><p class="month-card-check">${escapeHtml(c.check)}</p><small>절입 ${formatKstBoundary(item.start)} ~ ${formatKstBoundary(item.end)} · ${escapeHtml(item.korean)}</small></article>`;}).join('');
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
  form.querySelectorAll('[aria-invalid="true"]').forEach((field)=>{
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
  });
  try{
    const input=collectInput();
    const chart=calculateSaju(input);
    const mbti=calculateSajuMbti(chart);
    const todayFlow=calculateTodayFlow(chart,dailyDate());
    const year=currentKstYear();
    const yearFlow=calculateYearFlows(chart,year,1)[0];
    const monthFlows=calculateMonthFlows(chart,year);
    const report=buildDetailedInterpretation(chart,mbti,yearFlow,monthFlows);
    currentReport=report;
    currentChart=chart;
    const name=$('name').value.trim()||'당신';
    currentDisplayName=name;
    renderProfile(chart,mbti,report,name,todayFlow);
    renderDetailedReport(report);
    renderKeywordInsight(report,document.querySelector('.visual-keyword-card.is-active')?.dataset.reportKey || 'temperament');
    renderToday(chart,todayFlow);
    renderYear(yearFlow,monthFlows);
    renderLuck(chart);
    renderExpert(chart,mbti);
    results.hidden=false;
  }catch(error){
    results.hidden=true;
    errorBox.textContent=error?.message||'입력값을 확인해 주세요.';
    const field=error?.fieldId ? $(error.fieldId) : null;
    if(field){
      field.setAttribute('aria-invalid','true');
      field.setAttribute('aria-errormessage','formError');
      field.focus();
    }
  }
}

let tarotSession=null;
let tarotRevealTimer=null;
let tarotDealTimer=null;

function tarotPickCount(mode){ return mode==='today'?1:3; }

function cancelTarotDeal(){
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
    card.setAttribute('aria-selected',tarotSession.selected.includes(cardIndex)?'true':'false');
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

function runTarotDeal(){
  const deck=$('tarotDeck');
  if(!deck) return;
  cancelTarotDeal();
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
    <div class="tarot-fan-stage" tabindex="0" role="listbox" aria-multiselectable="${count>1?'true':'false'}" aria-label="78장 타로 카드 펼침 선택 영역">
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
            aria-selected="${picked}"
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
    runTarotDeal();
  });
}

function renderTarot(mode,draw,reading,question){
  cancelTarotDeal();
  const deck=$('tarotDeck');
  deck.className=`tarot-deck tarot-reveal-deck${draw.length===1?' one-card':''}`;
  deck.innerHTML=draw.map((item,index)=>`<article class="tarot-card" data-card="${index}">
    <div class="tarot-card-inner">
      <div class="tarot-face tarot-back"></div>
      <div class="tarot-face tarot-front">
        <span class="arcana-no">${item.card.arcana==='major'?String(item.card.rank).padStart(2,'0'):item.card.en}</span>
        <div class="tarot-illustration"><img class="tarot-card-image" src="${item.card.image}" alt="${item.card.en} Rider-Waite-Smith 카드" loading="eager"></div>
      </div>
    </div>
    <div class="tarot-card-caption">
      <strong>${item.card.name}</strong>
      <small>${item.card.en}</small>
      <span>${item.reversed?'REVERSED · 역방향':'UPRIGHT · 정방향'}</span>
    </div>
  </article>`).join('');
  requestAnimationFrame(()=>setTimeout(()=>deck.querySelectorAll('.tarot-card').forEach((card)=>card.classList.add('revealed')),60));
  const questionLine=question?`<p class="tarot-question-line">질문 · ${escapeHtml(question)}</p>`:'';
  $('tarotResult').innerHTML=questionLine+reading.map((item)=>`<article class="tarot-reading"><div class="tarot-reading-head"><span>${item.position}</span><div><h3>${item.card.name} · ${item.orientation}</h3><p class="tarot-keywords">${item.card.keywords}</p></div></div><div class="tarot-reading-grid"><div><strong>카드의 뜻</strong><p>${item.meaning}</p></div><div><strong>그림이 말하는 상징</strong><p>${item.symbolism}</p></div><div><strong>지금 적용할 조언</strong><p>${item.advice}</p></div></div><p class="tarot-reading-note">타로는 미래를 확정하는 예언이 아니라 현재 질문을 다른 각도에서 살펴보기 위한 상징적 참고 도구입니다.</p></article>`).join('');
  $('tarotHelp').textContent='선택한 카드를 펼쳤습니다. 같은 질문으로 다시 보고 싶다면 78장을 다시 섞어 직접 선택하세요.';
}

function selectTarotCard(index){
  if(!tarotSession || tarotSession.selected.includes(index) || tarotSession.selected.length>=tarotSession.count) return;
  cancelTarotDeal();
  tarotSession.selected.push(index);
  const button=$('tarotDeck').querySelector(`[data-pick="${index}"]`);
  if(button){
    button.classList.add('selected');
    button.setAttribute('aria-selected','true');
    button.setAttribute('aria-disabled','true');
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
  cancelTarotDeal();
  const mode=$('tarotMode').value;
  $('tarot').classList.add('is-drawing');
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
  document.addEventListener('click',(event)=>{
    const link=event.target.closest?.('a[href="#full-report"], a[href^="#report-"], a[href="#annualDetailReport"], a[href="#luck"], a[href="#expert"]');
    if(!link) return;
    report.open=true;
    const selector=link.getAttribute('href');
    if(selector?.startsWith('#report-')){
      const chapter=document.querySelector(selector);
      const disclosure=chapter?.querySelector('details');
      if(disclosure) disclosure.open=true;
    }
  });
  if(['#full-report','#annualDetailReport','#luck','#expert'].includes(location.hash) || location.hash.startsWith('#report-')) report.open=true;
}

function setupSectionSpy(){
  const links=[...document.querySelectorAll('.topnav a[href^="#"], .report-nav a[href^="#"], .mobile-bottom-nav a[href^="#"]')];
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
$('birthYear').addEventListener('input',syncLeapAvailability);
$('birthMonth').addEventListener('input',syncLeapAvailability);
$('birthDate').addEventListener('input',()=>{ if(calendarUiMode==='solar') syncQuickYearFromActive(); });
$('birthYearQuick').addEventListener('focus',(event)=>event.target.select());
$('birthYearQuick').addEventListener('input',(event)=>{
  const raw=event.target.value.trim();
  if(/^\d{4}$/.test(raw)){
    const year=Number(raw);
    if(year>=1900 && year<=2100) applyQuickYear(year);
  }
});
$('birthYearQuick').addEventListener('change',commitQuickYear);
$('birthYearQuick').addEventListener('keydown',(event)=>{
  if(event.key==='Enter'){
    event.preventDefault();
    commitQuickYear();
  }
});
document.querySelectorAll('[data-year-shift]').forEach((button)=>button.addEventListener('click',()=>{
  const current=Number($('birthYearQuick').value)||Number((calendarUiMode==='solar'?$ ('birthDate').value.slice(0,4):$('birthYear').value))||1990;
  const shift=Number(button.dataset.yearShift)||0;
  const next=Math.min(2100,Math.max(1900,current+shift));
  applyQuickYear(next);
  $('birthYearQuick').focus();
}));
renderProfileSelect();
$('profileSelect').addEventListener('change',(event)=>{
  $('deleteProfile').disabled=!event.target.value;
  if(event.target.value) loadProfile(event.target.value);
});
$('saveProfile').addEventListener('click',saveCurrentProfile);
$('deleteProfile').addEventListener('click',deleteSelectedProfile);
$('shareReport').addEventListener('click',shareReport);
$('copyReport').addEventListener('click',copyReportSummary);
document.querySelectorAll('[data-day-shift]').forEach((button)=>button.addEventListener('click',()=>{
  dailyOffset=Math.max(-3650,Math.min(3650,dailyOffset+Number(button.dataset.dayShift||0)));
  if(currentChart) renderToday(currentChart,calculateTodayFlow(currentChart,dailyDate()));
}));
$('todayReset').addEventListener('click',()=>{
  dailyOffset=0;
  if(currentChart) renderToday(currentChart,calculateTodayFlow(currentChart,dailyDate()));
});
$('fortuneDate').addEventListener('change',(event)=>{
  if(!setDailyOffsetFromIso(event.target.value)) return;
  if(currentChart) renderToday(currentChart,calculateTodayFlow(currentChart,dailyDate()));
});
$('partnerProfileSelect').addEventListener('change',(event)=>{
  if(event.target.value) loadPartnerProfile(event.target.value);
});
$('compatibilityForm').addEventListener('submit',(event)=>{ event.preventDefault(); renderCompatibility(); });
$('precisionToggle').addEventListener('change',syncPrecisionUi);
form.addEventListener('input',(event)=>{
  const field=event.target;
  if(field?.matches?.('input,select,textarea')){
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
    errorBox.textContent='';
  }
});
form.addEventListener('change',(event)=>{
  const field=event.target;
  if(field?.matches?.('input[name="calendar"]')) return;
  if(field?.matches?.('input,select,textarea')){
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-errormessage');
    errorBox.textContent='';
  }
});
form.addEventListener('submit',(event)=>{
  event.preventDefault();
  results.dataset.mode='personal';
  renderAll();
  if(!results.hidden){
    const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(()=>document.querySelector('.visual-keyword-showcase')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
  }
});
$('drawTarot').addEventListener('click',handleTarot);
syncCalendarUi();
syncPrecisionUi();
setupSectionSpy();
setupFullReportAccess();
setupKeywordCards();
results.dataset.mode='demo';
requestAnimationFrame(()=>renderAll());
