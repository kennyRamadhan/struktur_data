import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { CLIENT_DIST } from './config.js';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import structureRoutes from './routes/structure.js';
import demoRoutes from './routes/demos.js';

export function createApp(db) {
  const app = express();
  app.use(express.json());

  app.use('/api/auth', authRoutes(db));
  app.use('/api/stack', requireAuth, structureRoutes(db, 'stack'));
  app.use('/api/queue', requireAuth, structureRoutes(db, 'queue'));
  app.use('/api/demo', requireAuth, demoRoutes());

  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));

  // Menyajikan hasil build React (client/dist) jika sudah di-build.
  const indexHtml = path.join(CLIENT_DIST, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(CLIENT_DIST));
    app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(indexHtml) : next()));
  }

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  });

  return app;
}
