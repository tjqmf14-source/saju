import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../product-v3.css',import.meta.url),'utf8');
const plain=await readFile(new URL('../src/plain-language-ui.js',import.meta.url),'utf8');

test('Product V3 overlay is the active theme',()=>{
  assert.match(html,/href="\/product-v17\.css"[\s\S]*href="\/product-v3\.css"/);
  assert.match(html,/data-theme="product-v3"/);
  assert.match(css,/Naesaju Product UI v3/);
});

test('primary information architecture is reduced to top user tasks',()=>{
  const topnav=html.match(/<nav class="topnav"[\s\S]*?<\/nav>/)?.[0]||'';
  assert.equal((topnav.match(/<a /g)||[]).length,4);
  for(const label of ['사주 리포트','오늘','올해','타로']) assert.ok(topnav.includes(label),label);
  assert.doesNotMatch(topnav,/궁합|자세한리포트/);

  const feature=html.match(/<nav class="feature-orbit-nav[^"]*"[\s\S]*?<\/nav>/)?.[0]||'';
  assert.equal((feature.match(/<a /g)||[]).length,4);

  const mobile=html.match(/<nav class="mobile-bottom-nav[^"]*"[\s\S]*?<\/nav>/)?.[0]||'';
  assert.equal((mobile.match(/<a /g)||[]).length,5);
  assert.match(mobile,/href="#year"[\s\S]*>흐름</);
  assert.doesNotMatch(mobile,/href="#compatibility"/);
});

test('V3 typography and controls raise the mobile readability floor',()=>{
  assert.match(css,/body\[data-theme="product-v3"\]\{[\s\S]*font-size:17px/);
  assert.match(css,/@media\(max-width:760px\)\{[\s\S]*body\[data-theme="product-v3"\]\{[\s\S]*font-size:20px/);
  assert.match(css,/body\[data-theme="product-v3"\] small\{font-size:15px!important/);
  assert.match(css,/@media\(max-width:760px\)[\s\S]*small\{font-size:17px!important/);
  assert.match(css,/min-height:50px/);
  assert.match(css,/min-height:54px/);
});

test('secondary capabilities remain available without crowding primary navigation',()=>{
  for(const id of ['compatibility','compatibilityForm','tarot','full-report','annualDetailReport','luck']) {
    assert.match(html,new RegExp(`id="${id}"`),id);
  }
  assert.match(plain,/compatibilityNote/);
});
