import { calculateFourPillars } from 'manseryeok';
import { lunarToSolar, solarToLunar } from './calendar.js';
import { TOJEONG_144 } from './data/tojeong-144.js';

const STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const MONTH_BRANCHES = ['인','묘','진','사','오','미','신','유','술','해','자','축'];

const SUNCHEON = {
  갑:9,기:9,을:8,경:8,병:7,신:7,정:6,임:6,무:5,계:5,
  자:9,오:9,축:8,미:8,인:7,신:7,묘:6,유:6,진:5,술:5,사:4,해:4
};

const JUNGCHEON = {
  갑:11,기:11,을:10,경:10,병:9,신:9,정:8,임:8,무:7,계:7,
  진:11,술:11,축:11,미:11,신:10,유:10,해:9,자:9,인:8,묘:8,사:7,오:7
};

const FIRST_MONTH_STEM = {
  갑:'병',기:'병',을:'무',경:'무',병:'경',신:'경',정:'임',임:'임',무:'갑',계:'갑'
};

const POSITIVE = ['성취','기쁨','경사','귀인','형통','재물','복','평안','성공','번창','순조','대길'];
const CAUTION = ['구설','손재','근심','불리','위태','질병','횡액','분쟁','실패','허망','조심','재앙'];

function mod(value, divisor) {
  return value % divisor || divisor;
}

function yearGanji(year) {
  const index = ((year - 1984) % 60 + 60) % 60;
  return {
    stem: STEMS[index % 10],
    branch: BRANCHES[index % 12],
    korean: STEMS[index % 10] + BRANCHES[index % 12]
  };
}

function lunarMonthGanji(yearStem, month) {
  const firstStem = FIRST_MONTH_STEM[yearStem];
  const firstIndex = STEMS.indexOf(firstStem);
  const stem = STEMS[(firstIndex + month - 1) % 10];
  const branch = MONTH_BRANCHES[month - 1];
  return { stem, branch, korean: stem + branch };
}

function lunarMonthDays(year, month) {
  try {
    lunarToSolar(year, month, 30, false);
    return 30;
  } catch {
    return 29;
  }
}

function normalizeBirthLunar(input) {
  const year = Number(input.year);
  const month = Number(input.month);
  const day = Number(input.day);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new TypeError('생년월일 입력이 올바르지 않습니다.');
  }
  if (input.calendar === 'lunar') {
    lunarToSolar(year, month, day, Boolean(input.isLeap));
    return { year, month, day, isLeap: Boolean(input.isLeap) };
  }
  return solarToLunar({ year, month, day });
}

function dayGanjiFromLunar(year, month, day) {
  const solar = lunarToSolar(year, month, day, false);
  const detail = calculateFourPillars({
    year: solar.year,
    month: solar.month,
    day: solar.day,
    hour: 12,
    minute: 0,
    isLunar: false,
    gender: 'male',
    dayBoundary: 'midnight'
  });
  return {
    stem: detail.day.heavenlyStem,
    branch: detail.day.earthlyBranch,
    korean: detail.day.heavenlyStem + detail.day.earthlyBranch
  };
}

function signalCount(text, words) {
  return words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
}

const MONTH_ACTIONS = [
  '시작 전에 조건을 한 줄로 적고, 가장 작은 첫 단계부터 실행하세요.',
  '관계된 사람과 기대·역할을 먼저 맞춘 뒤 일정을 확정하세요.',
  '추가 결정보다 현재 계획에서 빠진 정보 하나를 먼저 확인하세요.',
  '중간 점검 날짜를 정하고 결과가 약한 일 하나를 줄이세요.',
  '말이나 계약은 즉시 확정하지 말고 핵심 조건을 다시 읽어보세요.',
  '일정이 몰리면 우선순위 두 가지만 남기고 나머지는 미루세요.',
  '상반기 결과를 숫자로 정리하고 이어갈 일과 끝낼 일을 나누세요.',
  '새 기회는 비용·시간·되돌릴 수 있는지 세 가지를 확인한 뒤 선택하세요.',
  '관계나 협업은 애매한 기대를 남기지 말고 역할을 문장으로 합의하세요.',
  '체력이 떨어질수록 큰 결정보다 마감과 회복을 먼저 관리하세요.',
  '남은 자원과 일정을 다시 계산해 올해 안에 끝낼 한 가지를 고르세요.',
  '성과와 실수를 함께 기록하고 내년으로 넘길 과제를 한 가지로 줄이세요.'
];

