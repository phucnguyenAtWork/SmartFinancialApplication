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
app.use(express.json());
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

// API proxies
app.use('/api/auth', createProxyMiddleware({ target: routes.auth, changeOrigin: true, pathRewrite: { '^/api/auth': '/' } }));
app.use('/api/users', createProxyMiddleware({ target: routes.users, changeOrigin: true, pathRewrite: { '^/api/users': '/' } }));
app.use('/api/transactions', createProxyMiddleware({ target: routes.tx, changeOrigin: true, pathRewrite: { '^/api/transactions': '/' } }));
app.use('/api/budgets', createProxyMiddleware({ target: routes.budgets, changeOrigin: true, pathRewrite: { '^/api/budgets': '/' } }));
app.use('/api/insights', createProxyMiddleware({ target: routes.llm, changeOrigin: true, pathRewrite: { '^/api/insights': '/' } }));

// Spec endpoints (no proxy rewrite quirks); Node 20+ has global fetch
const forwardOpenApi = (base) => async (req, res) => {
  try {
    const r = await fetch(`${base}/openapi.json`);
    const text = await r.text();
    res.status(r.status);
    // Try to pass JSON if possible; otherwise raw
    try { res.type('application/json').send(JSON.parse(text)); }
    catch { res.type('application/json').send(text); }
  } catch (e) {
    res.status(502).json({ error: 'bad_gateway', detail: String(e) });
  }
};
app.get('/specs/auth', forwardOpenApi(routes.auth));
app.get('/specs/users', forwardOpenApi(routes.users));
app.get('/specs/transactions', forwardOpenApi(routes.tx));
app.get('/specs/budgets', forwardOpenApi(routes.budgets));
app.get('/specs/insights', forwardOpenApi(routes.llm));

// Aggregated Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, {
  explorer: false,
  swaggerOptions: {
    urls: [
  { url: '/api/auth/openapi.json', name: 'Auth' },
  { url: '/api/users/openapi.json', name: 'Users' },
  { url: '/api/transactions/openapi.json', name: 'Transactions' },
  { url: '/api/budgets/openapi.json', name: 'Budgets' },
  { url: '/api/insights/openapi.json', name: 'Insights LLM' },
    ],
    docExpansion: 'none',
  }
}));

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Gateway listening on :${PORT}`);
});
