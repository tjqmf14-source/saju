import test from 'node:test';
import assert from 'node:assert/strict';
import { TAROT_DECK } from '../src/tarot.js';

const byCode=Object.fromEntries(TAROT_DECK.map((card)=>[card.code,card]));
const cases=[
  ['s03',/상처|슬픔|아픔|이별/,'Three of Swords'],
  ['s10',/끝|종료|바닥|마무리/,'Ten of Swords'],
  ['s07',/전략|숨|회피|기만/,'Seven of Swords'],
  ['c03',/축하|우정|모임|기쁨/,'Three of Cups'],
  ['c05',/상실|후회|슬픔/,'Five of Cups'],
  ['c10',/가족|행복|정서|관계/,'Ten of Cups'],
  ['p05',/결핍|곤란|경제|도움/,'Five of Pentacles'],
  ['p08',/숙련|연습|기술|반복/,'Eight of Pentacles'],
  ['p10',/유산|가족|장기|안정/,'Ten of Pentacles'],
  ['w05',/경쟁|충돌|갈등/,'Five of Wands'],
  ['w08',/속도|소식|빠른|진전/,'Eight of Wands'],
  ['w10',/부담|책임|짐|과중/,'Ten of Wands']
];

for(const [code,pattern,name] of cases){
  test(`${name} has its own traditional RWS meaning`,()=>{
    const card=byCode[code];
    assert.ok(card);
    assert.match(`${card.keywords} ${card.upright}`,pattern);
  });
}

test('all 56 minor cards carry card-specific meaning records',()=>{
  const minor=TAROT_DECK.filter((card)=>card.arcana==='minor');
  assert.equal(minor.length,56);
  assert.equal(new Set(minor.map((card)=>card.upright)).size,56);
  assert.ok(minor.every((card)=>card.symbolism.length>=28));
});
