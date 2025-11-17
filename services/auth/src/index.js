import { createApp } from './app.js';
import { config } from './config/env.js';
const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth service listening on :${config.port}`);
});
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { createApp } from './app.js';
import { config } from './config/env.js';
const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth service listening on :${config.port}`);
});
const PORT = process.env.PORT || 8101;
