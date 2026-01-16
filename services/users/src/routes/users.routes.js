import { Router } from 'express';
import { health, listUsers, getUser, me, onboardCard } from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const usersRouter = Router();

usersRouter.get('/health', health);
usersRouter.get('/users', listUsers);
usersRouter.get('/users/:id', getUser);
usersRouter.get('/me', requireAuth, me);
usersRouter.post('/onboard/card', requireAuth, onboardCard);