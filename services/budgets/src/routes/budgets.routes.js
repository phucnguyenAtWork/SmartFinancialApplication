import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgets.controller.js';

export const budgetsRouter = Router();

/**
 * @openapi
 * /:
 * get:
 * summary: List active budgets for current user
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: OK
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id:
 * type: integer
 * category_name:
 * type: string
 * amount_limit:
 * type: number
 * spent:
 * type: number
 * status:
 * type: string
 * enum: [safe, warning, danger]
 * 401:
 * description: Unauthorized
 */
budgetsRouter.get('/', requireAuth, listBudgets);

/**
 * @openapi
 * /:
 * post:
 * summary: Create a new budget
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [category_id, amount_limit, start_date, end_date]
 * properties:
 * category_id:
 * type: integer
 * amount_limit:
 * type: number
 * period:
 * type: string
 * default: MONTHLY
 * enum: [WEEKLY, MONTHLY, YEARLY]
 * start_date:
 * type: string
 * format: date
 * end_date:
 * type: string
 * format: date
 * alert_threshold:
 * type: number
 * default: 0.80
 * responses:
 * 201:
 * description: Created
 * 400:
 * description: Bad request
 * 401:
 * description: Unauthorized
 */
budgetsRouter.post('/', requireAuth, createBudget);

/**
 * @openapi
 * /{id}:
 * put:
 * summary: Update an existing budget
 * tags: [Budgets]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * amount_limit:
 * type: number
 * period:
 * type: string
 * start_date:
 * type: string
 * format: date
 * end_date:
 * type: string
 * format: date
 * alert_threshold:
 * type: number
 * responses:
 * 200:
 * description: Updated successfully
 * 401:
 * description: Unauthorized
 * 404:
 * description: Budget not found
 */
budgetsRouter.put('/:id', requireAuth, updateBudget);

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
budgetsRouter.delete('/:id', requireAuth, deleteBudget);