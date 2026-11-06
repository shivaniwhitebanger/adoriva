import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { INITIAL_USERS } from '../data/seedData.ts';
import { api, getAdminToken, setAdminToken } from '../services/api.ts';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

interface AuthContextType {
  // Customer state
  user: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  quickSwitch: (role: 'customer') => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // Admin state & operations (Server-Authorized RBAC)
  isAdmin: boolean;
  adminUser: AdminProfile | null;
  adminLoading: boolean;
  loginAdmin: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Customer user state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('adoriva_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // default to demo customer
    } catch {
      return INITIAL_USERS[1];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Admin state
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Check existing admin session on mount
  useEffect(() => {
    const verifyExistingAdmin = async () => {
      const token = getAdminToken();
      if (!token) {
        setAdminLoading(false);
        return;
      }
      try {
        const res = await api.adminVerify();
        if (res.valid && res.admin) {
          setAdminUser(res.admin);
        } else {
          setAdminUser(null);
          setAdminToken(null);
        }
      } catch {
        setAdminUser(null);
      } finally {
        setAdminLoading(false);
      }
    };

    verifyExistingAdmin();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('adoriva_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('adoriva_user');
    }
  }, [user]);

  // Customer Login
  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        setIsAuthModalOpen(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const quickSwitch = (role: 'customer') => {
    if (role === 'customer') {
      setUser(INITIAL_USERS[1]);
    }
  };

  // Secure Admin Login (Server-Authoritative)
  const loginAdmin = async (
    email: string,
    password: string,
    remember = false
  ): Promise<{ success: boolean; error?: string }> => {
    setAdminLoading(true);
    try {
      const res = await api.adminLogin(email, password, remember);
      if (res.success && res.admin) {
        setAdminUser(res.admin);
        setAdminLoading(false);
        return { success: true };
      }
      setAdminUser(null);
      setAdminLoading(false);
      return { success: false, error: res.error || 'Invalid credentials' };
    } catch {
      setAdminUser(null);
      setAdminLoading(false);
      return { success: false, error: 'Network error communicating with authentication server' };
    }
  };

  // Secure Admin Logout
  const logoutAdmin = async (): Promise<void> => {
    setAdminLoading(true);
    try {
      await api.adminLogout();
    } finally {
      setAdminUser(null);
      setAdminLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        quickSwitch,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),

        // Admin
        isAdmin: !!adminUser && adminUser.role === 'admin',
        adminUser,
        adminLoading,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
