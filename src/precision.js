export const BIRTH_LOCATIONS = {
  korea: { label:'대한민국 평균', longitude:127.5 },
  seoul: { label:'서울', longitude:126.978 },
  busan: { label:'부산', longitude:129.0756 },
  daegu: { label:'대구', longitude:128.6014 },
  incheon: { label:'인천', longitude:126.7052 },
  gwangju: { label:'광주', longitude:126.8526 },
  daejeon: { label:'대전', longitude:127.3845 },
  ulsan: { label:'울산', longitude:129.3114 },
  jeju: { label:'제주', longitude:126.5312 },
  sejong: { label:'세종', longitude:127.289 }
};

const DAY_BOUNDARIES = new Set(['midnight','jasi','splitJasi']);

export const DAY_BOUNDARY_LABELS = {
  midnight:'자정(00:00) 기준',
  jasi:'자시 환일 기준',
  splitJasi:'분할자시 기준'
};

export function resolvePrecision(input = {}) {
  const enabled = input.precision !== false;
  const location = BIRTH_LOCATIONS[input.location] ? input.location : 'korea';
  const locationData = BIRTH_LOCATIONS[location];
  const dayBoundary = DAY_BOUNDARIES.has(input.dayBoundary) ? input.dayBoundary : 'midnight';

  return {
    enabled,
    location,
    locationLabel: locationData.label,
    longitude: locationData.longitude,
    dayBoundary,
    trueSolarTime: enabled ? {
      longitude: locationData.longitude,
      applyEquationOfTime: true,
      applyHistoricalDst: true
    } : undefined
  };
}
