import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../product-v17.css',import.meta.url),'utf8');
const plain=await readFile(new URL('../src/plain-language-ui.js',import.meta.url),'utf8');

test('product v17 is the only active presentation layer',()=>{
  assert.match(html,/href="\/product-v17\.css"/);
  assert.doesNotMatch(html,/href="\/site-v12\.css"/);
  assert.match(html,/data-theme="product-v17"/);
});

test('app-first UI uses progressive disclosure and mobile-first controls',()=>{
  for(const token of ['--app-bg:#f5f1e8','--app-brand:#b54b3f','--app-pine:#34574c','.trust-strip','.mobile-bottom-nav','.full-report-shell','.tarot-fan-stage']){
    assert.ok(css.includes(token),token);
  }
  assert.ok(html.indexOf('hero-primary') < html.indexOf('trust-strip'),'hero should lead before trust details');
  assert.match(css,/@media\(max-width:760px\)\{[\s\S]*?\.feature-orbit-nav\{display:none!important\}/);
  assert.match(css,/\.visual-keyword-showcase\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/#expert\{display:none!important\}/);
  assert.match(css,/\.chapter-evidence\{[\s\S]*?display:block!important/);
  assert.match(css,/\.chapter-full-analysis\{[\s\S]*?display:block!important/);
  assert.match(css,/@media\(max-width:720px\)/);
});

test('reader-facing category set is simple and life-oriented',()=>{
  for(const label of ['성격','강점','일','돈','관계','회복']) assert.ok(html.includes('>'+label+'<'),label);
  for(const term of ['원국','십신','격국','용신','희신']) assert.doesNotMatch(html,new RegExp(term));
  assert.match(plain,/FRIENDLY_TITLES/);
  assert.match(plain,/strengths:'강점'/);
  assert.doesNotThrow(()=>new Function(plain));
});
