import { LUNAR_INFO, LUNAR_MIN_YEAR, LUNAR_MAX_YEAR } from './lunar-data.js';

const DAY_MS = 86400000;
const BASE_UTC = Date.UTC(1900, 0, 31);
const MIN_SOLAR = Date.UTC(1900, 0, 31);
const MAX_SOLAR = Date.UTC(2100, 11, 31);

function info(year) {
  if (year < LUNAR_MIN_YEAR || year > LUNAR_MAX_YEAR) {
    throw new RangeError(`지원 연도는 ${LUNAR_MIN_YEAR}~${LUNAR_MAX_YEAR}년입니다.`);
  }
  return LUNAR_INFO[year - LUNAR_MIN_YEAR];
}

export function leapMonth(year) {
  return info(year) & 0xf;
}

export function isLeapMonth(year, month) {
  return leapMonth(year) === Number(month);
}

export function leapDays(year) {
  if (!leapMonth(year)) return 0;
  return (info(year) & 0x10000) ? 30 : 29;
}

export function lunarMonthDays(year, month) {
  if (month < 1 || month > 12) throw new RangeError('음력 월은 1~12 사이여야 합니다.');
  return (info(year) & (0x10000 >> month)) ? 30 : 29;
}

export function lunarYearDays(year) {
  let total = 348;
  let mask = 0x8000;
  for (let month = 1; month <= 12; month += 1, mask >>= 1) {
    if (info(year) & mask) total += 1;
  }
  return total + leapDays(year);
}

function validateSolarParts({ year, month, day }) {
  if (![year, month, day].every(Number.isInteger)) throw new TypeError('날짜는 정수로 입력해야 합니다.');
  const utc = Date.UTC(year, month - 1, day);
  const date = new Date(utc);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new RangeError('존재하지 않는 양력 날짜입니다.');
  }
  if (utc < MIN_SOLAR || utc > MAX_SOLAR) {
    throw new RangeError('양력 날짜는 1900-01-31~2100-12-31 범위여야 합니다.');
  }
  return utc;
}

export function solarToLunar(parts) {
  const utc = validateSolarParts(parts);
  let offset = Math.floor((utc - BASE_UTC) / DAY_MS);
  let year = LUNAR_MIN_YEAR;

  while (year <= LUNAR_MAX_YEAR) {
    const days = lunarYearDays(year);
    if (offset < days) break;
    offset -= days;
    year += 1;
  }
  if (year > LUNAR_MAX_YEAR) throw new RangeError('음력 변환 지원 범위를 벗어났습니다.');

  const leap = leapMonth(year);
  let month = 1;
  let isLeap = false;
  while (month <= 12) {
    const days = isLeap ? leapDays(year) : lunarMonthDays(year, month);
    if (offset < days) break;
    offset -= days;
    if (leap === month && !isLeap) {
      isLeap = true;
    } else {
      if (isLeap) isLeap = false;
      month += 1;
    }
  }

  return { year, month, day: offset + 1, isLeap };
}

export function lunarToSolar(year, month, day, isLeap = false) {
  year = Number(year);
  month = Number(month);
  day = Number(day);
  if (![year, month, day].every(Number.isInteger)) throw new TypeError('날짜는 정수로 입력해야 합니다.');
  info(year);
  if (month < 1 || month > 12) throw new RangeError('음력 월은 1~12 사이여야 합니다.');
  if (isLeap && !isLeapMonth(year, month)) throw new RangeError(`${year}년 음력 ${month}월은 윤달이 아닙니다.`);

  const maxDay = isLeap ? leapDays(year) : lunarMonthDays(year, month);
  if (day < 1 || day > maxDay) throw new RangeError(`해당 음력 월의 날짜는 1~${maxDay}일까지입니다.`);

  let offset = 0;
  for (let y = LUNAR_MIN_YEAR; y < year; y += 1) offset += lunarYearDays(y);

  const leap = leapMonth(year);
  for (let m = 1; m < month; m += 1) {
    offset += lunarMonthDays(year, m);
    if (leap === m) offset += leapDays(year);
  }
  if (isLeap) offset += lunarMonthDays(year, month);
  offset += day - 1;

  const date = new Date(BASE_UTC + offset * DAY_MS);
  const result = { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  validateSolarParts(result);
  return result;
}

export function normalizeBirthDate(input) {
  const { calendar = 'solar', year, month, day, isLeap = false } = input;
  if (calendar === 'solar') {
    validateSolarParts({ year: Number(year), month: Number(month), day: Number(day) });
    return { year: Number(year), month: Number(month), day: Number(day) };
  }
  if (calendar === 'lunar') return lunarToSolar(Number(year), Number(month), Number(day), Boolean(isLeap));
  throw new RangeError('달력 종류는 solar 또는 lunar여야 합니다.');
}
