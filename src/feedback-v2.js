import './feedback-v4.js';
import './redesign-v5.js';

const $=(id)=>document.getElementById(id);

function text(id){ return $(id)?.textContent?.trim() || ''; }
function cards(selector){ return [...document.querySelectorAll(selector)]; }
function setHtml(element,html){ if(element && element.innerHTML!==html) element.innerHTML=html; }

function renderYearDeepDive(){
  const target=$('yearDeepDive');
  if(!target) return;
  const summary=text('yearSummary');
  const advice=cards('#yearAdviceGrid .advice-card').map((el)=>({title:el.querySelector('span')?.textContent?.trim(),body:el.querySelector('p')?.textContent?.trim()}));
  if(!summary||!advice.length) return;
  const opportunity=advice.find((x)=>x.title?.includes('기회'))?.body || advice[0]?.body;
  const caution=advice.find((x)=>x.title?.includes('주의'))?.body || advice[1]?.body;
  const money=advice.find((x)=>x.title?.includes('돈'))?.body || advice[2]?.body;
  const relation=advice.find((x)=>x.title?.includes('관계'))?.body || advice[3]?.body;
  const deepHtml=`<article class="year-essay"><span class="essay-kicker">YEAR IN DEPTH</span><h3>올해 전체 흐름</h3><p>${summary} 이 흐름은 한두 달의 단기 운세라기보다 올해 전반에 반복해서 등장하는 선택의 배경으로 읽는 편이 좋습니다. 일이 잘 풀리는 시점만 찾기보다 어떤 방식으로 움직일 때 효율이 높아지는지, 그리고 반복해서 막히는 패턴이 무엇인지 함께 보는 것이 핵심입니다.</p><p><strong>현실적인 조언.</strong> ${opportunity} 특히 새로운 일을 한꺼번에 벌이기보다 현재 가진 시간·돈·관계 자원을 먼저 정리하고, 성과가 확인되는 영역부터 단계적으로 넓혀가는 방식이 안정적입니다. 운세의 문장을 행동으로 바꾼다면 ‘지금 당장 할 수 있는 한 가지’를 정하고 일정에 넣는 것이 가장 실용적입니다.</p><p><strong>주의할 점.</strong> ${caution} 올해의 경고 문구를 불안 요소로 받아들이기보다 같은 실수를 줄이기 위한 체크리스트로 사용하는 편이 좋습니다. 중요한 계약·지출·관계 결정은 감정이 가장 강한 순간보다 자료와 조건을 다시 확인한 뒤 결정하세요.</p><div class="year-topic-grid"><div><span>재정</span><p>${money}</p></div><div><span>관계</span><p>${relation}</p></div></div></article>`;
  setHtml(target,deepHtml);
}

let scheduled=false;
function scheduleEnhancements(){
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;renderYearDeepDive();});
}

const results=$('results');
if(results) new MutationObserver(scheduleEnhancements).observe(results,{childList:true,subtree:true,characterData:true});
requestAnimationFrame(()=>requestAnimationFrame(renderYearDeepDive));
