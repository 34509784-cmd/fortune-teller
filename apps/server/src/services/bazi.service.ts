/**
 * 八字排盘 Service
 * Uses lunar-typescript for calendar computation and traditional algorithms for Four Pillars.
 * For production use with shunshi-bazi-core, we build our own computation layer
 * on top of lunar-typescript which provides reliable solar term and stem-branch data.
 */
import { Lunar, Solar } from 'lunar-typescript';
import type { BaziInput, BaziResult, Pillar, FourPillars, DaYunStep } from '../../../../packages/shared/src/types/bazi';

// Heavenly Stems and Earthly Branches
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Five Elements mapping
const STEM_ELEMENTS: Record<string, string> = {
  '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth', '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};
const BRANCH_ELEMENTS: Record<string, string> = {
  '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water',
};

// Na Yin (纳音) Five Elements mapping for stem-branch pairs
const NA_YIN: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
};

// Ten Gods (十神) computation based on day master and other stems
function getTenGod(dayMaster: string, targetStem: string): string {
  const dmIdx = STEMS.indexOf(dayMaster);
  const tIdx = STEMS.indexOf(targetStem);

  // Same element (比肩/劫财)
  if (STEM_ELEMENTS[dayMaster] === STEM_ELEMENTS[targetStem]) {
    return (dmIdx % 2 === tIdx % 2) ? '比肩' : '劫财';
  }

  // Determine generation and control relationships
  const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
  const dmElem = STEM_ELEMENTS[dayMaster];
  const tElem = STEM_ELEMENTS[targetStem];
  const dmIdx2 = elementOrder.indexOf(dmElem);
  const tIdx2 = elementOrder.indexOf(tElem);

  // I generate (食神/伤官)
  if ((dmIdx2 + 1) % 5 === tIdx2) {
    return (dmIdx % 2 === tIdx % 2) ? '食神' : '伤官';
  }
  // I control (正财/偏财)
  if ((dmIdx2 + 2) % 5 === tIdx2) {
    return (dmIdx % 2 === tIdx % 2) ? '偏财' : '正财';
  }
  // Generates me (正印/偏印)
  if ((dmIdx2 + 4) % 5 === tIdx2) {
    return (dmIdx % 2 === tIdx % 2) ? '偏印' : '正印';
  }
  // Controls me (正官/七杀)
  if ((dmIdx2 + 3) % 5 === tIdx2) {
    return (dmIdx % 2 === tIdx % 2) ? '七杀' : '正官';
  }

  return '未知';
}

// Hidden stems (藏干) for each earthly branch
const HIDDEN_STEMS: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// Year stem-branch index for Da Yun starting point
function getSexagenaryIndex(stem: string, branch: string): number {
  const sIdx = STEMS.indexOf(stem);
  const bIdx = BRANCHES.indexOf(branch);
  // The sexagenary cycle index can be computed as (stemIdx * 6 + branchIdx * 5) % 10...
  // Actually it's simpler: the pair repeats every 60 combos. Convention: index = (s - b) mod 10
  // Traditional formula: if stem parity != branch parity, not a valid pair
  for (let i = 0; i < 60; i++) {
    if (STEMS[i % 10] === stem && BRANCHES[i % 12] === branch) return i;
  }
  return 0;
}

