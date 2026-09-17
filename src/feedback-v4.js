import '../polish-v4.css';
import { calculateSaju } from './saju-engine.js';
import { TEN_GOD_GROUP, ROLE_LABELS } from './data.js';
import { getTenGod } from 'manseryeok';

const $=(id)=>document.getElementById(id);

const DECADE_COPY={
  비겁:{
    title:'나를 세우는 10년',
    story:'남이 원하는 모습보다 내가 어떤 기준으로 살아갈지를 더 선명하게 정리하게 되는 시기입니다. 독립성, 선택권, 경쟁, 자기표현이 반복해서 삶의 앞쪽으로 올라올 수 있습니다. 이 시기의 핵심은 혼자 강해지는 데 있지 않고, 내 기준을 잃지 않으면서도 사람과 건강하게 연결되는 법을 배우는 데 있습니다.',
    chance:'내 이름으로 결정하고 책임지는 일, 개인 프로젝트, 새로운 역할, 독립적인 선택에서 성장의 계기를 만들기 쉽습니다. 스스로 방향을 정했을 때 집중력이 살아날 수 있습니다.',
    caution:'혼자 해결하려는 습관이 강해지면 관계 피로와 과도한 부담으로 이어질 수 있습니다. 비교와 경쟁에 오래 머물수록 내가 진짜 원하는 방향이 흐려질 수 있습니다.',
    advice:'이 시기에는 “내가 잘할 수 있는 것”과 “굳이 내가 다 해야 하는 것”을 구분하는 연습이 중요합니다. 자기주도성은 유지하되, 협업할 사람과 도움을 요청할 시점을 미리 정해두면 훨씬 안정적으로 성장할 수 있습니다.'
  },
  식상:{
    title:'세상에 나를 보여주는 10년',
    story:'머릿속에 있던 생각과 감각을 결과물로 꺼내는 힘이 커지는 시기입니다. 말, 글, 디자인, 창작, 발표, 기획처럼 보이지 않던 것을 보이게 만드는 일이 중요한 의미를 갖기 쉽습니다. 스스로를 표현하는 과정에서 정체성과 자신감도 함께 다듬어지는 흐름입니다.',
    chance:'실력과 개성을 보여줄 수 있는 자리, 새로운 결과물을 공개하는 일, 콘텐츠와 창작 활동, 커뮤니케이션이 기회로 연결될 수 있습니다. 잘 만든 한 가지가 여러 기회를 불러오는 구조가 되기 쉽습니다.',
    caution:'인정받고 싶은 마음이 너무 커지면 결과보다 반응에 흔들릴 수 있습니다. 일을 많이 벌이기보다 끝까지 완성하는 경험을 쌓는 것이 중요합니다.',
    advice:'완벽해질 때까지 숨기기보다, 일정 수준까지 만든 뒤 세상에 보여주고 반응을 받아 다듬는 방식을 추천합니다. 표현을 반복할수록 내 강점이 무엇인지 스스로도 더 정확히 알게 됩니다.'
  },
  재성:{
    title:'현실의 기반을 단단하게 만드는 10년',
    story:'돈, 시간, 생활 기반, 성과처럼 손에 잡히는 현실의 문제를 더 진지하게 다루게 되는 시기입니다. 단순히 돈을 많이 버는 시기라는 의미보다, 내가 가진 자원을 어떻게 관리하고 쌓아갈지 배우는 시간이 될 가능성이 큽니다.',
    chance:'재정 구조를 정리하거나, 일에서 성과를 축적하고, 생활 기반을 안정시키는 선택이 힘을 받을 수 있습니다. 숫자로 확인할 수 있는 목표를 세울수록 진행 상황을 체감하기 쉽습니다.',
    caution:'불안 때문에 지나치게 움켜쥐거나, 눈앞의 이익만 보고 중요한 가치를 놓칠 수 있습니다. 돈과 성과가 삶 전체의 기준이 되지 않도록 균형을 확인해야 합니다.',
    advice:'수입만 늘리려 하기보다 고정비, 반복 지출, 시간 사용, 업무 단가처럼 생활의 구조를 먼저 점검해 보세요. 현실을 정리할수록 마음도 안정되고 선택의 폭도 넓어질 수 있습니다.'
  },
  관성:{
    title:'책임과 사회적 역할이 커지는 10년',
    story:'해야 할 일, 맡아야 할 역할, 지켜야 할 기준이 이전보다 분명해지는 시기입니다. 직업, 조직, 책임, 신뢰와 관련된 경험이 반복될 수 있고, 그 과정에서 사회적으로 어떤 사람으로 자리 잡을지 결정되는 흐름이 생기기 쉽습니다.',
    chance:'꾸준함과 책임감이 눈에 띄기 쉬운 시기라, 공식적인 역할이나 장기 프로젝트에서 신뢰를 쌓을 가능성이 큽니다. 실력을 제도와 구조 안에서 인정받는 경험이 생길 수 있습니다.',
    caution:'모든 것을 완벽하게 해야 한다는 압박이 커지면 삶이 지나치게 딱딱해질 수 있습니다. 책임감이 강점이지만, 그것이 자기비판과 과로로 바뀌지 않도록 주의해야 합니다.',
    advice:'책임을 더 많이 떠안기보다 책임을 건강하게 운영하는 방식을 만들어야 합니다. 일정, 기준, 역할 범위를 문장으로 정리하고, 감당할 수 없는 부분은 일찍 조정하는 편이 장기적으로 더 좋은 결과를 만듭니다.'
  },
  인성:{
    title:'내공과 회복을 깊게 쌓는 10년',
    story:'외부의 속도보다 내부의 성장과 이해가 더 중요해지는 시기입니다. 공부, 기록, 연구, 자격 준비, 휴식, 재정비처럼 당장 눈에 크게 드러나지 않더라도 이후의 삶을 받쳐주는 기반을 만드는 일이 중요해질 수 있습니다.',
    chance:'새로운 지식을 배우거나 지금까지의 경험을 정리해 전문성으로 만드는 데 좋은 흐름이 생길 수 있습니다. 조용히 쌓은 자료와 경험이 나중에 큰 힘이 될 가능성이 큽니다.',
    caution:'생각이 깊어지는 만큼 실행이 늦어지거나 세상과 거리를 두고 싶어질 수 있습니다. 준비가 완벽해야 움직일 수 있다는 생각은 오히려 기회를 늦출 수 있습니다.',
    advice:'배움과 회복의 시간을 충분히 가지되, 작은 실행을 끊지 않는 것이 중요합니다. 하루에 한 줄 기록, 한 페이지 공부, 한 가지 정리처럼 작지만 반복 가능한 행동을 두면 내공이 실제 변화로 이어집니다.'
  }
};

