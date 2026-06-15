// ========== 八字排盘 Types ==========

export type Gender = 'MALE' | 'FEMALE';
export type CalendarType = 'GREGORIAN' | 'LUNAR';

export interface BaziInput {
  birthDate: string;       // ISO date: "1990-05-15"
  birthTime: string;       // "08:30"
  longitude: number;
  latitude: number;
  gender: Gender;
  calendarType: CalendarType;
}

export interface Pillar {
  stem: string;            // 天干: 甲,乙,丙...
  branch: string;          // 地支: 子,丑,寅...
  hiddenStems: string[];   // 藏干
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface DaYunStep {
  startAge: number;
  endAge: number;
  stem: string;
  branch: string;
  direction: 'forward' | 'reverse';
}

export interface BaziResult {
  fourPillars: FourPillars;
  dayMaster: string;          // 日主天干
  tenGods: Record<string, string>;  // { year: "正官", month: "偏财", ... }
  fiveElements: Record<string, number>;  // { wood: 3, fire: 1, ... }
  daYun: DaYunStep[];
  shenSha: Array<{ name: string; pillar: string; type: string }>;
  naYin: Record<string, string>;   // { year: "炉中火", ... }
  elementBalance: {
    strongest: string;
    weakest: string;
    advice: string;
  };
}

export interface BaziReading {
  id: string;
  userId: string;
  input: BaziInput;
  result: BaziResult;
  readingText?: string;
  createdAt: string;
}
