import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authPool, financePool } from '../config/db.js';
import { config } from '../config/env.js';
import { AuthUser } from '../models/AuthUser.js';

export async function health(req, res) {
  return res.json({ status: 'ok', service: 'auth' });
}

async function ensureFinanceUser(email, name) {
  const [rows] = await financePool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (rows[0]) return rows[0].id;
  const [result] = await financePool.execute('INSERT INTO users (email, name) VALUES (?,?)', [email, name || email]);
  return result.insertId;
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const [existing] = await authPool.execute('SELECT id FROM auth_users WHERE email = ?', [email]);
    if (existing[0]) return res.status(409).json({ error: 'email_taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await authPool.execute('INSERT INTO auth_users (email, password_hash) VALUES (?,?)', [email, passwordHash]);
    const authUser = AuthUser.fromDb({ id: result.insertId, email, password_hash: passwordHash, created_at: new Date() });
    const fid = await ensureFinanceUser(email, name);
    const token = jwt.sign({ sub: authUser.id, email: authUser.email, fid }, config.jwtSecret, { expiresIn: '1h' });
    return res.status(201).json({ token });
  } catch (e) {
    console.error(e); return res.status(500).json({ error: 'internal' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const [rows] = await authPool.execute('SELECT id, email, password_hash, created_at FROM auth_users WHERE email = ?', [email]);
    const row = rows[0];
    if (!row) return res.status(401).json({ error: 'invalid_credentials' });
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return res.status(401).json({ error: 'invalid_credentials' });
    const fidRows = await financePool.execute('SELECT id FROM users WHERE email = ?', [email]);
    const fid = fidRows[0][0]?.id || (await ensureFinanceUser(email));
    const token = jwt.sign({ sub: row.id, email: row.email, fid }, config.jwtSecret, { expiresIn: '1h' });
    return res.json({ token });
  } catch (e) {
    console.error(e); return res.status(500).json({ error: 'internal' });
  }
}

export async function me(req, res) {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'unauthorized' });
    const [rows] = await financePool.execute('SELECT id, email, name, created_at FROM users WHERE email = ?', [email]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    return res.json(rows[0]);
  } catch (e) {
    console.error(e); return res.status(500).json({ error: 'internal' });
  }
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { authPool, finPool } from '../config/db.js';
import { AuthUser } from '../models/AuthUser.js';

const signToken = (payload) => jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

const ensureFinanceUser = async (email, name = null) => {
  await finPool.execute('INSERT IGNORE INTO users (email, name) VALUES (?, ?)', [email, name]);
  const [rows] = await finPool.execute('SELECT id, email, name FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const health = (req, res) => res.json({ status: 'ok', service: 'auth' });

export const register = async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await authPool.execute(
      'INSERT INTO auth_users (email, password_hash) VALUES (?, ?)',
      [email, hash]
    );
    // hydrate model
    // eslint-disable-next-line no-unused-vars
    const authUser = new AuthUser({ id: result.insertId, email, passwordHash: hash });
    const financeUser = await ensureFinanceUser(email, name || null);
    const token = signToken({ sub: result.insertId, email, fid: financeUser?.id });
    return res.status(201).json({ token });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'email exists' });
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const [rows] = await authPool.execute('SELECT id, password_hash FROM auth_users WHERE email = ?', [email]);
    const userRow = rows[0];
    if (!userRow) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const authUser = AuthUser.fromDb(userRow);
    const financeUser = await ensureFinanceUser(email);
    const token = signToken({ sub: authUser.id, email, fid: financeUser?.id });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const me = async (req, res) => {
  try {
    const [authRows] = await authPool.execute('SELECT id, email, created_at FROM auth_users WHERE id = ?', [req.user.sub]);
    const authUser = authRows[0];
    const [finRows] = await finPool.execute('SELECT id, email, name, created_at FROM users WHERE email = ?', [authUser.email]);
    return res.json({ auth: authUser, finance: finRows[0] || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};
