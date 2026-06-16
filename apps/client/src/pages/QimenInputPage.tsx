import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calcQimen } from '../utils/fortuneEngine';
import Loading from '../components/ui/Loading';

export default function QimenInputPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({ queryDateTime: today, method: 'CHAIBU' as const });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      const data = calcQimen({ queryDateTime: new Date(form.queryDateTime).toISOString() });
      navigate('/qimen/temp', { state: data });
    } catch (err: any) {
      alert(err?.message || '排盘失败');
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
            <input type="datetime-local" required value={form.queryDateTime}
              onChange={e => setForm({ ...form, queryDateTime: e.target.value })}
              className="mystic-input" />
          </div>
          <button type="submit" className="mystic-button-primary w-full py-4 text-lg">
            🎯 开始排盘
          </button>
        </form>
      </motion.div>
    </div>
  );
}
