import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser } from "../types";
import {
  adminApi,
  getAdminToken,
  getStoredUser,
  setAdminAuth,
  clearAdminAuth,
} from "../lib/adminApi";

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [user, setUser] = useState<AdminUser | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const existingToken = getAdminToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await adminApi.auth.getMe();
      setUser(profile);
      setToken(existingToken);
      setAdminAuth(existingToken, profile);
    } catch (err) {
      console.warn("Session check failed, retaining local user state if valid:", err);
      const stored = getStoredUser();
      if (!stored) {
        clearAdminAuth();
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await adminApi.auth.login(credentials);
      setToken(res.token);
      setUser(res.data);
      setAdminAuth(res.token, res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await adminApi.auth.logout();
    } catch {
      clearAdminAuth();
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

