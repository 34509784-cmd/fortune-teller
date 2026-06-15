export default function Loading({ text = '命运正在计算中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16 mb-6">
        {/* Yin-Yang spinning loader */}
        <div className="absolute inset-0 rounded-full border-4 border-mystic-primary animate-spin"
          style={{
            borderTopColor: 'transparent',
            borderRightColor: '#D4A76A',
            borderBottomColor: '#C49BBB',
            borderLeftColor: '#D4A76A',
            animationDuration: '2s',
          }}
        />
        <div className="absolute inset-2 rounded-full bg-mystic-bg flex items-center justify-center">
          <span className="text-xl animate-pulse">🔮</span>
        </div>
      </div>
      <p className="text-mystic-text-secondary text-lg animate-pulse">{text}</p>
    </div>
  );
}
