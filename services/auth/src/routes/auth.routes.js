import { Router } from 'express';
import { health, register, login, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { authPool } from '../config/db.js';
import { getLogs } from '../util/logger.js';

export const authRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.get('/health', health);

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user (phone based)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string, description: 'E.164 phone number' }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string }
 *               email: { type: string, format: email }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     phone: { type: string }
 *                     name: { type: string }
 *       409: { description: Phone already exists }
 */
authRouter.post('/register', register);

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login with phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     phone: { type: string }
 *                     name: { type: string }
 *       401: { description: Invalid credentials }
 */
authRouter.post('/login', login);

/**
 * @openapi
 * /me:
 *   get:
 *     summary: Get current user info
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auth:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     phone: { type: string }
 *                     email: { type: string }
 *                 finance:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     phone: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *       401: { description: Unauthorized }
 */
authRouter.get('/me', requireAuth, me);

// Debug DB route (non-auth) - DO NOT USE IN PRODUCTION
authRouter.get('/debug/db', async (req, res) => {
	try {
		const [ping] = await authPool.execute('SELECT 1 AS ok');
		const [schema] = await authPool.query('SHOW COLUMNS FROM auth_users');
		res.json({ ping: ping[0], schema });
	} catch (e) {
		res.status(500).json({ error: 'db_debug_failed', detail: e.code, message: e.message });
	}
});

// Simple echo to confirm POST reaches service
authRouter.post('/debug/echo', (req, res) => {
	res.json({ received: req.body || null, time: Date.now() });
});

// Minimal test register (no finance ensure) to isolate DB insert timing
authRouter.post('/debug/test-register', async (req, res) => {
	const { phone, password } = req.body || {};
	if (!phone || !password) return res.status(400).json({ error: 'phone/password required' });
	try {
		const t0 = Date.now();
		const hash = await bcrypt.hash(password, 8);
		const [result] = await authPool.execute(
			'INSERT INTO auth_users (phone, password_hash) VALUES (?, ?)',
			[phone, hash]
		);
		res.json({ id: result.insertId, ms: Date.now() - t0 });
	} catch (e) {
		res.status(500).json({ error: 'test_register_failed', code: e.code, msg: e.message });
	}
});

// Recent logs (non-auth) - DO NOT USE IN PRODUCTION
authRouter.get('/debug/logs', (req, res) => {
	const limit = Number(req.query.limit || 200);
	res.json({ lines: getLogs({ limit }) });
});
