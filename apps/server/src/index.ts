import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import baziRoutes from './routes/bazi.routes';
import baguaRoutes from './routes/bagua.routes';
import qimenRoutes from './routes/qimen.routes';
import zodiacRoutes from './routes/zodiac.routes';
import historyRoutes from './routes/history.routes';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bazi', baziRoutes);
app.use('/api/bagua', baguaRoutes);
app.use('/api/qimen', qimenRoutes);
app.use('/api/zodiac', zodiacRoutes);
app.use('/api/history', historyRoutes);

// === Production: serve static React build ===
if (env.NODE_ENV === 'production') {
  // process.cwd() is the server directory when started from there
  const clientDist = path.resolve(process.cwd(), '..', 'client', 'dist');

  if (fs.existsSync(clientDist)) {
    console.log('📦 Serving static files from:', clientDist);

    // Serve static files
    app.use(express.static(clientDist));

    // SPA fallback: any unmatched route goes to index.html
    app.use((req, res, next) => {
      // Skip API routes and static file requests with extensions
      if (req.path.startsWith('/api/') || path.extname(req.path)) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'), (err) => {
        if (err) {
          console.error('Failed to send index.html:', err.message);
          next(err);
        }
      });
    });
  } else {
    console.warn('⚠ Client dist not found at:', clientDist);
    console.warn('  Run: cd apps/client && npx vite build');
  }
}

// Error handler
app.use(errorHandler);

app.listen(Number(env.PORT), '0.0.0.0', () => {
  console.log(`🔮 Fortune Teller running on http://0.0.0.0:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Database: ${env.DATABASE_URL}`);
});

export default app;
