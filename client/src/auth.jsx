import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, clearToken, getToken, setToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  // Saat halaman dibuka ulang, cek apakah token lama masih valid.
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('sdp:logout', onLogout);
    return () => window.removeEventListener('sdp:logout', onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { username, password } });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, checking, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/** Halaman yang hanya boleh diakses setelah login. */
export function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="page-loading">Memuat…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
