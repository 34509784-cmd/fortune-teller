import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { baguaApi } from '../api/client';

type LineResult = { value: number; label: string; symbol: string };

export default function BaguaCastPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState<'AUTO' | 'COINS'>('AUTO');
  const [lines, setLines] = useState<LineResult[]>([]);
  const [isTossing, setIsTossing] = useState(false);
  const [currentToss, setCurrentToss] = useState(0);
  const [loading, setLoading] = useState(false);

  const lineToDisplay = (val: number): LineResult => {
    switch (val) {
      case 6: return { value: 6, label: '老阴', symbol: '━ ━ ✕' };
      case 7: return { value: 7, label: '少阳', symbol: '━━━' };
      case 8: return { value: 8, label: '少阴', symbol: '━ ━' };
      case 9: return { value: 9, label: '老阳', symbol: '━━━ ○' };
      default: return { value: val, label: '未知', symbol: '?' };
    }
  };

  const tossCoins = () => {
    const coin1 = Math.random() < 0.5 ? 2 : 3;
    const coin2 = Math.random() < 0.5 ? 2 : 3;
    const coin3 = Math.random() < 0.5 ? 2 : 3;
    return coin1 + coin2 + coin3;
  };

  const handleToss = () => {
    if (isTossing || lines.length >= 6) return;
    setIsTossing(true);
    setCurrentToss(lines.length + 1);

    // Animate coin flip
    setTimeout(() => {
      const val = tossCoins();
      setLines(prev => [...prev, lineToDisplay(val)]);
      setIsTossing(false);
    }, 800);
  };

  const handleAutoDraw = () => {
    const results: number[] = [];
    for (let i = 0; i < 6; i++) results.push(tossCoins());
    setLines(results.map(lineToDisplay));
  };

  const handleDivine = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await baguaApi.divine({
        question: question.trim(),
        method,
        manualLines: lines.map(l => l.value),
      });
      if (res.data.readingId) {
        navigate(`/bagua/${res.data.readingId}`, { state: res.data });
      } else {
        navigate('/bagua/temp', { state: res.data });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || '占卜失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-6 animate-bounce">🔮</div>
          <p className="text-xl text-mystic-accent">正在解读卦象...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔮</span>
          <h1 className="section-title">八卦占卜</h1>
          <p className="section-subtitle">以真诚之心，问天地之意</p>
        </div>

        {/* Question Input */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-mystic-text-secondary mb-3 text-sm">你心中所想的问题是？</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="请在心中默念你的问题，然后写下..."
            className="mystic-input min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* Method Selection */}
        <div className="glass-card p-6 mb-6">
          <label className="block text-mystic-text-secondary mb-3 text-sm">选择起卦方式</label>
          <div className="flex gap-4">
            {[
              { value: 'COINS', label: '🪙 铜钱起卦', desc: '亲手投掷铜钱' },
              { value: 'AUTO', label: '🎲 自动起卦', desc: '一键生成卦象' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setMethod(opt.value as any); if (opt.value === 'AUTO') handleAutoDraw(); else setLines([]); }}
                className={`flex-1 p-4 rounded-mystic border-2 transition-all text-left
                  ${method === opt.value
                    ? 'border-mystic-accent bg-mystic-accent/10 shadow-accent-glow'
                    : 'border-mystic-divider hover:border-mystic-secondary'
                  }`}
              >
                <div className="text-lg font-medium text-mystic-text-primary">{opt.label}</div>
                <div className="text-xs text-mystic-text-secondary mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coin Toss */}
        {method === 'COINS' && lines.length < 6 && (
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-mystic-text-secondary mb-4">
              第 <span className="text-mystic-accent font-bold">{lines.length + 1}</span> / 6 次投掷
            </p>
            <AnimatePresence>
              {isTossing ? (
                <motion.div
                  key="tossing"
                  className="text-6xl mb-4"
                  animate={{ rotateY: [0, 720, 1440], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  🪙
                </motion.div>
              ) : (
                <motion.button
                  key="toss-btn"
                  onClick={handleToss}
                  className="mystic-button-primary text-lg px-12"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🪙 投掷铜钱
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Growing Hexagram */}
        {lines.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-center text-mystic-accent mb-4 font-heading">
              {lines.length < 6 ? `卦象已现 ${lines.length}/6` : '✨ 卦象已成'}
            </h3>
            <div className="space-y-2 max-w-xs mx-auto">
              {Array.from({ length: 6 }).map((_, i) => {
                const idx = 5 - i; // display top-to-bottom
                const line = lines[idx];
                const isChanging = line?.value === 6 || line?.value === 9;
                return (
                  <motion.div
                    key={i}
                    className={`text-center py-2 font-chinese text-2xl rounded ${isChanging ? 'text-mystic-accent' : 'text-mystic-text-primary'}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: line ? 1 : 0.3, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {line ? (
                      <>
                        <span>{line.symbol}</span>
                        <span className="text-xs ml-2 text-mystic-text-secondary">({line.label})</span>
                      </>
                    ) : (
                      <span className="text-mystic-text-secondary/30">━━━</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Divine Button */}
        {lines.length === 6 && question && (
          <motion.button
            onClick={handleDivine}
            className="mystic-button-primary w-full py-4 text-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🔮 解读卦象
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