const YEAR_COPY={
  자기주도:{theme:'내가 방향을 정하는 힘',life:'결정을 미루던 일, 혼자 책임지고 있던 일, 경계를 다시 세워야 하는 관계에서 특히 체감될 수 있습니다.'},
  '표현·창작':{theme:'생각을 밖으로 꺼내는 힘',life:'작업물 공개, 대화, 발표, 콘텐츠, 새로운 제안처럼 “보이게 만드는 행동”에서 흐름을 체감하기 쉽습니다.'},
  '재물·성과':{theme:'현실의 구조를 정리하는 힘',life:'수입과 지출, 시간 배분, 업무 성과, 생활 루틴처럼 숫자와 결과로 확인되는 영역에서 특히 체감될 수 있습니다.'},
  '책임·직업':{theme:'역할과 기준을 세우는 힘',life:'직업, 조직, 마감, 약속, 장기 계획처럼 책임이 분명한 장면에서 특히 체감될 수 있습니다.'},
  '배움·회복':{theme:'내공을 쌓고 회복하는 힘',life:'공부, 기록, 휴식, 자료 정리, 자격 준비, 관계를 천천히 이해하는 과정에서 특히 체감될 수 있습니다.'}
};

function collectInput(){
  const form=$('birthForm');
  if(!form) return null;
  const [hour,minute]=$('birthTime').value.split(':').map(Number);
  return {
    calendar:form.elements.calendar.value,
    year:Number($('birthYear').value), month:Number($('birthMonth').value), day:Number($('birthDay').value),
    hour, minute, gender:$('gender').value, isLeap:$('isLeap').checked,
    precision:$('precisionToggle').checked,
    location:$('birthLocation').value,
    dayBoundary:$('dayBoundary').value
  };
}

function currentAge(input){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const now=Object.fromEntries(parts.map((part)=>[part.type,Number(part.value)]));
  let age=now.year-input.year;
  if(now.month<input.month || (now.month===input.month && now.day<input.day)) age-=1;
  return age;
}

function buildLuckNarrative(group,item,isActive){
  const base=DECADE_COPY[group]||DECADE_COPY.인성;
  const ageEnd=Number(item.age)+9;
  return {
    headline:`${item.age}세 ~ ${ageEnd}세 · ${base.title}`,
    lead:`${ROLE_LABELS[group]||group}의 기운이 이 10년의 배경처럼 흐릅니다. ${base.story}${isActive?' 지금 이 구간을 지나고 있다면, 결과를 급하게 판단하기보다 이 시기가 요구하는 삶의 태도를 천천히 몸에 익히는 것이 중요합니다.':''}`,
    sections:[
      ['큰 주제',base.story],
      ['기회',base.chance],
      ['주의할 점',base.caution],
      ['조언',base.advice]
    ]
  };
}

