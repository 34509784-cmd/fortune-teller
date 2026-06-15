// ========== 星座 Types ==========

export type HouseSystem = 'PLACIDUS' | 'KOCH' | 'WHOLE_SIGN' | 'EQUAL';

export interface ZodiacInput {
  birthDateTime: string;   // ISO datetime
  longitude: number;
  latitude: number;
  houseSystem: HouseSystem;
}

export interface PlanetPosition {
  name: string;            // Sun, Moon, Mercury...
  sign: string;            // Aries, Taurus...
  degree: number;          // 0-359.99
  house: number;           // 1-12
  retrograde: boolean;
  signEmoji: string;       // ♈♉♊...
}

export interface HouseCusp {
  number: number;          // 1-12
  sign: string;
  degree: number;
  cuspDegree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;            // conjunction, trine, square...
  orb: number;
  isApplying: boolean;
}

export interface ZodiacResult {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  ascendant: string;       // "Libra 15°32'"
  midheaven: string;
  aspects: Aspect[];
  elements: Record<string, number>;    // { fire: 3, earth: 4, ... }
  modalities: Record<string, number>;  // { cardinal: 3, fixed: 4, ... }
  sunSign: string;
  moonSign: string;
}

export interface ZodiacReading {
  id: string;
  userId: string;
  input: ZodiacInput;
  result: ZodiacResult;
  readingText?: string;
  createdAt: string;
}
