// Base API URL; may be empty in dev when using Vite proxy. Normalize trailing slash.
const rawBase = import.meta.env.VITE_API_BASE_URL || '';
export const apiBase = rawBase.replace(/\/+$/, '');

class ApiError extends Error {
  constructor(message, { status, data, path }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.path = path;
  }
}

export async function apiRequest(path, { method = 'GET', body, token, timeoutMs = 30000 } = {}) {
  // Ensure path starts with single leading slash and avoid double /api or // sequences.
  const cleanPath = ('/' + path.replace(/^\/+/, '')).replace(/\/+/g, '/');
  const url = apiBase ? `${apiBase}${cleanPath}` : cleanPath;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const started = Date.now();
  console.log('[api] request', { method, url, base: apiBase, path: cleanPath, body });
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(t);
    console.error('[api] network error', err.name, err.message);
    throw new Error(err.name === 'AbortError' ? 'Request timeout' : 'Network error');
  }
  clearTimeout(t);
  console.log('[api] response meta', { url, ms: Date.now() - started, status: res.status });
  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const msg = typeof data === 'string' ? data.slice(0,200) : data?.message || data?.error || `HTTP ${res.status}`;
    throw new ApiError(msg, { status: res.status, data, path });
  }
  return data;
}
