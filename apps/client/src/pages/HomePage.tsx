import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MODULES = [
  {
    path: '/bazi',
    icon: '柱',
    title: '八字排盘',
    subtitle: 'Ba Zi',
    desc: '知天命，明运势',
    color: 'from-[#6B4E71] to-[#8B6B9E]',
    emoji: '📜',
  },
  {
    path: '/bagua',
    icon: '☯',
    title: '八卦占卜',
    subtitle: 'I Ching',
    desc: '问天地，解疑惑',
    color: 'from-[#4A6B6B] to-[#6B9E9E]',
    emoji: '🔮',
  },
  {
    path: '/qimen',
    icon: '遁',
    title: '奇门遁甲',
    subtitle: 'Qi Men',
    desc: '察时机，定策略',
    color: 'from-[#6B4A4A] to-[#9E6B6B]',
    emoji: '🎯',
  },
  {
    path: '/zodiac',
    icon: '♈',
    title: '星座星盘',
    subtitle: 'Zodiac',
    desc: '观星象，识自我',
    color: 'from-[#4A5A6B] to-[#6B8B9E]',
    emoji: '🌌',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div
        className="text-center py-16 md:py-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-6xl md:text-7xl mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌙
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          <span className="text-mystic-accent">神秘</span>
          <span className="text-mystic-text-primary">占卜</span>
        </h1>
        <p className="text-xl text-mystic-text-secondary max-w-md mx-auto leading-relaxed">
          探索命运的奥秘<br />
          在星辰与卦象中<br />
          寻找属于你的答案 ✨
        </p>
      </motion.div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
          >
            <Link
              to={mod.path}
              className="glass-card-hover block p-6 text-center group cursor-pointer h-full"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${mod.color} flex items-center justify-center text-2xl shadow-mystic-glow`}>
                {mod.emoji}
              </div>
              <h3 className="text-xl font-heading font-semibold text-mystic-text-primary mb-1 group-hover:text-mystic-accent transition-colors">
                {mod.icon} {mod.title}
              </h3>
              <p className="text-sm text-mystic-accent font-medium mb-2">{mod.subtitle}</p>
              <p className="text-mystic-text-secondary text-sm">{mod.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Daily Fortune */}
      <motion.div
        className="glass-card p-8 max-w-2xl mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <span className="text-3xl mb-4 block">🌟</span>
        <h3 className="text-lg font-heading text-mystic-accent mb-3">今日小语</h3>
        <p className="text-mystic-text-primary text-lg leading-relaxed italic">
          "命运不是写在星空中，而是刻在你的选择里。<br />
          占卜的意义，是帮你听见内心的声音。"
        </p>
      </motion.div>
    </div>
  );
}
