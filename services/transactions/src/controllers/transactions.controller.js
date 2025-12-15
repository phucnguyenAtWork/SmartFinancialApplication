import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import { Transaction } from '../models/Transaction.js';

export async function listTransactions(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const [rows] = await pool.execute(
      `SELECT 
         t.id, t.user_id, t.type, t.amount, t.currency, t.description,
         t.category_id, c.name AS category_name,
         t.merchant_id, m.name AS merchant_name,
         t.account_id, a.name AS account_name,
         t.to_account_id, a2.name AS to_account_name,
         t.essential, t.tags, t.occurred_at
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN merchants m ON t.merchant_id = m.id
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN accounts a2 ON t.to_account_id = a2.id
       WHERE t.user_id = ?
       ORDER BY t.occurred_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function getTransaction(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const id = Number(req.params.id);
    const [rows] = await pool.execute(
      `SELECT 
         t.id, t.user_id, t.type, t.amount, t.currency, t.description,
         t.category_id, c.name AS category_name,
         t.merchant_id, m.name AS merchant_name,
         t.account_id, a.name AS account_name,
         t.to_account_id, a2.name AS to_account_name,
         t.essential, t.tags, t.occurred_at
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN merchants m ON t.merchant_id = m.id
       LEFT JOIN accounts a ON t.account_id = a.id
       LEFT JOIN accounts a2 ON t.to_account_id = a2.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );

    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function createTransaction(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const { type, amount, currency, description, categoryId, merchantId, accountId, toAccountId, essential, tags, occurredAt } = req.body || {};
    const dateObj = occurredAt ? new Date(occurredAt) : new Date();
    const formattedDate = dateObj.toISOString().slice(0, 19).replace('T', ' ');
    const tx = new Transaction({ userId, type, amount, currency, description, categoryId, merchantId, accountId, toAccountId, essential, tags, occurredAt: dateObj });
    const [result] = await pool.execute(
      'INSERT INTO transactions (user_id, type, amount, currency, description, category_id, merchant_id, account_id, to_account_id, essential, tags, occurred_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [tx.userId, tx.type, tx.amount, tx.currency, tx.description, tx.categoryId, tx.merchantId, tx.accountId, tx.toAccountId, tx.essential, JSON.stringify(tx.tags), formattedDate]
    );
    const [rows] = await pool.execute(
      'SELECT id, user_id, type, amount, currency, description, category_id, merchant_id, account_id, to_account_id, essential, tags, occurred_at FROM transactions WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (err && err.message) return res.status(400).json({ error: err.message });
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const id = Number(req.params.id);
    const [rows] = await pool.execute('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    await pool.execute('DELETE FROM transactions WHERE id = ?', [id]);
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
}