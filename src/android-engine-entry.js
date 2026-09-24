import { calculateSaju } from './saju-engine.js';

const SCHEMA_VERSION = 1;
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

function successPayload(input, chart) {
  return {
    ok: true,
    schemaVersion: SCHEMA_VERSION,
    meta: {
      birthTimeKnown: input.birthTimeKnown,
      fallbackBirthTime: input.birthTimeKnown ? null : '12:00'
    },
    chart
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

globalThis.SajutaroEngine = Object.freeze({
  schemaVersion: SCHEMA_VERSION,
  calculate: calculateForAndroid
});
