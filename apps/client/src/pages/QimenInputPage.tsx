import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { qimenApi } from '../api/client';
import Loading from '../components/ui/Loading';

export default function QimenInputPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    queryDateTime: new Date().toISOString().slice(0, 16),
    method: 'CHAIBU' as 'CHAIBU' | 'ZHIRUN',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await qimenApi.calculate({ queryDateTime: new Date(form.queryDateTime).toISOString(), method: form.method });
      if (res.data.readingId) {
        navigate(`/qimen/${res.data.readingId}`, { state: res.data });
      } else {
        navigate('/qimen/temp', { state: res.data });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || '排盘失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="正在排奇门遁甲盘..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🎯</span>
          <h1 className="section-title">奇门遁甲</h1>
          <p className="section-subtitle">察天时，择地利，定人和</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">查询时间</label>
            <input
              type="datetime-local"
              required
              value={form.queryDateTime}
              onChange={e => setForm({ ...form, queryDateTime: e.target.value })}
              className="mystic-input"
            />
            <p className="text-xs text-mystic-text-secondary/60 mt-1">默认为当前时间，选择你要查询的时辰</p>
          </div>

          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">排盘方法</label>
            <div className="flex gap-4">
              {[
                { value: 'CHAIBU', label: '拆补法', desc: '以节气为准' },
                { value: 'ZHIRUN', label: '置润法', desc: '以闰月为准' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, method: opt.value as any })}
                  className={`flex-1 p-4 rounded-mystic border-2 transition-all text-left
                    ${form.method === opt.value
                      ? 'border-mystic-accent bg-mystic-accent/10 shadow-accent-glow'
                      : 'border-mystic-divider hover:border-mystic-secondary'
                    }`}
                >
                  <div className="font-medium text-mystic-text-primary">{opt.label}</div>
                  <div className="text-xs text-mystic-text-secondary mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="mystic-button-primary w-full py-4 text-lg">
            🎯 开始排盘
          </button>
        </form>

        <div className="glass-card p-6 mt-6">
          <p className="text-sm text-mystic-text-secondary leading-relaxed">
            <span className="text-mystic-accent font-semibold">奇门遁甲</span>是中国古代最高层次的预测学之一，
            综合了天时（九星）、地利（九宫）、人和（八门）、神助（八神）四大要素。
            通过排盘可以分析特定时刻的吉凶方位和行动策略。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
