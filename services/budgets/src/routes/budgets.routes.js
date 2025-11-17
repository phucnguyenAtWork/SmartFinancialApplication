import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listBudgets, getBudget, createBudget, deleteBudget } from '../controllers/budgets.controller.js';

export const budgetsRouter = Router();

/** @openapi */
budgetsRouter.get('/budgets/health', (req, res) => res.json({ status: 'ok', service: 'budgets' }));

/** @openapi */
budgetsRouter.get('/budgets/budgets', requireAuth, listBudgets);
/** @openapi */
budgetsRouter.get('/budgets/budgets/:id', requireAuth, getBudget);
/** @openapi */
budgetsRouter.post('/budgets/budgets', requireAuth, createBudget);
/** @openapi */
budgetsRouter.delete('/budgets/budgets/:id', requireAuth, deleteBudget);
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listBudgets, getBudget, createBudget, deleteBudget } from '../controllers/budgets.controller.js';

export const budgetsRouter = Router();

/**
 * @openapi
 * /budgets:
 *   get:
 *     summary: List budgets for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
budgetsRouter.get('/budgets', requireAuth, listBudgets);

/**
 * @openapi
 * /budgets/{id}:
 *   get:
 *     summary: Get budget by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 *       404: { description: Not found }
 */
budgetsRouter.get('/budgets/:id', requireAuth, getBudget);

/**
 * @openapi
 * /budgets:
 *   post:
 *     summary: Create a budget
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, period, limitAmount, currency]
 *             properties:
 *               name: { type: string }
 *               period: { type: string, enum: [weekly, monthly, yearly] }
 *               limitAmount: { type: number }
 *               currency: { type: string, minLength: 3, maxLength: 3 }
 *               startsOn: { type: string, format: date }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Bad request }
 *       401: { description: Unauthorized }
 */
budgetsRouter.post('/budgets', requireAuth, createBudget);

/**
 * @openapi
 * /budgets/{id}:
 *   delete:
 *     summary: Delete a budget
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
budgetsRouter.delete('/budgets/:id', requireAuth, deleteBudget);
