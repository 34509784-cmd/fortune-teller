import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../api/client';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🌙</span>
          <h1 className="section-title">登录</h1>
          <p className="section-subtitle">欢迎回来，继续探索命运</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-mystic bg-mystic-danger/10 border border-mystic-danger/30 text-mystic-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">邮箱</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="mystic-input"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-mystic-text-secondary mb-2 text-sm">密码</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="mystic-input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="mystic-button-primary w-full py-3">
            {loading ? '正在登录...' : '🌙 登录'}
          </button>

          <p className="text-center text-sm text-mystic-text-secondary">
            还没有账号？{' '}
            <Link to="/register" className="text-mystic-accent hover:underline">注册</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
