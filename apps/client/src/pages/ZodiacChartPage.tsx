import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SIGN_NAMES: Record<string, string> = {
  'Aries': '白羊座', 'Taurus': '金牛座', 'Gemini': '双子座',
  'Cancer': '巨蟹座', 'Leo': '狮子座', 'Virgo': '处女座',
  'Libra': '天秤座', 'Scorpio': '天蝎座', 'Sagittarius': '射手座',
  'Capricorn': '摩羯座', 'Aquarius': '水瓶座', 'Pisces': '双鱼座',
};
const PLANET_NAMES: Record<string, string> = {
  'Sun': '太阳', 'Moon': '月亮', 'Mercury': '水星', 'Venus': '金星',
  'Mars': '火星', 'Jupiter': '木星', 'Saturn': '土星',
  'Uranus': '天王星', 'Neptune': '海王星', 'Pluto': '冥王星',
};
const PLANET_EMOJIS: Record<string, string> = {
  'Sun': '☀️', 'Moon': '🌙', 'Mercury': '☿️', 'Venus': '♀️',
  'Mars': '♂️', 'Jupiter': '♃', 'Saturn': '♄',
  'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
};

export default function ZodiacChartPage() {
  const location = useLocation();
  const data = location.state;
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="text-6xl mb-4 block">🌌</span>
        <h1 className="section-title">未找到星盘结果</h1>
        <Link to="/zodiac" className="mystic-button-primary mt-4 inline-block">重新绘制</Link>
      </div>
    );
  }

  const { planets, houses, ascendant, midheaven, aspects, elements, modalities, sunSign, moonSign, readingText } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/zodiac" className="text-mystic-text-secondary hover:text-mystic-accent transition-colors mb-6 inline-block">
          ← 重新绘制
        </Link>

        <h1 className="section-title text-center mb-8">🌌 星座星盘</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview */}
          <motion.div className="glass-card p-6 text-center lg:col-span-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-center gap-8 flex-wrap">
              <div>
                <div className="text-sm text-mystic-text-secondary">太阳星座</div>
                <div className="text-2xl font-heading text-mystic-accent">
                  {signPlanet(sunSign)} {SIGN_NAMES[sunSign] || sunSign}
                </div>
              </div>
              <div>
                <div className="text-sm text-mystic-text-secondary">月亮星座</div>
                <div className="text-2xl font-heading text-mystic-accent">
                  🌙 {SIGN_NAMES[moonSign] || moonSign}
                </div>
              </div>
              <div>
                <div className="text-sm text-mystic-text-secondary">上升星座</div>
                <div className="text-2xl font-heading text-mystic-accent">↗ {ascendant}</div>
              </div>
              <div>
                <div className="text-sm text-mystic-text-secondary">天顶</div>
                <div className="text-2xl font-heading text-mystic-accent">⬆ {midheaven}</div>
              </div>
            </div>
          </motion.div>

          {/* Planets */}
          <motion.div className="glass-card p-6 md:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">🪐 行星位置</h3>
            <div className="space-y-2">
              {planets?.map((p: any, i: number) => (
                <motion.div
                  key={p.name}
                  className="flex items-center gap-3 p-2 rounded-mystic bg-mystic-bg/30 hover:bg-mystic-surface-hover/30 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <span className="text-lg w-8">{PLANET_EMOJIS[p.name] || '🪐'}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-mystic-text-primary">{PLANET_NAMES[p.name] || p.name}</span>
                  </div>
                  <span className="text-sm text-mystic-text-secondary">{SIGN_NAMES[p.sign] || p.sign} {p.signEmoji}</span>
                  <span className="text-xs text-mystic-primary">{p.degree.toFixed(1)}°</span>
                  <span className="text-xs text-mystic-text-secondary">第{p.house}宫</span>
                  {p.retrograde && <span className="text-xs text-mystic-danger">逆行</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Elements & Modalities */}
          <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading text-mystic-accent mb-4">⚖️ 元素</h3>
              <div className="space-y-2">
                {Object.entries(elements || {}).map(([elem, count]: [string, any]) => {
                  const names: Record<string, string> = { fire: '🔥火', earth: '⛰️土', air: '💨风', water: '💧水' };
                  return (
                    <div key={elem} className="flex items-center gap-2">
                      <span className="text-sm w-14">{names[elem] || elem}</span>
                      <div className="flex-1 h-3 bg-mystic-bg rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-mystic-primary to-mystic-secondary rounded-full"
                          style={{ width: `${(count / 5) * 100}%` }} />
                      </div>
                      <span className="text-xs text-mystic-text-secondary">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Houses */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading text-mystic-accent mb-4">🏠 宫位</h3>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {houses?.map((h: any) => (
                  <div key={h.number} className="flex justify-between text-sm py-1 border-b border-mystic-divider/20">
                    <span className="text-mystic-text-secondary">第{h.number}宫</span>
                    <span>{SIGN_NAMES[h.sign] || h.sign} {h.degree.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Aspects */}
          {aspects?.length > 0 && (
            <motion.div className="glass-card p-6 md:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3 className="text-lg font-heading text-mystic-accent mb-4">🔗 行星相位</h3>
              <div className="flex flex-wrap gap-2">
                {aspects.map((a: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs bg-mystic-bg/40 border border-mystic-divider/30">
                    {PLANET_NAMES[a.planet1] || a.planet1}
                    <span className="mx-1 text-mystic-accent">
                      {a.type === 'conjunction' ? '☌合' : a.type === 'trine' ? '△三分' :
                       a.type === 'square' ? '□四分' : a.type === 'sextile' ? '⚹六分' :
                       a.type === 'opposition' ? '☍对分' : a.type}
                    </span>
                    {PLANET_NAMES[a.planet2] || a.planet2}
                    <span className="ml-1 text-mystic-text-secondary/50">{a.orb}°</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Reading */}
        {readingText && (
          <motion.div className="glass-card p-8 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">📖 星盘解读</h3>
            <div className="reading-text" dangerouslySetInnerHTML={{ __html: readingText.replace(/\n/g, '<br/>') }} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function signPlanet(sign: string): string {
  const map: Record<string, string> = { 'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓' };
  return map[sign] || '⭐';
}
