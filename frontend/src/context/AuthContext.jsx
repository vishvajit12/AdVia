// =====================================================================
// AdVia Frontend — Auth Context
// Holds the logged-in user, persists the JWT/user to localStorage, and
// exposes login/register/logout helpers used across the app.
// =====================================================================
import { createContext, useContext, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, restore the session from localStorage and verify
  // the token is still valid via /auth/me.
  useEffect(() => {
    const storedToken = localStorage.getItem('advia_token');
    const storedUser = localStorage.getItem('advia_user');

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    setUser(JSON.parse(storedUser));

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('advia_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        // Interceptor already clears storage + redirects on 401.
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: loggedInUser } = res.data;
      localStorage.setItem('advia_token', token);
      localStorage.setItem('advia_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }

  async function register(payload) {
    try {
      const res = await api.post('/auth/register', payload);
      const { token, user: newUser } = res.data;
      localStorage.setItem('advia_token', token);
      localStorage.setItem('advia_user', JSON.stringify(newUser));
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }

  function logout() {
    localStorage.removeItem('advia_token');
    localStorage.removeItem('advia_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
