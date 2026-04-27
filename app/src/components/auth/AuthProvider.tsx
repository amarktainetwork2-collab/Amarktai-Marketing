import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  AuthContext,
  type AuthUser,
  authFetch,
  storeSession,
  clearSession,
  getStoredToken,
  getStoredUser,
} from '@/lib/auth';

interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  name?: string | null;
  is_admin?: boolean;
  email_verified?: boolean;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoaded, setIsLoaded] = useState(false);

  // On mount, verify the stored token is still valid by hitting /users/me
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setIsLoaded(true);
      return;
    }
    authFetch<AuthUser>('/users/me', undefined, stored)
      .then((u) => {
        setUser(u);
        setToken(stored);
      })
      .catch(() => {
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authFetch<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const u: AuthUser = { id: data.user_id, email: data.email, name: data.name, isAdmin: data.is_admin, emailVerified: data.email_verified };
    storeSession(data.access_token, u);
    setToken(data.access_token);
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const data = await authFetch<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const u: AuthUser = { id: data.user_id, email: data.email, name: data.name, isAdmin: data.is_admin, emailVerified: data.email_verified };
    storeSession(data.access_token, u);
    setToken(data.access_token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoaded,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
