import { createApp } from './app.js';
import { config } from './config/env.js';
const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Budgets service listening on :${config.port}`);
});
// Backward-compat entry: use new app/server structure
import { createApp } from './app.js';
import { config } from './config/env.js';
const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Budgets service listening on :${config.port}`);
});
