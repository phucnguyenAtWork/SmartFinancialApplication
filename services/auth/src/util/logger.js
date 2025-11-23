// Simple in-memory ring buffer logger for recent lines
const MAX_LINES = 500;
const lines = [];

function push(kind, args) {
  const entry = {
    ts: new Date().toISOString(),
    kind,
    text: args.map(a => (typeof a === 'object' ? safeStringify(a) : String(a))).join(' '),
  };
  lines.push(entry);
  if (lines.length > MAX_LINES) lines.shift();
}

function safeStringify(obj) {
  try { return JSON.stringify(obj); } catch { return '[unstringifiable]'; }
}

export function hookConsole() {
  if (console.__hooked) return; // idempotent
  const origLog = console.log;
  const origError = console.error;
  console.log = (...args) => { push('log', args); origLog(...args); };
  console.error = (...args) => { push('error', args); origError(...args); };
  console.__hooked = true;
}

export function getLogs({ limit = 200 } = {}) {
  return lines.slice(-limit);
}
