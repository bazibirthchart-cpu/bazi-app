import lunar from './lunar.cjs';

const { Solar } = lunar;

export const elementMeta = {
  '甲': { name: 'Wood' }, '乙': { name: 'Wood' },
  '丙': { name: 'Fire' }, '丁': { name: 'Fire' },
  '戊': { name: 'Earth' }, '己': { name: 'Earth' },
  '庚': { name: 'Metal' }, '辛': { name: 'Metal' },
  '壬': { name: 'Water' }, '癸': { name: 'Water' },
  '寅': { name: 'Wood' }, '卯': { name: 'Wood' },
  '巳': { name: 'Fire' }, '午': { name: 'Fire' },
  '辰': { name: 'Earth' }, '戌': { name: 'Earth' },
  '丑': { name: 'Earth' }, '未': { name: 'Earth' },
  '申': { name: 'Metal' }, '酉': { name: 'Metal' },
  '亥': { name: 'Water' }, '子': { name: 'Water' }
};

export const hiddenGanMap = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
  '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

const elementOrder = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const generateElement = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const generatedByElement = { Wood: 'Water', Fire: 'Wood', Earth: 'Fire', Metal: 'Earth', Water: 'Metal' };
const controlElement = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };
const controlledByElement = { Wood: 'Metal', Fire: 'Water', Earth: 'Wood', Metal: 'Fire', Water: 'Earth' };

