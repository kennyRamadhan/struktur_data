import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

/** Hanya request dengan token JWT yang valid yang boleh lewat. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Silakan login terlebih dahulu' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sesi tidak valid atau sudah habis, silakan login ulang' });
  }
}
