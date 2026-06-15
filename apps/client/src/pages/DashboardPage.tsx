import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-center mb-2">✨ {user?.name || '朋友'}，欢迎回来</h1>
        <p className="section-subtitle text-center mb-8">选择你想要探索的方向</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { path: '/bazi', emoji: '📜', title: '八字排盘', desc: '查看你的先天命盘' },
            { path: '/bagua', emoji: '🔮', title: '八卦占卜', desc: '向天地问一个答案' },
            { path: '/qimen', emoji: '🎯', title: '奇门遁甲', desc: '分析时空吉凶方位' },
            { path: '/zodiac', emoji: '🌌', title: '星座星盘', desc: '探索星辰的奥秘' },
          ].map((mod, i) => (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={mod.path}
                className="glass-card-hover p-6 block text-center h-full"
              >
                <span className="text-4xl mb-3 block">{mod.emoji}</span>
                <h3 className="text-xl font-heading text-mystic-accent mb-1">{mod.title}</h3>
                <p className="text-mystic-text-secondary text-sm">{mod.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="glass-card p-6 text-center max-w-md mx-auto">
          <h3 className="text-mystic-accent font-heading mb-4">📋 快捷操作</h3>
          <div className="flex gap-4 justify-center">
            <Link to="/history" className="mystic-button-outline text-sm">
              📜 查看历史
            </Link>
            <Link to="/bagua" className="mystic-button-primary text-sm">
              🔮 快速占卜
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
