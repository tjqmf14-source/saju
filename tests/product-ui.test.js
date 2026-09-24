import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../product-v20.css',import.meta.url),'utf8');
const reading=await readFile(new URL('../src/reading-v20.js',import.meta.url),'utf8');

test('primary navigation is task based and stable',()=>{
  for(const label of ['홈','내 사주','운세','타로']) assert.ok(html.includes('>'+label+'<'),label);
  assert.match(html,/aria-label="주요 메뉴"/);
  assert.match(css,/@media\(max-width:980px\)/);
  assert.match(css,/\.mobile-nav\{position:fixed/);
});

test('saju report uses five life categories and progressive evidence',()=>{
  for(const label of ['성향','일','돈','관계','회복']) assert.ok(reading.includes("title:'"+label+"'"),label);
  assert.match(html,/id="sajuTabs"/);
  assert.match(html,/id="sajuReading"/);
  assert.match(html,/id="evidenceButton"/);
  assert.match(html,/id="evidenceDialog"/);
});

test('home prioritizes one daily summary and four practical categories',()=>{
  assert.match(html,/id="homeScore"/);
  assert.match(html,/id="homeDailyGrid"/);
  assert.match(html,/오늘의 네 가지 흐름/);
  assert.doesNotMatch(html,/학업운|행운의 번호|코디 추천|바이오리듬/);
});

test('responsive design preserves readable controls and text scale',()=>{
  assert.match(css,/min-height:48px/);
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(css,/font-size:16px/);
  assert.match(css,/\.outline-button\{[^}]*white-space:nowrap/);
  assert.match(css,/\.daily-row>span\{white-space:nowrap\}/);
  assert.match(css,/\.bar-row span\{word-break:keep-all\}/);
  assert.doesNotMatch(css,/font-size:\s*(?:[0-9]|1[0-5])(?:\.\d+)?px/);
});
