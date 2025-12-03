import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simple password - in production, use proper auth
const ADMIN_PASSWORD = 'admin123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getStorageItem<boolean>(STORAGE_KEYS.AUTH, false);
    setIsAuthenticated(auth);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setStorageItem(STORAGE_KEYS.AUTH, true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeStorageItem(STORAGE_KEYS.AUTH);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
