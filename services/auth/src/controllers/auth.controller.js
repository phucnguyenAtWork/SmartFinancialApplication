import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { authPool, finPool } from '../config/db.js';
import { AuthUser } from '../models/AuthUser.js';

const signToken = (payload) => jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

const ensureFinanceUser = async (phone, name = null, email = null) => {
  await finPool.execute('INSERT IGNORE INTO users (phone, name, email) VALUES (?, ?, ?)', [phone, name, email]);
  const [rows] = await finPool.execute('SELECT id, phone, name, email FROM users WHERE phone = ?', [phone]);
  return rows[0];
};

export const health = (req, res) => res.json({ status: 'ok', service: 'auth' });

export const register = async (req, res) => {
  const { phone, password, name, email } = req.body || {};
  if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });
  try {
    const t0 = Date.now();
  console.log('[auth] register start', { phone, hasEmail: !!email, hasName: !!name, headers: req.headers });
  const hash = await bcrypt.hash(password, 8);
    console.log('[auth] after bcrypt', { ms: Date.now() - t0 });
    const [result] = await authPool.execute(
      'INSERT INTO auth_users (phone, email, password_hash) VALUES (?, ?, ?)',
      [phone, email || null, hash]
    );
    console.log('[auth] after auth insert', { ms: Date.now() - t0, insertId: result.insertId });
    const authUser = new AuthUser({ id: result.insertId, phone, email: email || null, passwordHash: hash });
    const financeUser = await ensureFinanceUser(phone, name || null, email || null);
    console.log('[auth] after finance ensure', { ms: Date.now() - t0, financeId: financeUser?.id });
    const token = signToken({ sub: result.insertId, phone, fid: financeUser?.id });
    console.log('[auth] register completed', { ms: Date.now() - t0, id: authUser.id });
    return res.status(201).json({ token, user: { id: authUser.id, phone, name: financeUser?.name || name || null } });
  } catch (err) {
  const code = err.code;
  const msg = err.message;
  // Classify common DB connectivity issues
  let kind = 'unknown';
  if (code === 'ER_DUP_ENTRY') kind = 'duplicate_phone';
  else if (/ECONNREFUSED/i.test(msg) || /connect ECONNREFUSED/i.test(msg)) kind = 'db_conn_refused';
  else if (/ENOTFOUND/i.test(msg)) kind = 'db_host_not_found';
  else if (/PROTOCOL_CONNECTION_LOST/i.test(code)) kind = 'db_connection_lost';
  else if (/ETIMEDOUT/i.test(msg)) kind = 'db_timeout';
  console.error('[auth] register error', { code, msg, kind });
  if (code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'phone exists' });
  return res.status(500).json({ error: 'internal', detail: code, kind });
  }
};

export const login = async (req, res) => {
  const { phone, password } = req.body || {};
  if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });
  try {
  console.log('[auth] login attempt', { phone });
    const [rows] = await authPool.execute('SELECT id, password_hash, phone, email FROM auth_users WHERE phone = ?', [phone]);
    const userRow = rows[0];
    if (!userRow) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const authUser = AuthUser.fromDb(userRow);
    const financeUser = await ensureFinanceUser(phone);
    const token = signToken({ sub: authUser.id, phone, fid: financeUser?.id });
  console.log('[auth] login success', { id: authUser.id, phone });
    return res.json({ token, user: { id: authUser.id, phone, name: financeUser?.name || null } });
  } catch (err) {
  console.error('[auth] login error', err.code, err.message);
  return res.status(500).json({ error: 'internal', detail: err.code });
  }
};

export const me = async (req, res) => {
  try {
    // 1. Safety Check: User ID from Token
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'unauthorized_token_invalid' });
    }

    // 2. Query Auth User (Added 'full_name' to select list)
    const [authRows] = await authPool.execute(
      'SELECT id, phone, email, full_name, created_at FROM auth_users WHERE id = ?', 
      [req.user.sub]
    );
    const authUser = authRows[0];

    if (!authUser) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    // 3. Query Finance User (Optional Profile Data)
    let financeUser = null;
    if (authUser.phone) {
      const [finRows] = await finPool.execute(
        'SELECT id, name, email FROM users WHERE phone = ?', 
        [authUser.phone]
      );
      financeUser = finRows[0];
    }

    return res.json({
      id: authUser.id,
      phone: authUser.phone,
      email: authUser.email,
      full_name: financeUser?.name || authUser.full_name || 'User',
      created_at: authUser.created_at
    });

  } catch (err) {
    console.error('[auth] me error:', err);
    return res.status(500).json({ error: 'internal' });
  }
};
