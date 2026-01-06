import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import amqp from 'amqplib';

let channel;

async function connectToQueue() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  try {
    console.log("[Transactions] Connecting to RabbitMQ...");
    const connection = await amqp.connect(rabbitUrl);

    connection.on("error", (err) => {
      console.error("[Transactions] Connection Error:", err.message);
      setTimeout(connectToQueue, 5000);
    });

    connection.on("close", () => {
      console.warn("[Transactions] Connection Closed. Retrying...");
      setTimeout(connectToQueue, 5000);
    });

    channel = await connection.createChannel();
    await channel.assertQueue('transaction_events');
    console.log("[Transactions] Connected to RabbitMQ Successfully!");

  } catch (err) {
    console.error(`[Transactions] Failed to connect: ${err.message}`);
    console.log("[Transactions] Retrying in 5 seconds...");
    setTimeout(connectToQueue, 5000);
  }
}

connectToQueue();

async function resolveCategoryId(categoryName, userId, transactionType) {
  if (!categoryName) return null;

  // Try to find existing category
  const [catRows] = await pool.execute(
    'SELECT id FROM categories WHERE name = ? AND user_id = ?',
    [categoryName, userId]
  );

  if (catRows.length > 0) {
    return catRows[0].id;
  }

  console.log(` Category "${categoryName}" not found, creating...`);
  const [newCat] = await pool.execute(
    'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
    [userId, categoryName, transactionType]
  );
  console.log(`Created category ID: ${newCat.insertId}`);
  return newCat.insertId;
}

