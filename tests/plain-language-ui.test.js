import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const reading=await readFile(new URL('../src/reading-v20.js',import.meta.url),'utf8');

test('main UI uses everyday labels and keeps technical evidence secondary',()=>{
  for(const label of ['성향','일','돈','관계','회복']) assert.ok(reading.includes("title:'"+label+"'"),label);
  assert.match(html,/계산 기준/);
  assert.doesNotMatch(html,/MBTI|격국|용신|희신|신강|신약/);
});

test('reading copy separates interpretation from deterministic evidence',()=>{
  assert.match(reading,/evidence:/);
  assert.match(reading,/사주는 미래를 확정하는 예언이 아니라/);
  assert.match(reading,/투자·대출·큰 소비의 단독 근거/);
  assert.match(reading,/상대의 마음을 예언하는 것이 아니라/);
});

test('obsolete post-processing copy layer is no longer loaded',()=>{
  assert.doesNotMatch(html,/plain-language-ui\.js/);
  assert.match(html,/product-v20\.js/);
});
