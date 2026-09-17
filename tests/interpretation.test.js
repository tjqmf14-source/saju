import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaju, calculateYearFlows, calculateMonthFlows } from '../src/saju-engine.js';
import { calculateSajuMbti } from '../src/mbti.js';
import { buildDetailedInterpretation } from '../src/interpretation.js';

const chart = calculateSaju({
  calendar:'solar', year:1987, month:6, day:14, hour:11, minute:45,
  gender:'male', isLeap:false, precision:true, location:'busan'
});
const mbti = calculateSajuMbti(chart);
const year = 2026;
const yearFlow = calculateYearFlows(chart, year, 1)[0];
const monthFlows = calculateMonthFlows(chart, year);
const report = buildDetailedInterpretation(chart, mbti, yearFlow, monthFlows);

for (const key of ['overview','temperament','innerOuter','strengths','balance','career','money','love','relationships','recovery','year','luck','technical']) {
  test(`detailed interpretation contains ${key}`, () => {
    assert.ok(report[key]);
    assert.equal(typeof report[key].title, 'string');
    assert.equal(typeof report[key].lead, 'string');
    assert.ok(report[key].lead.length >= 20);
    assert.ok(Array.isArray(report[key].paragraphs));
    assert.ok(report[key].paragraphs.length >= 2);
    assert.ok(report[key].paragraphs.every((p) => typeof p === 'string' && p.length >= 45));
  });
}

test('overview includes MBTI and calculation basis context', () => {
  assert.match(report.overview.paragraphs.join(' '), new RegExp(mbti.type));
  assert.match(report.overview.paragraphs.join(' '), /진태양시|경도|정밀/);
});

test('balance interpretation does not pretend school-dependent 용신 is a deterministic fact', () => {
  const text = `${report.balance.lead} ${report.balance.paragraphs.join(' ')}`;
  assert.match(text, /신강|신약|균형/);
  assert.match(text, /학파|참고|단정/);
});

test('technical section explains exact month-flow solar-term boundaries', () => {
  const text = `${report.technical.lead} ${report.technical.paragraphs.join(' ')}`;
  assert.match(text, /절입|절기/);
  assert.match(text, /입춘/);
});
