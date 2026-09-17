import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, calculateTodayFlow } from '../src/saju-engine.js';
import { TAROT_DECK, MAJOR_ARCANA, drawTarot, interpretSpread } from '../src/tarot.js';
import { buildPlainChartGuide } from '../src/plain-chart.js';
import { calculateDailyScores } from '../src/daily-score.js';
import { readFile } from 'node:fs/promises';

const chart = calculateSaju({
  calendar:'solar', year:1987, month:6, day:14, hour:11, minute:45,
  gender:'male', isLeap:false, precision:true, location:'busan'
});
const today = calculateTodayFlow(chart, new Date('2026-09-17T03:00:00.000Z'));

test('tarot deck contains the full 78-card Rider-Waite-Smith structure', () => {
  assert.equal(TAROT_DECK.length, 78);
  assert.equal(MAJOR_ARCANA.length, 22);
  assert.equal(new Set(TAROT_DECK.map((card)=>card.code)).size, 78);
  assert.equal(TAROT_DECK.filter((card)=>card.arcana==='major').length, 22);
  assert.equal(TAROT_DECK.filter((card)=>card.arcana==='minor').length, 56);
});

test('every tarot card has local RWS art and readable interpretation fields', () => {
  for (const card of TAROT_DECK) {
    assert.match(card.image, /^\/tarot-rws\/.+\.jpg$/);
    assert.ok(card.name.length > 0);
    assert.ok(card.en.length > 0);
    assert.ok(card.keywords.length > 3);
    assert.ok(card.upright.length >= 20);
    assert.ok(card.reversed.length >= 20);
    assert.ok(card.advice.length >= 20);
    assert.ok(card.symbolism.length >= 20);
  }
});

test('full-deck draw is deterministic and has no duplicate cards', () => {
  const sequence=[0.02,0.18,0.42,0.63,0.81,0.27,0.55,0.73];
  let i=0;
  const draw=drawTarot(3,()=>sequence[i++%sequence.length]);
  assert.equal(draw.length,3);
  assert.equal(new Set(draw.map((item)=>item.card.code)).size,3);
});

test('tarot interpretation exposes meaning, symbolism and practical advice', () => {
  const draw=drawTarot(3,()=>0.31);
  const reading=interpretSpread('career',draw);
  for (const item of reading) {
    assert.ok(item.meaning.length >= 20);
    assert.ok(item.symbolism.length >= 20);
    assert.ok(item.advice.length >= 20);
    assert.ok(item.text.length >= 80);
  }
});

test('plain chart guide starts from everyday language and explains evidence second', () => {
  const guide=buildPlainChartGuide(chart);
  assert.ok(guide.headline.length >= 20);
  for (const key of ['personality','work','money','relationships','recovery']) {
    assert.ok(guide.sections[key].summary.length >= 45);
    assert.ok(guide.sections[key].lifeExample.length >= 35);
    assert.ok(guide.sections[key].evidence.length >= 20);
  }
  assert.ok(guide.glossary.length >= 5);
});

test('today flow scores are deterministic, complete and bounded', () => {
  const first=calculateDailyScores(chart,today);
  const second=calculateDailyScores(chart,today);
  assert.deepEqual(first,second);
  assert.deepEqual(Object.keys(first),['overall','money','love','work','condition']);
  for (const item of Object.values(first)) {
    assert.ok(Number.isInteger(item.score));
    assert.ok(item.score >= 0 && item.score <= 100);
    assert.match(item.label,/매우 좋음|좋음|무난|조절 필요|신중/);
    assert.ok(item.reason.length >= 20);
  }
});

test('browser runtime keeps tarot images local and includes an asset sync script', async () => {
  const ui=await readFile(new URL('../src/premium-ui.js',import.meta.url),'utf8');
  const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
  const sync=await readFile(new URL('../scripts/sync-rws-assets.js',import.meta.url),'utf8');
  assert.doesNotMatch(ui,/raw\.githubusercontent|wikimedia|commons\.wikimedia/);
  assert.match(ui,/tarot-card-image/);
  assert.match(pkg.scripts.predev,/sync-rws-assets/);
  assert.match(pkg.scripts.prebuild,/sync-rws-assets/);
  assert.match(sync,/78/);
});
