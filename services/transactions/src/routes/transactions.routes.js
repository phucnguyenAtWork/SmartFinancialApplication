import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listTransactions, getTransaction, createTransaction, deleteTransaction } from '../controllers/transactions.controller.js';

export const transactionsRouter = Router();

/**
 * @openapi
 * /transactions:
 *   get:
 *     summary: List current user's transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
transactionsRouter.get('/transactions', requireAuth, listTransactions);

/**
 * @openapi
 * /transactions/{id}:
 *   get:
 *     summary: Get a transaction by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
transactionsRouter.get('/transactions/:id', requireAuth, getTransaction);

/**
 * @openapi
 * /transactions:
 *   post:
 *     summary: Create a transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, currency, occurredAt]
 *             properties:
 *               amount: { type: number }
 *               currency: { type: string, minLength: 3, maxLength: 3 }
 *               category: { type: string }
 *               description: { type: string }
 *               occurredAt: { type: string, format: date-time }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 */
transactionsRouter.post('/transactions', requireAuth, createTransaction);

/**
 * @openapi
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       204: { description: No Content }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
transactionsRouter.delete('/transactions/:id', requireAuth, deleteTransaction);
