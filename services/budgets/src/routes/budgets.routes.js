import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listBudgets, getBudget, createBudget, deleteBudget } from '../controllers/budgets.controller.js';

export const budgetsRouter = Router();

/**
 * @openapi
 * /:
 * get:
 * summary: List budgets for current user
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: OK
 * 401:
 * description: Unauthorized
 */
// FIXED: Changed '/budgets' to '/'
budgetsRouter.get('/', requireAuth, listBudgets);

/**
 * @openapi
 * /{id}:
 * get:
 * summary: Get budget by id
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: OK
 * 401:
 * description: Unauthorized
 * 404:
 * description: Not found
 */
// FIXED: Changed '/budgets/:id' to '/:id'
budgetsRouter.get('/:id', requireAuth, getBudget);

/**
 * @openapi
 * /:
 * post:
 * summary: Create a budget
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [amount, period, startDate, endDate]
 * properties:
 * categoryId:
 * type: integer
 * amount:
 * type: number
 * period:
 * type: string
 * enum: [Weekly, Monthly, Yearly]
 * startDate:
 * type: string
 * format: date
 * endDate:
 * type: string
 * format: date
 * responses:
 * 201:
 * description: Created
 * 400:
 * description: Bad request
 * 401:
 * description: Unauthorized
 */
// FIXED: Changed '/budgets' to '/'
budgetsRouter.post('/', requireAuth, createBudget);

/**
 * @openapi
 * /{id}:
 * delete:
 * summary: Delete a budget
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 204:
 * description: No Content
 * 401:
 * description: Unauthorized
 * 404:
 * description: Not found
 */
// FIXED: Changed '/budgets/:id' to '/:id'
budgetsRouter.delete('/:id', requireAuth, deleteBudget);