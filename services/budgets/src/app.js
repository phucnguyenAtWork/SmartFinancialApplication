import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './config/env.js';
import { budgetsRouter } from './routes/budgets.routes.js';

export function createApp() {
  const app = express();
  
  // 1. Security & CORS
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin || '*' })); 
  
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      console.log(`[Budgets Traffic] Incoming ${req.method} ${req.url}`);
    }
    next();
  });

  // 3. Body Parsers
  app.use(express.json({ 
    limit: '10mb',
    strict: true
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));
  
  // 4. Standard Logging
  app.use(morgan('dev'));

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.body) {
      console.log('[Budgets Payload] Body Parsed Successfully');
    }
    next();
  });

  // 6. Health Check
  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'budgets' }));

  // 7. Mount Routes
  app.use(budgetsRouter); 

  // 8. Swagger Docs
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'Budgets Service', version: '1.0.0' },
      components: { 
        securitySchemes: { 
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } 
        } 
      },
      servers: [{ url: '/api/budgets', description: 'Public API Gateway Path' }]
    },
    apis: ['./routes/budgets.routes.js'], 
  });
  
  app.get('/openapi.json', (req, res) => res.json(swaggerSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 9. Global Error Handler
  app.use((err, req, res, next) => {
    if (err.type === 'request.aborted' || err.message === 'request aborted') {
      return res.status(400).json({ error: 'Bad Request', message: 'Request aborted.' });
    }

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: "Invalid JSON", message: err.message });
    }

    console.error(`[Budgets Service Error]: ${err.message}`);
    
    return res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  return app;
}