function modernize(text, month = 0) {
  const positive = signalCount(text, POSITIVE);
  const caution = signalCount(text, CAUTION);
  const tone = positive >= caution + 2
    ? '기회를 살리기 좋은 흐름'
    : caution >= positive + 2
      ? '속도보다 점검이 중요한 흐름'
      : '기회와 점검이 함께 필요한 흐름';

  const topics = [];
  if (/재물|손재|횡재|가산|재수/.test(text)) topics.push('돈');
  if (/구설|친구|사람|부부|이성|가정|가족/.test(text)) topics.push('관계');
  if (/질병|건강|몸|피로/.test(text)) topics.push('컨디션');
  if (/출행|타향|이동|동분서주/.test(text)) topics.push('이동');
  if (/일|경영|성취|사업|공로/.test(text)) topics.push('일');
  if (!topics.length) topics.push('생활');

  let action = '한 번에 크게 움직이기보다 확인 가능한 한 단계부터 진행하세요.';
  if (topics.includes('돈')) action = '돈과 관련된 결정은 기대보다 조건·비용·손실 한도를 먼저 숫자로 확인하세요.';
  if (topics.includes('관계')) action = '중요한 관계에서는 추측보다 사실과 요청을 짧게 확인하는 대화를 우선하세요.';
  if (topics.includes('컨디션')) action = '일정을 무리하게 늘리지 말고 회복 시간을 확보하세요. 지속되는 증상은 실제 의료 판단을 우선하세요.';
  if (topics.includes('이동')) action = '이동이나 변화가 필요하다면 일정·비용·대안을 먼저 확인한 뒤 결정하세요.';

  if (month >= 1 && month <= 12) action = MONTH_ACTIONS[month - 1];

  return {
    tone,
    topics: [...new Set(topics)],
    action,
    note: '전통 문구를 현대적인 생활 언어로 요약한 참고 해설입니다. 사건을 확정적으로 예측하지 않습니다.'
  };
}

export function calculateTojeong(input, targetYear = new Date().getFullYear()) {
  if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 2050) {
    throw new RangeError('토정비결 대상 연도는 1900~2050 범위여야 합니다.');
  }

  const birth = normalizeBirthLunar(input);
  const year = yearGanji(targetYear);
  const month = lunarMonthGanji(year.stem, birth.month);
  const monthDays = lunarMonthDays(targetYear, birth.month);
  const effectiveDay = Math.min(birth.day, monthDays);
  const day = dayGanjiFromLunar(targetYear, birth.month, effectiveDay);

  const koreanAge = targetYear - birth.year + 1;
  const taese = JUNGCHEON[year.stem] + JUNGCHEON[year.branch];
  const wolgeon = SUNCHEON[month.stem] + SUNCHEON[month.branch];
  const iljin = SUNCHEON[day.stem] + JUNGCHEON[day.branch];

  const sang = mod(koreanAge + taese, 8);
  const jung = mod(monthDays + wolgeon, 6);
  const ha = mod(effectiveDay + iljin, 3);
  const code = String(sang) + String(jung) + String(ha);
  const source = TOJEONG_144[code];
  if (!source) throw new Error('토정비결 144괘 데이터를 찾지 못했습니다.');

  return {
    targetYear,
    birthLunar: birth,
    koreanAge,
    code,
    gwae: { sang, jung, ha },
    evidence: {
      taese: { ganji: year.korean, value: taese },
      wolgeon: { ganji: month.korean, value: wolgeon },
      iljin: { ganji: day.korean, value: iljin },
      monthDays,
      effectiveDay,
      dayClamped: effectiveDay !== birth.day
    },
    overview: modernize(source.chongun),
    months: Array.from({ length: 12 }, (_, index) => {
      const number = index + 1;
      const traditional = source.months[String(number)] || '';
      return {
        month: number,
        ...modernize(traditional, number)
      };
    }),
    traditionalSource: {
      overview: source.chongun,
      months: source.months
    },
    method: {
      name: '토정비결 144괘 작괘법',
      reference: '한국민족문화대백과사전의 상·중·하괘 작괘 원리와 공개 조견표를 기준으로 계산',
      licenseNote: '144괘 텍스트 데이터는 MIT 라이선스 mcp-tojeong 자료를 포함'
    }
  };
}
