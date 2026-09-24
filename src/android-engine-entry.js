import {
  calculateSaju,
  calculateTodayFlow,
  calculateYearFlow,
  calculateMonthFlows
} from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { buildDetailedInterpretation } from './interpretation.js';
import { calculateDailyScores } from './daily-score.js';
import { monthFlowCopy } from './flow-copy.js';
import { drawTarot, interpretSpread } from './tarot.js';

const SCHEMA_VERSION = 2;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

function integerPart(value, name) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    throw new TypeError(`${name} 입력이 올바르지 않습니다.`);
  }
  return number;
}

export function normalizeAndroidRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new TypeError('입력 형식이 올바르지 않습니다.');
  }

  const calendar = request.calendar === 'lunar' ? 'lunar' : 'solar';
  const dateMatch = DATE_PATTERN.exec(String(request.birthDate || ''));
  if (!dateMatch) {
    throw new TypeError('생년월일 입력이 올바르지 않습니다.');
  }

  const birthTimeKnown = request.birthTimeKnown !== false;
  const normalizedTime = birthTimeKnown ? String(request.birthTime || '') : '12:00';
  const timeMatch = TIME_PATTERN.exec(normalizedTime);
  if (!timeMatch) {
    throw new TypeError('출생시간 입력이 올바르지 않습니다.');
  }

  const year = integerPart(dateMatch[1], '출생연도');
  const month = integerPart(dateMatch[2], '출생월');
  const day = integerPart(dateMatch[3], '출생일');
  const hour = integerPart(timeMatch[1], '출생시간');
  const minute = integerPart(timeMatch[2], '출생분');

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new RangeError('출생시간 입력이 올바르지 않습니다.');
  }

  return {
    calendar,
    year,
    month,
    day,
    hour,
    minute,
    isLeap: Boolean(request.isLeap),
    gender: request.gender === 'female' ? 'female' : 'male',
    precision: request.precision !== false,
    location: request.location || 'korea',
    dayBoundary: request.dayBoundary || 'midnight',
    birthTimeKnown
  };
}

function stripQuickPrefix(text = '') {
  return String(text)
    .replace(/^한 줄 요약:\s*/, '')
    .replace(/^왜 그런가요\?\s*/, '')
    .replace(/^생활에서는:\s*/, '')
    .trim();
}

function readingSection(report, key, title) {
  const section = report?.[key] || {};
  const quick = Array.isArray(section.quick) ? section.quick.map(stripQuickPrefix) : [];
  return {
    id: key,
    title,
    summary: quick[0] || stripQuickPrefix(section.lead || ''),
    reason: quick[1] || '',
    action: quick[2] || ''
  };
}

function nativePayload(chart, now = new Date()) {
  const today = calculateTodayFlow(chart, now);
  const scores = calculateDailyScores(chart, today);
  const year = calculateYearFlow(chart, today.date.year);
  const months = calculateMonthFlows(chart, today.date.year);
  const mbti = calculateSajuMbti(chart);
  const report = buildDetailedInterpretation(chart, mbti, year, months);
  const monthGuides = months.map((flow, index) => ({
    month: index + 1,
    korean: flow.korean,
    ...monthFlowCopy(flow)
  }));

  const currentMonth = monthGuides[Math.max(0, Math.min(monthGuides.length - 1, today.date.month - 1))];

  return {
    headline: readingSection(report, 'overview', '나를 한 문장으로').summary,
    sajuSections: [
      readingSection(report, 'overview', '나를 한 문장으로'),
      readingSection(report, 'strengths', '내가 잘하는 것'),
      readingSection(report, 'temperament', '힘들어지는 상황'),
      readingSection(report, 'career', '일'),
      readingSection(report, 'money', '돈'),
      readingSection(report, 'relationships', '관계'),
      readingSection(report, 'recovery', '생활과 회복')
    ],
    today: {
      headline: scores.overall.reason,
      items: [
        { id: 'work', title: '일', label: scores.work.label, text: scores.work.reason },
        { id: 'money', title: '돈', label: scores.money.label, text: scores.money.reason },
        { id: 'love', title: '관계', label: scores.love.label, text: scores.love.reason },
        { id: 'condition', title: '컨디션', label: scores.condition.label, text: scores.condition.reason }
      ],
      good: currentMonth?.action || '오늘 할 수 있는 한 가지를 작게 정해 실행해 보세요.',
      avoid: currentMonth?.check || '한 번에 너무 많은 결정을 내리지 마세요.'
    },
    year: readingSection(report, 'year', '올해의 흐름'),
    months: monthGuides,
    mbti: mbti.type
  };
}

function successPayload(input, chart) {
  return {
    ok: true,
    schemaVersion: SCHEMA_VERSION,
    meta: {
      birthTimeKnown: input.birthTimeKnown,
      fallbackBirthTime: input.birthTimeKnown ? null : '12:00'
    },
    chart,
    native: nativePayload(chart)
  };
}

function failurePayload(error) {
  return {
    ok: false,
    schemaVersion: SCHEMA_VERSION,
    error: {
      code: 'INVALID_REQUEST',
      message: '입력 정보를 확인해 주세요.',
      detail: error instanceof Error ? error.message : String(error)
    }
  };
}

export function calculateForAndroid(jsonString) {
  try {
    const request = JSON.parse(String(jsonString));
    const normalized = normalizeAndroidRequest(request);
    const { birthTimeKnown, ...engineInput } = normalized;
    const chart = calculateSaju(engineInput);
    return JSON.stringify(successPayload(normalized, chart));
  } catch (error) {
    return JSON.stringify(failurePayload(error));
  }
}

export function drawTarotForAndroid(jsonString) {
  try {
    const request = JSON.parse(String(jsonString || '{}'));
    const count = Number(request.count || 1);
    const requestedMode = ['question', 'love', 'money', 'career', 'today'].includes(request.mode)
      ? request.mode
      : 'question';
    const mode = count === 1 ? 'today' : requestedMode === 'today' ? 'question' : requestedMode;
    const draw = drawTarot(count);
    const spread = interpretSpread(mode, draw).map((item) => ({
      position: item.position,
      reversed: item.reversed,
      orientation: item.orientation,
      meaning: item.meaning,
      advice: item.advice,
      card: {
        code: item.card.code,
        name: item.card.name,
        en: item.card.en,
        keywords: item.card.keywords,
        image: item.card.image
      }
    }));

    return JSON.stringify({
      ok: true,
      schemaVersion: SCHEMA_VERSION,
      mode,
      count,
      spread
    });
  } catch (error) {
    return JSON.stringify(failurePayload(error));
  }
}

globalThis.SajutaroEngine = Object.freeze({
  schemaVersion: SCHEMA_VERSION,
  calculate: calculateForAndroid,
  drawTarot: drawTarotForAndroid
});
