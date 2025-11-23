import { hookConsole } from './util/logger.js';
hookConsole();
import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();
app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth service listening on :${config.port}`);
});
