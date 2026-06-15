import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { historyApi } from '../api/client';

const MODULE_BADGES: Record<string, { emoji: string; label: string; color: string }> = {
  bazi: { emoji: '📜', label: '八字', color: 'bg-purple-500/20 text-purple-300' },
  bagua: { emoji: '🔮', label: '八卦', color: 'bg-teal-500/20 text-teal-300' },
  qimen: { emoji: '🎯', label: '奇门', color: 'bg-red-500/20 text-red-300' },
  zodiac: { emoji: '🌌', label: '星座', color: 'bg-blue-500/20 text-blue-300' },
};

export default function HistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    historyApi.getAll(1, 50)
      .then(res => setReadings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl mb-4 block">🔒</span>
        <h1 className="section-title mb-4">请先登录</h1>
        <Link to="/login" className="mystic-button-primary">去登录</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-center mb-8">📜 占卜历史</h1>

        {loading ? (
          <div className="text-center py-12 text-mystic-text-secondary">
            <div className="animate-spin text-4xl mb-4">🔮</div>
            <p>加载中...</p>
          </div>
        ) : readings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <span className="text-5xl mb-4 block">📭</span>
            <h3 className="text-xl text-mystic-text-secondary mb-4">还没有任何占卜记录</h3>
            <Link to="/bagua" className="mystic-button-primary">开始第一次占卜 🔮</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {readings.map((r, i) => {
              const badge = MODULE_BADGES[r.module] || { emoji: '✨', label: r.module, color: 'bg-gray-500/20 text-gray-300' };
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex items-center gap-4 hover:bg-mystic-surface-hover/30 transition-colors"
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-mystic-text-primary text-sm truncate">
                      {r.summary || '占卜记录'}
                    </p>
                    <p className="text-mystic-text-secondary/50 text-xs mt-0.5">
                      {new Date(r.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <Link
                    to={`/${r.module}/${r.id}`}
                    className="text-mystic-accent text-sm hover:underline flex-shrink-0"
                  >
                    查看 →
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
