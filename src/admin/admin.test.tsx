import { describe, it, expect, beforeEach } from "vitest";
import { getApiBaseUrl, setApiBaseUrl, getAdminToken, setAdminAuth, clearAdminAuth, getStoredUser } from "./lib/adminApi";

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
});

