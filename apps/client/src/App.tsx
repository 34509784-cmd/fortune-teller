import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CelestialBackground from './components/layout/CelestialBackground';
import Loading from './components/ui/Loading';

// Lazy-load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const BaziInputPage = lazy(() => import('./pages/BaziInputPage'));
const BaziResultPage = lazy(() => import('./pages/BaziResultPage'));
const BaguaCastPage = lazy(() => import('./pages/BaguaCastPage'));
const BaguaReadingPage = lazy(() => import('./pages/BaguaReadingPage'));
const QimenInputPage = lazy(() => import('./pages/QimenInputPage'));
const QimenPlatePage = lazy(() => import('./pages/QimenPlatePage'));
const ZodiacInputPage = lazy(() => import('./pages/ZodiacInputPage'));
const ZodiacChartPage = lazy(() => import('./pages/ZodiacChartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

export default function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <CelestialBackground />
      <Navbar />
      <main className="relative z-10 flex-1 pt-16 pb-8">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bazi" element={<BaziInputPage />} />
            <Route path="/bazi/:readingId" element={<BaziResultPage />} />
            <Route path="/bagua" element={<BaguaCastPage />} />
            <Route path="/bagua/:readingId" element={<BaguaReadingPage />} />
            <Route path="/qimen" element={<QimenInputPage />} />
            <Route path="/qimen/:readingId" element={<QimenPlatePage />} />
            <Route path="/zodiac" element={<ZodiacInputPage />} />
            <Route path="/zodiac/:readingId" element={<ZodiacChartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
