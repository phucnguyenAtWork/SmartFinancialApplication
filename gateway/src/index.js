import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));

const routes = {
  auth: process.env.ROUTE_AUTH || 'http://auth:8101',
  users: process.env.ROUTE_USERS || 'http://users:8102',
  tx: process.env.ROUTE_TX || 'http://transactions:8103',
  budgets: process.env.ROUTE_BUDGETS || 'http://budgets:8104',
  llm: process.env.ROUTE_LLM || 'http://insights-llm:8105',
};

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

app.use('/api/auth', createProxyMiddleware({
  target: routes.auth,          
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onProxyReq(proxyReq, req) {
    console.log('[gateway] auth proxyReq', { url: req.originalUrl, method: req.method });
  },
  onError(err, req, res) {
    console.error('[gateway] auth proxy error', err.code, err.message);
    if (!res.headersSent) res.status(502).json({ error: 'bad_gateway', detail: err.code || 'proxy_error' });
  },
}));

app.use('/api/users', createProxyMiddleware({
   target: routes.users, 
   changeOrigin: true, 
   pathRewrite: {
     '^/api/users': '/'
   }
}));

app.use('/api/transactions', createProxyMiddleware({ 
  target: routes.tx, 
  changeOrigin: true, 
  pathRewrite: {
    '^/api/transactions': '/'
  }
}));

app.use('/api/budgets', createProxyMiddleware({ 
  target: routes.budgets, 
  changeOrigin: true, 
  pathRewrite: {
    '^/api/budgets': '/'
  }
}));

app.use('/api/insights', createProxyMiddleware({ 
  target: routes.llm, 
  changeOrigin: true, 
  pathRewrite: {
    '^/api/insights': '/'
  }
}));


const forwardOpenApi = (base, prefix) => async (req, res) => {
  try {
    const r = await fetch(`${base}/openapi.json`);
    const text = await r.text();
    res.status(r.status);
    try {
      const json = JSON.parse(text);
      const existingServers = Array.isArray(json.servers) ? json.servers : [];
      const hasPrefix = existingServers.some(s => s.url === prefix);
      if (!hasPrefix) {
        json.servers = [{ url: prefix }, ...existingServers];
      }
      res.type('application/json').send(json);
    } catch {
      res.type('application/json').send(text);
    }
  } catch (e) {
    res.status(502).json({ error: 'bad_gateway', detail: String(e) });
  }
};

app.get('/specs/auth', forwardOpenApi(routes.auth, '/api/auth'));
app.get('/specs/users', forwardOpenApi(routes.users, '/api/users'));
app.get('/specs/transactions', forwardOpenApi(routes.tx, '/api/transactions'));
app.get('/specs/budgets', forwardOpenApi(routes.budgets, '/api/budgets'));
app.get('/specs/insights', forwardOpenApi(routes.llm, '/api/insights'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, {
  explorer: false,
  swaggerOptions: {
    urls: [
      { url: '/specs/auth', name: 'Auth' },
      { url: '/specs/users', name: 'Users' },
      { url: '/specs/transactions', name: 'Transactions' },
      { url: '/specs/budgets', name: 'Budgets' },
      { url: '/specs/insights', name: 'Insights LLM' },
    ],
    docExpansion: 'none',
  }
}));

app.listen(PORT, () => {
  console.log(`Gateway listening on :${PORT}`);
});