import { Router } from 'express';
import { health, listUsers, getUser, me } from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const usersRouter = Router();

/** @openapi /health: get: summary: Health check responses: 200: { description: OK } */
usersRouter.get('/health', health);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users (paged)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: OK }
 */
usersRouter.get('/users', listUsers);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
usersRouter.get('/users/:id', getUser);

/**
 * @openapi
 * /me:
 *   get:
 *     summary: Current finance profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
usersRouter.get('/me', requireAuth, me);
