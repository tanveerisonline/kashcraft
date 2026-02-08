/**
 * Authentication Security
 * Bcrypt password hashing, session tokens, token rotation, session timeouts
 */

import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Password hashing with bcrypt
 */
export class PasswordManager {
  private readonly rounds = 12; // NIST recommends 12+ rounds

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.rounds);
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error("Password verification failed:", error);
      return false;
    }
  }

  /**
   * Check if password needs rehashing (rounds changed)
   */
  needsRehash(hash: string): boolean {
    // Extract rounds from bcrypt hash ($2b$12$...)
    const match = hash.match(/\$2[aby]\$(\d+)\$/);
    if (!match) return false;

    const rounds = parseInt(match[1], 10);
    return rounds < this.rounds;
  }
}

/**
 * Session token management
 */
export class SessionTokenManager {
  private readonly tokenLength = 32;
  private readonly algorithim = "sha256";

  /**
   * Generate session token
   */
  generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString("hex");
  }

  /**
   * Hash token for storage (never store plain tokens)
   */
  hashToken(token: string): string {
    return crypto.createHash(this.algorithim).update(token).digest("hex");
  }

  /**
   * Verify token against hash
   */
  verifyToken(token: string, hash: string): boolean {
    const tokenHash = this.hashToken(token);
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
  }
}

/**
 * Session configuration
 */
export interface SessionConfig {
  expiresIn: number; // Seconds
  absoluteTimeout: number; // Seconds - max session duration
  idleTimeout: number; // Seconds - inactivity timeout
  rotateTokens: boolean; // Rotate tokens on each refresh
  secureCookies: boolean; // HTTPS only
  sameSiteCookies: "strict" | "lax" | "none";
}

/**
 * Default session configuration
 */
export const defaultSessionConfig: SessionConfig = {
  expiresIn: 3600, // 1 hour
  absoluteTimeout: 86400 * 7, // 7 days
  idleTimeout: 1800, // 30 minutes
  rotateTokens: true,
  secureCookies: process.env.NODE_ENV === "production",
  sameSiteCookies: "lax",
};

/**
 * Session data structure
 */
export interface SessionData {
  id: string;
  userId: string;
  token: string;
  tokenHash: string;
  refreshToken: string;
  refreshTokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  absoluteTimeout: Date;
  ipAddress: string;
  userAgent: string;
  isRotated: boolean;
}

/**
 * Session manager
 */
