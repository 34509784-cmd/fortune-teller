/**
 * 八卦 / I Ching Service
 * Coin toss divination and hexagram interpretation.
 */
import type { BaguaInput, BaguaResult, HexagramData } from '../../../../packages/shared/src/types/bagua';

// Complete I Ching hexagram data (64 hexagrams)
// In production, use the 'i-ching' npm package for complete data
const HEXAGRAMS: Record<number, Omit<HexagramData, 'lines'>> = {
  1:  { number: 1,  name: '乾为天',   pinyin: 'Qian Wei Tian',   character: '䷀', upperTrigram: '乾', lowerTrigram: '乾', judgment: '元亨利贞。', image: '天行健，君子以自强不息。' },
  2:  { number: 2,  name: '坤为地',   pinyin: 'Kun Wei Di',     character: '䷁', upperTrigram: '坤', lowerTrigram: '坤', judgment: '元亨利牝马之贞。', image: '地势坤，君子以厚德载物。' },
  3:  { number: 3,  name: '水雷屯',   pinyin: 'Shui Lei Zhun',  character: '䷂', upperTrigram: '坎', lowerTrigram: '震', judgment: '元亨利贞，勿用有攸往。', image: '云雷屯，君子以经纶。' },
  4:  { number: 4,  name: '山水蒙',   pinyin: 'Shan Shui Meng', character: '䷃', upperTrigram: '艮', lowerTrigram: '坎', judgment: '亨，匪我求童蒙，童蒙求我。', image: '山下出泉蒙，君子以果行育德。' },
  5:  { number: 5,  name: '水天需',   pinyin: 'Shui Tian Xu',   character: '䷄', upperTrigram: '坎', lowerTrigram: '乾', judgment: '有孚，光亨，贞吉，利涉大川。', image: '云上于天需，君子以饮食宴乐。' },
  6:  { number: 6,  name: '天水讼',   pinyin: 'Tian Shui Song', character: '䷅', upperTrigram: '乾', lowerTrigram: '坎', judgment: '有孚窒惕，中吉，终凶。', image: '天与水违行讼，君子以作事谋始。' },
  7:  { number: 7,  name: '地水师',   pinyin: 'Di Shui Shi',    character: '䷆', upperTrigram: '坤', lowerTrigram: '坎', judgment: '贞，丈人吉，无咎。', image: '地中有水师，君子以容民畜众。' },
  8:  { number: 8,  name: '水地比',   pinyin: 'Shui Di Bi',     character: '䷇', upperTrigram: '坎', lowerTrigram: '坤', judgment: '吉，原筮元永贞，无咎。', image: '地上有水比，先王以建万国亲诸侯。' },
  9:  { number: 9,  name: '风天小畜', pinyin: 'Feng Tian Xiao Xu', character: '䷈', upperTrigram: '巽', lowerTrigram: '乾', judgment: '亨，密云不雨，自我西郊。', image: '风行天上小畜，君子以懿文德。' },
  10: { number: 10, name: '天泽履',   pinyin: 'Tian Ze Lü',     character: '䷉', upperTrigram: '乾', lowerTrigram: '兑', judgment: '履虎尾，不咥人，亨。', image: '上天下泽履，君子以辨上下定民志。' },
  11: { number: 11, name: '地天泰',   pinyin: 'Di Tian Tai',    character: '䷊', upperTrigram: '坤', lowerTrigram: '乾', judgment: '小往大来，吉亨。', image: '天地交泰，后以财成天地之道。' },
  12: { number: 12, name: '天地否',   pinyin: 'Tian Di Pi',     character: '䷋', upperTrigram: '乾', lowerTrigram: '坤', judgment: '否之匪人，不利君子贞。', image: '天地不交否，君子以俭德辟难。' },
  13: { number: 13, name: '天火同人', pinyin: 'Tian Huo Tong Ren', character: '䷌', upperTrigram: '乾', lowerTrigram: '离', judgment: '同人于野，亨，利涉大川。', image: '天与火同人，君子以类族辨物。' },
  14: { number: 14, name: '火天大有', pinyin: 'Huo Tian Da You', character: '䷍', upperTrigram: '离', lowerTrigram: '乾', judgment: '元亨。', image: '火在天上大有，君子以遏恶扬善。' },
  15: { number: 15, name: '地山谦',   pinyin: 'Di Shan Qian',   character: '䷎', upperTrigram: '坤', lowerTrigram: '艮', judgment: '亨，君子有终。', image: '地中有山谦，君子以裒多益寡。' },
  16: { number: 16, name: '雷地豫',   pinyin: 'Lei Di Yu',      character: '䷏', upperTrigram: '震', lowerTrigram: '坤', judgment: '利建侯行师。', image: '雷出地奋豫，先王以作乐崇德。' },
  17: { number: 17, name: '泽雷随',   pinyin: 'Ze Lei Sui',     character: '䷐', upperTrigram: '兑', lowerTrigram: '震', judgment: '元亨利贞，无咎。', image: '泽中有雷随，君子以向晦入宴息。' },
  18: { number: 18, name: '山风蛊',   pinyin: 'Shan Feng Gu',   character: '䷑', upperTrigram: '艮', lowerTrigram: '巽', judgment: '元亨，利涉大川，先甲三日。', image: '山下有风蛊，君子以振民育德。' },
  19: { number: 19, name: '地泽临',   pinyin: 'Di Ze Lin',      character: '䷒', upperTrigram: '坤', lowerTrigram: '兑', judgment: '元亨利贞，至于八月有凶。', image: '泽上有地临，君子以教思无穷。' },
  20: { number: 20, name: '风地观',   pinyin: 'Feng Di Guan',   character: '䷓', upperTrigram: '巽', lowerTrigram: '坤', judgment: '盥而不荐，有孚颙若。', image: '风行地上观，先王以省方观民设教。' },
  21: { number: 21, name: '火雷噬嗑', pinyin: 'Huo Lei Shi He', character: '䷔', upperTrigram: '离', lowerTrigram: '震', judgment: '亨，利用狱。', image: '雷电噬嗑，先王以明罚敕法。' },
  22: { number: 22, name: '山火贲',   pinyin: 'Shan Huo Bi',    character: '䷕', upperTrigram: '艮', lowerTrigram: '离', judgment: '亨，小利有攸往。', image: '山下有火贲，君子以明庶政。' },
  23: { number: 23, name: '山地剥',   pinyin: 'Shan Di Bo',     character: '䷖', upperTrigram: '艮', lowerTrigram: '坤', judgment: '不利有攸往。', image: '山附于地剥，上以厚下安宅。' },
  24: { number: 24, name: '地雷复',   pinyin: 'Di Lei Fu',      character: '䷗', upperTrigram: '坤', lowerTrigram: '震', judgment: '亨，出入无疾，朋来无咎。', image: '雷在地中复，先王以至日闭关。' },
  25: { number: 25, name: '天雷无妄', pinyin: 'Tian Lei Wu Wang', character: '䷘', upperTrigram: '乾', lowerTrigram: '震', judgment: '元亨利贞，其匪正有眚。', image: '天下雷行物与无妄，先王以茂对时育万物。' },
  26: { number: 26, name: '山天大畜', pinyin: 'Shan Tian Da Xu', character: '䷙', upperTrigram: '艮', lowerTrigram: '乾', judgment: '利贞，不家食吉，利涉大川。', image: '天在山中大畜，君子以多识前言往行。' },
  27: { number: 27, name: '山雷颐',   pinyin: 'Shan Lei Yi',    character: '䷚', upperTrigram: '艮', lowerTrigram: '震', judgment: '贞吉，观颐自求口实。', image: '山下有雷颐，君子以慎言语节饮食。' },
  28: { number: 28, name: '泽风大过', pinyin: 'Ze Feng Da Guo', character: '䷛', upperTrigram: '兑', lowerTrigram: '巽', judgment: '栋桡，利有攸往，亨。', image: '泽灭木大过，君子以独立不惧。' },
  29: { number: 29, name: '坎为水',   pinyin: 'Kan Wei Shui',   character: '䷜', upperTrigram: '坎', lowerTrigram: '坎', judgment: '习坎，有孚，维心亨。', image: '水洊至习坎，君子以常德行习教事。' },
  30: { number: 30, name: '离为火',   pinyin: 'Li Wei Huo',     character: '䷝', upperTrigram: '离', lowerTrigram: '离', judgment: '利贞，亨，畜牝牛吉。', image: '明两作离，大人以继明照于四方。' },
  31: { number: 31, name: '泽山咸',   pinyin: 'Ze Shan Xian',   character: '䷞', upperTrigram: '兑', lowerTrigram: '艮', judgment: '亨利贞，取女吉。', image: '山上有泽咸，君子以虚受人。' },
  32: { number: 32, name: '雷风恒',   pinyin: 'Lei Feng Heng',  character: '䷟', upperTrigram: '震', lowerTrigram: '巽', judgment: '亨，无咎，利贞。', image: '雷风恒，君子以立不易方。' },
  33: { number: 33, name: '天山遁',   pinyin: 'Tian Shan Dun',  character: '䷠', upperTrigram: '乾', lowerTrigram: '艮', judgment: '亨，小利贞。', image: '天下有山遁，君子以远小人。' },
  34: { number: 34, name: '雷天大壮', pinyin: 'Lei Tian Da Zhuang', character: '䷡', upperTrigram: '震', lowerTrigram: '乾', judgment: '利贞。', image: '雷在天上大壮，君子以非礼弗履。' },
  35: { number: 35, name: '火地晋',   pinyin: 'Huo Di Jin',     character: '䷢', upperTrigram: '离', lowerTrigram: '坤', judgment: '康侯用锡马蕃庶，昼日三接。', image: '明出地上晋，君子以自昭明德。' },
  36: { number: 36, name: '地火明夷', pinyin: 'Di Huo Ming Yi', character: '䷣', upperTrigram: '坤', lowerTrigram: '离', judgment: '利艰贞。', image: '明入地中明夷，君子以莅众用晦而明。' },
  37: { number: 37, name: '风火家人', pinyin: 'Feng Huo Jia Ren', character: '䷤', upperTrigram: '巽', lowerTrigram: '离', judgment: '利女贞。', image: '风自火出家人，君子以言有物而行有恒。' },
  38: { number: 38, name: '火泽睽',   pinyin: 'Huo Ze Kui',     character: '䷥', upperTrigram: '离', lowerTrigram: '兑', judgment: '小事吉。', image: '上火下泽睽，君子以同而异。' },
  39: { number: 39, name: '水山蹇',   pinyin: 'Shui Shan Jian', character: '䷦', upperTrigram: '坎', lowerTrigram: '艮', judgment: '利西南，不利东北。', image: '山上有水蹇，君子以反身修德。' },
  40: { number: 40, name: '雷水解',   pinyin: 'Lei Shui Xie',   character: '䷧', upperTrigram: '震', lowerTrigram: '坎', judgment: '利西南，无所往其来复吉。', image: '雷雨作解，君子以赦过宥罪。' },
  41: { number: 41, name: '山泽损',   pinyin: 'Shan Ze Sun',    character: '䷨', upperTrigram: '艮', lowerTrigram: '兑', judgment: '有孚，元吉，无咎。', image: '山下有泽损，君子以惩忿窒欲。' },
  42: { number: 42, name: '风雷益',   pinyin: 'Feng Lei Yi',    character: '䷩', upperTrigram: '巽', lowerTrigram: '震', judgment: '利有攸往，利涉大川。', image: '风雷益，君子以见善则迁有过则改。' },
  43: { number: 43, name: '泽天夬',   pinyin: 'Ze Tian Guai',   character: '䷪', upperTrigram: '兑', lowerTrigram: '乾', judgment: '扬于王庭，孚号有厉。', image: '泽上于天夬，君子以施禄及下。' },
  44: { number: 44, name: '天风姤',   pinyin: 'Tian Feng Gou',  character: '䷫', upperTrigram: '乾', lowerTrigram: '巽', judgment: '女壮，勿用取女。', image: '天下有风姤，后以施命诰四方。' },
  45: { number: 45, name: '泽地萃',   pinyin: 'Ze Di Cui',      character: '䷬', upperTrigram: '兑', lowerTrigram: '坤', judgment: '亨，王假有庙。', image: '泽上于地萃，君子以除戎器戒不虞。' },
  46: { number: 46, name: '地风升',   pinyin: 'Di Feng Sheng',  character: '䷭', upperTrigram: '坤', lowerTrigram: '巽', judgment: '元亨，用见大人。', image: '地中生木升，君子以顺德积小以高大。' },
  47: { number: 47, name: '泽水困',   pinyin: 'Ze Shui Kun',    character: '䷮', upperTrigram: '兑', lowerTrigram: '坎', judgment: '亨，贞大人吉。', image: '泽无水困，君子以致命遂志。' },
  48: { number: 48, name: '水风井',   pinyin: 'Shui Feng Jing', character: '䷯', upperTrigram: '坎', lowerTrigram: '巽', judgment: '改邑不改井，无丧无得。', image: '木上有水井，君子以劳民劝相。' },
  49: { number: 49, name: '泽火革',   pinyin: 'Ze Huo Ge',      character: '䷰', upperTrigram: '兑', lowerTrigram: '离', judgment: '巳日乃孚，元亨利贞。', image: '泽中有火革，君子以治历明时。' },
  50: { number: 50, name: '火风鼎',   pinyin: 'Huo Feng Ding',  character: '䷱', upperTrigram: '离', lowerTrigram: '巽', judgment: '元吉，亨。', image: '木上有火鼎，君子以正位凝命。' },
  51: { number: 51, name: '震为雷',   pinyin: 'Zhen Wei Lei',   character: '䷲', upperTrigram: '震', lowerTrigram: '震', judgment: '亨，震来虩虩，笑言哑哑。', image: '洊雷震，君子以恐惧修省。' },
  52: { number: 52, name: '艮为山',   pinyin: 'Gen Wei Shan',   character: '䷳', upperTrigram: '艮', lowerTrigram: '艮', judgment: '艮其背不获其身，行其庭不见其人。', image: '兼山艮，君子以思不出其位。' },
  53: { number: 53, name: '风山渐',   pinyin: 'Feng Shan Jian', character: '䷴', upperTrigram: '巽', lowerTrigram: '艮', judgment: '女归吉，利贞。', image: '山上有木渐，君子以居贤德善俗。' },
  54: { number: 54, name: '雷泽归妹', pinyin: 'Lei Ze Gui Mei', character: '䷵', upperTrigram: '震', lowerTrigram: '兑', judgment: '征凶，无攸利。', image: '泽上有雷归妹，君子以永终知敝。' },
  55: { number: 55, name: '雷火丰',   pinyin: 'Lei Huo Feng',   character: '䷶', upperTrigram: '震', lowerTrigram: '离', judgment: '亨，王假之，勿忧。', image: '雷电皆至丰，君子以折狱致刑。' },
  56: { number: 56, name: '火山旅',   pinyin: 'Huo Shan Lü',    character: '䷷', upperTrigram: '离', lowerTrigram: '艮', judgment: '小亨，旅贞吉。', image: '山上有火旅，君子以明慎用刑。' },
  57: { number: 57, name: '巽为风',   pinyin: 'Xun Wei Feng',   character: '䷸', upperTrigram: '巽', lowerTrigram: '巽', judgment: '小亨，利有攸往。', image: '随风巽，君子以申命行事。' },
  58: { number: 58, name: '兑为泽',   pinyin: 'Dui Wei Ze',     character: '䷹', upperTrigram: '兑', lowerTrigram: '兑', judgment: '亨，利贞。', image: '丽泽兑，君子以朋友讲习。' },
  59: { number: 59, name: '风水涣',   pinyin: 'Feng Shui Huan', character: '䷺', upperTrigram: '巽', lowerTrigram: '坎', judgment: '亨，王假有庙。', image: '风行水上涣，先王以享于帝立庙。' },
  60: { number: 60, name: '水泽节',   pinyin: 'Shui Ze Jie',    character: '䷻', upperTrigram: '坎', lowerTrigram: '兑', judgment: '亨，苦节不可贞。', image: '泽上有水节，君子以制数度议德行。' },
  61: { number: 61, name: '风泽中孚', pinyin: 'Feng Ze Zhong Fu', character: '䷼', upperTrigram: '巽', lowerTrigram: '兑', judgment: '豚鱼吉，利涉大川。', image: '泽上有风中孚，君子以议狱缓死。' },
  62: { number: 62, name: '雷山小过', pinyin: 'Lei Shan Xiao Guo', character: '䷽', upperTrigram: '震', lowerTrigram: '艮', judgment: '亨，利贞，可小事不可大事。', image: '山上有雷小过，君子以行过乎恭。' },
  63: { number: 63, name: '水火既济', pinyin: 'Shui Huo Ji Ji', character: '䷾', upperTrigram: '坎', lowerTrigram: '离', judgment: '亨小，利贞，初吉终乱。', image: '水在火上既济，君子以思患而预防之。' },
  64: { number: 64, name: '火水未济', pinyin: 'Huo Shui Wei Ji', character: '䷿', upperTrigram: '离', lowerTrigram: '坎', judgment: '亨，小狐汔济濡其尾。', image: '火在水上未济，君子以慎辨物居方。' },
};

