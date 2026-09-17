import {
  solarToLunar as coreSolarToLunar,
  lunarToSolar as coreLunarToSolar,
  isValidSolarDate
} from 'manseryeok';

export function solarToLunar({ year, month, day }) {
  if (!isValidSolarDate(year, month, day)) throw new RangeError('존재하지 않는 양력 날짜입니다.');
  if (year < 1900 || year > 2100) throw new RangeError('지원 연도는 1900~2100년입니다.');
  const result = coreSolarToLunar(year, month, day);
  return { year: result.year, month: result.month, day: result.day, isLeap: result.isLeapMonth };
}

export function lunarToSolar(year, month, day, isLeap = false) {
  if (year < 1900 || year > 2100) throw new RangeError('지원 연도는 1900~2100년입니다.');
  try {
    const result = coreLunarToSolar(year, month, day, Boolean(isLeap));
    return { year: result.year, month: result.month, day: result.day };
  } catch (error) {
    if (isLeap) throw new RangeError(`${year}년 음력 ${month}월 윤달 입력이 올바르지 않습니다.`);
    throw error;
  }
}

export function isLeapMonth(year, month) {
  try {
    coreLunarToSolar(year, month, 1, true);
    return true;
  } catch {
    return false;
  }
}

export function normalizeBirthDate(input) {
  const year = Number(input.year);
  const month = Number(input.month);
  const day = Number(input.day);
  if (input.calendar === 'lunar') return lunarToSolar(year, month, day, Boolean(input.isLeap));
  if (input.calendar !== 'solar') throw new RangeError('달력 종류는 solar 또는 lunar여야 합니다.');
  if (!isValidSolarDate(year, month, day)) throw new RangeError('존재하지 않는 양력 날짜입니다.');
  if (year < 1900 || year > 2100) throw new RangeError('지원 연도는 1900~2100년입니다.');
  return { year, month, day };
}