function callMethod(target, name, fallback = '-') {
  try {
    if (!target || typeof target[name] !== 'function') return fallback;
    const value = target[name]();
    if (Array.isArray(value)) return value.length ? value : fallback;
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatDateTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getEquationOfTimeMinutes(date) {
  const dayOfYear = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
  const hour = date.getHours() + (date.getMinutes() / 60) + (date.getSeconds() / 3600);
  const gamma = (2 * Math.PI / 365) * ((dayOfYear - 1) + ((hour - 12) / 24));
  return 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );
}

export function getTrueSolarDate(date, longitude, isDST) {
  const civilTime = new Date(date.getTime());
  if (isDST) civilTime.setHours(civilTime.getHours() - 1);
  const standardLongitude = Math.round((longitude || 120) / 15) * 15;
  const localMeanSolarTime = new Date(civilTime.getTime());
  const longitudeOffsetMinutes = (longitude - standardLongitude) * 4;
  localMeanSolarTime.setMinutes(localMeanSolarTime.getMinutes() + longitudeOffsetMinutes);
  const equationOfTimeMinutes = getEquationOfTimeMinutes(localMeanSolarTime);
  const adjusted = new Date(localMeanSolarTime.getTime());
  adjusted.setMinutes(adjusted.getMinutes() + equationOfTimeMinutes + 1);
  return {
    adjusted,
    solarOffsetMinutes: Math.round(longitudeOffsetMinutes + equationOfTimeMinutes + 1),
    longitudeOffsetMinutes: Math.round(longitudeOffsetMinutes),
    equationOfTimeMinutes: Math.round(equationOfTimeMinutes)
  };
}

function addElementScore(scores, char, weight) {
  const meta = elementMeta[char];
  if (!meta) return;
  scores[meta.name] += weight;
}

export function calculateElementScores(ganValues, zhiValues) {
  const scores = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  ganValues.forEach(gan => addElementScore(scores, gan, 1));
  zhiValues.forEach(zhi => {
    addElementScore(scores, zhi, 0.8);
    (hiddenGanMap[zhi] || []).forEach((gan, index) => addElementScore(scores, gan, index === 0 ? 0.6 : 0.3));
  });
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  return elementOrder.map(name => ({
    name,
    value: scores[name],
    percent: Math.round((scores[name] / total) * 100)
  }));
}

export function getStrengthState(dayElement, elementScores) {
  const scoreMap = Object.fromEntries(elementScores.map(item => [item.name, item.percent]));
  const support = (scoreMap[dayElement] || 0) + (scoreMap[generatedByElement[dayElement]] || 0);
  if (support >= 45) return 'strong';
  if (support <= 32) return 'weak';
  return 'balanced';
}

export function getUsefulElements(dayElement, strengthState) {
  if (strengthState === 'weak') return [generatedByElement[dayElement], dayElement];
  if (strengthState === 'strong') return [generateElement[dayElement], controlElement[dayElement]];
  return [controlElement[dayElement], controlledByElement[dayElement]];
}

export function getAvoidElements(dayElement, strengthState) {
  if (strengthState === 'weak') return [controlElement[dayElement], controlledByElement[dayElement]];
  if (strengthState === 'strong') return [dayElement, generatedByElement[dayElement]];
  return [generatedByElement[dayElement]];
}

export function normalizeInput(payload = {}) {
  const {
    name = 'Unnamed',
    gender = 'female',
    birthDate = '1983-01-20',
    birthTime = '05:15',
    isDST = false,
    longitude = 120,
    locationLabel = 'Unknown Location',
    language = 'en'
  } = payload;
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  return {
    name,
    gender,
    isDST: Boolean(isDST),
    longitude: Number(longitude),
    locationLabel,
    language,
    rawDate: new Date(year, month - 1, day, hour, minute, 0)
  };
}

export function buildCalculation(payload = {}) {
  const input = normalizeInput(payload);
  const solarResult = getTrueSolarDate(input.rawDate, input.longitude, input.isDST);
  const solar = Solar.fromYmdHms(
    solarResult.adjusted.getFullYear(),
    solarResult.adjusted.getMonth() + 1,
    solarResult.adjusted.getDate(),
    solarResult.adjusted.getHours(),
    solarResult.adjusted.getMinutes(),
    solarResult.adjusted.getSeconds()
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const ganValues = ['Year', 'Month', 'Day', 'Time'].map(item => callMethod(eightChar, `get${item}Gan`, '-'));
  const zhiValues = ['Year', 'Month', 'Day', 'Time'].map(item => callMethod(eightChar, `get${item}Zhi`, '-'));
  const dayMaster = ganValues[2];
  const dayElement = elementMeta[dayMaster]?.name || 'Earth';
  const elementScores = calculateElementScores(ganValues, zhiValues);
  const strengthState = getStrengthState(dayElement, elementScores);
  const usefulElements = getUsefulElements(dayElement, strengthState);
  const avoidElements = getAvoidElements(dayElement, strengthState);
  return {
    input: {
      ...input,
      rawBirthTime: formatDateTime(input.rawDate),
      adjustedBirthTime: formatDateTime(solarResult.adjusted)
    },
    solarAdjustment: solarResult,
    chart: {
      pillars: {
        year: `${ganValues[0]}${zhiValues[0]}`,
        month: `${ganValues[1]}${zhiValues[1]}`,
        day: `${ganValues[2]}${zhiValues[2]}`,
        time: `${ganValues[3]}${zhiValues[3]}`
      },
      ganValues,
      zhiValues,
      hiddenStems: zhiValues.map(zhi => hiddenGanMap[zhi] || []),
      mainStars: [
        callMethod(eightChar, 'getYearShiShenGan', '-'),
        callMethod(eightChar, 'getMonthShiShenGan', '-'),
        input.gender === 'male' ? '元男' : '元女',
        callMethod(eightChar, 'getTimeShiShenGan', '-')
      ],
      subStars: [
        callMethod(eightChar, 'getYearShiShenZhi', []),
        callMethod(eightChar, 'getMonthShiShenZhi', []),
        callMethod(eightChar, 'getDayShiShenZhi', []),
        callMethod(eightChar, 'getTimeShiShenZhi', [])
      ],
      diShi: ['Year', 'Month', 'Day', 'Time'].map(item => callMethod(eightChar, `get${item}DiShi`, '-')),
      xunKong: ['Year', 'Month', 'Day', 'Time'].map(item => callMethod(eightChar, `get${item}XunKong`, '-')),
      naYin: ['Year', 'Month', 'Day', 'Time'].map(item => callMethod(eightChar, `get${item}NaYin`, '-'))
    },
    analysis: {
      lunarDate: lunar.toString(),
      zodiac: callMethod(lunar, 'getYearShengXiao', '-'),
      jieQi: callMethod(lunar, 'getCurrentJieQi', '-') || '-',
      dayMaster,
      dayElement,
      elementScores,
      strengthState,
      usefulElements,
      avoidElements
    }
  };
}
