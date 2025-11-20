export const apiBase = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const msg = typeof data === 'string' ? data : data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
