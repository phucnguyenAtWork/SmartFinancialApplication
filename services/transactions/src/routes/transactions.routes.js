import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
// 1. IMPORT updateTransaction HERE
import { 
  listTransactions, 
  getTransaction, 
  createTransaction, 
  deleteTransaction, 
  updateTransaction 
} from '../controllers/transactions.controller.js';

export const transactionsRouter = Router();

/**
 * @openapi
 * /:
 * get:
 * summary: List current user's transactions
 * tags: [Transactions]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 50
 * - in: query
 * name: offset
 * schema:
 * type: integer
 * default: 0
 * responses:
 * 200:
 * description: OK
 * 401:
 * description: Unauthorized
 */
transactionsRouter.get('/', requireAuth, listTransactions);

/**
 * @openapi
 * /{id}:
 * get:
 * summary: Get a transaction by id
 * tags: [Transactions]
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
transactionsRouter.get('/:id', requireAuth, getTransaction);

/**
 * @openapi
 * /:
 * post:
 * summary: Create a transaction
 * tags: [Transactions]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [amount, currency, occurredAt]
 * properties:
 * amount:
 * type: number
 * currency:
 * type: string
 * category:
 * type: string
 * description:
 * type: string
 * occurredAt:
 * type: string
 * format: date-time
 * responses:
 * 201:
 * description: Created
 * 400:
 * description: Bad request
 * 401:
 * description: Unauthorized
 */
transactionsRouter.post('/', requireAuth, createTransaction);

/**
 * @openapi
 * /{id}:
 * put:
 * summary: Update a transaction
 * tags: [Transactions]
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
 * amount:
 * type: number
 * description:
 * type: string
 * occurred_at:
 * type: string
 * format: date-time
 * type:
 * type: string
 * enum: [INCOME, EXPENSE, TRANSFER]
 * responses:
 * 200:
 * description: Updated successfully
 * 400:
 * description: Bad request
 * 401:
 * description: Unauthorized
 * 404:
 * description: Not found
 */
transactionsRouter.put('/:id', requireAuth, updateTransaction);

/**
 * @openapi
 * /{id}:
 * delete:
 * summary: Delete a transaction
 * tags: [Transactions]
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
transactionsRouter.delete('/:id', requireAuth, deleteTransaction);