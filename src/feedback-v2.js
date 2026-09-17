import { TAROT_ILLUSTRATIONS } from './tarot-art.js';

const $=(id)=>document.getElementById(id);

function text(id){ return $(id)?.textContent?.trim() || ''; }
function cards(selector){ return [...document.querySelectorAll(selector)]; }

function renderYearDeepDive(){
  const target=$('yearDeepDive');
  const plan=$('yearActionPlan');
  if(!target||!plan) return;
  const summary=text('yearSummary');
  const advice=cards('#yearAdviceGrid .advice-card').map((el)=>({title:el.querySelector('span')?.textContent?.trim(),body:el.querySelector('p')?.textContent?.trim()}));
  const quarters=cards('#tojungQuarterGrid .quarter-card').map((el)=>({title:el.querySelector('h3')?.textContent?.trim(),body:el.querySelector('p')?.textContent?.trim()}));
  if(!summary||!advice.length||!quarters.length) return;
  const opportunity=advice.find((x)=>x.title?.includes('기회'))?.body || advice[0]?.body;
  const caution=advice.find((x)=>x.title?.includes('주의'))?.body || advice[1]?.body;
  const money=advice.find((x)=>x.title?.includes('돈'))?.body || advice[2]?.body;
  const relation=advice.find((x)=>x.title?.includes('관계'))?.body || advice[3]?.body;
  target.innerHTML=`<article class="year-essay"><span class="essay-kicker">YEAR IN DEPTH</span><h3>올해 전체 흐름</h3><p>${summary} 이 흐름은 한두 달의 단기 운세라기보다 올해 전반에 반복해서 등장하는 선택의 배경으로 읽는 편이 좋습니다. 일이 잘 풀리는 시점만 찾기보다 어떤 방식으로 움직일 때 효율이 높아지는지, 그리고 반복해서 막히는 패턴이 무엇인지 함께 보는 것이 핵심입니다.</p><p><strong>현실적인 조언.</strong> ${opportunity} 특히 새로운 일을 한꺼번에 벌이기보다 현재 가진 시간·돈·관계 자원을 먼저 정리하고, 성과가 확인되는 영역부터 단계적으로 넓혀가는 방식이 안정적입니다. 운세의 문장을 행동으로 바꾼다면 ‘지금 당장 할 수 있는 한 가지’를 정하고 일정에 넣는 것이 가장 실용적입니다.</p><p><strong>주의할 점.</strong> ${caution} 올해의 경고 문구를 불안 요소로 받아들이기보다, 같은 실수를 줄이기 위한 체크리스트로 사용하는 편이 좋습니다. 중요한 계약·지출·관계 결정은 감정이 가장 강한 순간보다 자료와 조건을 다시 확인한 뒤 결정하세요.</p><div class="year-topic-grid"><div><span>재정</span><p>${money}</p></div><div><span>관계</span><p>${relation}</p></div></div></article>`;
  plan.innerHTML=`<div class="block-head"><h3>분기별 행동 계획</h3><p>짧은 운세 문구 대신 실제 일정에 옮길 수 있도록 분기마다 무엇을 점검할지 정리했습니다.</p></div><div class="year-action-grid">${quarters.map((q,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><h4>${q.title}</h4><p>${q.body}</p><strong>${i===0?'우선순위를 3개 이하로 줄이고 시작 조건을 정하세요.':i===1?'진행 중인 일을 점검하고 과도한 확장보다 완성도를 높이세요.':i===2?'성과와 비용을 함께 확인하고 사람·일의 경계를 다시 정리하세요.':'올해의 결과를 기록하고 다음 해에 이어갈 것과 끝낼 것을 분리하세요.'}</strong></article>`).join('')}</div>`;
}

function renderExpertGuide(){
  const target=$('expertGuide');
  if(!target) return;
  const pillarNames=cards('#pillarGrid .pillar-card').map((el)=>el.querySelector('.pillar-letters')?.textContent?.trim()).filter(Boolean);
  const elementRows=cards('#elementChart .bar-row').map((el)=>({label:el.querySelector('strong')?.textContent?.trim(),value:Number(el.lastElementChild?.textContent)})).filter((x)=>Number.isFinite(x.value)).sort((a,b)=>b.value-a.value);
  const roleRows=cards('#roleChart .bar-row').map((el)=>({label:el.querySelector('strong')?.textContent?.trim(),value:Number(el.lastElementChild?.textContent)})).filter((x)=>Number.isFinite(x.value)).sort((a,b)=>b.value-a.value);
  if(!pillarNames.length) return;
  const strongElement=elementRows[0]?.label || '오행의 강한 축';
  const weakElement=elementRows.at(-1)?.label || '오행의 약한 축';
  const role=roleRows[0]?.label || '가장 두드러진 십성';
  target.innerHTML=`<div class="expert-guide-head"><span class="micro">PLAIN LANGUAGE GUIDE</span><h3>처음 보는 사람을 위한 원국 읽는 법</h3><p><strong>쉽게 말하면</strong>, 이 항목은 사주 해석의 ‘원재료’를 보여주는 곳입니다. 아래 숫자나 한자를 좋은 점수·나쁜 점수로 판단하기보다, 어떤 성향과 역할이 상대적으로 자주 나타나는지를 확인하는 용도로 보세요.</p></div><div class="expert-intro-grid"><article><span>① 네 기둥</span><h4>${pillarNames.join(' · ')}</h4><p>연주·월주·일주·시주는 각각 성장 배경, 사회 환경, 나 자신, 행동과 후반 흐름을 보는 기본 축입니다. 특히 일주의 천간은 ‘일간’이라고 하며 해석의 기준점이 됩니다.</p></article><article><span>② 오행 분포</span><h4>${strongElement} 쪽이 상대적으로 두드러짐</h4><p>목·화·토·금·수는 성격 점수가 아니라 에너지를 분류하는 언어입니다. 강한 요소는 익숙하게 쓰는 방식, ${weakElement}처럼 낮은 요소는 생활에서 의식적으로 보완해 볼 수 있는 방식으로 이해하면 쉽습니다.</p></article><article><span>③ 십성 분포</span><h4>${role} 비중 확인</h4><p>십성은 나를 기준으로 사람·성과·돈·책임·배움과의 관계를 분류합니다. 비중이 높다고 무조건 좋다는 뜻은 아니며, 어떤 상황에서 내가 자연스럽게 반응하는지 설명하는 참고 지표입니다.</p></article><article><span>④ 합·충·형·파·해</span><h4>관계와 변화의 패턴</h4><p>이 항목은 ‘사건 예언’이 아닙니다. 서로 잘 묶이는 기운, 부딪히는 기운, 반복적인 긴장처럼 구조적 관계를 표시합니다. <strong>생활에서</strong>는 협업·변화·갈등 관리의 경향을 점검하는 참고 자료로 보세요.</p></article></div><div class="expert-note"><strong>읽는 순서 추천</strong><p>① 일주와 오행을 먼저 보고 → ② 십성의 큰 비중을 확인한 뒤 → ③ 합·충 등 관계 신호를 보세요. 마지막으로 앞의 상세 사주 리포트와 연결하면 한자 데이터가 실제 생활 해설과 어떻게 이어지는지 이해하기 쉽습니다.</p></div>`;
}

function enhanceTarotCards(){
  cards('#tarotDeck .tarot-card').forEach((card)=>{
    const front=card.querySelector('.tarot-front');
    if(!front) return;
    const number=Number(front.querySelector('.arcana-no')?.textContent);
    const art=TAROT_ILLUSTRATIONS[number];
    if(!art) return;
    const wasReversed=front.classList.contains('reversed') || front.textContent.includes('REVERSED');
    front.classList.remove('reversed');
    const existing=front.querySelector('.tarot-illustration');
    if(existing){ existing.classList.toggle('reversed-art',wasReversed); return; }
    const symbol=front.querySelector('.arcana-symbol');
    if(!symbol) return;
    const illustration=document.createElement('div');
    illustration.className=`tarot-illustration${wasReversed?' reversed-art':''}`;
    illustration.innerHTML=art;
    symbol.replaceWith(illustration);
  });
}

function renderEnhancements(){
  renderYearDeepDive();
  renderExpertGuide();
  enhanceTarotCards();
}

const deck=$('tarotDeck');
if(deck) new MutationObserver(enhanceTarotCards).observe(deck,{childList:true,subtree:true});
const results=$('results');
if(results) new MutationObserver(()=>requestAnimationFrame(renderEnhancements)).observe(results,{childList:true,subtree:true,characterData:true});
requestAnimationFrame(()=>requestAnimationFrame(renderEnhancements));
