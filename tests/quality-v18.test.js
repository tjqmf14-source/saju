import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css=await readFile(new URL('../product-v18.css',import.meta.url),'utf8');
const ui=await readFile(new URL('../src/premium-ui.js',import.meta.url),'utf8');
const plain=await readFile(new URL('../src/plain-language-ui.js',import.meta.url),'utf8');

test('V18 CSS has no explicit px font size below the 10pt floor',()=>{
  const sizes=[...css.matchAll(/font-size\s*:\s*([0-9]*\.?[0-9]+)px/g)].map((match)=>Number(match[1]));
  const tooSmall=sizes.filter((value)=>value<13.33);
  assert.deepEqual(tooSmall,[]);
  assert.match(css,/--font-floor:13\.34px/);
});

test('tarot artwork uses contain fitting instead of cropping',()=>{
  assert.match(css,/\.tarot-card-image\{[\s\S]*?object-fit:contain!important/);
  assert.match(css,/\.tarot-preview-card img\{[\s\S]*?object-fit:contain!important/);
  assert.doesNotMatch(css,/\.tarot-card-image\{[^}]*object-fit:cover/);
});

test('primary report is compressed into eight evidence-first chapters',()=>{
  assert.match(ui,/const ordered=\['overview','temperament','strengths','balance','career','money','relationships','recovery'\]/);
  assert.match(ui,/const labels=\['핵심','계산 근거','지금 할 일'\]/);
  assert.match(ui,/item\.paragraphs\.slice\(0,2\)/);
});

test('plain-language layer preserves calculated quick copy instead of overwriting it',()=>{
  const rewrite=plain.slice(plain.indexOf('function rewriteFriendlyAdvice'),plain.indexOf('for (const guide of Object.values',plain.indexOf('function rewriteFriendlyAdvice')));
  assert.match(rewrite,/계산된 해설 본문은 절대 공통 문구로 덮어쓰지 않는다/);
  assert.doesNotMatch(rewrite,/chapter-quick-list li/);
  assert.doesNotMatch(rewrite,/body\.textContent=lines/);
});
