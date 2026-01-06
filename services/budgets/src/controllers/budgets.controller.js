import { pool } from '../config/db.js';
import { getFinanceUserId } from '../middlewares/auth.js';
import { Budget } from '../models/Budget.js';
import amqp from 'amqplib';

// --- 1. RABBITMQ SETUP (Matches Transaction Service) ---
let channel;

async function connectToQueue() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  try {
    console.log("[Budgets] Connecting to RabbitMQ...");
    const connection = await amqp.connect(rabbitUrl);

    connection.on("error", (err) => {
      console.error(" [Budgets] Connection Error:", err.message);
      setTimeout(connectToQueue, 5000);
    });

    connection.on("close", () => {
      console.warn("[Budgets] Connection Closed. Retrying...");
      setTimeout(connectToQueue, 5000);
    });

    channel = await connection.createChannel();
    // Assert 'budget_events' queue for publishing
    await channel.assertQueue('budget_events');
    console.log("[Budgets] Connected to RabbitMQ Successfully!");

  } catch (err) {
    console.error(`[Budgets] Failed to connect: ${err.message}`);
    console.log(`[Budgets] Retrying in 5 seconds...`);
    setTimeout(connectToQueue, 5000);
  }
}

// Start connection
connectToQueue();


// --- 2. CONTROLLER FUNCTIONS ---

export const listBudgets = async (req, res) => {
  try {
    const userId = await getFinanceUserId(req);
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    
    // Updated query to join Category Name (useful for Frontend display)
    const [rows] = await pool.execute(
      `SELECT 
        b.id, b.user_id, b.category_id, c.name as category_name,
        b.amount_limit, b.period, b.alert_threshold, 
        b.start_date, b.end_date, b.created_at 
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
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
      `SELECT 
        b.id, b.user_id, b.category_id, c.name as category_name,
        b.amount_limit, b.period, b.alert_threshold, 
        b.start_date, b.end_date, b.created_at 
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ? AND b.user_id = ?`,
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
    
    // Create Budget Model instance
    const budget = new Budget({ userId, categoryId, amountLimit, period, alertThreshold, startDate, endDate });
    
    // 1. Insert into DB
    const [result] = await pool.execute(
      'INSERT INTO budgets (user_id, category_id, amount_limit, period, alert_threshold, start_date, end_date) VALUES (?,?,?,?,?,?,?)',
      [budget.userId, budget.categoryId, budget.amountLimit, budget.period, budget.alertThreshold, budget.startDate.toISOString().slice(0, 10), budget.endDate.toISOString().slice(0, 10)]
    );

    // 2. Fetch created row (with category name for the Event)
    const [rows] = await pool.execute(
      `SELECT 
        b.*, c.name as category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [result.insertId]
    );
    const newBudget = rows[0];

    // 3. PUBLISH EVENT: BUDGET_CREATED
    if (channel) {
      const event = {
        type: 'BUDGET_CREATED',
        data: {
          id: newBudget.id,
          user_id: newBudget.user_id,
          category_id: newBudget.category_id,
          category_name: newBudget.category_name || 'General',
          amount_limit: newBudget.amount_limit,
          period: newBudget.period,
          start_date: newBudget.start_date
        },
        timestamp: new Date().toISOString()
      };

      try {
        channel.sendToQueue('budget_events', Buffer.from(JSON.stringify(event)));
        console.log(`[Event Sent] BUDGET_CREATED: Limit ${newBudget.amount_limit} for ${newBudget.category_name}`);
      } catch (e) {
        console.warn(`[Budgets] Failed to publish budget event: ${e.message}`);
      }
    }

    return res.status(201).json(newBudget);
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
    
    // Check existence
    const [rows] = await pool.execute('SELECT id, category_id FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    
    const budgetToDelete = rows[0];

    // Delete
    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);

    // PUBLISH EVENT: BUDGET_DELETED
    if (channel) {
      const event = {
        type: 'BUDGET_DELETED',
        data: { 
          id, 
          user_id: userId,
          category_id: budgetToDelete.category_id 
        },
        timestamp: new Date().toISOString()
      };
      
      channel.sendToQueue('budget_events', Buffer.from(JSON.stringify(event)));
      console.log(`[Event Sent] BUDGET_DELETED: ID ${id}`);
    }

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
};