// Trigram mapping (lower trigram bits + upper trigram bits → hexagram number)
// Lower trigram: bottom 3 lines (bits 0-2), Upper trigram: top 3 lines (bits 3-5)
const TRIGRAM_VALUES: Record<string, number[]> = {
  '乾': [1,1,1], '兑': [0,1,1], '离': [1,0,1], '震': [0,0,1],
  '巽': [1,1,0], '坎': [0,1,0], '艮': [1,0,0], '坤': [0,0,0],
};

// Line interpretations
const LINE_TEXTS: Record<number, string[]> = {
  1: ['潜龙勿用。', '见龙在田，利见大人。', '君子终日乾乾，夕惕若厉。', '或跃在渊，无咎。', '飞龙在天，利见大人。', '亢龙有悔。'],
  2: ['履霜，坚冰至。', '直方大，不习无不利。', '含章可贞，或从王事。', '括囊，无咎无誉。', '黄裳，元吉。', '龙战于野，其血玄黄。'],
};

export function divineBagua(input: BaguaInput): BaguaResult {
  const { method, manualLines } = input;

  // Generate 6 lines based on method
  let lines: number[];
  if (method === 'COINS' && manualLines && manualLines.length === 6) {
    lines = manualLines;
  } else {
    lines = generateCoinToss();
  }

  // Convert lines to hexagram
  const changingLines: number[] = [];
  lines.forEach((val, idx) => {
    if (val === 6 || val === 9) changingLines.push(idx + 1);
  });

  const primaryNumber = linesToHexagramNumber(lines);
  const primaryHexagram = getHexagramData(primaryNumber);

  let changedHexagram: HexagramData | undefined;
  if (changingLines.length > 0) {
    const changedLines = lines.map(l => l === 6 ? 7 : l === 9 ? 8 : l);
    const changedNumber = linesToHexagramNumber(changedLines);
    changedHexagram = getHexagramData(changedNumber);
  }

  return {
    primaryHexagram,
    changedHexagram,
    changingLines,
    lines,
  };
}

