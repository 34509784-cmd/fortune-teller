// ========== 奇门遁甲 Types ==========

export type QimenMethod = 'CHAIBU' | 'ZHIRUN';

export interface QimenInput {
  queryDateTime: string;  // ISO datetime
  method: QimenMethod;
}

export interface PalaceCell {
  number: number;          // 1-9, 5 is center
  direction: string;       // 坎/坤/震/巽/中/乾/兑/艮/离
  earthStem: string;       // 地盘干
  heavenStem: string;      // 天盘干
  door: string;            // 八门: 休/生/伤/杜/景/死/惊/开
  star: string;            // 九星: 天蓬/天芮/天冲...
  god: string;             // 八神: 值符/螣蛇/太阴...
}

export interface QimenResult {
  juNumber: number;        // 局数 1-9
  yinYangDun: '阳遁' | '阴遁';
  palaces: PalaceCell[];
  zhiFu: string;           // 值符星
  zhiShi: string;          // 值使门
  eightDoors: string[];    // 八门布置
  nineStars: string[];     // 九星布置
  eightGods: string[];     // 八神布置
}

export interface QimenReading {
  id: string;
  userId: string;
  input: QimenInput;
  result: QimenResult;
  readingText?: string;
  createdAt: string;
}
