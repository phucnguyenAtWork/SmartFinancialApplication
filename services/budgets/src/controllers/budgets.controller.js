import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import amqp from 'amqplib';

let channel;

// --- RabbitMQ Connection (Mirrors your Transaction Service) ---
async function connectToQueue() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  try {
    console.log("[Budgets] Connecting to RabbitMQ...");
    const connection = await amqp.connect(rabbitUrl);

    connection.on("error", (err) => {
      console.error("[Budgets] Connection Error:", err.message);
      setTimeout(connectToQueue, 5000);
    });

    connection.on("close", () => {
      console.warn("[Budgets] Connection Closed. Retrying...");
      setTimeout(connectToQueue, 5000);
    });

    channel = await connection.createChannel();
    await channel.assertQueue('budget_events'); // Separate queue for budget lifecycle events
    console.log("[Budgets] Connected to RabbitMQ Successfully!");

  } catch (err) {
    console.error(`[Budgets] Failed to connect: ${err.message}`);
    console.log("[Budgets] Retrying in 5 seconds...");
    setTimeout(connectToQueue, 5000);
  }
}

connectToQueue();

// --- Helper: Publish Event ---
function publishEvent(type, data) {
  if (channel) {
    const event = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    try {
      channel.sendToQueue('budget_events', Buffer.from(JSON.stringify(event)));
      console.log(`Event Sent: ${type} (ID: ${data.id})`);
    } catch (e) {
      console.warn('Failed to publish event:', e.message);
    }
  }
}

// --- Controller Functions ---

export async function listBudgets(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    // Logic: Join Budgets with Transactions to calculate 'spent' in real-time
    // Only counts EXPENSES that occurred between the budget's start and end dates
    const [rows] = await pool.execute(
      `SELECT 
         b.id, b.user_id, b.amount_limit, b.period, b.start_date, b.end_date, b.alert_threshold,
         c.name AS category_name, b.category_id,
         COALESCE(SUM(t.amount), 0) as spent
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       LEFT JOIN transactions t ON 
           b.category_id = t.category_id 
           AND t.user_id = b.user_id
           AND t.type = 'EXPENSE'
           AND t.occurred_at BETWEEN b.start_date AND b.end_date
       WHERE b.user_id = ?
       GROUP BY b.id, c.name, b.amount_limit, b.period, b.start_date, b.end_date, b.alert_threshold`,
      [userId]
    );

    // Format the response and calculate flags (over budget, warning, etc.)
    const formatted = rows.map(row => {
      const limit = Number(row.amount_limit);
      const spent = Number(row.spent);
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      const threshold = Number(row.alert_threshold || 0.80);

      // Determine Status
      let status = 'safe';
      if (spent > limit) status = 'danger';
      else if (percent >= (threshold * 100)) status = 'warning';

      return {
        ...row,
        spent,
        amount_limit: limit,
        remaining: limit - spent,
        percent,
        status,
        // Convert JS Date objects to YYYY-MM-DD strings for frontend
        start_date: row.start_date.toISOString().split('T')[0],
        end_date: row.end_date.toISOString().split('T')[0]
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('List Budgets Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function createBudget(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    console.log('Creating Budget:', JSON.stringify(req.body, null, 2));

    const { category_id, amount_limit, period, start_date, end_date, alert_threshold } = req.body;

    if (!category_id || !amount_limit || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields (category_id, amount, dates)' });
    }

    const [result] = await pool.execute(
      `INSERT INTO budgets 
       (user_id, category_id, amount_limit, period, start_date, end_date, alert_threshold) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        category_id,
        amount_limit,
        period || 'MONTHLY',
        start_date,
        end_date,
        alert_threshold || 0.80
      ]
    );

    const newBudgetId = result.insertId;
    console.log(`Budget created with ID: ${newBudgetId}`);

    publishEvent('BUDGET_CREATED', {
      id: newBudgetId,
      user_id: userId,
      category_id,
      amount_limit
    });

    return res.status(201).json({ id: newBudgetId, status: 'success' });

  } catch (err) {
    console.error('Create Budget Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function updateBudget(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const id = Number(req.params.id);
    const { amount_limit, period, start_date, end_date, alert_threshold } = req.body;

    // Verify ownership
    const [check] = await pool.execute('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!check[0]) return res.status(404).json({ error: 'Budget not found' });

    await pool.execute(
      `UPDATE budgets 
       SET amount_limit = ?, period = ?, start_date = ?, end_date = ?, alert_threshold = ?
       WHERE id = ? AND user_id = ?`,
      [
        amount_limit,
        period,
        start_date,
        end_date,
        alert_threshold || 0.80,
        id,
        userId
      ]
    );

    console.log(`Budget ${id} updated`);
    
    publishEvent('BUDGET_UPDATED', {
      id,
      user_id: userId,
      new_limit: amount_limit
    });

    return res.json({ id, status: 'updated' });

  } catch (err) {
    console.error('Update Budget Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}

export async function deleteBudget(req, res) {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    const id = Number(req.params.id);

    const [check] = await pool.execute('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!check[0]) return res.status(404).json({ error: 'Budget not found' });

    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
    console.log(`Budget ${id} deleted`);

    publishEvent('BUDGET_DELETED', { id, user_id: userId });

    return res.status(204).end();

  } catch (err) {
    console.error('Delete Budget Error:', err);
    return res.status(500).json({ error: 'internal' });
  }
}