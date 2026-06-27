// Bearer-token fetch wrapper for the RestoPulse API.
// Source: RESEARCH.md § Code Example (lines 569-630) + PATTERNS.md §8.
//
// Auth mechanism (verified against src/middleware/authMiddleware.ts):
//   - Backend reads `Authorization: Bearer <token>` header (NOT cookies).
//   - POST /api/auth/login returns `{ success, data: { token, owner } }` in
//     the JSON body; the token is persisted in localStorage and attached
//     manually to every request here.
//   - On 401 the token is cleared and the user is redirected to /login.
//
// `credentials: 'include'` is intentionally NOT set — the backend uses
// Bearer tokens, not cookies (RESEARCH.md Pitfall 2).

// VITE_API_BASE_URL must be set during the Render Static Site build so the
// frontend calls the correct backend origin in production. Falls back to
// '/api' for local development (relies on Vite dev proxy).
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
const TOKEN_KEY = 'restopulse_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    // Cast to Record<string, string> so TS allows the arbitrary key write
    // on the HeadersInit union (HeadersInit also accepts string[][] / Headers).
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    // Backend error shape: { success: false, error: { code, message, details? } }
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function get<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'GET' });
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
