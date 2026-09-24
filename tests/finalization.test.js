import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../product-v20.css',import.meta.url),'utf8');
const ui=await readFile(new URL('../src/product-v20.js',import.meta.url),'utf8');

test('V20 is the only active product presentation layer',()=>{
  assert.match(html,/data-product="v20"/);
  assert.match(html,/href="\/product-v20\.css"/);
  assert.match(html,/src="\/src\/product-v20\.js"/);
  assert.doesNotMatch(html,/product-v17\.css|site-v12\.css|premium-ui\.js|plain-language-ui\.js/);
  assert.equal((html.match(/<link rel="stylesheet"/g)||[]).length,1);
});

test('V20 uses four primary app destinations instead of one long landing page',()=>{
  for(const route of ['home','saju','fortune','tarot']) assert.match(html,new RegExp('data-screen="'+route+'"'));
  assert.equal((html.match(/data-screen="/g)||[]).length,4);
  assert.doesNotMatch(html,/id="compatibility"|MBTI|visual-keyword-showcase|full-report|trust-strip|quote-band/);
  assert.match(html,/class="mobile-nav"/);
  assert.match(html,/class="side-nav"/);
});

test('minimum explicit typography is 12pt equivalent or larger',()=>{
  const sizes=[...css.matchAll(/font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px/g)].map((match)=>Number(match[1]));
  assert.ok(sizes.length>20);
  const minimum=Math.min(...sizes);
  assert.ok(minimum>=16,'minimum explicit font size is '+minimum+'px');
  assert.match(css,/small\{font-size:16px!important\}/);
  assert.match(css,/--font-min:16px/);
});

test('tarot preserves full card artwork without cover cropping',()=>{
  assert.match(css,/\.tarot-reading-card img\{[^}]*object-fit:contain/);
  assert.match(css,/aspect-ratio:7\/12/);
  assert.match(ui,/prepareTarotFan\(12\)/);
  assert.match(ui,/interpretSpread/);
});

test('document IDs are unique and forms expose explicit labels and error region',()=>{
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map((match)=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
  assert.match(html,/id="profileError"[^>]*role="alert"/);
  assert.match(html,/id="profileForm"/);
  assert.match(html,/id="birthDate"/);
  assert.match(html,/id="birthTime"/);
  assert.match(html,/id="birthLocation"/);
});

test('runtime stores only local profile data and retains native local share support',()=>{
  assert.match(ui,/localStorage\.setItem\(PROFILE_KEY/);
  assert.match(ui,/globalThis\.NaesajuNative/);
  assert.match(ui,/bridge\.shareText\('내사주 리포트',text\)/);
  assert.doesNotMatch(ui,/fetch\(|XMLHttpRequest|WebSocket/);
});
