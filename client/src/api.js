const TOKEN_KEY = 'sdp_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Error dari API, membawa status HTTP dan body respons. */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || 'Terjadi kesalahan');
    this.status = status;
    this.body = body;
  }
}

/** Pembungkus fetch: otomatis menyertakan token JWT dan parsing JSON. */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    clearToken();
    window.dispatchEvent(new Event('sdp:logout'));
  }
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
