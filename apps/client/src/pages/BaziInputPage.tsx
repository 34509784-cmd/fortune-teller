import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calcBazi } from '../utils/fortuneEngine';
import Loading from '../components/ui/Loading';

export default function BaziInputPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    birthDate: '',
    birthTime: '12:00',
    gender: 'MALE',
    calendarType: 'GREGORIAN',
    longitude: '120',
    latitude: '30',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.birthDate) return;
    setLoading(true);
    try {
      // Use local engine (no backend needed!)
      await new Promise(r => setTimeout(r, 500));
      const data = calcBazi({
        birthDate: form.birthDate,
        birthTime: form.birthTime,
        gender: form.gender,
        longitude: Number(form.longitude),
        latitude: Number(form.latitude),
      });
      navigate('/bazi/temp', { state: data });
    } catch (err: any) {
      alert(err?.message || '计算失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="正在排八字命盘..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">📜</span>
          <h1 className="section-title">八字排盘</h1>
          <p className="section-subtitle">输入出生信息，解读命运的密码</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {/* Birth Date */}
          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">出生日期</label>
            <input
              type="date"
              required
              value={form.birthDate}
              onChange={e => setForm({ ...form, birthDate: e.target.value })}
              className="mystic-input"
            />
          </div>

          {/* Birth Time */}
          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">出生时间</label>
            <input
              type="time"
              required
              value={form.birthTime}
              onChange={e => setForm({ ...form, birthTime: e.target.value })}
              className="mystic-input"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">性别</label>
            <div className="flex gap-4">
              {[
                { value: 'MALE', label: '👨 男' },
                { value: 'FEMALE', label: '👩 女' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, gender: opt.value })}
                  className={`flex-1 py-3 rounded-mystic border-2 transition-all duration-300 font-medium
                    ${form.gender === opt.value
                      ? 'border-mystic-accent bg-mystic-accent/10 text-mystic-accent shadow-accent-glow'
                      : 'border-mystic-divider text-mystic-text-secondary hover:border-mystic-secondary'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Type */}
          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">历法</label>
            <div className="flex gap-4">
              {[
                { value: 'GREGORIAN', label: '公历' },
                { value: 'LUNAR', label: '农历' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, calendarType: opt.value })}
                  className={`flex-1 py-3 rounded-mystic border-2 transition-all duration-300 font-medium
                    ${form.calendarType === opt.value
                      ? 'border-mystic-accent bg-mystic-accent/10 text-mystic-accent shadow-accent-glow'
                      : 'border-mystic-divider text-mystic-text-secondary hover:border-mystic-secondary'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-mystic-text-secondary mb-2 text-sm">经度</label>
              <input
                type="number"
                step="0.01"
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                className="mystic-input"
                placeholder="120 (北京)"
              />
            </div>
            <div>
              <label className="block text-mystic-text-secondary mb-2 text-sm">纬度</label>
              <input
                type="number"
                step="0.01"
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                className="mystic-input"
                placeholder="30 (北京)"
              />
            </div>
          </div>

          <button type="submit" className="mystic-button-primary w-full py-4 text-lg">
            🔮 开始排盘
          </button>
        </form>
      </motion.div>
    </div>
  );
}
