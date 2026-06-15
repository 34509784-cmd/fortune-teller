import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BaguaReadingPage() {
  const location = useLocation();
  const data = location.state;
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <span className="text-6xl mb-4 block">🔮</span>
        <h1 className="section-title">未找到占卜结果</h1>
        <Link to="/bagua" className="mystic-button-primary mt-4 inline-block">重新占卜</Link>
      </div>
    );
  }

  const { primaryHexagram, changedHexagram, changingLines, lines, readingText } = data;

  const lineDisplay = (val: number) => {
    switch (val) {
      case 6: return { symbol: '━ ━ ✕', label: '老阴', isYin: true, isChanging: true };
      case 7: return { symbol: '━━━', label: '少阳', isYin: false, isChanging: false };
      case 8: return { symbol: '━ ━', label: '少阴', isYin: true, isChanging: false };
      case 9: return { symbol: '━━━ ○', label: '老阳', isYin: false, isChanging: true };
      default: return { symbol: '?', label: '', isYin: false, isChanging: false };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Link to="/bagua" className="text-mystic-text-secondary hover:text-mystic-accent transition-colors mb-6 inline-block">
          ← 重新占卜
        </Link>

        <h1 className="section-title text-center mb-8">🔮 卦象解读</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Hexagram */}
          <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-2">本卦</h3>
            <div className="text-6xl mb-3">{primaryHexagram?.character || '?'}</div>
            <div className="text-xl font-chinese font-bold text-mystic-text-primary">{primaryHexagram?.name}</div>
            <div className="text-sm text-mystic-text-secondary mt-1">{primaryHexagram?.pinyin}</div>
            <div className="text-xs text-mystic-primary mt-1">第{primaryHexagram?.number}卦</div>
            <div className="mt-4 p-3 bg-mystic-bg/40 rounded-mystic text-sm text-mystic-text-secondary">
              <p className="font-semibold text-mystic-accent mb-1">卦辞</p>
              <p>{primaryHexagram?.judgment}</p>
            </div>
            <div className="mt-2 p-3 bg-mystic-bg/40 rounded-mystic text-sm text-mystic-text-secondary">
              <p className="font-semibold text-mystic-accent mb-1">象传</p>
              <p>{primaryHexagram?.image}</p>
            </div>
          </motion.div>

          {/* Changed Hexagram */}
          {changedHexagram && (
            <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-lg font-heading text-mystic-accent mb-2">变卦</h3>
              <div className="text-6xl mb-3">{changedHexagram.character}</div>
              <div className="text-xl font-chinese font-bold text-mystic-text-primary">{changedHexagram.name}</div>
              <div className="text-sm text-mystic-text-secondary mt-1">{changedHexagram.pinyin}</div>
              <div className="text-xs text-mystic-primary mt-1">第{changedHexagram.number}卦</div>
              <div className="mt-4 p-3 bg-mystic-bg/40 rounded-mystic text-sm text-mystic-text-secondary">
                <p className="font-semibold text-mystic-accent mb-1">变卦卦辞</p>
                <p>{changedHexagram.judgment}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Line visualization */}
        <motion.div className="glass-card p-6 mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-center text-mystic-accent mb-4 font-heading">⚡ 卦象结构</h3>
          <div className="max-w-xs mx-auto">
            <div className="text-center text-sm text-mystic-text-secondary mb-2">上卦: {primaryHexagram?.upperTrigram} | 下卦: {primaryHexagram?.lowerTrigram}</div>
            {lines?.map((val: number, i: number) => {
              const ld = lineDisplay(val);
              const idx = 5 - i;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-3 py-1.5"
                >
                  <span className="text-xs text-mystic-text-secondary w-6 text-right">第{idx + 1}爻</span>
                  <span className={`text-2xl font-chinese ${ld.isChanging ? 'text-mystic-accent font-bold' : 'text-mystic-text-primary'}`}>
                    {ld.symbol}
                  </span>
                  <span className="text-xs text-mystic-text-secondary w-16">
                    {ld.label} {ld.isChanging ? '⚡' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Changing lines */}
          {changingLines?.length > 0 && (
            <div className="mt-4 text-center">
              <span className="text-sm text-mystic-accent">
                动爻: 第{changingLines.join('、')}爻
                {changedHexagram ? ` → 化为${changedHexagram.name}` : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* Reading Text */}
        {readingText && (
          <motion.div className="glass-card p-8 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <h3 className="text-lg font-heading text-mystic-accent mb-4">📖 占卜解读</h3>
            <div className="reading-text" dangerouslySetInnerHTML={{ __html: readingText.replace(/\n/g, '<br/>') }} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
