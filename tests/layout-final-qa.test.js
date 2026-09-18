import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const css=await readFile(new URL('../agency-v6.css',import.meta.url),'utf8');

test('annual flow keeps one quarterly plan and one aligned 12-month grid',()=>{
  assert.doesNotMatch(html,/id="yearActionPlan"/);
  assert.equal((html.match(/id="tojungQuarterGrid"/g)||[]).length,1);
  assert.equal((html.match(/id="monthForecast"/g)||[]).length,1);
  assert.match(css,/B CONCEPT FINAL QA/);
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\);\n  gap:1px/);
});

test('decade overview uses responsive readable tracks instead of narrow fixed cards',()=>{
  assert.match(css,/grid-template-columns:repeat\(auto-fit,minmax\(180px,1fr\)\)/);
  assert.match(css,/\.luck-overview-item[^}]*word-break:keep-all/s);
  assert.match(css,/\.luck-step[^}]*min-width:0/s);
});

test('plain natal chart owns its width and collapses 4 to 2 to 1 pillars',()=>{
  assert.match(css,/#expert \.expert-content-shell[^}]*min-width:0/s);
  assert.match(css,/#expert \.pillar-grid[^}]*repeat\(4,minmax\(0,1fr\)\)/s);
  assert.match(css,/@media\(max-width:900px\)[\s\S]*#expert \.pillar-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:560px\)[\s\S]*#expert \.pillar-grid\{grid-template-columns:1fr/);
});
