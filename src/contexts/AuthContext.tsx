import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem } from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  loginAttempts: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Stronger password - change this to your secure password before deployment!
// Minimum 12 characters with uppercase, lowercase, numbers, and symbols recommended
const ADMIN_PASSWORD = 'Kernel#Admin2024!';

// Security: Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Simple hash function for password comparison (timing-safe-ish)
const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  useEffect(() => {
    const auth = getStorageItem<boolean>(STORAGE_KEYS.AUTH, false);
    const storedAttempts = getStorageItem<number>('login_attempts', 0);
    const storedLockout = getStorageItem<number | null>('lockout_end', null);
    
    setIsAuthenticated(auth);
    setLoginAttempts(storedAttempts);
    
    // Check if lockout has expired
    if (storedLockout && Date.now() > storedLockout) {
      setLockoutEndTime(null);
      setLoginAttempts(0);
      removeStorageItem('lockout_end');
      setStorageItem('login_attempts', 0);
    } else {
      setLockoutEndTime(storedLockout);
    }
  }, []);

  const isLocked = lockoutEndTime !== null && Date.now() < lockoutEndTime;

  const login = (password: string): boolean => {
    // Check if account is locked
    if (isLocked) {
      return false;
    }

    // Use timing-safe comparison
    if (secureCompare(password, ADMIN_PASSWORD)) {
      setIsAuthenticated(true);
      setStorageItem(STORAGE_KEYS.AUTH, true);
      // Reset attempts on successful login
      setLoginAttempts(0);
      setStorageItem('login_attempts', 0);
      setLockoutEndTime(null);
      removeStorageItem('lockout_end');
      return true;
    }
    
    // Failed attempt - increment counter
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    setStorageItem('login_attempts', newAttempts);
    
    // Lock account if max attempts reached
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockEnd = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutEndTime(lockEnd);
      setStorageItem('lockout_end', lockEnd);
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    removeStorageItem(STORAGE_KEYS.AUTH);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      loginAttempts, 
      isLocked, 
      lockoutEndTime 
    }}>
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
