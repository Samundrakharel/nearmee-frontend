'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { isLoggedIn, getProfile, login as apiLogin, logout as apiLogout } from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    if (isLoggedIn()) {
      try {
        const profile = await getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } catch (e) {
        setUser(null);
        setIsAuthenticated(false);
        // Might be because of an invalid token that couldn't be refreshed
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, [pathname]); // Refresh user on navigation to catch logout in other tabs or token expiry

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    await refreshUser();
    return data;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
