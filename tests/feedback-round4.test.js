import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const v2js = await readFile(new URL('../src/feedback-v2.js', import.meta.url), 'utf8');
const v4js = await readFile(new URL('../src/feedback-v4.js', import.meta.url), 'utf8').catch(()=> '');
const v4css = await readFile(new URL('../polish-v4.css', import.meta.url), 'utf8').catch(()=> '');

test('v4 patch is loaded through the existing post-render enhancement module', () => {
  assert.match(v2js, /import ['"]\.\/feedback-v4\.js['"]/);
  assert.match(v4js, /import ['"]\.\.\/polish-v4\.css['"]/);
});

test('reversed tarot keeps RWS artwork visually upright while retaining reversed meaning', () => {
  assert.match(v4css, /\.tarot-illustration\.reversed-art\s*\{[^}]*transform:\s*none\s*!important/i);
  assert.match(v4js, /classList\.remove\(['"]reversed-art['"]\)/);
});

test('tarot interpretation uses a readable stacked layout instead of narrow columns', () => {
  assert.match(v4css, /\.tarot-reading-grid\s*\{[^}]*grid-template-columns:\s*1fr/i);
  assert.match(v4css, /\.tarot-reading\s*\{[^}]*max-width:/i);
});

test('page polish aligns content margins and reduces table-box visual density', () => {
  assert.match(v4css, /\.main-column\s*\{[^}]*padding-inline:\s*clamp\(/i);
  assert.match(v4css, /\.panel-flow\b/);
  assert.match(v4css, /\.luck-step\s*\{[^}]*grid-template-columns:/i);
});

test('decade reading contains deep, advice-oriented narrative instead of generic boilerplate', () => {
  assert.match(v4js, /function buildLuckNarrative\(/);
  assert.match(v4js, /큰 주제/);
  assert.match(v4js, /기회/);
  assert.match(v4js, /주의할 점/);
  assert.match(v4js, /조언/);
  assert.doesNotMatch(v4js, /이 시기부터 새로운 10년의 배경 주제가 시작됩니다/);
});

test('annual and monthly copy is expanded into user-facing guidance', () => {
  assert.match(v4js, /function enhanceYearCopy\(/);
  assert.match(v4js, /이번 흐름에서 중요한 것은/);
  assert.match(v4js, /생활에서 체감할 수 있는 방식/);
  assert.match(v4js, /서두르기보다/);
});
