/**
 * 奇门遁甲 Service
 * Currently uses simplified calculation.
 * For full accuracy, use Python bridge with kinqimen library.
 */
import type { QimenInput, QimenResult, PalaceCell } from '@fortune/shared';

// 九宫 directions (Luoshu order)
const PALACE_DIRECTIONS: Record<number, string> = {
  1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中',
  6: '乾', 7: '兑', 8: '艮', 9: '离',
};

// 八门
const DOORS = ['休', '生', '伤', '杜', '景', '死', '惊', '开'];

// 九星
const STARS = ['天蓬', '天芮', '天冲', '天辅', '天禽', '天心', '天柱', '天任', '天英'];

// 八神 (阳遁顺序)
const GODS_YANG = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
// 八神 (阴遁顺序)
const GODS_YIN = ['值符', '九天', '九地', '玄武', '白虎', '六合', '太阴', '螣蛇'];

// Heavenly stems
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// Earthly branches
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export function calculateQimen(input: QimenInput): QimenResult {
  const { queryDateTime, method } = input;
  const date = new Date(queryDateTime);

  // Determine which Ju (局) based on solar term
  // Simplified: use month and day to estimate
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // Simplified JieQi to Ju number mapping
  const juNumber = calculateJuNumber(month, day, hour);

  // Yang Dun or Yin Dun based on JieQi
  const isYangDun = isYangDunPeriod(month, day);
  const yinYangDun = isYangDun ? '阳遁' : '阴遁';

  // Calculate palace arrangements
  const palaces = buildPalaces(juNumber, isYangDun, hour, month, day);

  const earthStems = palaces.map(p => p.earthStem);
  const heavenStems = palaces.map(p => p.heavenStem);
  const doors = palaces.map(p => p.door);
  const stars = palaces.map(p => p.star);
  const gods = palaces.map(p => p.god);

  return {
    juNumber,
    yinYangDun,
    palaces,
    zhiFu: stars[0],
    zhiShi: doors[0],
    eightDoors: doors,
    nineStars: stars,
    eightGods: gods.slice(0, 8),
  };
}

function calculateJuNumber(month: number, day: number, hour: number): number {
  // Simplified Ju calculation based on solar terms
  // In production, use exact solar term boundaries from lunar calendar
  const jieqiMap: Record<string, [number, number, number]> = {
    '冬至': [12, 22, 1], '小寒': [1, 6, 2], '大寒': [1, 20, 3],
    '立春': [2, 4, 8], '雨水': [2, 19, 9], '惊蛰': [3, 6, 1],
    '春分': [3, 21, 3], '清明': [4, 5, 4], '谷雨': [4, 20, 5],
    '立夏': [5, 6, 4], '小满': [5, 21, 5], '芒种': [6, 6, 6],
    '夏至': [6, 22, 9], '小暑': [7, 7, 8], '大暑': [7, 23, 7],
    '立秋': [8, 8, 2], '处暑': [8, 23, 1], '白露': [9, 8, 9],
    '秋分': [9, 23, 7], '寒露': [10, 8, 6], '霜降': [10, 23, 5],
    '立冬': [11, 8, 6], '小雪': [11, 22, 5], '大雪': [12, 7, 4],
  };

  // Determine current JieQi
  let ju = 1;
  for (const [m, d, j] of Object.values(jieqiMap)) {
    if ((month > m) || (month === m && day >= d)) {
      ju = j;
    }
  }

  // Adjust based on ShangYuan/ZhongYuan/XiaYuan
  // Simplified: use day of JieQi cycle
  const upperJu = ju;
  const middleJu = ju + 5 > 9 ? ju + 5 - 9 : ju + 5;
  const lowerJu = ju + 5 > 9 ? ju + 5 - 9 : ju + 5;

  return ((upperJu - 1 + Math.floor((day - 1) / 5)) % 9) + 1;
}

function isYangDunPeriod(month: number, day: number): boolean {
  // Yang Dun: 冬至 to 夏至 (approx Dec 22 to Jun 21)
  // Yin Dun: 夏至 to 冬至 (approx Jun 22 to Dec 21)
  if (month > 6) return false;
  if (month < 6) return true;
  return day <= 21;
}

function buildPalaces(juNumber: number, isYangDun: boolean, hour: number, month: number, day: number): PalaceCell[] {
  // Build the 9 palaces in Luoshu order
  const palaces: PalaceCell[] = [];

  // Earth plate: 地盘
  // Palace numbers: 1坎, 2坤, 3震, 4巽, 5中, 6乾, 7兑, 8艮, 9离
  const luoshuOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4]; // Simplified arrangement

  // Simplified: use juNumber to rotate heaven stems
  const earthStems = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

  // Hour branch determines door rotation
  const hourBranchIdx = Math.floor((hour + 1) / 2) % 12;
  const doorOffset = (hourBranchIdx + (isYangDun ? juNumber : -juNumber) + 9) % 8;

  for (let i = 0; i < 9; i++) {
    const palaceNum = luoshuOrder[i];
    const earthStemIdx = (i - juNumber + 1 + 9) % 9;

    palaces.push({
      number: palaceNum,
      direction: PALACE_DIRECTIONS[palaceNum],
      earthStem: earthStems[((earthStemIdx % 9) + 9) % 9],
      heavenStem: STEMS[(i + month) % 10],
      door: DOORS[(i + doorOffset) % 8],
      star: STARS[(i + juNumber) % 9],
      god: isYangDun
        ? GODS_YANG[(i + juNumber - 1) % 8]
        : GODS_YIN[(i - juNumber + 1 + 8) % 8],
    });
  }

  return palaces;
}

export function generateQimenReading(result: QimenResult): string {
  const { juNumber, yinYangDun, palaces, zhiFu, zhiShi } = result;

  let text = `## 🎯 奇门遁甲排盘\n\n`;
  text += `### 📐 基本参数\n`;
  text += `- **局数**: ${yinYangDun}${juNumber}局\n`;
  text += `- **值符**: ${zhiFu}\n`;
  text += `- **值使**: ${zhiShi}\n\n`;

  text += `### 🏯 九宫排盘\n`;
  text += `| 宫位 | 方向 | 地盘 | 天盘 | 八门 | 九星 | 八神 |\n`;
  text += `|------|------|------|------|------|------|------|\n`;
  palaces.forEach(p => {
    text += `| ${p.number} | ${p.direction} | ${p.earthStem} | ${p.heavenStem} | ${p.door} | ${p.star} | ${p.god} |\n`;
  });

  text += `\n### 🌟 简要分析\n`;
  const openPalace = palaces.find(p => p.door === '开');
  if (openPalace) {
    text += `开门落${openPalace.direction}宫，主事业、工作方面存在机遇。`;
  }
  const birthPalace = palaces.find(p => p.door === '生');
  if (birthPalace) {
    text += `生门落${birthPalace.direction}宫，主财运和健康方面有利。`;
  }

  return text;
}
