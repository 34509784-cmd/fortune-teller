// ========== 八卦 / I Ching Types ==========

export type DivinationMethod = 'COINS' | 'AUTO' | 'YARROW';

export interface BaguaInput {
  question: string;
  method: DivinationMethod;
  manualLines?: number[];   // [6, 8, 7, 9, 8, 7] for coin toss
}

export interface HexagramData {
  number: number;            // 1-64
  name: string;              // "乾为天"
  pinyin: string;            // "Qian Wei Tian"
  character: string;         // "䷀"
  upperTrigram: string;      // "乾"
  lowerTrigram: string;      // "乾"
  judgment: string;          // Classical judgment text
  image: string;             // Classical image text
  lines: Array<{
    lineNumber: number;      // 1-6 (bottom to top)
    text: string;            // Yao text
    meaning: string;         // Interpretation
  }>;
}

export interface BaguaResult {
  primaryHexagram: HexagramData;
  changedHexagram?: HexagramData;
  changingLines: number[];   // [4, 6] = lines 4 and 6 are moving
  lines: number[];           // raw line values: [6,8,7,9,8,7]
}

export interface BaguaReading {
  id: string;
  userId: string;
  input: BaguaInput;
  result: BaguaResult;
  readingText?: string;
  createdAt: string;
}
