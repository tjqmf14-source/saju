import { ELEMENT_LABELS, ROLE_LABELS } from './data.js';

const AXES = {
  EI: {
    left:{letter:'E',roles:['식상','비겁'],elements:['화','목']},
    right:{letter:'I',roles:['인성','관성'],elements:['수','금']}
  },
  SN: {
    left:{letter:'S',roles:['재성','관성'],elements:['토','금']},
    right:{letter:'N',roles:['인성','식상'],elements:['목','수']}
  },
  TF: {
    left:{letter:'T',roles:['관성','재성'],elements:['금','수']},
    right:{letter:'F',roles:['인성','비겁'],elements:['목','화']}
  },
  JP: {
    left:{letter:'J',roles:['관성','재성'],elements:['토','금']},
    right:{letter:'P',roles:['식상','비겁'],elements:['목','수']}
  }
};

function sideScore(chart, side) {
  const roleScore = side.roles.reduce((sum,key)=>sum+(chart.roles[key]||0),0);
  const elementScore = side.elements.reduce((sum,key)=>sum+(chart.elements[key]||0),0);
  return roleScore + elementScore * 0.7 + 0.001;
}

function reasonsFor(chart, side) {
  const role = [...side.roles].sort((a,b)=>(chart.roles[b]||0)-(chart.roles[a]||0))[0];
  const element = [...side.elements].sort((a,b)=>(chart.elements[b]||0)-(chart.elements[a]||0))[0];
  return [
    `${ROLE_LABELS[role]} ${chart.roles[role].toFixed(2)}`,
    `${element}(${ELEMENT_LABELS[element].label}) ${chart.elements[element].toFixed(2)}`
  ];
}

function axisResult(chart, config) {
  const leftScore = sideScore(chart,config.left);
  const rightScore = sideScore(chart,config.right);
  const total = leftScore + rightScore;
  const leftPercent = Math.round(leftScore / total * 100);
  const rightPercent = 100 - leftPercent;
  return {
    selected: leftPercent >= rightPercent ? config.left.letter : config.right.letter,
    left:{letter:config.left.letter,percent:leftPercent,score:Number(leftScore.toFixed(3))},
    right:{letter:config.right.letter,percent:rightPercent,score:Number(rightScore.toFixed(3))},
    reasons:[...reasonsFor(chart,config.left),...reasonsFor(chart,config.right)]
  };
}

export function calculateSajuMbti(chart) {
  const axes = {};
  for (const [key,config] of Object.entries(AXES)) axes[key] = axisResult(chart,config);
  const type = ['EI','SN','TF','JP'].map((key)=>axes[key].selected).join('');
  return {
    type,
    axes,
    label:'사주 기반 성향 MBTI · 비공식 참고',
    disclaimer:'정식 MBTI 심리검사가 아니라 사주 원국의 오행·십성 분포를 MBTI 4축 언어로 번역한 비공식 참고 지표입니다.'
  };
}
