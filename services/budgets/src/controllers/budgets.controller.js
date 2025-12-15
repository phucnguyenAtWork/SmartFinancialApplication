import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import { Budget } from '../models/Budget.js';

export const listBudgets = async (req, res) => {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const [rows] = await pool.execute(
      'SELECT id, user_id, category_id, amount_limit, period, alert_threshold, start_date, end_date, created_at FROM budgets WHERE user_id = ? ORDER BY created_at DESC',
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
      'SELECT id, user_id, category_id, amount_limit, period, alert_threshold, start_date, end_date, created_at FROM budgets WHERE id = ? AND user_id = ?',
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
    const { categoryId, amountLimit, period, alertThreshold, startDate, endDate } = req.body || {};
    const budget = new Budget({ userId, categoryId, amountLimit, period, alertThreshold, startDate, endDate });
    const [result] = await pool.execute(
      'INSERT INTO budgets (user_id, category_id, amount_limit, period, alert_threshold, start_date, end_date) VALUES (?,?,?,?,?,?,?)',
      [budget.userId, budget.categoryId, budget.amountLimit, budget.period, budget.alertThreshold, budget.startDate.toISOString().slice(0, 10), budget.endDate.toISOString().slice(0, 10)]
    );
    const [rows] = await pool.execute(
      'SELECT id, user_id, category_id, amount_limit, period, alert_threshold, start_date, end_date, created_at FROM budgets WHERE id = ?',
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