function enhanceLuck(){
  const target=$('luckTimeline');
  if(!target) return;
  const input=collectInput();
  if(!input) return;
  let chart;
  try{ chart=calculateSaju(input); }catch{ return; }
  if(!chart.luck?.pillars?.length) return;
  const age=currentAge(input);
  const signature=chart.luck.pillars.slice(0,9).map((item)=>`${item.age}:${item.korean}`).join('|');
  if(target.dataset.v4Signature===signature) return;
  target.dataset.v4Signature=signature;
  target.innerHTML=chart.luck.pillars.slice(0,9).map((item)=>{
    const tenGod=getTenGod(chart.dayMaster,item.heavenlyStem);
    const group=TEN_GOD_GROUP[tenGod]||'인성';
    const active=age>=Number(item.age)&&age<Number(item.age)+10;
    const narrative=buildLuckNarrative(group,item,active);
    return `<article class="luck-step panel-flow${active?' active':''}">
      <div class="luck-marker"><span>${active?'현재 대운':'대운 흐름'}</span><strong>${item.age}세부터</strong><b>${item.korean}</b><small>${ROLE_LABELS[group]||group}</small></div>
      <div class="luck-copy"><h3>${narrative.headline}</h3><p class="luck-lead">${narrative.lead}</p><div class="luck-narrative-grid">${narrative.sections.map(([title,text])=>`<div><strong>${title}</strong><p>${text}</p></div>`).join('')}</div></div>
    </article>`;
  }).join('');
}

function fixTarotOrientation(){
  document.querySelectorAll('.tarot-illustration.reversed-art').forEach((node)=>node.classList.remove('reversed-art'));
  document.querySelectorAll('.tarot-reading').forEach((node)=>node.classList.add('panel-flow'));
}

function groupFromLabel(label=''){
  return Object.entries(ROLE_LABELS).find(([,value])=>label.includes(value))?.[0] || null;
}

function friendlyFlowParagraph(group,period='이번 시기'){
  const copy=DECADE_COPY[group]||DECADE_COPY.인성;
  return `${period}에 생활에서 체감할 수 있는 방식은 거창한 사건보다 반복되는 선택에서 더 잘 드러납니다. 이번 흐름에서 중요한 것은 ${copy.title.replace('10년','방향')}을 억지로 만들기보다, 이미 반복되고 있는 패턴을 알아차리고 더 좋은 방식으로 조정하는 일입니다. ${copy.chance} 반대로 ${copy.caution} 서두르기보다 지금 할 수 있는 작은 행동 하나를 먼저 정해보세요.`;
}

function enhanceYearCopy(){
  document.querySelectorAll('#monthForecast .month-card').forEach((card)=>{
    const label=card.querySelector('strong')?.textContent?.trim()||'';
    const group=groupFromLabel(label);
    const body=card.querySelector('p');
    const period=card.querySelector('.month-number')?.textContent?.trim();
    if(!group||!body||body.dataset.v4==='1') return;
    body.dataset.v4='1';
    body.textContent=friendlyFlowParagraph(group,period?`${Number(period)}월`:'이번 달');
  });

  document.querySelectorAll('#tojungQuarterGrid .quarter-card').forEach((card)=>{
    const text=card.textContent;
    const group=groupFromLabel(text);
    const body=card.querySelector('p');
    if(!group||!body||body.dataset.v4==='1') return;
    body.dataset.v4='1';
    const base=DECADE_COPY[group];
    body.textContent=`이번 흐름에서 중요한 것은 ${base.title.replace('10년','방향')}을 내 생활에 맞게 쓰는 것입니다. ${base.chance} 생활에서 체감할 수 있는 방식은 일정, 관계, 돈, 작업 리듬처럼 반복되는 선택에서 먼저 나타납니다. ${base.caution} 서두르기보다 이번 분기에 꼭 남기고 싶은 결과 한 가지를 정하고, 나머지는 과감히 줄여보세요.`;
  });

  const summary=$('yearSummary');
  if(summary && summary.dataset.v4!=='1'){
    summary.dataset.v4='1';
    const original=summary.textContent.trim();
    const key=Object.keys(YEAR_COPY).find((label)=>original.includes(label));
    const info=YEAR_COPY[key]||{theme:'현재의 흐름을 현실에 맞게 조절하는 힘',life:'일정, 관계, 돈, 생활 리듬처럼 반복되는 선택에서 체감될 수 있습니다.'};
    summary.textContent=`${original} 올해를 단순히 좋은 해·나쁜 해로 나누기보다, ${info.theme}을 어떻게 생활 속에서 쓰는지가 더 중요합니다. ${info.life} 이번 흐름에서 중요한 것은 한 번의 큰 선택보다 반복되는 작은 선택의 질을 높이는 일입니다. 서두르기보다 지금 가진 시간과 에너지를 먼저 정리해 보세요.`;
  }
}

function markFlowPanels(){
  ['year','luck','tarot','expert','today'].forEach((id)=>$(id)?.classList.add('panel-flow'));
}

let scheduled=false;
function enhance(){
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    markFlowPanels();
    fixTarotOrientation();
    enhanceLuck();
    enhanceYearCopy();
  });
}

const results=$('results');
if(results) new MutationObserver(enhance).observe(results,{childList:true,subtree:true,characterData:true});
$('drawTarot')?.addEventListener('click',()=>requestAnimationFrame(()=>requestAnimationFrame(enhance)));
$('birthForm')?.addEventListener('submit',()=>requestAnimationFrame(()=>requestAnimationFrame(enhance)));
requestAnimationFrame(()=>requestAnimationFrame(enhance));