function generateCoinToss(): number[] {
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    // Simulate 3 coins: each coin = 2 or 3, sum = 6, 7, 8, or 9
    const coin1 = Math.random() < 0.5 ? 2 : 3;
    const coin2 = Math.random() < 0.5 ? 2 : 3;
    const coin3 = Math.random() < 0.5 ? 2 : 3;
    lines.push(coin1 + coin2 + coin3);
  }
  return lines;
}

function linesToHexagramNumber(lines: number[]): number {
  // Build the hexagram from bottom (line 0) to top (line 5)
  // Lower trigram: lines[0..2], Upper trigram: lines[3..5]
  const lowerBits = lines.slice(0, 3).map(l => (l === 7 || l === 9) ? 1 : 0);
  const upperBits = lines.slice(3, 6).map(l => (l === 7 || l === 9) ? 1 : 0);

  // Find trigram names from bits
  const lowerName = bitsToTrigramName(lowerBits);
  const upperName = bitsToTrigramName(upperBits);

  // Find hexagram number
  for (const h of Object.values(HEXAGRAMS)) {
    if (h.lowerTrigram === lowerName && h.upperTrigram === upperName) {
      return h.number;
    }
  }
  return 1; // Fallback
}

function bitsToTrigramName(bits: number[]): string {
  const key = bits.join(',');
  for (const [name, val] of Object.entries(TRIGRAM_VALUES)) {
    if (val.join(',') === key) return name;
  }
  return '乾';
}

