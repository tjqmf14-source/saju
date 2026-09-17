import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePrecision } from '../src/precision.js';
import { calculateSaju } from '../src/saju-engine.js';

test('default precision uses Korean average longitude and historical corrections', () => {
  assert.deepEqual(resolvePrecision({}), {
    enabled: true,
    location: 'korea',
    locationLabel: '대한민국 평균',
    longitude: 127.5,
    dayBoundary: 'midnight',
    trueSolarTime: {
      longitude: 127.5,
      applyEquationOfTime: true,
      applyHistoricalDst: true
    }
  });
});

test('known locations resolve to expected longitude', () => {
  assert.equal(resolvePrecision({ location: 'seoul' }).longitude, 126.978);
  assert.equal(resolvePrecision({ location: 'busan' }).longitude, 129.0756);
  assert.equal(resolvePrecision({ location: 'jeju' }).longitude, 126.5312);
});

test('precision can be disabled without true solar time correction', () => {
  const value = resolvePrecision({ precision: false, location: 'seoul', dayBoundary: 'jasi' });
  assert.equal(value.enabled, false);
  assert.equal(value.trueSolarTime, undefined);
  assert.equal(value.dayBoundary, 'jasi');
});

test('precision affects hour pillar at a known boundary example', () => {
  const base = { calendar:'solar', year:1990, month:5, day:15, hour:7, minute:5, gender:'male', isLeap:false };
  const plain = calculateSaju({ ...base, precision:false });
  const precise = calculateSaju({ ...base, precision:true, location:'seoul' });
  assert.equal(plain.pillars.hour.earthlyBranch, '진');
  assert.equal(precise.pillars.hour.earthlyBranch, '묘');
});

test('basis reports applied precision settings', () => {
  const chart = calculateSaju({
    calendar:'solar', year:1987, month:6, day:14, hour:11, minute:45,
    gender:'male', isLeap:false, precision:true, location:'busan', dayBoundary:'splitJasi'
  });
  assert.equal(chart.basis.location, '부산');
  assert.equal(chart.basis.longitude, 129.0756);
  assert.equal(chart.basis.dayBoundary, '분할자시 기준');
  assert.equal(chart.basis.trueSolarTime, '적용');
});
