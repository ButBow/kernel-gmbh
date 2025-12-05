import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  STORAGE_KEYS, 
  getStorageItem, 
  setStorageItem, 
  removeStorageItem,
  serverLogin,
  serverLogout,
  verifyAuthToken,
  getAuthToken
} from '@/lib/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  loginAttempts: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Fallback password for Lovable preview (where server is not available)
const FALLBACK_PASSWORD = 'Kernel#Admin2024!';

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

// Check if we're on production server
function isServerAvailable(): boolean {
  return typeof window !== 'undefined' && !window.location.hostname.includes('lovable');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedAttempts = getStorageItem<number>('login_attempts', 0);
      const storedLockout = getStorageItem<number | null>('lockout_end', null);
      
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

      // Check if we have a valid auth token (server mode)
      if (isServerAvailable()) {
        const token = getAuthToken();
        if (token) {
          const valid = await verifyAuthToken();
          setIsAuthenticated(valid);
        }
      } else {
        // Fallback for Lovable preview - use localStorage
        const auth = getStorageItem<boolean>(STORAGE_KEYS.AUTH, false);
        setIsAuthenticated(auth);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const isLocked = lockoutEndTime !== null && Date.now() < lockoutEndTime;

  const login = async (password: string): Promise<boolean> => {
    // Check if account is locked
    if (isLocked) {
      return false;
    }

    let success = false;

    // Try server auth first (production)
    if (isServerAvailable()) {
      const result = await serverLogin(password);
      success = result.success;
    } else {
      // Fallback for Lovable preview
      success = secureCompare(password, FALLBACK_PASSWORD);
    }

    if (success) {
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

  const logout = async () => {
    await serverLogout();
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
      lockoutEndTime,
      isLoading
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