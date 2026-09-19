import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v9.css', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('production saju theme follows the supplied dark navy and antique-gold reference', () => {
  assert.match(css, /REFERENCE SCREENSHOT LOCK/);
  assert.match(css, /#05111e/);
  assert.match(css, /url\('\/oracle\/hero-scene\.svg'\)/);
  assert.match(css, /daily-primary-score[\s\S]*border-radius:50%/);
});

test('tarot starts with an explicit fan-and-pick interaction', () => {
  assert.match(html, /카드 섞어 펼치기/);
  assert.match(html, /끌리는 카드를 직접 선택/);
  assert.match(ui, /prepareTarotFan/);
  assert.match(ui, /class="tarot-pick/);
  assert.match(ui, /function selectTarotCard/);
  assert.match(css, /\.tarot-pick-deck\{/);
});

test('solar-term month flow is labelled by actual boundary month', () => {
  assert.match(ui, /function kstMonthNumber/);
  assert.match(ui, /월 절기운/);
  assert.match(ui, /양력 월초가 아니라/);
});
