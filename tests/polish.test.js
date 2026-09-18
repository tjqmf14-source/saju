import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ui = await readFile(new URL('../src/premium-ui.js', import.meta.url), 'utf8');

test('clean v9 stylesheet is the only active site theme', () => {
  assert.match(html, /<link[^>]+href="\/site-v9\.css"/);
  assert.equal((html.match(/<link rel="stylesheet"/g) || []).length, 1);
  assert.doesNotMatch(html, /href="\/(?:agency-v6|reference-v\d+|premium|polish|feedback-v2|feedback-v3|redesign-v5)\.css"/);
});

test('keyboard users get a skip link and labelled primary navigation', () => {
  assert.match(html, /class="skip-link"[^>]+href="#input"/);
  assert.match(html, /<nav class="topnav"[^>]+aria-label="주요 메뉴"/);
  assert.match(html, /<nav id="reportNav"[^>]+aria-label="리포트 바로가기"/);
});

test('detailed report exposes balance and technical accuracy chapters', () => {
  const ordered = ui.match(/const ordered=\[([^\]]+)\]/)?.[1] || '';
  assert.match(ordered, /'balance'/);
  assert.match(ordered, /'technical'/);
});

test('tarot controls expose an accessible description hook', () => {
  assert.match(html, /id="tarotHelp"/);
  assert.match(html, /id="drawTarot"[^>]+aria-describedby="tarotHelp"/);
});