export function calculateBazi(input: BaziInput): BaziResult {
  const { birthDate, birthTime, gender, longitude } = input;

  // Parse date and time
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  // Use lunar-typescript's Solar to get the lunar calendar data
  // Apply true solar time adjustment based on longitude
  const standardMeridian = 120; // Beijing time zone standard meridian
  const timeOffset = (longitude - standardMeridian) * 4; // minutes
  const adjustedMinute = minute + timeOffset;
  const adjustedHour = hour + Math.floor(adjustedMinute / 60);
  const finalMinute = ((adjustedMinute % 60) + 60) % 60;
  const finalHour = ((adjustedHour % 24) + 24) % 24;

  const solar = Solar.fromYmdHms(year, month, day, adjustedHour, finalMinute, 0);
  const lunar = solar.getLunar();

  // Get four pillars from lunar-typescript
  const yearPillar: Pillar = {
    stem: lunar.getYearInGanZhi()[0],
    branch: lunar.getYearInGanZhi()[1],
    hiddenStems: HIDDEN_STEMS[lunar.getYearInGanZhi()[1]] || [],
  };
  const monthPillar: Pillar = {
    stem: lunar.getMonthInGanZhi()[0],
    branch: lunar.getMonthInGanZhi()[1],
    hiddenStems: HIDDEN_STEMS[lunar.getMonthInGanZhi()[1]] || [],
  };
  const dayPillar: Pillar = {
    stem: lunar.getDayInGanZhi()[0],
    branch: lunar.getDayInGanZhi()[1],
    hiddenStems: HIDDEN_STEMS[lunar.getDayInGanZhi()[1]] || [],
  };
  const hourPillar: Pillar = {
    stem: lunar.getTimeInGanZhi()[0],
    branch: lunar.getTimeInGanZhi()[1],
    hiddenStems: HIDDEN_STEMS[lunar.getTimeInGanZhi()[1]] || [],
  };

  const fourPillars: FourPillars = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };

  const dayMaster = dayPillar.stem;

  // Ten Gods
  const tenGods: Record<string, string> = {
    year: getTenGod(dayMaster, yearPillar.stem),
    month: getTenGod(dayMaster, monthPillar.stem),
    day: '日主',
    hour: getTenGod(dayMaster, hourPillar.stem),
  };

  // Five Elements count
  const fiveElements: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const pillar of Object.values(fourPillars)) {
    fiveElements[STEM_ELEMENTS[pillar.stem]] = (fiveElements[STEM_ELEMENTS[pillar.stem]] || 0) + 1;
    fiveElements[BRANCH_ELEMENTS[pillar.branch]] = (fiveElements[BRANCH_ELEMENTS[pillar.branch]] || 0) + 1;
  }

  // Element balance
  const elementNames: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
  let strongest = 'wood', weakest = 'wood';
  let max = 0, min = Infinity;
  for (const [elem, count] of Object.entries(fiveElements)) {
    if (count > max) { max = count; strongest = elem; }
    if (count < min) { min = count; weakest = elem; }
  }
  const elementBalance = {
    strongest: elementNames[strongest],
    weakest: elementNames[weakest],
    advice: `五行${elementNames[strongest]}偏旺，${elementNames[weakest]}偏弱，建议在生活中有意识地补充${elementNames[weakest]}的能量。`,
  };

  // Na Yin (纳音)
  const naYin: Record<string, string> = {
    year: NA_YIN[yearPillar.stem + yearPillar.branch] || '',
    month: NA_YIN[monthPillar.stem + monthPillar.branch] || '',
    day: NA_YIN[dayPillar.stem + dayPillar.branch] || '',
    hour: NA_YIN[hourPillar.stem + hourPillar.branch] || '',
  };

  // Da Yun (大运) - simplified calculation
  const daYun = calculateDaYun(lunar, dayMaster, gender, fourPillars);

  // Shen Sha (神煞) - simplified
  const shenSha = calculateShenSha(fourPillars);

  return {
    fourPillars,
    dayMaster,
    tenGods,
    fiveElements,
    daYun,
    shenSha,
    naYin,
    elementBalance,
  };
}

function calculateDaYun(lunar: any, dayMaster: string, gender: string, pillars: FourPillars): DaYunStep[] {
  // Simplified Da Yun calculation
  // In production, use shunshi-bazi-core for accurate calculation
  const isYangStem = STEMS.indexOf(dayMaster) % 2 === 0;
  const isMale = gender === 'MALE';
  const forward = (isYangStem && isMale) || (!isYangStem && !isMale);

  const monthStemIdx = STEMS.indexOf(pillars.month.stem);
  const monthBranchIdx = BRANCHES.indexOf(pillars.month.branch);

  const daYun: DaYunStep[] = [];
  const startAge = 5; // Simplified starting age
  const step = 10;

  for (let i = 0; i < 8; i++) {
    const offset = forward ? (i + 1) : -(i + 1);
    const stemIdx = ((monthStemIdx + offset) % 10 + 10) % 10;
    const branchIdx = ((monthBranchIdx + offset) % 12 + 12) % 12;

    daYun.push({
      startAge: startAge + i * step,
      endAge: startAge + (i + 1) * step - 1,
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      direction: forward ? 'forward' : 'reverse',
    });
  }

  return daYun;
}

function calculateShenSha(pillars: FourPillars): Array<{ name: string; pillar: string; type: string }> {
  // Simplified 神煞 calculation
  // In production, expand with full shensha rules
  const shenSha: Array<{ name: string; pillar: string; type: string }> = [];

  // 天乙贵人 simplified
  const dayStem = pillars.day.stem;
  const tianYiMap: Record<string, string[]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '庚': ['午', '寅'], '辛': ['午', '寅'],
    '壬': ['巳', '卯'], '癸': ['巳', '卯'],
  };

  const tianYi = tianYiMap[dayStem] || [];
  for (const [key, pillar] of Object.entries(pillars)) {
    if (tianYi.includes(pillar.branch)) {
      shenSha.push({ name: '天乙贵人', pillar: key, type: '吉' });
    }
  }

  // 文昌贵人 simplified
  const wenChangMap: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
    '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
    '壬': '寅', '癸': '卯',
  };
  const wenChang = wenChangMap[dayStem];
  if (wenChang) {
    for (const [key, pillar] of Object.entries(pillars)) {
      if (pillar.branch === wenChang) {
        shenSha.push({ name: '文昌贵人', pillar: key, type: '吉' });
      }
    }
  }

  return shenSha;
}
