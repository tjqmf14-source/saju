import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLuckNarrativeCopy } from '../src/luck-copy.js';

test('same ten-god group gets different decade copy when pillar and life stage differ', () => {
  const first = buildLuckNarrativeCopy({
    group: '관성',
    pillar: '신축',
    age: 43,
    active: true,
  });
  const second = buildLuckNarrativeCopy({
    group: '관성',
    pillar: '경자',
    age: 53,
    active: false,
  });

  assert.notEqual(first.overview, second.overview);
  assert.notEqual(first.theme, second.theme);
  assert.notEqual(first.lead, second.lead);
  assert.notEqual(first.advice, second.advice);
});

test('decade overview is specific enough to avoid generic repeated boilerplate', () => {
  const copy = buildLuckNarrativeCopy({
    group: '인성',
    pillar: '임인',
    age: 33,
    active: false,
  });

  assert.ok(copy.overview.length >= 28);
  assert.match(copy.overview, /학습|회복|탐색|성장|기반|정리|표현|성과|책임/);
  assert.doesNotMatch(copy.overview, /삶의 배경으로 커지는 10년/);
  assert.doesNotMatch(copy.lead, /사건 하나를 맞히는 운세라기보다/);
});

test('all five role groups produce practical and distinct opportunity/caution/advice copy', () => {
  const groups = ['비겁','식상','재성','관성','인성'];
  const outputs = groups.map((group, index) => buildLuckNarrativeCopy({
    group,
    pillar: ['갑진','을사','병오','신축','임인'][index],
    age: 23 + index * 10,
    active: index === 2,
  }));

  assert.equal(new Set(outputs.map((item) => item.overview)).size, 5);
  for (const item of outputs) {
    assert.ok(item.opportunity.length >= 35);
    assert.ok(item.caution.length >= 35);
    assert.ok(item.advice.length >= 45);
  }
});
