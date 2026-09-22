import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v12.css', import.meta.url), 'utf8');
const plain = await readFile(new URL('../src/plain-language-ui.js', import.meta.url), 'utf8');

test('white interface and plain-language layer are active', () => {
  assert.match(html, /data-theme="clean-white"/);
  assert.match(html, /theme-color" content="#ffffff"/);
  assert.match(html, /src="\/src\/premium-ui\.js"[\s\S]*src="\/src\/plain-language-ui\.js"/);
  assert.match(css, /NAESAJU CLEAN WHITE UI V13/);
  assert.match(css, /background:#fff!important/);
  assert.match(css, /#expert/);
});

test('static user-facing markup avoids specialist saju terms', () => {
  assert.doesNotMatch(html, /(원국|십신|오행|일간|절입|대운|세운|월운|자시 관법|진태양시)/);
});

test('plain-language module covers common specialist terms and duplicate copy', () => {
  for (const term of ['신강','신약','용신','격국','천간','지지','비겁','식상','재성','관성','인성']) {
    assert.ok(plain.includes(term), term);
  }
  assert.match(plain, /MutationObserver/);
  assert.match(plain, /data\.plainDuplicate/);
  assert.doesNotThrow(() => new Function(plain));
});
