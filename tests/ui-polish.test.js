import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../site-v9.css', import.meta.url), 'utf8').catch(()=>'');
const expectedChange = '최종 디자인은 접근성 마크업과 단일 site-v9.css 테마를 제공해야 한다.';

test('production change: 키보드 사용자를 위한 입력 바로가기 링크를 제공한다', () => {
  assert.match(html, /class="skip-link"[^>]*href="#input"/i, expectedChange);
  assert.match(html, /<main[^>]*id="main-content"/i, expectedChange);
});

test('production change: 주요 내비게이션은 접근 가능한 이름을 가진다', () => {
  assert.match(html, /<nav class="topnav"[^>]*aria-label="주요 메뉴"/i, expectedChange);
  assert.match(html, /<nav id="reportNav"[^>]*aria-label="리포트 바로가기"/i, expectedChange);
});

test('production change: 단일 clean stylesheet를 활성 테마로 로드한다', () => {
  assert.match(html, /<link rel="stylesheet" href="\/site-v9\.css">/i, expectedChange);
  assert.equal((html.match(/<link rel="stylesheet"/g) || []).length, 1, expectedChange);
});

test('production change: 명확한 focus-visible 스타일을 제공한다', () => {
  assert.match(css, /:focus-visible/i, expectedChange);
  assert.match(css, /outline\s*:/i, expectedChange);
});

test('production change: 작은 화면에서 핵심 내비게이션과 레이아웃을 재배치한다', () => {
  assert.match(css, /@media\(max-width:760px\)/i, expectedChange);
  assert.match(css, /\.topnav/i, expectedChange);
  assert.match(css, /\.form-grid/i, expectedChange);
  assert.match(css, /\.detail-chapter/i, expectedChange);
});

test('production change: reduced-motion 환경을 존중한다', () => {
  assert.match(css, /prefers-reduced-motion:no-preference/i, expectedChange);
});
