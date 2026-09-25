import {
  calculateSaju,
  calculateTodayFlow,
  calculateYearFlow,
  calculateMonthFlows,
  detectBranchRelations
} from './saju-engine.js';
import { calculateSajuMbti } from './mbti.js';
import { buildDetailedInterpretation } from './interpretation.js';
import { calculateDailyScores } from './daily-score.js';
import { monthFlowCopy } from './flow-copy.js';
import { drawTarot, interpretSpread } from './tarot.js';
import { calculateTojeong } from './tojeong.js';

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

function hasFinalConsonant(text = '') {
  const syllable = [...String(text)].reverse().find((character) => /[가-힣]/.test(character));
  if (!syllable) return false;
  return (syllable.charCodeAt(0) - 0xAC00) % 28 !== 0;
}

function attachParticle(text, consonantParticle, vowelParticle) {
  const value = String(text || '').trim();
  return value + (hasFinalConsonant(value) ? consonantParticle : vowelParticle);
}

const DAILY_GUIDANCE = {
  work: {
    high: '결정할 일을 한 가지 고르고 결과까지 연결해 보세요.',
    steady: '우선순위를 한 가지로 좁히면 흐름을 쓰기 쉽습니다.',
    caution: '급한 일과 중요한 일을 나눠 순서대로 처리하세요.',
    low: '새 일을 벌이기보다 밀린 일과 오류부터 정리하세요.'
  },
  money: {
    high: '기회가 보여도 예산 범위와 회수 조건을 먼저 확인하세요.',
    steady: '필요한 지출과 미룰 지출을 구분해 보세요.',
    caution: '큰 결제나 투자는 조건을 한 번 더 확인하세요.',
    low: '새 위험을 늘리기보다 현금 흐름을 지키는 쪽에 집중하세요.'
  },
  love: {
    high: '먼저 연락하거나 필요한 말을 짧고 분명하게 전해 보세요.',
    steady: '추측보다 확인하는 대화를 우선하면 편안합니다.',
    caution: '감정이 올라오면 결론보다 서로의 의도를 먼저 확인하세요.',
    low: '답을 서두르지 말고 불편한 지점을 한 문장으로 정리하세요.'
  },
  condition: {
    high: '활동과 휴식 시간을 나눠 좋은 리듬을 유지해 보세요.',
    steady: '쉬는 시간을 일정에 먼저 넣어 리듬을 지켜보세요.',
    caution: '피로 신호가 보이면 일정을 줄이고 회복 시간을 확보하세요.',
    low: '무리한 일정을 미루고 수면과 식사 같은 기본 리듬부터 챙기세요.'
  }
};

function dailyGuidance(category, score) {
  const copy = DAILY_GUIDANCE[category] || DAILY_GUIDANCE.work;
  if (score >= 72) return copy.high;
  if (score >= 58) return copy.steady;
  if (score >= 44) return copy.caution;
  return copy.low;
}

function dailyHeadline(scores) {
  const ranked = [
    { title: '일', score: scores.work.score },
    { title: '돈', score: scores.money.score },
    { title: '관계', score: scores.love.score },
    { title: '컨디션', score: scores.condition.score }
  ].sort((a, b) => b.score - a.score);
  const strongest = ranked[0];
  const weakest = ranked.at(-1);
  if (strongest.score - weakest.score >= 10) {
    return `${strongest.title}은 비교적 수월하고, ${weakest.title}은 한 번 더 점검해 보세요.`;
  }
  if (scores.overall.score >= 72) return '오늘은 중요한 한 가지를 정해 끝까지 이어가기 좋은 흐름입니다.';
  if (scores.overall.score >= 58) return '큰 무리 없이 움직일 수 있지만, 중요한 일부터 순서를 정해 보세요.';
  if (scores.overall.score >= 44) return '속도를 높이기보다 확인과 정리에 시간을 조금 더 써보세요.';
  return '새 결정을 늘리기보다 이미 정한 일과 회복에 집중해 보세요.';
}

function nativePayload(chart, now = new Date()) {
  const today = calculateTodayFlow(chart, now);
  const scores = calculateDailyScores(chart, today);
  const year = calculateYearFlow(chart, today.date.year);
  const months = calculateMonthFlows(chart, today.date.year);
  const mbti = calculateSajuMbti(chart);
  const report = buildDetailedInterpretation(chart, mbti, year, months);
  const tojeong = calculateTojeong(chart.input, today.date.year);
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
      headline: dailyHeadline(scores),
      items: [
        { id: 'work', title: '일', label: scores.work.label, text: dailyGuidance('work', scores.work.score) },
        { id: 'money', title: '돈', label: scores.money.label, text: dailyGuidance('money', scores.money.score) },
        { id: 'love', title: '관계', label: scores.love.label, text: dailyGuidance('love', scores.love.score) },
        { id: 'condition', title: '컨디션', label: scores.condition.label, text: dailyGuidance('condition', scores.condition.score) }
      ],
      good: currentMonth?.action || '오늘 할 수 있는 한 가지를 작게 정해 실행해 보세요.',
      avoid: currentMonth?.check || '한 번에 너무 많은 결정을 내리지 마세요.'
    },
    year: readingSection(report, 'year', '올해의 흐름'),
    months: monthGuides,
    tojeong: {
      targetYear: tojeong.targetYear,
      code: tojeong.code,
      overview: tojeong.overview,
      months: tojeong.months,
      evidence: tojeong.evidence,
      method: tojeong.method
    },
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

