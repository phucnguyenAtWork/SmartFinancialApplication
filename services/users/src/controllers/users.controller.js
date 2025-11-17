import { pool } from '../config/db.js';

export const health = (req, res) => res.json({ status: 'ok', service: 'users' });

export const listUsers = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const [rows] = await pool.execute(
      'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT id, email, name, created_at FROM users WHERE id = ?', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const me = async (req, res) => {
  try {
    const email = req.user.email;
    const [rows] = await pool.execute('SELECT id, email, name, created_at FROM users WHERE email = ?', [email]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};
