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
    // Look up by phone since email is optional in your system
    const phone = req.user.phone; 
    
    // Select card info so the frontend knows if user is onboarded
    const [rows] = await pool.execute(
      'SELECT id, email, name, card_last4, created_at FROM users WHERE phone = ?', 
      [phone]
    );
    
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};

// --- ONBOARDING LOGIC (Clean Version) ---

export const onboardCard = async (req, res) => {
  try {
    let userId = req.user.fid;
    const phone = req.user.phone;

    if (!userId && phone) {
      const [u] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]);
      if (u[0]) userId = u[0].id;
    }

    if (!userId) {
      return res.status(404).json({ error: 'user_not_found_in_finance_db' });
    }

    const { card_last4, card_name } = req.body;

    // 2. Validate Input
    if (!card_last4 || !card_name) {
      return res.status(400).json({ error: 'Missing card details' });
    }

    // 3. Update User Profile
    await pool.execute(
      'UPDATE users SET card_last4 = ?, card_name = ?, updated_at = NOW() WHERE id = ?',
      [card_last4, card_name, userId]
    );

    return res.json({ success: true, message: 'Card linked successfully' });
  } catch (err) {
    console.error('Onboard error:', err);
    return res.status(500).json({ error: 'internal' });
  }
};