const ROLE_COPY = {
  비겁:'자기 기준과 실행',
  식상:'표현과 결과 만들기',
  재성:'현실 관리와 자원',
  관성:'책임과 기준',
  인성:'이해와 학습'
};

function dominantRole(chart) {
  return Object.entries(chart.roles || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || '인성';
}

function compatibilityPayload(first, second) {
  const firstBranches = Object.values(first.pillars).map((pillar) => pillar.earthlyBranch);
  const secondBranches = Object.values(second.pillars).map((pillar) => pillar.earthlyBranch);
  const relationSignals = detectBranchRelations([...firstBranches, ...secondBranches]).filter((relation) =>
    relation.members.some((member) => firstBranches.includes(member)) &&
    relation.members.some((member) => secondBranches.includes(member))
  );
  const firstRole = dominantRole(first);
  const secondRole = dominantRole(second);
  const supportive = relationSignals.filter((item) => item.type === '합' || item.type === '삼합');
  const friction = relationSignals.filter((item) => ['충','형','파','해'].includes(item.type));

  const strengths = firstRole === secondRole
    ? '두 사람 모두 ' + attachParticle(ROLE_COPY[firstRole], '을', '를') + ' 중요하게 보는 편이라 결정 기준을 맞추기 쉽습니다.'
    : '한 사람은 ' + ROLE_COPY[firstRole] + ', 다른 사람은 ' + ROLE_COPY[secondRole] + ' 쪽이 두드러져 역할을 나누면 서로의 빈틈을 보완할 수 있습니다.';

  const differences = first.dayMaster === second.dayMaster
    ? '핵심 반응 방식이 비슷해 공감은 빠를 수 있지만, 같은 방식으로 고집을 부리면 갈등도 길어질 수 있습니다.'
    : '핵심 반응 방식이 다르므로 같은 상황을 다르게 해석할 수 있습니다. 결론보다 서로의 판단 기준을 먼저 확인하는 편이 좋습니다.';

  const conflictText = friction.length
    ? '교차 관계에서 ' + friction.map((item) => item.text).join(' · ') + ' 신호가 보입니다. 압박이 큰 상황에서는 즉답보다 시간을 두고 합의점을 정하세요.'
    : '강한 충돌 신호가 두드러지지 않습니다. 다만 갈등이 없다는 뜻은 아니므로 기대와 경계를 말로 확인하는 과정은 필요합니다.';

  const summary = supportive.length
    ? '서로 연결되는 지점이 있으면서 성향 차이도 함께 나타나는 관계입니다. 잘 맞는 부분을 당연하게 여기기보다 실제 생활의 역할과 기대를 맞추는 것이 중요합니다.'
    : '좋고 나쁨을 한 점수로 정하기보다 서로 다른 기준을 어떻게 조율하는지가 중요한 관계입니다.';

  return {
    summary,
    sections: [
      { id:'strengths', title:'잘 맞는 부분', text:strengths },
      { id:'differences', title:'다른 부분', text:differences },
      { id:'conflict', title:'갈등하기 쉬운 상황', text:conflictText },
      {
        id:'understand',
        title:'서로 이해하면 좋은 점',
        text:'첫 번째 사람은 ' + ROLE_COPY[firstRole] + ', 두 번째 사람은 ' + attachParticle(ROLE_COPY[secondRole], '을', '를') + ' 우선하기 쉽습니다. 상대의 방식이 틀렸다기보다 우선순위가 다를 수 있다는 점을 먼저 확인하세요.'
      },
      {
        id:'advice',
        title:'현실적인 관계 조언',
        text:'중요한 결정은 감정이 가장 높은 순간을 피하고, 원하는 것·양보 가능한 것·지킬 경계를 각각 한 문장으로 정리해 대화하세요.'
      }
    ],
    evidence: {
      firstDayMaster:first.dayMaster,
      secondDayMaster:second.dayMaster,
      firstDominantRole:firstRole,
      secondDominantRole:secondRole,
      relationSignals:relationSignals.map((item) => item.text)
    },
    note:'궁합은 관계의 좋고 나쁨을 확정하는 점수가 아니라 두 사람의 차이를 이해하기 위한 참고 해설입니다.'
  };
}

export function calculateCompatibilityForAndroid(jsonString) {
  try {
    const request = JSON.parse(String(jsonString || '{}'));
    const firstInput = normalizeAndroidRequest(request.first || {});
    const secondInput = normalizeAndroidRequest(request.second || {});
    const firstNormalized = { ...firstInput };
    const secondNormalized = { ...secondInput };
    delete firstNormalized.birthTimeKnown;
    delete secondNormalized.birthTimeKnown;
    const first = calculateSaju(firstNormalized);
    const second = calculateSaju(secondNormalized);
    return JSON.stringify({
      ok:true,
      schemaVersion:SCHEMA_VERSION,
      compatibility:compatibilityPayload(first, second)
    });
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
  calculateCompatibility: calculateCompatibilityForAndroid,
  drawTarot: drawTarotForAndroid
});
