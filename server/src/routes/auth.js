import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

export default function authRoutes(db) {
  const router = Router();

  router.post('/login', (req, res) => {
    const { username = '', password = '' } = req.body ?? {};
    const user = db
      .prepare('SELECT id, username, password_hash, name, nim FROM users WHERE username = ?')
      .get(String(username).trim());

    if (!user || !bcrypt.compareSync(String(password), user.password_hash)) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const profile = { id: user.id, username: user.username, name: user.name, nim: user.nim };
    const token = jwt.sign(profile, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: profile });
  });

  router.get('/me', requireAuth, (req, res) => {
    const { id, username, name, nim } = req.user;
    res.json({ user: { id, username, name, nim } });
  });

  router.get('/members', requireAuth, (req, res) => {
    const rows = db.prepare('SELECT id, name, nim FROM users ORDER BY id').all();
    res.json({ members: rows });
  });

  return router;
}
