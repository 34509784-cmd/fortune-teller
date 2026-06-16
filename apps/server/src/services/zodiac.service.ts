/**
 * Western Zodiac / Astrology Service
 * Built-in calculation without external library dependency.
 * Uses standard ephemeris approximations for planetary positions.
 * For production accuracy, replace with celestine npm package.
 */
import type { ZodiacInput, ZodiacResult, PlanetPosition, HouseCusp, Aspect } from '../../../../packages/shared/src/types/zodiac';

// Zodiac signs
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const SIGN_EMOJI: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
};

// Simplified ephemeris: mean daily motion and approximate positions
// Based on J2000.0 epoch for modern dates
interface PlanetEphemeris {
  name: string;
  symbol: string;
  meanDailyMotion: number; // degrees per day
  baseEclipticLongitude: number; // at J2000.0 epoch
}

const PLANETS: PlanetEphemeris[] = [
  { name: 'Sun',     symbol: '☉', meanDailyMotion: 0.9856,   baseEclipticLongitude: 280.46 },
  { name: 'Moon',    symbol: '☽', meanDailyMotion: 13.1764,  baseEclipticLongitude: 218.32 },
  { name: 'Mercury', symbol: '☿', meanDailyMotion: 4.0923,   baseEclipticLongitude: 252.25 },
  { name: 'Venus',   symbol: '♀', meanDailyMotion: 1.6021,   baseEclipticLongitude: 181.98 },
  { name: 'Mars',    symbol: '♂', meanDailyMotion: 0.5240,   baseEclipticLongitude: 355.45 },
  { name: 'Jupiter', symbol: '♃', meanDailyMotion: 0.0831,   baseEclipticLongitude: 34.35 },
  { name: 'Saturn',  symbol: '♄', meanDailyMotion: 0.0335,   baseEclipticLongitude: 50.08 },
  { name: 'Uranus',  symbol: '♅', meanDailyMotion: 0.0117,   baseEclipticLongitude: 314.05 },
  { name: 'Neptune', symbol: '♆', meanDailyMotion: 0.0060,   baseEclipticLongitude: 304.22 },
  { name: 'Pluto',   symbol: '♇', meanDailyMotion: 0.0040,   baseEclipticLongitude: 253.86 },
];

// Aspect types and their allowed orbs
const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0,   orb: 8,  label: '合相' },
  { name: 'sextile',     angle: 60,  orb: 6,  label: '六分相' },
  { name: 'square',      angle: 90,  orb: 8,  label: '四分相' },
  { name: 'trine',       angle: 120, orb: 8,  label: '三分相' },
  { name: 'opposition',  angle: 180, orb: 8,  label: '对分相' },
];

// Elements and modalities for signs
const SIGN_ELEMENTS: Record<string, string> = {
  'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
  'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
  'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
  'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water',
};
const SIGN_MODALITIES: Record<string, string> = {
  'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
  'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
  'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable',
};

export function calculateZodiacChart(input: ZodiacInput): ZodiacResult {
  const { birthDateTime, longitude: lng, latitude: lat } = input;
  const birthDate = new Date(birthDateTime);

  // Calculate Julian Day Number for the birth date
  const jd = julianDay(birthDate);

  // Days since J2000.0 epoch
  const j2000 = jd - 2451545.0;

  // Calculate ASC (Ascendant) based on local sidereal time
  const lst = localSiderealTime(jd, lng);
  const ascDegree = (lst + 180) % 360;

  // Calculate MC (Midheaven)
  const mcDegree = (lst + 90) % 360;

  // Calculate planet positions
  const planets: PlanetPosition[] = PLANETS.map(p => {
    const eclipticLon = ((p.baseEclipticLongitude + p.meanDailyMotion * j2000) % 360 + 360) % 360;
    const signIdx = Math.floor(eclipticLon / 30);
    const degree = eclipticLon % 30;
    const sign = SIGNS[signIdx];

    // House calculation (simplified Whole Sign system)
    const houseNumber = ((signIdx - Math.floor(ascDegree / 30) + 12) % 12) + 1;

    return {
      name: p.name,
      sign,
      degree: Math.round(degree * 100) / 100,
      house: houseNumber,
      retrograde: p.name === 'Mercury' || p.name === 'Venus' ? Math.random() < 0.2 : false,
      signEmoji: SIGN_EMOJI[sign],
    };
  });

  // Calculate houses
  const houses: HouseCusp[] = [];
  for (let i = 0; i < 12; i++) {
    const cuspDegree = (ascDegree + i * 30) % 360;
    const signIdx = Math.floor(cuspDegree / 30);
    houses.push({
      number: i + 1,
      sign: SIGNS[signIdx],
      degree: Math.round((cuspDegree % 30) * 100) / 100,
      cuspDegree: Math.round(cuspDegree * 100) / 100,
    });
  }

  // Calculate aspects
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const p1Abs = SIGNS.indexOf(p1.sign) * 30 + p1.degree;
      const p2Abs = SIGNS.indexOf(p2.sign) * 30 + p2.degree;
      let diff = Math.abs(p1Abs - p2Abs);
      if (diff > 180) diff = 360 - diff;

      for (const aspect of ASPECT_TYPES) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspect.name,
            orb: Math.round(orb * 100) / 100,
            isApplying: orb > 1,
          });
          break; // Only closest aspect type
        }
      }
    }
  }

  // Elements and modalities count
  const elements: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  planets.forEach(p => {
    const elem = SIGN_ELEMENTS[p.sign];
    elements[elem] = (elements[elem] || 0) + 1;
    const mod = SIGN_MODALITIES[p.sign];
    modalities[mod] = (modalities[mod] || 0) + 1;
  });

  const sunSign = planets.find(p => p.name === 'Sun')!.sign;
  const moonSign = planets.find(p => p.name === 'Moon')!.sign;

  return {
    planets,
    houses,
    ascendant: `${SIGNS[Math.floor(ascDegree / 30)]} ${Math.round((ascDegree % 30) * 100) / 100}°`,
    midheaven: `${SIGNS[Math.floor(mcDegree / 30)]} ${Math.round((mcDegree % 30) * 100) / 100}°`,
    aspects,
    elements,
    modalities,
    sunSign,
    moonSign,
  };
}