async function resolveMerchantId(merchantName) {
  if (!merchantName || merchantName.trim() === '') return null;

  const [merchantRows] = await pool.execute(
    'SELECT id FROM merchants WHERE name = ?',
    [merchantName]
  );

  if (merchantRows.length > 0) {
    return merchantRows[0].id;
  }

  // Create new merchant if it doesn't exist
  console.log(`Merchant "${merchantName}" not found, creating...`);
  const [newMerchant] = await pool.execute(
    'INSERT INTO merchants (name) VALUES (?)',
    [merchantName]
  );
  console.log(` Created merchant ID: ${newMerchant.insertId}`);
  return newMerchant.insertId;
}

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
         t.essential, t.tags, t.occurred_at
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN merchants m ON t.merchant_id = m.id
       WHERE t.user_id = ?
       ORDER BY t.occurred_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );

    const formatted = rows.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('List Transactions Error:', err);
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
         t.essential, t.tags, t.occurred_at
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN merchants m ON t.merchant_id = m.id
       WHERE t.id = ? AND t.user_id = ?`,
      [id, userId]
    );

    if (!rows[0]) return res.status(404).json({ error: 'not found' });

    const transaction = {
      ...rows[0],
      tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags
    };

    return res.json(transaction);
  } catch (err) {
    console.error('Get Transaction Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function createTransaction(req, res) {
  try {
    console.log('Received payload:', JSON.stringify(req.body, null, 2));

    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    let {
      amount,
      description,
      category_name,
      merchant_name,
      type,
      currency,
      occurred_at,
      essential,
      tags
    } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Amount is required and must be a number' });
    }

    if (!type || !['EXPENSE', 'INCOME', 'TRANSFER'].includes(type)) {
      return res.status(400).json({ error: 'Type must be EXPENSE, INCOME, or TRANSFER' });
    }

    const rawDate = occurred_at || new Date();
    const dateObj = new Date(rawDate);
    const formattedDate = dateObj.toISOString().slice(0, 19).replace('T', ' ');

    let finalAmount = Math.abs(Number(amount));
    if (!currency) currency = 'VND';
    if (essential === undefined) essential = false;
    if (!tags) tags = [];

    const category_id = await resolveCategoryId(category_name, userId, type);
    const merchant_id = await resolveMerchantId(merchant_name);

    console.log('Inserting transaction:', {
      userId,
      type,
      finalAmount,
      currency,
      description,
      category_id,
      merchant_id,
      essential,
      tags,
      formattedDate
    });

    const [result] = await pool.execute(
      `INSERT INTO transactions 
      (user_id, type, amount, currency, description, category_id, merchant_id, essential, tags, occurred_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        type,
        finalAmount,
        currency,
        description || '',
        category_id,
        merchant_id,
        essential,
        JSON.stringify(tags),
        formattedDate
      ]
    );

    console.log(' Transaction created with ID:', result.insertId);

    const [rows] = await pool.execute(
      `SELECT 
        t.id, t.user_id, t.type, t.amount, t.currency, t.description, t.occurred_at, t.essential, t.tags,
        c.name as category_name,
        m.name as merchant_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN merchants m ON t.merchant_id = m.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    const newTx = {
      ...rows[0],
      tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags
    };

    if (channel) {
      const event = {
        type: 'TRANSACTION_CREATED',
        data: {
          id: newTx.id,
          user_id: newTx.user_id,
          amount: newTx.type === 'EXPENSE' ? -Math.abs(newTx.amount) : Math.abs(newTx.amount),
          description: newTx.description,
          category_name: newTx.category_name || 'Uncategorized',
          occurred_at: newTx.occurred_at
        },
        timestamp: new Date().toISOString()
      };

      try {
        channel.sendToQueue('transaction_events', Buffer.from(JSON.stringify(event)));
        console.log(`Event Sent: TRANSACTION_CREATED (${event.data.amount} - ${newTx.description})`);
      } catch (e) {
        console.warn('Failed to publish event:', e.message);
      }
    }

    return res.status(201).json(newTx);

  } catch (err) {
    console.error('Create Transaction Error:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage
    });

    return res.status(400).json({
      error: err.message,
      details: err.sqlMessage || err.message
    });
  }
}
export async function updateTransaction(req, res) {
  try {
    console.log('Update payload:', JSON.stringify(req.body, null, 2));

    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const id = Number(req.params.id);

    const {
      amount,
      description,
      category_name,
      merchant_name,
      occurred_at,
      type,
      essential,
      tags
    } = req.body;

    const [check] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!check[0]) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const oldTx = check[0];
    const dateObj = occurred_at ? new Date(occurred_at) : new Date(oldTx.occurred_at);
    const formattedDate = dateObj.toISOString().slice(0, 19).replace('T', ' ');

    const finalAmount = amount !== undefined ? Math.abs(Number(amount)) : oldTx.amount;
    const finalType = type || oldTx.type;
    const finalEssential = essential !== undefined ? essential : oldTx.essential;
    const finalTags = tags !== undefined ? tags : (typeof oldTx.tags === 'string' ? JSON.parse(oldTx.tags) : oldTx.tags);

    const category_id = category_name 
      ? await resolveCategoryId(category_name, userId, finalType)
      : oldTx.category_id;

    const merchant_id = merchant_name !== undefined
      ? await resolveMerchantId(merchant_name)
      : oldTx.merchant_id;

    console.log(' Updating transaction:', {
      id,
      finalAmount,
      description: description || oldTx.description,
      category_id,
      merchant_id,
      finalType,
      finalEssential,
      finalTags,
      formattedDate
    });

    await pool.execute(
      `UPDATE transactions 
       SET amount = ?, description = ?, category_id = ?, merchant_id = ?, 
           occurred_at = ?, type = ?, essential = ?, tags = ?
       WHERE id = ? AND user_id = ?`,
      [
        finalAmount,
        description || oldTx.description,
        category_id,
        merchant_id,
        formattedDate,
        finalType,
        finalEssential,
        JSON.stringify(finalTags),
        id,
        userId
      ]
    );

    console.log('Transaction updated successfully');
    if (channel) {
      const event = {
        type: 'TRANSACTION_UPDATED',
        data: {
          id,
          user_id: userId,
          old_amount: oldTx.amount,
          new_amount: finalAmount,
          category_name: category_name || 'General',
          description: description || oldTx.description
        },
        timestamp: new Date().toISOString()
      };

      try {
        channel.sendToQueue('transaction_events', Buffer.from(JSON.stringify(event)));
        console.log(`Event Sent: TRANSACTION_UPDATED (ID: ${id})`);
      } catch (e) {
        console.warn('Failed to publish update event:', e.message);
      }
    }
    const [rows] = await pool.execute(
      `SELECT 
        t.id, t.user_id, t.type, t.amount, t.currency, t.description, t.occurred_at, t.essential, t.tags,
        c.name as category_name,
        m.name as merchant_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN merchants m ON t.merchant_id = m.id
       WHERE t.id = ?`,
      [id]
    );

    const updatedTx = {
      ...rows[0],
      tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags
    };

    return res.json(updatedTx);

  } catch (err) {
    console.error('Update Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const id = Number(req.params.id);

    const [rows] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const deletedTx = rows[0];
    await pool.execute('DELETE FROM transactions WHERE id = ?', [id]);

    console.log(`Transaction ${id} deleted successfully`);

    if (channel) {
      const event = {
        type: 'TRANSACTION_DELETED',
        data: {
          id,
          user_id: userId,
          amount: deletedTx.amount,
          type: deletedTx.type,
          description: deletedTx.description
        },
        timestamp: new Date().toISOString()
      };

      try {
        channel.sendToQueue('transaction_events', Buffer.from(JSON.stringify(event)));
        console.log(`Event Sent: TRANSACTION_DELETED (ID: ${id})`);
      } catch (e) {
        console.warn('Failed to publish delete event:', e.message);
      }
    }

    return res.status(204).end();

  } catch (err) {
    console.error('Delete Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}