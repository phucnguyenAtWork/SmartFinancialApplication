import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import { Budget } from '../models/Budget.js';

export async function listBudgets(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const [rows] = await pool.execute('SELECT id, user_id, name, period, limit_amount, currency, starts_on, created_at FROM budgets WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return res.json(rows);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
}

export async function getBudget(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT id, user_id, name, period, limit_amount, currency, starts_on, created_at FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    return res.json(rows[0]);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
}

export async function createBudget(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const { name, period, limitAmount, currency, startsOn } = req.body || {};
    if (!name || !period || !currency) return res.status(400).json({ error: 'missing_fields' });
    const b = new Budget({ userId, name, period, limitAmount, currency, startsOn });
    const [result] = await pool.execute('INSERT INTO budgets (user_id, name, period, limit_amount, currency, starts_on) VALUES (?,?,?,?,?,?)', [b.userId, b.name, b.period, b.limitAmount, b.currency, b.startsOn ? b.startsOn.toISOString().slice(0,10) : null]);
    const [rows] = await pool.execute('SELECT id, user_id, name, period, limit_amount, currency, starts_on, created_at FROM budgets WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
}

export async function deleteBudget(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'not_found' });
    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
    return res.status(204).end();
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
}
import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import { Budget } from '../models/Budget.js';

export const listBudgets = async (req, res) => {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const [rows] = await pool.execute(
      'SELECT id, user_id, name, period, limit_amount, currency, starts_on, created_at FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const getBudget = async (req, res) => {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = Number(req.params.id);
    const [rows] = await pool.execute(
      'SELECT id, user_id, name, period, limit_amount, currency, starts_on, created_at FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const createBudget = async (req, res) => {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const { name, period, limitAmount, currency, startsOn } = req.body || {};
    const budget = new Budget({ userId, name, period, limitAmount, currency, startsOn });
    const [result] = await pool.execute(
      'INSERT INTO budgets (user_id, name, period, limit_amount, currency, starts_on) VALUES (?,?,?,?,?,?)',
      [budget.userId, budget.name, budget.period, budget.limitAmount, budget.currency, budget.startsOn ? budget.startsOn.toISOString().slice(0, 10) : null]
    );
    const [rows] = await pool.execute(
      'SELECT id, user_id, name, period, limit_amount, currency, starts_on, created_at FROM budgets WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.message) return res.status(400).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};
