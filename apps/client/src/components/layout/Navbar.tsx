import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/bazi', label: '八字', icon: '柱' },
  { path: '/bagua', label: '八卦', icon: '☯' },
  { path: '/qimen', label: '奇门', icon: '遁' },
  { path: '/zodiac', label: '星座', icon: '♈' },
];

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-mystic-bg/80 backdrop-blur-lg border-b border-mystic-divider/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl animate-float">🌙</span>
            <span className="font-heading text-xl font-bold text-mystic-accent group-hover:text-mystic-text-primary transition-colors">
              神秘占卜
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-mystic text-sm font-medium transition-all duration-300
                  ${location.pathname.startsWith(item.path)
                    ? 'bg-mystic-primary/30 text-mystic-accent shadow-mystic-glow'
                    : 'text-mystic-text-secondary hover:text-mystic-text-primary hover:bg-mystic-surface'
                  }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mystic-button-ghost text-sm">
                  {user?.name || '我的'}
                </Link>
                <Link to="/history" className="mystic-button-ghost text-sm">
                  历史
                </Link>
                <button onClick={logout} className="mystic-button-ghost text-sm text-mystic-danger">
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mystic-button-ghost text-sm">登录</Link>
                <Link to="/register" className="mystic-button-primary text-sm !py-2 !px-4">
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-mystic-text-primary p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-mystic-divider/30 bg-mystic-bg/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-mystic text-base transition-all
                  ${location.pathname.startsWith(item.path)
                    ? 'bg-mystic-primary/30 text-mystic-accent'
                    : 'text-mystic-text-secondary hover:text-mystic-text-primary hover:bg-mystic-surface'
                  }`}
              >
                <span className="mr-2">{item.icon}</span>{item.label}
              </Link>
            ))}
            <div className="border-t border-mystic-divider/30 pt-2 mt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-mystic-text-secondary hover:text-mystic-text-primary">我的</Link>
                  <Link to="/history" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-mystic-text-secondary hover:text-mystic-text-primary">历史</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-mystic-danger">退出</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-mystic-text-secondary">登录</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-mystic-accent font-semibold">注册</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
