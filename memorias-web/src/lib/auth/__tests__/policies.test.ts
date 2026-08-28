import { describe, it, expect } from "vitest";
import {
  isAuthRoute,
  isApiAuthRoute,
  isAdminRoute,
  isReportsRoute,
  isPendingActivationRoute,
  getRouteRedirect,
} from "../policies";

describe("Route Authorization Policies", () => {
  describe("Route classification helpers", () => {
    it("identifies auth routes correctly", () => {
      expect(isAuthRoute("/auth/signin")).toBe(true);
      expect(isAuthRoute("/auth/error")).toBe(true);
      expect(isAuthRoute("/members")).toBe(false);
    });

    it("identifies api auth routes correctly", () => {
      expect(isApiAuthRoute("/api/auth/signin")).toBe(true);
      expect(isApiAuthRoute("/api/auth/callback/google")).toBe(true);
      expect(isApiAuthRoute("/api/cron/digest")).toBe(false);
    });

    it("identifies admin routes correctly", () => {
      expect(isAdminRoute("/admin")).toBe(true);
      expect(isAdminRoute("/admin/users")).toBe(true);
      expect(isAdminRoute("/reports")).toBe(false);
    });

    it("identifies reports routes correctly", () => {
      expect(isReportsRoute("/reports")).toBe(true);
      expect(isReportsRoute("/reports/statistics")).toBe(true);
      expect(isReportsRoute("/projects")).toBe(false);
    });

    it("identifies pending activation route correctly", () => {
      expect(isPendingActivationRoute("/pending-activation")).toBe(true);
      expect(isPendingActivationRoute("/")).toBe(false);
    });
  });

  describe("getRouteRedirect policy evaluator", () => {
    it("redirects inactive logged-in users to /pending-activation when visiting protected routes", () => {
      const inactiveUser = { isLoggedIn: true, isActive: false, role: "USER" };
      expect(getRouteRedirect("/", inactiveUser)).toBe("/pending-activation");
      expect(getRouteRedirect("/members", inactiveUser)).toBe("/pending-activation");
      expect(getRouteRedirect("/reports/statistics", inactiveUser)).toBe("/pending-activation");
    });

    it("allows inactive logged-in users on /pending-activation and /auth routes", () => {
      const inactiveUser = { isLoggedIn: true, isActive: false, role: "USER" };
      expect(getRouteRedirect("/pending-activation", inactiveUser)).toBeNull();
      expect(getRouteRedirect("/auth/signin", inactiveUser)).toBeNull();
      expect(getRouteRedirect("/api/auth/signout", inactiveUser)).toBeNull();
    });

    it("redirects active logged-in users away from /pending-activation and /auth pages to home", () => {
      const activeUser = { isLoggedIn: true, isActive: true, role: "USER" };
      expect(getRouteRedirect("/pending-activation", activeUser)).toBe("/");
      expect(getRouteRedirect("/auth/signin", activeUser)).toBe("/");
    });

    it("allows active logged-in users on standard public and reports routes", () => {
      const activeUser = { isLoggedIn: true, isActive: true, role: "USER" };
      expect(getRouteRedirect("/", activeUser)).toBeNull();
      expect(getRouteRedirect("/members", activeUser)).toBeNull();
      expect(getRouteRedirect("/reports/statistics", activeUser)).toBeNull();
    });

    it("protects /admin routes from non-admin users or unauthenticated users", () => {
      const unauthenticated = { isLoggedIn: false, isActive: false };
      const nonAdminUser = { isLoggedIn: true, isActive: true, role: "EDITOR" };
      const adminUser = { isLoggedIn: true, isActive: true, role: "ADMIN" };

      expect(getRouteRedirect("/admin/users", unauthenticated)).toBe("/");
      expect(getRouteRedirect("/admin/config", nonAdminUser)).toBe("/");
      expect(getRouteRedirect("/admin/users", adminUser)).toBeNull();
    });

    it("protects /reports routes from unauthenticated users", () => {
      const unauthenticated = { isLoggedIn: false, isActive: false };
      expect(getRouteRedirect("/reports/statistics", unauthenticated)).toBe("/auth/signin");
      expect(getRouteRedirect("/reports/builder", unauthenticated)).toBe("/auth/signin");
    });
  });
});
