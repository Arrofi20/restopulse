// AuthContext — React Context for JWT Bearer token management and auth state.
//
// Auth mechanism (verified against src/controllers/AuthController.ts +
// src/middleware/authMiddleware.ts + frontend/src/api/client.ts):
//   - POST /api/auth/login returns `{ success, data: { token, owner: { id, username } } }`.
//   - The token is persisted in localStorage ('restopulse_token') and attached
//     to every request by api/client.ts as `Authorization: Bearer <token>`.
//   - On 401, api/client.ts clears the token and redirects to /login; this
//     context mirrors that via a `storage` event listener for cross-tab sync.
//
// Per RESEARCH.md Pitfall 2: NO cookies, NO httpOnly — the backend uses Bearer
// tokens. The JWT is NOT decoded client-side (unnecessary for v1; the backend
// validates it on every request).

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { post, setToken, clearToken } from '../api/client';

const TOKEN_KEY = 'restopulse_token';
const USER_KEY = 'restopulse_user';

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    owner: { id: string; username: string };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  // Persist the owner identity alongside the token so the header (D-17)
  // can display the username after a page refresh, not only right after login.
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  // Cross-tab sync: api/client.ts clears the token + redirects to /login on a
  // 401 in ANY tab. Listen for the storage event so this provider's state
  // mirrors a token removal that happened in another tab/window.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) {
        const next = e.newValue;
        setTokenState(next);
        if (!next) {
          setUser(null);
          localStorage.removeItem(USER_KEY);
        }
      }
      if (e.key === USER_KEY) {
        setUser(readStoredUser());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      // Only a successful response reaches here — api/client.ts throws on
      // non-ok responses, so LoginPage's catch block handles bad credentials.
      setToken(result.data.token);
      const owner = result.data.owner;
      const userObj: AuthUser = { id: owner.id, username: owner.username };
      localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      setTokenState(result.data.token);
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUser(null);
    // Simple v1 redirect — the api/client.ts 401 handler uses the same
    // mechanism (window.location.href = '/login').
    window.location.href = '/login';
  }, []);

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
