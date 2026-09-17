const profile = {
  name: "나",
  birthDate: "1987-06-14",
  birthTime: "11:45",
  calendar: "양력",
  timezone: "한국 표준시"
};

const stems = [
  { ko: "갑", hanja: "甲", element: "목", yinYang: "양", image: "시작과 성장" },
  { ko: "을", hanja: "乙", element: "목", yinYang: "음", image: "유연한 성장" },
  { ko: "병", hanja: "丙", element: "화", yinYang: "양", image: "밝은 표현" },
  { ko: "정", hanja: "丁", element: "화", yinYang: "음", image: "섬세한 온기" },
  { ko: "무", hanja: "戊", element: "토", yinYang: "양", image: "중심과 버팀" },
  { ko: "기", hanja: "己", element: "토", yinYang: "음", image: "관리와 축적" },
  { ko: "경", hanja: "庚", element: "금", yinYang: "양", image: "결단과 기준" },
  { ko: "신", hanja: "辛", element: "금", yinYang: "음", image: "정교한 감각" },
  { ko: "임", hanja: "壬", element: "수", yinYang: "양", image: "큰 흐름과 정보" },
  { ko: "계", hanja: "癸", element: "수", yinYang: "음", image: "깊은 관찰" }
];

const branches = [
  { ko: "자", hanja: "子", element: "수", yinYang: "양", hidden: ["계"], season: "한겨울" },
  { ko: "축", hanja: "丑", element: "토", yinYang: "음", hidden: ["기", "계", "신"], season: "겨울 끝" },
  { ko: "인", hanja: "寅", element: "목", yinYang: "양", hidden: ["갑", "병", "무"], season: "초봄" },
  { ko: "묘", hanja: "卯", element: "목", yinYang: "음", hidden: ["을"], season: "봄" },
  { ko: "진", hanja: "辰", element: "토", yinYang: "양", hidden: ["무", "을", "계"], season: "봄 끝" },
  { ko: "사", hanja: "巳", element: "화", yinYang: "음", hidden: ["병", "무", "경"], season: "초여름" },
  { ko: "오", hanja: "午", element: "화", yinYang: "양", hidden: ["정", "기"], season: "한여름" },
  { ko: "미", hanja: "未", element: "토", yinYang: "음", hidden: ["기", "정", "을"], season: "여름 끝" },
  { ko: "신", hanja: "申", element: "금", yinYang: "양", hidden: ["경", "임", "무"], season: "초가을" },
  { ko: "유", hanja: "酉", element: "금", yinYang: "음", hidden: ["신"], season: "가을" },
  { ko: "술", hanja: "戌", element: "토", yinYang: "양", hidden: ["무", "신", "정"], season: "가을 끝" },
  { ko: "해", hanja: "亥", element: "수", yinYang: "음", hidden: ["임", "갑"], season: "초겨울" }
];

