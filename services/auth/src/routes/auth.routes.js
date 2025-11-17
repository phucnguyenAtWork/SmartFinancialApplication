import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { health, register, login, me } from '../controllers/auth.controller.js';

export const authRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200: { description: OK }
 */
authRouter.get('/health', health);

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Conflict }
 */
authRouter.post('/register', register);

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
authRouter.post('/login', login);

/**
 * @openapi
 * /me:
 *   get:
 *     summary: Current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
authRouter.get('/me', requireAuth, me);
import { Router } from 'express';
import { health, register, login, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

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
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string }
 *     responses:
 *       201: { description: Created }
 *       409: { description: Email already exists }
 */
authRouter.post('/register', register);

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in }
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
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
authRouter.get('/me', requireAuth, me);
