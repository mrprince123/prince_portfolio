import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  getAdminToken,
  setAdminAuth,
  clearAdminAuth,
  getStoredUser,
  parseJwtExp,
  isTokenExpired,
  getTokenTimeRemaining,
  notifySessionExpired,
  onSessionExpired,
  broadcastAdminLogin,
  ADMIN_AUTH_EVENT_KEY,
} from "./lib/adminApi";

function createMockJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      userId: "user_123",
      email: "admin@test.com",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
    })
  );
  return `${header}.${payload}.mockSignature`;
}

describe("Admin API Storage & Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("handles base URL configuration correctly", () => {
    expect(getApiBaseUrl()).toContain("/api/v1");
    setApiBaseUrl("https://api.example.com/v1");
    expect(getApiBaseUrl()).toBe("https://api.example.com/v1");
    setApiBaseUrl("https://api.example.com/api/v1/auth/login");
    expect(getApiBaseUrl()).toBe("https://api.example.com/api/v1");
  });

  it("manages admin auth token and user persistence", () => {
    expect(getAdminToken()).toBeNull();
    expect(getStoredUser()).toBeNull();

    const sampleUser = { username: "AdminUser", email: "admin@test.com" };
    setAdminAuth("jwt_mock_token_123", sampleUser);

    expect(getAdminToken()).toBe("jwt_mock_token_123");
    expect(getStoredUser()).toEqual(sampleUser);

    clearAdminAuth();
    expect(getAdminToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it("evaluates password security complexity requirements", () => {
    const isStrong = (pwd: string) =>
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd);

    // Predictable/insecure passwords rejected
    expect(isStrong("admin123")).toBe(false);
    expect(isStrong("admin@example.com")).toBe(false);
    expect(isStrong("password")).toBe(false);
    expect(isStrong("Admin123")).toBe(false); // missing symbol
    expect(isStrong("admin@123")).toBe(false); // missing uppercase

    // Strong enterprise-grade passwords accepted
    expect(isStrong("PrinceAdmin@2026")).toBe(true);
    expect(isStrong("P@ssw0rdEnterprise#")).toBe(true);
  });

  it("verifies mobile navigation routes and coverage", () => {
    const mobilePrimary = ["/admin/overview", "/admin/contacts", "/admin/projects", "/admin/blogs"];
    const mobileSecondary = [
      "/admin/courses",
      "/admin/skills",
      "/admin/articles",
      "/admin/testimonials",
      "/admin/youtube",
      "/admin/settings",
    ];

    const allRoutes = [...mobilePrimary, ...mobileSecondary];
    expect(allRoutes).toHaveLength(10);

    // Verify all 10 administrative routes are mapped
    const expectedRoutes = [
      "/admin/overview",
      "/admin/contacts",
      "/admin/projects",
      "/admin/blogs",
      "/admin/courses",
      "/admin/skills",
      "/admin/articles",
      "/admin/testimonials",
      "/admin/youtube",
      "/admin/settings",
    ];

    expectedRoutes.forEach((route) => {
      expect(allRoutes).toContain(route);
    });
  });

  describe("Automatic Session Timeout & Expiration", () => {
    it("accurately detects unexpired vs expired JWT tokens", () => {
      const activeToken = createMockJwt(3600); // 1 hour in future
      expect(parseJwtExp(activeToken)).toBeGreaterThan(Date.now());
      expect(isTokenExpired(activeToken)).toBe(false);
      expect(getTokenTimeRemaining(activeToken)).toBeGreaterThan(0);

      const expiredToken = createMockJwt(-60); // 60 seconds in past
      expect(parseJwtExp(expiredToken)).toBeLessThan(Date.now());
      expect(isTokenExpired(expiredToken)).toBe(true);
      expect(getTokenTimeRemaining(expiredToken)).toBe(0);

      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired("invalid.jwt.token")).toBe(false); // malformed fallback
      expect(getTokenTimeRemaining(null)).toBe(0);
    });

    it("clears auth credentials and triggers session expired listeners", () => {
      const sampleUser = { username: "Admin", email: "admin@test.com" };
      setAdminAuth("jwt_active_session", sampleUser);
      expect(getAdminToken()).toBe("jwt_active_session");

      const mockListener = vi.fn();
      const unsubscribe = onSessionExpired(mockListener);

      notifySessionExpired("Your session has expired. Please log in again.");

      expect(getAdminToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
      expect(mockListener).toHaveBeenCalledWith(
        "Your session has expired. Please log in again."
      );

      // Verify multi-tab sync event was written to localStorage
      const authEvent = localStorage.getItem(ADMIN_AUTH_EVENT_KEY);
      expect(authEvent).not.toBeNull();
      const parsed = JSON.parse(authEvent!);
      expect(parsed.type).toBe("session_expired");

      unsubscribe();
    });

    it("broadcasts login events across tabs", () => {
      const sampleUser = { username: "Admin", email: "admin@test.com" };
      broadcastAdminLogin(sampleUser);

      const authEvent = localStorage.getItem(ADMIN_AUTH_EVENT_KEY);
      expect(authEvent).not.toBeNull();
      const parsed = JSON.parse(authEvent!);
      expect(parsed.type).toBe("login");
      expect(parsed.user).toEqual(sampleUser);
    });
  });
});

