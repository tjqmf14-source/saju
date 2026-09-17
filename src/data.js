export const STEMS = [
  { ko:'갑', hanja:'甲', element:'목', yinYang:'양' },
  { ko:'을', hanja:'乙', element:'목', yinYang:'음' },
  { ko:'병', hanja:'丙', element:'화', yinYang:'양' },
  { ko:'정', hanja:'丁', element:'화', yinYang:'음' },
  { ko:'무', hanja:'戊', element:'토', yinYang:'양' },
  { ko:'기', hanja:'己', element:'토', yinYang:'음' },
  { ko:'경', hanja:'庚', element:'금', yinYang:'양' },
  { ko:'신', hanja:'辛', element:'금', yinYang:'음' },
  { ko:'임', hanja:'壬', element:'수', yinYang:'양' },
  { ko:'계', hanja:'癸', element:'수', yinYang:'음' }
];

export const BRANCHES = [
  { ko:'자', hanja:'子', element:'수', hidden:['계'] },
  { ko:'축', hanja:'丑', element:'토', hidden:['기','계','신'] },
  { ko:'인', hanja:'寅', element:'목', hidden:['갑','병','무'] },
  { ko:'묘', hanja:'卯', element:'목', hidden:['을'] },
  { ko:'진', hanja:'辰', element:'토', hidden:['무','을','계'] },
  { ko:'사', hanja:'巳', element:'화', hidden:['병','무','경'] },
  { ko:'오', hanja:'午', element:'화', hidden:['정','기'] },
  { ko:'미', hanja:'未', element:'토', hidden:['기','정','을'] },
  { ko:'신', hanja:'申', element:'금', hidden:['경','임','무'] },
  { ko:'유', hanja:'酉', element:'금', hidden:['신'] },
  { ko:'술', hanja:'戌', element:'토', hidden:['무','신','정'] },
  { ko:'해', hanja:'亥', element:'수', hidden:['임','갑'] }
];

export const HIDDEN_WEIGHTS = {
  1:[1],
  2:[0.7,0.3],
  3:[0.6,0.25,0.15]
};

export const TEN_GOD_GROUP = {
  비견:'비겁', 겁재:'비겁', 식신:'식상', 상관:'식상', 편재:'재성', 정재:'재성', 편관:'관성', 정관:'관성', 편인:'인성', 정인:'인성', 일간:'비겁'
};

export const ELEMENT_LABELS = {
  목:{ label:'성장', keyword:'기획·확장' }, 화:{ label:'표현', keyword:'표현·집중' }, 토:{ label:'안정', keyword:'관리·축적' }, 금:{ label:'정리', keyword:'판단·완성' }, 수:{ label:'탐구', keyword:'정보·통찰' }
};

export const ROLE_LABELS = {
  비겁:'자기주도', 식상:'표현·창작', 재성:'현실·성과', 관성:'책임·규칙', 인성:'학습·사고'
};

export function stemByName(name){ return STEMS.find((s)=>s.ko===name); }
export function branchByName(name){ return BRANCHES.find((b)=>b.ko===name); }