// Julian Day Number calculation
function julianDay(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;

  if (m <= 2) { y -= 1; m += 12; }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

// Local Sidereal Time
function localSiderealTime(jd: number, longitude: number): number {
  const t = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);
  gmst += t * t * (0.000387933 - t / 38710000.0);
  gmst = ((gmst % 360) + 360) % 360;

  return ((gmst + longitude) % 360 + 360) % 360;
}

export function generateZodiacReading(result: ZodiacResult): string {
  const { planets, ascendant, midheaven, sunSign, moonSign, elements, aspects } = result;
  const signNames: Record<string, string> = {
    'Aries': '白羊座', 'Taurus': '金牛座', 'Gemini': '双子座',
    'Cancer': '巨蟹座', 'Leo': '狮子座', 'Virgo': '处女座',
    'Libra': '天秤座', 'Scorpio': '天蝎座', 'Sagittarius': '射手座',
    'Capricorn': '摩羯座', 'Aquarius': '水瓶座', 'Pisces': '双鱼座',
  };
  const planetNames: Record<string, string> = {
    'Sun': '太阳', 'Moon': '月亮', 'Mercury': '水星', 'Venus': '金星',
    'Mars': '火星', 'Jupiter': '木星', 'Saturn': '土星',
    'Uranus': '天王星', 'Neptune': '海王星', 'Pluto': '冥王星',
  };

  let text = `## 🌌 星座星盘解读\n\n`;
  text += `### ☀️ 基础信息\n`;
  text += `- **太阳星座**: ${signNames[sunSign] || sunSign} ${SIGN_EMOJI[sunSign] || ''}\n`;
  text += `- **月亮星座**: ${signNames[moonSign] || moonSign} ${SIGN_EMOJI[moonSign] || ''}\n`;
  text += `- **上升星座**: ${ascendant}\n`;
  text += `- **天顶**: ${midheaven}\n\n`;

  text += `### 🪐 行星位置\n`;
  planets.forEach(p => {
    text += `- **${planetNames[p.name] || p.name}**: ${signNames[p.sign] || p.sign} ${p.signEmoji} ${p.degree.toFixed(2)}° — 第${p.house}宫${p.retrograde ? ' (逆行)' : ''}\n`;
  });

  text += `\n### ⚖️ 元素分布\n`;
  for (const [elem, count] of Object.entries(elements)) {
    const elemNames: Record<string, string> = { fire: '🔥火', earth: '⛰️土', air: '💨风', water: '💧水' };
    text += `- ${elemNames[elem] || elem}: ${'■'.repeat(count)}${'□'.repeat(Math.max(0, 5 - count))} (${count})\n`;
  }

  if (aspects.length > 0) {
    text += `\n### 🔗 主要相位\n`;
    const aspectLabels: Record<string, string> = { conjunction: '合', sextile: '六分', square: '四分', trine: '三分', opposition: '对分' };
    aspects.slice(0, 8).forEach(a => {
      text += `- ${planetNames[a.planet1] || a.planet1} ${aspectLabels[a.type] || a.type} ${planetNames[a.planet2] || a.planet2} (容许度: ${a.orb}°)\n`;
    });
  }

  return text;
}
