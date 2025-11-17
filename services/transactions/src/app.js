import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './config/env.js';
import { transactionsRouter } from './routes/transactions.routes.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'transactions' }));
  app.use(transactionsRouter);

  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'Transactions Service', version: '1.0.0' },
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    },
    apis: [new URL('./routes/transactions.routes.js', import.meta.url).pathname],
  });
  app.get('/openapi.json', (req, res) => res.json(swaggerSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  return app;
}