function getHexagramData(number: number): HexagramData {
  const data = HEXAGRAMS[number] || HEXAGRAMS[1];
  const lineTexts = LINE_TEXTS[number] || [
    '初爻：事物初生，需要耐心观察。',
    '二爻：渐入佳境，把握时机。',
    '三爻：中途多艰，谨慎行事。',
    '四爻：进退有度，从长计议。',
    '五爻：中正之位，大有所为。',
    '上爻：物极必反，功成身退。',
  ];

  return {
    ...data,
    lines: lineTexts.map((text, i) => ({
      lineNumber: i + 1,
      text,
      meaning: text,
    })),
  };
}

export function generateBaguaReading(result: BaguaResult, question: string): string {
  const { primaryHexagram, changedHexagram, changingLines } = result;

  let text = `## 🔮 易经占卜解读\n\n`;
  text += `**您的问题**: ${question}\n\n`;
  text += `### 📜 本卦: ${primaryHexagram.character} ${primaryHexagram.name} (#${primaryHexagram.number})\n`;
  text += `**卦辞**: ${primaryHexagram.judgment}\n`;
  text += `**象传**: ${primaryHexagram.image}\n\n`;

  if (changedHexagram) {
    text += `### 🔄 变卦: ${changedHexagram.character} ${changedHexagram.name} (#${changedHexagram.number})\n`;
    text += `**卦辞**: ${changedHexagram.judgment}\n\n`;
    text += `### ⚡ 动爻\n`;
    changingLines.forEach(lineNum => {
      const line = primaryHexagram.lines.find(l => l.lineNumber === lineNum);
      if (line) {
        text += `- **第${lineNum}爻**: ${line.text}\n`;
      }
    });
  } else {
    text += `### 📍 静卦\n本卦六爻安静，无动爻。这意味着当前局势稳定，事情会按照本卦的启示自然发展。\n`;
  }

  text += `\n### 🌟 综合解读\n`;
  text += `上卦${primaryHexagram.upperTrigram}为天，下卦${primaryHexagram.lowerTrigram}为地。`;
  if (changedHexagram) {
    text += `本卦${primaryHexagram.name}化${changedHexagram.name}，${changingLines.length}爻动，预示着变化在所难免。`;
  }

  return text;
}
