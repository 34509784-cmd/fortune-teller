import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BaziResultPage() {
  const location = useLocation();
  const data = location.state;
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="text-6xl mb-4 block">📜</span>
        <h1 className="section-title">未找到排盘结果</h1>
        <Link to="/bazi" className="mystic-button-primary mt-4 inline-block">重新排盘</Link>
      </div>
    );
  }

  const { fourPillars, dayMaster, tenGods, fiveElements, daYun, shenSha, naYin, elementBalance, readingText } = data;
  const elementsEmoji: Record<string, string> = { wood: '🌳', fire: '🔥', earth: '⛰️', metal: '⚔️', water: '💧' };
  const elementsCN: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

  const pillarKeyMap: Record<string, string> = { year: '年', month: '月', day: '日', hour: '时' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/bazi" className="text-mystic-text-secondary hover:text-mystic-accent transition-colors mb-6 inline-block">
          ← 返回重新排盘
        </Link>

        <h1 className="section-title text-center mb-8">📜 八字排盘结果</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Four Pillars */}
          <motion.div className="glass-card p-6 lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">四柱八字</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(fourPillars).map(([key, pillar]: [string, any]) => (
                <div key={key} className="text-center bg-mystic-bg/40 rounded-mystic p-4 border border-mystic-divider/30">
                  <div className="text-xs text-mystic-text-secondary mb-1">{pillarKeyMap[key]}柱</div>
                  <div className="text-3xl font-chinese font-bold text-mystic-accent mb-1">
                    {pillar.stem}{pillar.branch}
                  </div>
                  <div className="text-xs text-mystic-primary">
                    {pillar.hiddenStems.join(' ')}
                  </div>
                  <div className="text-xs text-mystic-text-secondary mt-1">
                    {naYin?.[key] || ''}
                  </div>
                  <div className="text-xs text-mystic-secondary mt-1">
                    {tenGods?.[key] || ''}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Day Master Card */}
          <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-3">☀️ 日主</h3>
            <div className="text-5xl font-chinese font-bold text-mystic-accent mb-2">{dayMaster}</div>
            <p className="text-mystic-text-secondary text-sm">您的核心能量</p>
            <div className="mt-4 pt-4 border-t border-mystic-divider/30">
              <p className="text-sm text-mystic-text-secondary">
                {elementBalance?.strongest ? `五行${elementBalance.strongest}偏旺` : ''}
              </p>
              <p className="text-sm text-mystic-text-secondary mt-1">
                {elementBalance?.weakest ? `需补充${elementBalance.weakest}的能量` : ''}
              </p>
            </div>
          </motion.div>

          {/* Five Elements */}
          <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">⚖️ 五行分布</h3>
            <div className="space-y-3">
              {Object.entries(fiveElements || {}).map(([elem, count]: [string, any]) => {
                const maxVal = Math.max(...Object.values(fiveElements || {}).map(Number), 1);
                const pct = (count / maxVal) * 100;
                return (
                  <div key={elem} className="flex items-center gap-3">
                    <span className="text-sm w-12">{elementsEmoji[elem]} {elementsCN[elem]}</span>
                    <div className="flex-1 h-4 bg-mystic-bg rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, #6B4E71, #C49BBB)`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-mystic-text-secondary w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Shen Sha */}
          {shenSha && shenSha.length > 0 && (
            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-lg font-heading text-mystic-accent mb-3">🌟 神煞</h3>
              <div className="flex flex-wrap gap-2">
                {shenSha.map((s: any, i: number) => (
                  <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium
                    ${s.type === '吉' ? 'bg-mystic-success/20 text-mystic-success' : 'bg-mystic-danger/20 text-mystic-danger'}`}>
                    {s.name}（{s.pillar}柱）
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Da Yun Timeline */}
          <motion.div className="glass-card p-6 lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">🛤️ 大运走势</h3>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {daYun?.map((dy: any, i: number) => (
                <div key={i} className="flex-shrink-0 text-center bg-mystic-bg/40 rounded-mystic p-3 min-w-[80px] border border-mystic-divider/30">
                  <div className="text-xs text-mystic-text-secondary mb-1">{dy.startAge}-{dy.endAge}岁</div>
                  <div className="text-lg font-chinese font-bold text-mystic-accent">{dy.stem}{dy.branch}</div>
                  <div className="text-xs text-mystic-primary mt-1">{dy.direction === 'forward' ? '顺行' : '逆行'}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reading Text */}
        {readingText && (
          <motion.div className="glass-card p-8 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">📖 命理解读</h3>
            <div className="reading-text" dangerouslySetInnerHTML={{ __html: readingText.replace(/\n/g, '<br/>') }} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
