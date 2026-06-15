import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Luoshu mapping: palace number → grid position (row, col)
const LUOSHU_GRID: Record<number, [number, number]> = {
  9: [0, 0], 2: [0, 1], 7: [0, 2],
  4: [1, 0], 5: [1, 1], 6: [1, 2],
  3: [2, 0], 8: [2, 1], 1: [2, 2],
};

const DOOR_COLORS: Record<string, string> = {
  '休': 'text-blue-400', '生': 'text-green-400', '伤': 'text-red-400',
  '杜': 'text-gray-400', '景': 'text-yellow-400', '死': 'text-red-500',
  '惊': 'text-orange-400', '开': 'text-emerald-400',
};

export default function QimenPlatePage() {
  const location = useLocation();
  const data = location.state;
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="text-6xl mb-4 block">🎯</span>
        <h1 className="section-title">未找到排盘结果</h1>
        <Link to="/qimen" className="mystic-button-primary mt-4 inline-block">重新排盘</Link>
      </div>
    );
  }

  const { juNumber, yinYangDun, palaces, zhiFu, zhiShi, readingText } = data;

  // Create 3x3 grid
  const grid = Array.from({ length: 3 }, () => Array(3).fill(null));
  palaces?.forEach((palace: any) => {
    const [row, col] = LUOSHU_GRID[palace.number] || [1, 1];
    grid[row][col] = palace;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/qimen" className="text-mystic-text-secondary hover:text-mystic-accent transition-colors mb-6 inline-block">
          ← 重新排盘
        </Link>

        <h1 className="section-title text-center mb-2">🎯 奇门遁甲排盘</h1>
        <div className="text-center mb-8">
          <span className="text-lg text-mystic-accent font-chinese">
            {yinYangDun}{juNumber}局 · 值符{juNumber} · 值使{zhiShi}
          </span>
        </div>

        {/* 3x3 Palace Grid */}
        <div className="glass-card p-4 max-w-xl mx-auto mb-8">
          <div className="grid grid-cols-3 gap-2">
            {grid.flat().map((palace: any, idx: number) => {
              if (!palace) return <div key={idx} className="aspect-square" />;
              return (
                <motion.div
                  key={palace.number}
                  className={`aspect-square rounded-mystic border p-2 flex flex-col justify-between
                    ${palace.number === 5
                      ? 'border-mystic-accent bg-mystic-accent/10 shadow-accent-glow'
                      : 'border-mystic-divider/30 bg-mystic-bg/30'
                    }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: palace.number * 0.05 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                >
                  {/* Palace number (small, top-left) */}
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-mystic-text-secondary/50">{palace.number}</span>
                    <span className="text-xs text-mystic-primary/70">{palace.direction}</span>
                  </div>

                  {/* Main content */}
                  <div className="text-center space-y-0.5">
                    <div className="flex justify-center gap-2 text-sm">
                      <span className="text-mystic-text-primary font-chinese">{palace.earthStem}</span>
                      <span className="text-mystic-accent font-chinese">{palace.heavenStem}</span>
                    </div>
                    <div className={`text-xs font-chinese font-semibold ${DOOR_COLORS[palace.door] || 'text-mystic-text-primary'}`}>
                      {palace.door}门
                    </div>
                    <div className="text-xs text-mystic-text-secondary font-chinese">{palace.star}</div>
                    <div className="text-xs text-mystic-primary/80 font-chinese">{palace.god}</div>
                  </div>

                  {/* Bottom spacer */}
                  <div />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card p-6 max-w-xl mx-auto mb-8">
          <h3 className="text-sm font-heading text-mystic-accent mb-3">图例</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-mystic-text-secondary">
            <p><span className="text-mystic-text-primary">天盘/地盘</span> — 天干</p>
            <p><span className="text-green-400">八门</span> — 休生伤杜景死惊开</p>
            <p><span className="text-mystic-text-secondary">九星</span> — 天蓬天芮天冲天辅天禽天心天柱天任天英</p>
            <p><span className="text-mystic-primary">八神</span> — 值符螣蛇太阴六合白虎玄武九地九天</p>
          </div>
        </div>

        {/* Reading Text */}
        {readingText && (
          <motion.div className="glass-card p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">📖 奇门解读</h3>
            <div className="reading-text" dangerouslySetInnerHTML={{ __html: readingText.replace(/\n/g, '<br/>') }} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
