import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calcZodiac } from '../utils/fortuneEngine';
import Loading from '../components/ui/Loading';

export default function ZodiacInputPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    birthDateTime: '',
    longitude: '120',
    latitude: '30',
    houseSystem: 'PLACIDUS',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birthDateTime) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      const data = calcZodiac({
        birthDateTime: new Date(form.birthDateTime).toISOString(),
        longitude: Number(form.longitude),
        latitude: Number(form.latitude),
      });
      navigate('/zodiac/temp', { state: data });
    } catch (err: any) {
      alert(err?.message || '计算失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="正在绘制星盘..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🌌</span>
          <h1 className="section-title">星座星盘</h1>
          <p className="section-subtitle">在星辰的轨迹中，发现真实的自己</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">出生日期和时间</label>
            <input type="datetime-local" required value={form.birthDateTime}
              onChange={e => setForm({ ...form, birthDateTime: e.target.value })}
              className="mystic-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-mystic-text-secondary mb-2 text-sm">经度</label>
              <input type="number" step="0.01" value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                className="mystic-input" placeholder="120 (北京)" />
            </div>
            <div>
              <label className="block text-mystic-text-secondary mb-2 text-sm">纬度</label>
              <input type="number" step="0.01" value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                className="mystic-input" placeholder="30 (北京)" />
            </div>
          </div>
          <button type="submit" className="mystic-button-primary w-full py-4 text-lg">
            🌌 绘制星盘
          </button>
        </form>
      </motion.div>
    </div>
  );
}
