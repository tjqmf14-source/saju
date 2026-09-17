const DEG = Math.PI / 180;
const CALIBRATION_DEG = 0.0043;

export const JIE_TERMS = [
  { name: '소한', longitude: 285, month: 1 },
  { name: '입춘', longitude: 315, month: 2 },
  { name: '경칩', longitude: 345, month: 3 },
  { name: '청명', longitude: 15, month: 4 },
  { name: '입하', longitude: 45, month: 5 },
  { name: '망종', longitude: 75, month: 6 },
  { name: '소서', longitude: 105, month: 7 },
  { name: '입추', longitude: 135, month: 8 },
  { name: '백로', longitude: 165, month: 9 },
  { name: '한로', longitude: 195, month: 10 },
  { name: '입동', longitude: 225, month: 11 },
  { name: '대설', longitude: 255, month: 12 }
];

const GUESS_DAY = new Map([[285,6],[315,4],[345,6],[15,5],[45,6],[75,6],[105,7],[135,8],[165,8],[195,8],[225,7],[255,7]]);
const GUESS_MONTH = new Map(JIE_TERMS.map((t) => [t.longitude, t.month]));

function norm360(value) {
  return ((value % 360) + 360) % 360;
}

function signedAngle(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function julianDayFromMs(ms) {
  return ms / 86400000 + 2440587.5;
}

function msFromJulianDay(jd) {
  return (jd - 2440587.5) * 86400000;
}

function deltaTSeconds(year) {
  const t = (year - 2000) / 100;
  if (year < 2005) {
    const u = year - 2000;
    return 63.86 + 0.3345*u - 0.060374*u*u + 0.0017275*u**3 + 0.000651814*u**4 + 0.00002373599*u**5;
  }
  if (year < 2050) {
    const u = year - 2000;
    return 62.92 + 0.32217*u + 0.005589*u*u;
  }
  if (year < 2150) return -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year);
  return 64;
}

function apparentSolarLongitude(jdTT) {
  const T = (jdTT - 2451545.0) / 36525;
  const L0 = norm360(280.46646 + 36000.76983*T + 0.0003032*T*T);
  const M = norm360(357.52911 + 35999.05029*T - 0.0001537*T*T) * DEG;
  const C = (1.914602 - 0.004817*T - 0.000014*T*T) * Math.sin(M)
    + (0.019993 - 0.000101*T) * Math.sin(2*M)
    + 0.000289 * Math.sin(3*M);
  const omega = (125.04 - 1934.136*T) * DEG;
  return norm360(L0 + C - 0.00569 - 0.00478*Math.sin(omega));
}

export function getSolarTermDate(year, longitude) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100) throw new RangeError('절기 계산 연도는 1900~2100년이어야 합니다.');
  longitude = norm360(longitude);
  if (!GUESS_MONTH.has(longitude)) throw new RangeError('지원하지 않는 절기 황경입니다.');

  const month = GUESS_MONTH.get(longitude);
  const day = GUESS_DAY.get(longitude);
  const deltaT = deltaTSeconds(year);
  let jdTT = julianDayFromMs(Date.UTC(year, month - 1, day, 6, 0, 0)) + deltaT / 86400;
  const target = norm360(longitude + CALIBRATION_DEG);

  for (let i = 0; i < 10; i += 1) {
    const diff = signedAngle(apparentSolarLongitude(jdTT) - target);
    const epsilon = 0.01;
    const derivative = signedAngle(apparentSolarLongitude(jdTT + epsilon) - apparentSolarLongitude(jdTT - epsilon)) / (2 * epsilon);
    jdTT -= diff / derivative;
  }

  return new Date(msFromJulianDay(jdTT - deltaT / 86400));
}

export function toKstEpochMs(parts) {
  const { year, month, day, hour = 0, minute = 0 } = parts;
  return Date.UTC(year, month - 1, day, hour - 9, minute, 0);
}

export function getJieBoundariesAround(year) {
  const rows = [];
  for (let y = year - 1; y <= year + 1; y += 1) {
    if (y < 1900 || y > 2100) continue;
    for (const term of JIE_TERMS) rows.push({ ...term, year: y, date: getSolarTermDate(y, term.longitude) });
  }
  return rows.sort((a, b) => a.date - b.date);
}

export function getPreviousNextJie(parts) {
  const birthMs = toKstEpochMs(parts);
  const boundaries = getJieBoundariesAround(parts.year);
  let previous = null;
  let next = null;
  for (const item of boundaries) {
    const ms = item.date.getTime();
    if (ms <= birthMs) previous = item;
    if (ms > birthMs) { next = item; break; }
  }
  return { previous, next };
}

export function getMonthBoundaryIndex(parts) {
  const birthMs = toKstEpochMs(parts);
  const boundaries = getJieBoundariesAround(parts.year);
  let active = null;
  for (const item of boundaries) {
    if (item.date.getTime() <= birthMs) active = item;
    else break;
  }
  if (!active) throw new Error('월주 절기 경계를 찾지 못했습니다.');
  const branchIndexByLongitude = new Map([[315,2],[345,3],[15,4],[45,5],[75,6],[105,7],[135,8],[165,9],[195,10],[225,11],[255,0],[285,1]]);
  return { branchIndex: branchIndexByLongitude.get(active.longitude), term: active };
}

export function formatKst(date) {
  const kst = new Date(date.getTime() + 9 * 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${kst.getUTCFullYear()}-${pad(kst.getUTCMonth()+1)}-${pad(kst.getUTCDate())} ${pad(kst.getUTCHours())}:${pad(kst.getUTCMinutes())} KST`;
}
