import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../product-v3.css', import.meta.url), 'utf8');
const plain = await readFile(new URL('../src/plain-language-ui.js', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('Product V3 presentation layer is active on top of the stable V17 base', () => {
  assert.match(html, /data-theme="product-v3"/);
  assert.match(html, /href="\/product-v17\.css"[\s\S]*href="\/product-v3\.css"/);
  assert.match(html, /theme-color" content="#F5F6F3"/);
  assert.match(css, /Naesaju Product UI v3/);
  assert.match(css, /--v3-brand:#2f5d4a/);
});

test('V3 plain-language layer does not replace personalized calculated advice', () => {
  assert.doesNotMatch(plain, /ROLE_GUIDE/);
  assert.doesNotMatch(plain, /rewriteFriendlyAdvice/);
  assert.doesNotMatch(plain, /chapter-quick-list li/);
  assert.match(plain, /Calculated interpretation copy is the source of truth/);
  assert.match(plain, /MutationObserver/);
  assert.match(plain, /markExactDuplicateParagraphs/);
  assert.doesNotThrow(() => new Function(plain));
});

test('V3 reader-facing summary uses five primary life categories', () => {
  const keywordCards=[...html.matchAll(/class="visual-keyword-card[^"]*"[^>]+data-report-key="([^"]+)"/g)].map((match)=>match[1]);
  assert.deepEqual(keywordCards,['temperament','career','money','relationships','recovery']);
  for (const label of ['>나<','>일<','>돈<','>관계<','>회복<']) assert.ok(html.includes(label), label);
  assert.doesNotMatch(html, /data-report-key="strengths"[^>]*class="visual-keyword-card/);
});

test('deep report keeps only seven non-duplicated chapters in the primary reading flow', () => {
  assert.match(ui, /const ordered=\['overview','temperament','strengths','career','money','relationships','recovery'\]/);
  assert.match(ui, /\['한 줄 요약','왜 이렇게 보나요','생활에서 써먹기'\]/);
  assert.match(ui, /<details class="chapter-evidence"><summary>해석 근거 보기<\/summary>/);
  assert.match(ui, /<details class="chapter-full-analysis"><summary>깊이 읽기<\/summary>/);
  assert.doesNotMatch(ui, /const ordered=\[[^\]]*'innerOuter'/);
  assert.doesNotMatch(ui, /const ordered=\[[^\]]*'technical'/);
});