export class SessionManager {
  private config: SessionConfig;
  private tokenManager: SessionTokenManager;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...defaultSessionConfig, ...config };
    this.tokenManager = new SessionTokenManager();
  }

  /**
   * Create session
   */
  async createSession(userId: string, ipAddress: string, userAgent: string): Promise<SessionData> {
    const token = this.tokenManager.generateToken();
    const refreshToken = this.tokenManager.generateToken();

    return {
      id: crypto.randomUUID(),
      userId,
      token,
      tokenHash: this.tokenManager.hashToken(token),
      refreshToken,
      refreshTokenHash: this.tokenManager.hashToken(refreshToken),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.expiresIn * 1000),
      lastActivity: new Date(),
      absoluteTimeout: new Date(Date.now() + this.config.absoluteTimeout * 1000),
      ipAddress,
      userAgent,
      isRotated: false,
    };
  }

  /**
   * Verify session token
   */
  verifyToken(session: SessionData, token: string): boolean {
    // Check token
    if (!this.tokenManager.verifyToken(token, session.tokenHash)) {
      return false;
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      return false;
    }

    // Check absolute timeout
    if (new Date() > session.absoluteTimeout) {
      return false;
    }

    // Check idle timeout
    const now = new Date();
    const idleThreshold = new Date(session.lastActivity.getTime() + this.config.idleTimeout * 1000);
    if (now > idleThreshold) {
      return false;
    }

    return true;
  }

  /**
   * Refresh session
   */
  async refreshSession(session: SessionData, refreshToken: string): Promise<SessionData | null> {
    // Verify refresh token
    if (!this.tokenManager.verifyToken(refreshToken, session.refreshTokenHash)) {
      return null;
    }

    // Update session
    const newToken = this.tokenManager.generateToken();
    const newRefreshToken = this.config.rotateTokens
      ? this.tokenManager.generateToken()
      : refreshToken;

    return {
      ...session,
      token: newToken,
      tokenHash: this.tokenManager.hashToken(newToken),
      refreshToken: newRefreshToken,
      refreshTokenHash: this.tokenManager.hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + this.config.expiresIn * 1000),
      lastActivity: new Date(),
      isRotated: this.config.rotateTokens,
    };
  }

  /**
   * Update last activity
   */
  updateLastActivity(session: SessionData): SessionData {
    return {
      ...session,
      lastActivity: new Date(),
    };
  }

  /**
   * Invalidate session
   */
  invalidateSession(session: SessionData): SessionData {
    return {
      ...session,
      expiresAt: new Date(0), // Expired
    };
  }

  /**
   * Check if session is valid
   */
  isValid(session: SessionData): boolean {
    const now = new Date();

    // Check expiration
    if (now > session.expiresAt) {
      return false;
    }

    // Check absolute timeout
    if (now > session.absoluteTimeout) {
      return false;
    }

    // Check idle timeout
    const idleThreshold = new Date(session.lastActivity.getTime() + this.config.idleTimeout * 1000);
    if (now > idleThreshold) {
      return false;
    }

    return true;
  }

  /**
   * Get session expiry info
   */
  getExpiryInfo(session: SessionData) {
    const now = new Date();
    const expiresIn = Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000);
    const absoluteTimeout = Math.floor((session.absoluteTimeout.getTime() - now.getTime()) / 1000);
    const idleTimeout = Math.floor(
      (new Date(session.lastActivity.getTime() + this.config.idleTimeout * 1000).getTime() -
        now.getTime()) /
        1000
    );

    return {
      expiresIn,
      absoluteTimeout,
      idleTimeout,
      isExpired: expiresIn <= 0,
      isAbsoluteTimeout: absoluteTimeout <= 0,
      isIdleTimeout: idleTimeout <= 0,
    };
  }
}

/**
 * Safe password reset implementation
 */
export class PasswordResetManager {
  private readonly tokenLength = 32;
  private readonly expiry = 3600; // 1 hour

  /**
   * Generate password reset token
   */
  generateResetToken(): { token: string; hash: string } {
    const token = crypto.randomBytes(this.tokenLength).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    return { token, hash };
  }

  /**
   * Verify token and check expiry
   */
  verifyResetToken(storedHash: string, token: string, createdAt: Date): boolean {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Constant-time comparison
    const hashMatch = crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(storedHash));

    if (!hashMatch) {
      return false;
    }

    // Check expiry
    const expiryTime = new Date(createdAt.getTime() + this.expiry * 1000);
    return new Date() < expiryTime;
  }

  /**
   * Get token expiry
   */
  getTokenExpiry(createdAt: Date): Date {
    return new Date(createdAt.getTime() + this.expiry * 1000);
  }
}

/**
 * 2FA (Two-Factor Authentication) Setup
 */
export class TwoFactorAuthManager {
  /**
   * Generate 2FA secret (for TOTP)
   */
  generateSecret(userId: string): string {
    // Use a library like 'speakeasy' for TOTP
    // This is a placeholder
    return crypto.randomBytes(16).toString("base64");
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () => crypto.randomBytes(4).toString("hex").toUpperCase());
  }

  /**
   * Verify TOTP token
   */
  verifyTOTPToken(secret: string, token: string): boolean {
    // Use speakeasy.totp.verify() in production
    // This is a placeholder
    return token.length === 6;
  }
}

export const passwordManager = new PasswordManager();
export const sessionManager = new SessionManager();
export const passwordResetManager = new PasswordResetManager();
export const twoFactorAuthManager = new TwoFactorAuthManager();
