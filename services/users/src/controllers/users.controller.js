import { pool as finPool } from '../config/db.js';

export const health = (req, res) => {
  return res.json({ 
    status: 'ok', 
    service: 'users',
    timestamp: new Date().toISOString()
  });
};

export const listUsers = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    
    const [rows] = await finPool.execute(
      'SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [String(limit), String(offset)]
    );
    
    return res.json(rows);
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const getUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const [rows] = await finPool.execute(
      'SELECT id, email, name, created_at FROM users WHERE id = ?', 
      [id]
    );
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'not found' });
    }
    
    return res.json(rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const me = async (req, res) => {
  try {
    const targetId = req.user.fid || req.user.id;
    
    if (!targetId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await finPool.execute(
      'SELECT id, name, phone, email, currency, card_last4, card_name FROM users WHERE id = ?',
      [targetId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('GetMe Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const onboardCard = async (req, res) => {
  console.log('/onboard/card request started');

  try {
    const targetId = (req.user.fid !== undefined && req.user.fid !== null) 
    ? req.user.fid 
    : req.user.id;

    console.log('Target User ID (FID):', targetId);

    if (!targetId) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No user ID found in token' 
      });
    }

    const { card_last4, card_name } = req.body;

    const [result] = await finPool.execute(
      `UPDATE users 
       SET card_last4 = ?, 
           card_name = ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [card_last4, card_name, targetId]
    );

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      console.error(`User ${targetId} not found in Finance DB.`);
      return res.status(404).json({ 
        error: 'User not found', 
        message: 'User does not exist in the database' 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Card linked successfully',
      user: { id: targetId, card_last4, card_name }
    });

  } catch (err) {
    console.error('Onboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};