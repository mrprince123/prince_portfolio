import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useInRouterContext, useNavigate } from "react-router-dom";
import { AdminUser } from "../types";
import {
  adminApi,
  getAdminToken,
  getStoredUser,
  setAdminAuth,
  clearAdminAuth,
  isTokenExpired,
  getTokenTimeRemaining,
  onSessionExpired,
  notifySessionExpired,
  broadcastAdminLogin,
  ADMIN_TOKEN_KEY,
  ADMIN_AUTH_EVENT_KEY,
  ADMIN_CHANNEL_NAME,
} from "../lib/adminApi";
import { clearAdminCache } from "@/lib/queryClient";
import { toast } from "sonner";

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

// Internal helper to safely connect to React Router's useNavigate hook if within a router
const AdminAuthRouteBridgeInner: React.FC<{
  onRegisterNavigate: (nav: (path: string, options?: unknown) => void) => void;
}> = ({ onRegisterNavigate }) => {
  const navigate = useNavigate();
  useEffect(() => {
    onRegisterNavigate(navigate);
  }, [navigate, onRegisterNavigate]);
  return null;
};

const AdminAuthRouteBridge: React.FC<{
  onRegisterNavigate: (nav: (path: string, options?: unknown) => void) => void;
}> = ({ onRegisterNavigate }) => {
  const inRouter = useInRouterContext();
  if (!inRouter) return null;
  return <AdminAuthRouteBridgeInner onRegisterNavigate={onRegisterNavigate} />;
};

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [user, setUser] = useState<AdminUser | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const expiryTimerRef = useRef<number | null>(null);
  const navigateRef = useRef<((path: string, options?: unknown) => void) | null>(null);
  const lastToastTimeRef = useRef<number>(0);

  const handleRegisterNavigate = useCallback(
    (nav: (path: string, options?: unknown) => void) => {
      navigateRef.current = nav;
    },
    []
  );

  const handleSessionExpired = useCallback(
    (reason = "Your session has expired. Please log in again.", showToast = true) => {
      if (expiryTimerRef.current) {
        window.clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }

      clearAdminAuth();
      clearAdminCache();
      setToken(null);
      setUser(null);
      setIsLoading(false);

      const now = Date.now();
      if (showToast && now - lastToastTimeRef.current > 2500) {
        lastToastTimeRef.current = now;
        toast.error(reason, { id: "admin-session-expired" });
      }

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/admin") && currentPath !== "/admin/login") {
          if (navigateRef.current) {
            navigateRef.current("/admin/login?reason=expired", {
              replace: true,
              state: { from: { pathname: currentPath }, reason: "session_expired" },
            });
          } else {
            window.location.replace("/admin/login?reason=expired");
          }
        }
      }
    },
    []
  );

  const scheduleExpiryTimer = useCallback(
    (authToken: string | null) => {
      if (expiryTimerRef.current) {
        window.clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }

      if (!authToken) return;

      if (isTokenExpired(authToken)) {
        notifySessionExpired("Your session has expired. Please log in again.");
        return;
      }

      const remainingMs = getTokenTimeRemaining(authToken);
      if (remainingMs <= 0) {
        notifySessionExpired("Your session has expired. Please log in again.");
        return;
      }

      const maxTimeout = 2147483647; // 32-bit int limit for setTimeout
      const delay = Math.min(remainingMs, maxTimeout);

      expiryTimerRef.current = window.setTimeout(() => {
        notifySessionExpired("Your session has expired. Please log in again.");
      }, delay);
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    const existingToken = getAdminToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    if (isTokenExpired(existingToken)) {
      handleSessionExpired("Your session has expired. Please log in again.", false);
      return;
    }

    try {
      const profile = await adminApi.auth.getMe();
      setUser(profile);
      setToken(existingToken);
      setAdminAuth(existingToken, profile);
      scheduleExpiryTimer(existingToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Session verification failed";
      console.warn("Session check failed, terminating session:", msg);
      // Strictly clear local state to prevent retaining stale zombie sessions
      handleSessionExpired("Your session has expired. Please log in again.", true);
    } finally {
      setIsLoading(false);
    }
  }, [handleSessionExpired, scheduleExpiryTimer]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Subscribe to centralized session expiration events
  useEffect(() => {
    const unsubscribe = onSessionExpired((reason) => {
      handleSessionExpired(reason, true);
    });
    return () => {
      unsubscribe();
    };
  }, [handleSessionExpired]);

  // Multi-tab synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ADMIN_TOKEN_KEY && !e.newValue) {
        handleSessionExpired("Your session has ended in another tab.", true);
      } else if (e.key === ADMIN_AUTH_EVENT_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type === "session_expired") {
            handleSessionExpired(data.reason || "Your session has expired. Please log in again.", true);
          } else if (data.type === "login") {
            const currentToken = getAdminToken();
            const currentUser = getStoredUser();
            if (currentToken && currentUser) {
              setToken(currentToken);
              setUser(currentUser);
              setIsLoading(false);
              scheduleExpiryTimer(currentToken);
            }
          }
        } catch {
          // ignore storage json parsing error
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel(ADMIN_CHANNEL_NAME);
        channel.onmessage = (event) => {
          const data = event.data;
          if (data?.type === "session_expired") {
            handleSessionExpired(data.reason || "Your session has expired. Please log in again.", true);
          } else if (data?.type === "login") {
            const currentToken = getAdminToken();
            const currentUser = getStoredUser();
            if (currentToken && currentUser) {
              setToken(currentToken);
              setUser(currentUser);
              setIsLoading(false);
              scheduleExpiryTimer(currentToken);
            }
          }
        };
      } catch {
        // ignore BroadcastChannel errors
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.close();
      }
      if (expiryTimerRef.current) {
        window.clearTimeout(expiryTimerRef.current);
      }
    };
  }, [handleSessionExpired, scheduleExpiryTimer]);

  // Window Focus / Tab Visibility Change Detection (e.g. laptop wake from sleep)
  useEffect(() => {
    const checkTokenFreshness = () => {
      const currentToken = getAdminToken();
      if (currentToken && isTokenExpired(currentToken)) {
        notifySessionExpired("Your session has expired. Please log in again.");
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkTokenFreshness();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkTokenFreshness);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkTokenFreshness);
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await adminApi.auth.login(credentials);
      setToken(res.token);
      setUser(res.data);
      setAdminAuth(res.token, res.data);
      broadcastAdminLogin(res.data);
      scheduleExpiryTimer(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await adminApi.auth.logout();
    } catch {
      // ignore server logout errors
    } finally {
      if (expiryTimerRef.current) {
        window.clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
      clearAdminAuth();
      clearAdminCache();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      notifySessionExpired("You have signed out successfully.", true);
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
      <AdminAuthRouteBridge onRegisterNavigate={handleRegisterNavigate} />
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
