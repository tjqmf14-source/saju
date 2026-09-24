import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../product-v18.css', import.meta.url), 'utf8');
const plain = await readFile(new URL('../src/plain-language-ui.js', import.meta.url), 'utf8');

test('Product V18 app-first interface and plain-language layer are active', () => {
  assert.match(html, /data-theme="product-v18"/);
  assert.match(html, /theme-color" content="#F5F1E8"/);
  assert.match(html, /href="\/product-v18\.css"/);
  assert.match(html, /src="\/src\/premium-ui\.js"[\s\S]*src="\/src\/plain-language-ui\.js"/);
  assert.match(css, /Product V18 — readability and evidence-first interpretation/);
  assert.match(css, /--color-surface:#fffdf7/);
  assert.match(css, /--color-brand:#b54b3f/);
  assert.match(css, /#expert\{display:none!important\}/);
});

test('static user-facing markup avoids specialist saju terms', () => {
  assert.doesNotMatch(html, /(원국|십신|오행|일간|절입|대운|세운|월운|자시 관법|진태양시)/);
});

test('plain-language module covers common specialist terms and duplicate copy', () => {
  for (const term of ['신강','신약','용신','격국','천간','지지','비겁','식상','재성','관성','인성']) {
    assert.ok(plain.includes(term), term);
  }
  assert.match(plain, /MutationObserver/);
  assert.match(plain, /dataset\.plainDuplicate/);
  assert.doesNotThrow(() => new Function(plain));
});

test('reader-facing layer simplifies labels without replacing calculated interpretation copy', () => {
  assert.match(plain, /ROLE_GUIDE/);
  for (const key of ['temperament','strengths','career','money','relationships','recovery']) {
    assert.ok(plain.includes(key), key);
  }
  assert.match(plain, /FRIENDLY_TITLES/);
  assert.match(plain, /strengths:'강점'/);
  assert.match(plain, /rewriteFriendlyAdvice/);
  const rewrite=plain.slice(plain.indexOf('function rewriteFriendlyAdvice'),plain.indexOf('for (const guide of Object.values',plain.indexOf('function rewriteFriendlyAdvice')));
  assert.doesNotMatch(rewrite, /chapter-quick-list li/);
  assert.doesNotMatch(rewrite, /body\.textContent=lines/);
});
