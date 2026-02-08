/**
 * Data Encryption
 * Encrypt PII (Personally Identifiable Information) in database
 */

import crypto from "crypto";

/**
 * Encryption service for sensitive data
 */
export class EncryptionService {
  private readonly algorithm = "aes-256-gcm";
  private readonly encoding = "hex";
  private readonly saltLength = 16;
  private readonly tagLength = 16;
  private readonly iterations = 100000;

  /**
   * Initialize encryption key from environment
   */
  private getEncryptionKey(): Buffer {
    const keyString = process.env.ENCRYPTION_KEY;

    if (!keyString) {
      throw new Error("ENCRYPTION_KEY environment variable not set");
    }

    // Derive key from password
    return crypto.scryptSync(keyString, "salt", 32);
  }

  /**
   * Encrypt data
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", this.encoding);
    encrypted += cipher.final(this.encoding);

    const authTag = cipher.getAuthTag();

    // Return: iv + authTag + ciphertext
    return `${iv.toString(this.encoding)}:${authTag.toString(this.encoding)}:${encrypted}`;
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], this.encoding);
    const authTag = Buffer.from(parts[1], this.encoding);
    const encrypted = parts[2];

    const key = this.getEncryptionKey();
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, this.encoding, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hashData(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string): boolean {
    return this.hashData(data) === hash;
  }
}

/**
 * Encrypt sensitive fields in Prisma
 */
export async function encryptSensitiveFields(user: any): Promise<any> {
  const encryptionService = new EncryptionService();

  return {
    ...user,
    // Encrypt PII
    email: encryptionService.encrypt(user.email),
    phone: user.phone ? encryptionService.encrypt(user.phone) : null,
    ssn: user.ssn ? encryptionService.encrypt(user.ssn) : null,
  };
}

/**
 * Decrypt sensitive fields
 */
export async function decryptSensitiveFields(user: any): Promise<any> {
  const encryptionService = new EncryptionService();

  return {
    ...user,
    email: encryptionService.decrypt(user.email),
    phone: user.phone ? encryptionService.decrypt(user.phone) : null,
    ssn: user.ssn ? encryptionService.decrypt(user.ssn) : null,
  };
}

/**
 * Encrypt database backups
 */
export async function encryptDatabaseBackup(backup: Buffer): Promise<Buffer> {
  const encryptionService = new EncryptionService();
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default", "salt", 32);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(backup);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt database backup
 */
export async function decryptDatabaseBackup(encryptedBackup: Buffer): Promise<Buffer> {
  const iv = encryptedBackup.slice(0, 16);
  const authTag = encryptedBackup.slice(16, 32);
  const encrypted = encryptedBackup.slice(32);

  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "default", "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}

/**
 * HTTPS/TLS configuration
 */
export const tlsConfig = {
  // Enforce HTTPS in production
  enforceHTTPS: process.env.NODE_ENV === "production",

  // Strict-Transport-Security header
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // TLS certificate
  cert: process.env.TLS_CERT,
  key: process.env.TLS_KEY,

  // Minimum TLS version
  minTLSVersion: "TLSv1.2",

  // Cipher suites (only strong ciphers)
  ciphers: [
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384",
    "DHE-RSA-AES256-GCM-SHA384",
  ],
};

/**
 * Middleware to enforce HTTPS in production
 */
export function enforceHTTPSMiddleware() {
  return (request: Request) => {
    if (process.env.NODE_ENV === "production") {
      const url = new URL(request.url);
      if (url.protocol !== "https:") {
        url.protocol = "https:";
        return Response.redirect(url, 301);
      }
    }
    return null;
  };
}

export const encryptionService = new EncryptionService();