const monthStarts = [
  [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
  [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6]
];

const relationMap = {
  "목": { "목": "비겁", "화": "식상", "토": "재성", "금": "관성", "수": "인성" },
  "화": { "화": "비겁", "토": "식상", "금": "재성", "수": "관성", "목": "인성" },
  "토": { "토": "비겁", "금": "식상", "수": "재성", "목": "관성", "화": "인성" },
  "금": { "금": "비겁", "수": "식상", "목": "재성", "화": "관성", "토": "인성" },
  "수": { "수": "비겁", "목": "식상", "화": "재성", "토": "관성", "금": "인성" }
};

const roleCopy = {
  "비겁": { label: "자기 힘", easy: "내 의견, 독립성, 경쟁심", advice: "혼자 해내는 힘이지만 협업 규칙을 정하면 더 커집니다." },
  "식상": { label: "표현 힘", easy: "말, 결과물, 창작, 설득", advice: "생각을 밖으로 꺼낼수록 기회가 생깁니다." },
  "재성": { label: "현실 힘", easy: "돈, 성과, 관리, 선택", advice: "수입보다 지출 구조를 먼저 잡으면 안정됩니다." },
  "관성": { label: "책임 힘", easy: "직장, 규칙, 평판, 약속", advice: "신뢰를 쌓기 좋지만 부담을 다 떠안지는 마세요." },
  "인성": { label: "배움 힘", easy: "공부, 문서, 보호, 회복", advice: "준비와 기록이 운을 여는 열쇠가 됩니다." }
};

const elementCopy = {
  "목": { label: "성장", plus: "기획, 시작, 연결, 확장", risk: "조급함, 방향이 자주 바뀜", habit: "긴 산책, 새 공부, 관계 회복" },
  "화": { label: "표현", plus: "발표, 홍보, 집중력, 존재감", risk: "감정 과열, 말이 빨라짐", habit: "수면 관리, 말하기 전 한 박자 쉬기" },
  "토": { label: "안정", plus: "관리, 중재, 축적, 현실감", risk: "걱정 누적, 변화 회피", habit: "공간 정리, 루틴 만들기, 소화 관리" },
  "금": { label: "정리", plus: "판단, 기준, 계약, 완성도", risk: "비판적 말투, 완벽주의", habit: "목표를 작게 쪼개고 결정 기한 정하기" },
  "수": { label: "지혜", plus: "정보, 직감, 연구, 이동성", risk: "생각 과다, 실행 지연", habit: "메모, 물 마시기, 차분한 휴식" }
};

const fieldAdvice = {
  work: {
    "비겁": "사람이 많은 판에서 실력이 보입니다. 역할과 기준을 먼저 정하세요.",
    "식상": "콘텐츠, 발표, 설득, 기획안처럼 보이는 결과물이 운을 엽니다.",
    "재성": "성과와 돈으로 연결되는 일을 우선순위에 올리면 좋습니다.",
    "관성": "조직, 직책, 책임, 심사처럼 공식적인 자리에서 신뢰를 얻습니다.",
    "인성": "자격, 문서, 학습, 리서치를 쌓으면 뒤늦게 큰 힘이 됩니다."
  },
  money: {
    "비겁": "동업, 지인 거래, 즉흥 지출을 조심하세요. 내 몫을 분명히 해야 합니다.",
    "식상": "아이디어를 수익화하기 좋습니다. 작은 상품이나 서비스부터 실험하세요.",
    "재성": "돈의 흐름을 잡기 좋습니다. 투자보다 현금 흐름 점검이 먼저입니다.",
    "관성": "안정적인 급여, 계약, 제도권 수익에 강점이 있습니다.",
    "인성": "공부와 준비에 돈이 쓰이지만 장기적으로 회수될 가능성이 있습니다."
  },
  relationship: {
    "비겁": "솔직함은 장점이지만 내 주장만 강하면 거리가 생길 수 있습니다.",
    "식상": "말과 표현이 관계를 살립니다. 감사 표현을 미루지 마세요.",
    "재성": "현실적인 도움과 책임감이 매력으로 보입니다.",
    "관성": "약속을 지키는 태도가 신뢰를 만듭니다. 지나친 평가 말투는 줄이세요.",
    "인성": "상대의 이야기를 듣고 기억하는 태도가 관계를 깊게 합니다."
  },
  health: {
    "비겁": "긴장성 통증과 과로를 조심하세요. 경쟁 상황 뒤에는 회복 시간이 필요합니다.",
    "식상": "수면과 열감 관리가 중요합니다. 밤 늦은 자극을 줄이세요.",
    "재성": "소화, 체중, 고정된 생활 습관을 살피면 컨디션이 안정됩니다.",
    "관성": "호흡, 피부, 목과 어깨의 긴장을 자주 풀어주세요.",
    "인성": "냉증, 수분 균형, 하체 순환을 챙기면 좋습니다."
  }
};

const luckyMap = {
  "목": { color: "초록", number: "3, 8", food: "샐러드와 견과류", place: "공원 산책길" },
  "화": { color: "빨강", number: "2, 7", food: "따뜻한 음식", place: "밝은 카페" },
  "토": { color: "노랑", number: "5, 10", food: "밥과 뿌리채소", place: "익숙한 공간" },
  "금": { color: "흰색", number: "4, 9", food: "담백한 단백질", place: "정돈된 자리" },
  "수": { color: "검정", number: "1, 6", food: "수분 많은 과일", place: "조용한 물가" }
};

function mod(n, m) {
  return ((n % m) + m) % m;
}

function makePillar(index) {
  return {
    stem: stems[mod(index, 10)],
    branch: branches[mod(index, 12)],
    stemIndex: mod(index, 10),
    branchIndex: mod(index, 12)
  };
}

function getBirthDate() {
  return new Date(`${profile.birthDate}T${profile.birthTime}:00`);
}

function getYearPillar(date) {
  const year = date.getMonth() === 0 || (date.getMonth() === 1 && date.getDate() < 4)
    ? date.getFullYear() - 1
    : date.getFullYear();
  return makePillar(year - 4);
}

function getMonthPillar(date, yearStemIndex) {
  let monthIndex = 11;
  for (let i = 0; i < monthStarts.length; i += 1) {
    const [month, day] = monthStarts[i];
    const startYear = month === 1 ? date.getFullYear() + 1 : date.getFullYear();
    const start = new Date(startYear, month - 1, day);
    const nextSpec = monthStarts[(i + 1) % monthStarts.length];
    const nextYear = nextSpec[0] === 1 ? startYear + 1 : startYear;
    const next = new Date(nextYear, nextSpec[0] - 1, nextSpec[1]);
    if (date >= start && date < next) {
      monthIndex = i;
      break;
    }
  }
  const branchIndex = mod(monthIndex + 2, 12);
  const tigerStemByYearStem = [2, 4, 6, 8, 0];
  const firstStem = tigerStemByYearStem[yearStemIndex % 5];
  const stemIndex = mod(firstStem + monthIndex, 10);
  return { stem: stems[stemIndex], branch: branches[branchIndex], stemIndex, branchIndex };
}

function getJulianDay(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function getDayPillar(date) {
  return makePillar(getJulianDay(date) + 49);
}

function getHourPillar(hour, dayStemIndex) {
  const branchIndex = mod(Math.floor((hour + 1) / 2), 12);
  const firstStemByDayStem = [0, 2, 4, 6, 8];
  const stemIndex = mod(firstStemByDayStem[dayStemIndex % 5] + branchIndex, 10);
  return { stem: stems[stemIndex], branch: branches[branchIndex], stemIndex, branchIndex };
}

function getPillars(date) {
  const [hour, minute] = profile.birthTime.split(":").map(Number);
  const year = getYearPillar(date);
  const month = getMonthPillar(date, year.stemIndex);
  const day = getDayPillar(date);
  const hourPillar = getHourPillar(hour + minute / 60, day.stemIndex);
  return [year, month, day, hourPillar];
}

function countElements(pillars) {
  const score = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
  pillars.forEach((pillar) => {
    score[pillar.stem.element] += 1;
    score[pillar.branch.element] += 1;
    pillar.branch.hidden.forEach((hiddenStem) => {
      const found = stems.find((stem) => stem.ko === hiddenStem);
      score[found.element] += 0.35;
    });
  });
  return score;
}

function tenGod(dayStem, targetStem) {
  const relation = relationMap[dayStem.element][targetStem.element];
  const samePolarity = dayStem.yinYang === targetStem.yinYang;
  const detail = {
    "비겁": samePolarity ? "비견" : "겁재",
    "식상": samePolarity ? "식신" : "상관",
    "재성": samePolarity ? "편재" : "정재",
    "관성": samePolarity ? "편관" : "정관",
    "인성": samePolarity ? "편인" : "정인"
  };
  return { group: relation, detail: detail[relation] };
}

function countRoles(pillars) {
  const dayStem = pillars[2].stem;
  const roles = { "비겁": 0, "식상": 0, "재성": 0, "관성": 0, "인성": 0 };
  pillars.forEach((pillar) => {
    roles[tenGod(dayStem, pillar.stem).group] += 1;
    pillar.branch.hidden.forEach((hiddenStem) => {
      const found = stems.find((stem) => stem.ko === hiddenStem);
      roles[tenGod(dayStem, found).group] += 0.35;
    });
  });
  return roles;
}

function sortedEntries(score) {
  return Object.entries(score).sort((a, b) => b[1] - a[1]);
}

function ageOn(date, birth) {
  let age = date.getFullYear() - birth.getFullYear();
  const birthdayPassed = date.getMonth() > birth.getMonth()
    || (date.getMonth() === birth.getMonth() && date.getDate() >= birth.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
}

function getDaily(pillars, score) {
  const today = new Date();
  const todayPillar = getDayPillar(today);
  const dayStem = pillars[2].stem;
  const tone = relationMap[dayStem.element][todayPillar.stem.element];
  const strong = sortedEntries(score)[0][0];
  const weak = sortedEntries(score).slice(-1)[0][0];
  const scoreTotal = Math.min(96, 64 + mod(getJulianDay(today) + pillars[2].stemIndex * 7 + pillars[3].branchIndex * 3, 30));
  const lucky = luckyMap[weak];
  return { today, todayPillar, tone, strong, weak, scoreTotal, lucky };
}

function yearlyPillar(year) {
  return makePillar(year - 4);
}

function shiftPillar(pillar, amount) {
  return {
    stem: stems[mod(pillar.stemIndex + amount, 10)],
    branch: branches[mod(pillar.branchIndex + amount, 12)],
    stemIndex: mod(pillar.stemIndex + amount, 10),
    branchIndex: mod(pillar.branchIndex + amount, 12)
  };
}

function buildSnapshot(pillars, score, roles, daily) {
  const birth = getBirthDate();
  const age = ageOn(new Date(), birth);
  const dayStem = pillars[2].stem;
  const strong = sortedEntries(score)[0][0];
  const weak = sortedEntries(score).slice(-1)[0][0];
  const strongestRole = sortedEntries(roles)[0][0];
  document.querySelector("#heroScore").textContent = `${daily.scoreTotal}점`;
  document.querySelector("#heroMessage").textContent = `${elementCopy[weak].label}의 기운을 보완하면 오늘 흐름이 훨씬 부드럽습니다.`;

  return [
    card("오늘 핵심", `${daily.scoreTotal}점`, `${daily.todayPillar.stem.ko}${daily.todayPillar.branch.ko}일입니다. ${roleCopy[daily.tone].label}이 살아나는 날이라 ${roleCopy[daily.tone].easy}에 집중하면 좋습니다.`, true),
    card("나의 중심", `${dayStem.ko}${dayStem.hanja} ${dayStem.element}`, `${dayStem.image}의 기질입니다. 빠르게 움직이되 방향을 잡으면 힘이 큽니다.`),
    card("강한 기운", elementCopy[strong].label, `${elementCopy[strong].plus}이 장점입니다. 과하면 ${elementCopy[strong].risk}이 생길 수 있습니다.`),
    card("현재 나이", `만 ${age}세`, `가장 두드러진 역할은 ${roleCopy[strongestRole].label}입니다. ${roleCopy[strongestRole].advice}`)
  ].join("");
}

function card(label, title, text, featured = false) {
  return `<article class="panel snapshot-card${featured ? " featured" : ""}"><span>${label}</span><strong>${title}</strong><p>${text}</p></article>`;
}

function renderPillars(pillars) {
  const labels = ["태어난 해", "태어난 달", "태어난 날", "태어난 시간"];
  return pillars.map((pillar, index) => {
    const role = tenGod(pillars[2].stem, pillar.stem);
    return `
      <article class="pillar-card">
        <span class="label">${labels[index]}</span>
        <div class="letters">${pillar.stem.ko}${pillar.branch.ko}</div>
        <dl>
          <div><dt>한자</dt><dd>${pillar.stem.hanja}${pillar.branch.hanja}</dd></div>
          <div><dt>기운</dt><dd>${withAnd(pillar.stem.element)} ${pillar.branch.element}</dd></div>
          <div><dt>성질</dt><dd>${pillar.stem.yinYang}과 ${pillar.branch.yinYang}</dd></div>
          <div><dt>속기운</dt><dd>${pillar.branch.hidden.join(", ")}</dd></div>
          <div><dt>역할</dt><dd>${roleCopy[role.group].label}</dd></div>
        </dl>
      </article>
    `;
  }).join("");
}

function renderElementChart(score) {
  const max = Math.max(...Object.values(score));
  return Object.entries(score).map(([element, value]) => {
    const percent = Math.round((value / max) * 100);
    return `
      <div class="element-row">
        <strong>${elementCopy[element].label}</strong>
        <div class="track"><i class="fill" style="width:${percent}%"></i></div>
        <span>${value.toFixed(1)}</span>
      </div>
    `;
  }).join("");
}

function renderRoleChart(roles) {
  const max = Math.max(...Object.values(roles));
  return Object.entries(roles).map(([role, value]) => {
    const percent = Math.round((value / max) * 100);
    return `
      <div class="role-row">
        <strong>${roleCopy[role].label}</strong>
        <div class="track"><i class="fill" style="width:${percent}%"></i></div>
        <span>${value.toFixed(1)}</span>
      </div>
    `;
  }).join("");
}

function buildReading(pillars, score, roles) {
  const dayStem = pillars[2].stem;
  const month = pillars[1];
  const strong = sortedEntries(score)[0][0];
  const weak = sortedEntries(score).slice(-1)[0][0];
  const mainRole = sortedEntries(roles)[0][0];
  const moneyRole = roles["재성"];
  const workRole = roles["관성"];
  const expressionRole = roles["식상"];

  const cards = [
    ["기본 성향", `${dayStem.ko}${dayStem.hanja} 일간은 ${dayStem.image}입니다. 스스로 판단하고 움직이는 힘이 강합니다. 다만 속도가 빨라질수록 주변 속도를 함께 확인해야 합니다.`, [dayStem.element, month.branch.season, roleCopy[mainRole].label]],
    ["강점", `${elementCopy[strong].plus}이 잘 살아납니다. 특히 일을 시작하거나 방향을 잡을 때 강한 추진력이 나옵니다.`, [elementCopy[strong].label, "추진력", "판단"]],
    ["보완점", `${elementCopy[weak].label}이 약하게 보입니다. ${elementCopy[weak].habit}을 생활에 넣으면 균형이 좋아집니다.`, [elementCopy[weak].label, "루틴", "회복"]],
    ["일과 커리어", workRole >= 1 ? fieldAdvice.work["관성"] : fieldAdvice.work[mainRole], ["기획", "책임", "평판"]],
    ["돈의 흐름", moneyRole >= 1 ? fieldAdvice.money["재성"] : fieldAdvice.money[mainRole], ["현금 흐름", "계약", "지출 관리"]],
    ["관계와 마음", expressionRole >= 1 ? fieldAdvice.relationship["식상"] : fieldAdvice.relationship[mainRole], ["표현", "거리 조절", "약속"]]
  ];

  return cards.map(([title, text, tags]) => `
    <article class="reading-card">
      <h3>${title}</h3>
      <p>${text}</p>
      <div class="tag-list">${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    </article>
  `).join("");
}

function findStructure(pillars) {
  const branchNames = pillars.map((p) => p.branch.ko);
  const stemNames = pillars.map((p) => p.stem.ko);
  const items = [];
  const clashes = [["자", "오"], ["축", "미"], ["인", "신"], ["묘", "유"], ["진", "술"], ["사", "해"]];
  const unions = [["자", "축"], ["인", "해"], ["묘", "술"], ["진", "유"], ["사", "신"], ["오", "미"]];
  const stemUnions = [["갑", "기", "현실화"], ["을", "경", "정리"], ["병", "신", "지혜"], ["정", "임", "성장"], ["무", "계", "표현"]];
  const triple = [
    { set: ["신", "자", "진"], label: "정보와 이동" },
    { set: ["인", "오", "술"], label: "표현과 추진" },
    { set: ["해", "묘", "미"], label: "성장과 관계" },
    { set: ["사", "유", "축"], label: "정리와 성과" }
  ];

  clashes.forEach(([a, b]) => {
    if (branchNames.includes(a) && branchNames.includes(b)) {
      items.push(["부딪힘", `${a}와 ${b}가 함께 있어 마음과 상황이 빠르게 흔들릴 수 있습니다. 큰 결정은 하루 더 확인하는 방식이 좋습니다.`]);
    }
  });
  unions.forEach(([a, b]) => {
    if (branchNames.includes(a) && branchNames.includes(b)) {
      items.push(["끌림", `${a}와 ${b}가 서로 당기는 구조입니다. 사람, 장소, 일의 연결을 잘 만들면 기회가 커집니다.`]);
    }
  });
  stemUnions.forEach(([a, b, label]) => {
    if (stemNames.includes(a) && stemNames.includes(b)) {
      items.push(["겉으로 보이는 결합", `${a}와 ${b}가 만나 ${label}의 흐름을 만듭니다. 머릿속 계획을 실제 결과로 바꾸기 좋습니다.`]);
    }
  });
  triple.forEach(({ set, label }) => {
    const count = set.filter((name) => branchNames.includes(name)).length;
    if (count >= 2) {
      items.push(["큰 방향", `${label} 쪽 흐름이 살아납니다. 같은 주제의 사람과 일을 반복해서 만나기 쉽습니다.`]);
    }
  });
  if (items.length === 0) {
    items.push(["안정형", "원국 안의 강한 충돌 신호가 적습니다. 대신 익숙한 패턴에 머무르지 않도록 주기적으로 환경을 바꾸면 좋습니다."]);
  }
  return items.map(([title, text]) => `<article class="detail-card"><h3>${title}</h3><p>${text}</p></article>`).join("");
}

function buildDecadeFlow(birth, gender, pillars) {
  const yearStem = pillars[0].stem;
  const isForward = (gender === "male" && yearStem.yinYang === "양") || (gender === "female" && yearStem.yinYang === "음");
  const startAge = Math.max(3, Math.round((isForward ? 8 : 6) + birth.getMonth() / 4));
  const currentAge = ageOn(new Date(), birth);
  return Array.from({ length: 7 }, (_, index) => {
    const age = startAge + index * 10;
    const pillar = shiftPillar(pillars[1], isForward ? index + 1 : -index - 1);
    const active = currentAge >= age && currentAge < age + 10;
    const tone = relationMap[pillars[2].stem.element][pillar.stem.element];
    return `
      <div class="decade-item${active ? " current" : ""}">
        <strong>${age}세부터</strong>
        <p>${pillar.stem.ko}${pillar.branch.ko} 흐름입니다. ${roleCopy[tone].label}이 강해져 ${roleCopy[tone].easy} 주제가 커집니다.</p>
      </div>
    `;
  }).join("");
}

function buildYearForecast(pillars) {
  const dayElement = pillars[2].stem.element;
  return Array.from({ length: 8 }, (_, index) => 2026 + index).map((year) => {
    const pillar = yearlyPillar(year);
    const tone = relationMap[dayElement][pillar.stem.element];
    const score = clamp(68 + mod(year + pillar.stemIndex * 7 + pillar.branchIndex * 3, 25), 48, 96);
    return `
      <article class="year-card">
        <h3>${year}년 <span class="score-pill">${score}점</span></h3>
        <p>${pillar.stem.ko}${pillar.branch.ko}년입니다. ${yearMessage(tone)}</p>
      </article>
    `;
  }).join("");
}

function yearMessage(tone) {
  const copy = {
    "비겁": "사람과 경쟁, 협업이 커집니다. 내 몫과 기준을 분명히 하면 좋습니다.",
    "식상": "표현과 결과물이 운을 엽니다. 말, 글, 콘텐츠, 발표에 힘을 주세요.",
    "재성": "돈과 성과가 중요합니다. 수익 구조와 지출 습관을 함께 봐야 합니다.",
    "관성": "책임과 평판이 커집니다. 공식적인 약속을 잘 지키면 신뢰가 쌓입니다.",
    "인성": "배움과 준비가 깊어집니다. 문서, 자격, 연구가 나중의 기회가 됩니다."
  };
  return copy[tone];
}

function buildMonthForecast(pillars) {
  const labels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  return labels.map((label, index) => {
    const monthPillar = shiftPillar(yearlyPillar(2026), index + 2);
    const tone = relationMap[pillars[2].stem.element][monthPillar.stem.element];
    return `<article class="month-card"><h3>${label}</h3><p>${roleCopy[tone].label}이 올라옵니다. ${roleCopy[tone].advice}</p></article>`;
  }).join("");
}

function buildActionGuide(score, roles, daily) {
  const strong = sortedEntries(score)[0][0];
  const weak = sortedEntries(score).slice(-1)[0][0];
  const mainRole = sortedEntries(roles)[0][0];
  const lucky = daily.lucky;
  const actions = [
    ["이번 주", `${elementCopy[weak].habit}을 하나만 정해서 7일 동안 반복하세요. 부족한 ${elementCopy[weak].label}의 균형을 채우는 방법입니다.`],
    ["일", fieldAdvice.work[mainRole]],
    ["돈", fieldAdvice.money["재성"]],
    ["관계", fieldAdvice.relationship[daily.tone]],
    ["건강", fieldAdvice.health[daily.tone]],
    ["행운 힌트", `${lucky.color} 계열을 가까이 두고, ${lucky.place}에서 생각을 정리하면 좋습니다. 숫자는 ${lucky.number}가 잘 맞습니다.`],
    ["주의할 습관", `강한 ${elementCopy[strong].label}이 과해지면 ${elementCopy[strong].risk}이 생길 수 있습니다. 중요한 말은 한 번 정리한 뒤 꺼내세요.`],
    ["좋은 선택법", `${roleCopy[mainRole].label}이 강하므로 ${roleCopy[mainRole].easy}과 연결된 선택이 잘 맞습니다.`]
  ];
  return actions.map(([title, text]) => `<article class="action-card"><h3>${title}</h3><p>${text}</p></article>`).join("");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function withAnd(word) {
  const code = word.charCodeAt(word.length - 1);
  const hasFinalConsonant = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return `${word}${hasFinalConsonant ? "과" : "와"}`;
}

function render() {
  const birth = getBirthDate();
  const pillars = getPillars(birth);
  const score = countElements(pillars);
  const roles = countRoles(pillars);
  const daily = getDaily(pillars, score);
  const gender = document.querySelector("#genderBasis").value;

  document.querySelector("#snapshot").innerHTML = buildSnapshot(pillars, score, roles, daily);
  document.querySelector("#pillarGrid").innerHTML = renderPillars(pillars);
  document.querySelector("#elementChart").innerHTML = renderElementChart(score);
  document.querySelector("#roleChart").innerHTML = renderRoleChart(roles);
  document.querySelector("#readingGrid").innerHTML = buildReading(pillars, score, roles);
  document.querySelector("#structureList").innerHTML = findStructure(pillars);
  document.querySelector("#decadeFlow").innerHTML = buildDecadeFlow(birth, gender, pillars);
  document.querySelector("#yearForecast").innerHTML = buildYearForecast(pillars);
  document.querySelector("#monthForecast").innerHTML = buildMonthForecast(pillars);
  document.querySelector("#actionGuide").innerHTML = buildActionGuide(score, roles, daily);
}

document.querySelector("#genderBasis").addEventListener("change", render);
render();
