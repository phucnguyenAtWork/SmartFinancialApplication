import { createApp } from './app.js';
import { config } from './config/env.js';
const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Budgets service listening on :${config.port}`);
});
import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Budgets service listening on :${config.port}`);
});
