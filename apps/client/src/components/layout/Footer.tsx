export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-mystic-divider/30 bg-mystic-bg/60 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">🌙</span>
          <span className="font-heading text-mystic-accent font-semibold">神秘占卜</span>
          <span className="text-lg">✨</span>
        </div>
        <p className="text-mystic-text-secondary text-sm">
          探索命运的奥秘 · 八卦 · 奇门遁甲 · 八字排盘 · 星座
        </p>
        <p className="text-mystic-text-secondary/50 text-xs mt-2">
          © 2024 神秘占卜 — 仅供娱乐参考
        </p>
      </div>
    </footer>
  );
}
