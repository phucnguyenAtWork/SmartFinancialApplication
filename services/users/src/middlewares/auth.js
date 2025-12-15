import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
export const requireAuth = (req, res, next) => {
  if (process.env.AUTH_DISABLED === '1') {
    req.user = { id: Number(process.env.DEV_AUTH_USER_ID || 1), email: process.env.DEV_EMAIL || 'demo@example.com' };
    return next();
  }
  const hdr = req.headers['authorization'] || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
};
