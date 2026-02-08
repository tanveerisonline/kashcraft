/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Implements token-based CSRF protection with SameSite cookies
 */

import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * CSRF Token Manager
 */
export class CSRFTokenManager {
  private readonly tokenLength = 32;
  private readonly cookieName = "__Host-csrf-token";
  private readonly headerName = "x-csrf-token";
  private readonly maxAge = 3600; // 1 hour

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString("hex");
  }

  /**
   * Create CSRF token in cookies
   */
  async createToken(): Promise<string> {
    const token = this.generateToken();
    const cookieStore = await cookies();

    cookieStore.set(this.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Prevent cross-site cookie sending
      maxAge: this.maxAge,
      path: "/",
    });

    return token;
  }

  /**
   * Verify CSRF token from request
   */
  async verifyToken(token: string): Promise<boolean> {
    const cookieStore = await cookies();
    const storedToken = cookieStore.get(this.cookieName)?.value;

    if (!storedToken) {
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
  }

  /**
   * Get token from request header
   */
  getTokenFromRequest(headers: Record<string, string>): string | null {
    return headers[this.headerName] || null;
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<string> {
    const cookieStore = await cookies();
    cookieStore.delete(this.cookieName);
    return await this.createToken();
  }

  /**
   * Clear token
   */
  async clearToken(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.cookieName);
  }
}

/**
 * CSRF middleware for Next.js
 */
export async function csrfMiddleware(
  request: Request,
  allowedMethods: string[] = ["POST", "PUT", "PATCH", "DELETE"]
) {
  const method = request.method.toUpperCase();

  // Only check CSRF for mutation methods
  if (!allowedMethods.includes(method)) {
    return null;
  }

  const manager = new CSRFTokenManager();
  const token = manager.getTokenFromRequest(Object.fromEntries(request.headers));

  if (!token) {
    return new Response("CSRF token missing", { status: 403 });
  }

  const isValid = await manager.verifyToken(token);
  if (!isValid) {
    return new Response("CSRF token invalid", { status: 403 });
  }

  return null;
}

/**
 * React hook for CSRF protection
 */
export const useCSRFToken = () => {
  const [token, setToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Get token from meta tag or fetch from server
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

    if (metaToken) {
      setToken(metaToken);
    } else {
      // Fetch token from server
      fetch("/api/security/csrf-token")
        .then((res) => res.json())
        .then((data) => setToken(data.token));
    }
  }, []);

  /**
   * Add token to headers
   */
  const getHeaders = (additionalHeaders: Record<string, string> = {}) => {
    return {
      ...additionalHeaders,
      "x-csrf-token": token || "",
    };
  };

  /**
   * Add token to form data
   */
  const getFormData = () => {
    const formData = new FormData();
    formData.append("_csrf", token || "");
    return formData;
  };

  return { token, getHeaders, getFormData };
};

/**
 * API route for CSRF token endpoint
 * GET /api/security/csrf-token
 */
export async function handleCSRFTokenEndpoint(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const manager = new CSRFTokenManager();
  const token = await manager.createToken();

  return new Response(JSON.stringify({ token }), {
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * SameSite cookie configuration
 * Browser automatically prevents cross-site cookie sending
 */
export const sameSiteCookieConfig = {
  // Strict: Cookie only sent on same-site requests
  strict: {
    sameSite: "strict" as const,
    secure: true,
  },

  // Lax: Cookie sent on top-level navigations from external sites
  // (but not on form submissions or image loads)
  lax: {
    sameSite: "lax" as const,
    secure: true,
  },

  // None: Cookie sent on all requests (requires Secure flag)
  none: {
    sameSite: "none" as const,
    secure: true,
  },
};

/**
 * Set cookie with CSRF-safe options
 */
export async function setCSRFSafeCookie(
  name: string,
  value: string,
  options: Partial<typeof sameSiteCookieConfig.strict> = {}
) {
  const cookieStore = await cookies();

  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...options,
  });
}

/**
 * Validate request origin for CSRF
 */
export function validateOrigin(request: Request, allowedOrigins: string[]): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return false;
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin) {
    return false;
  }

  return allowedOrigins.includes(requestOrigin);
}

import React from "react";
