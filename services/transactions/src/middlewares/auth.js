import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { pool } from '../config/db.js';

export const requireAuth = (req, res, next) => {
  if (process.env.AUTH_DISABLED === '1') {
    req.user = { id: Number(process.env.DEV_FINANCE_USER_ID || 1)
      , devBypass: true };
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

export const getFinanceUserId = async (req) => {
  if (process.env.AUTH_DISABLED === '1') return Number(process.env.DEV_FINANCE_USER_ID || 1);
  if (req.user?.fid) return req.user.fid;
  if (req.user?.email) {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [req.user.email]);
    return rows[0]?.id || null;
  }
  return null;
};
