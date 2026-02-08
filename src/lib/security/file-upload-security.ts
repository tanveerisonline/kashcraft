/**
 * File Upload Security
 * Validate file types, scan for malware, limit file sizes, use signed URLs
 */

import crypto from "crypto";

/**
 * File upload validation
 */
export class FileUploadValidator {
  // Allowed MIME types
  private readonly allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/csv",
  ];

  // Allowed extensions
  private readonly allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".csv"];

  // Maximum file size (10MB)
  private readonly maxFileSize = 10 * 1024 * 1024;

  /**
   * Validate file
   */
  async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file size
    if (file.size > this.maxFileSize) {
      return { valid: false, error: `File exceeds maximum size of 10MB` };
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: `File type not allowed: ${file.type}` };
    }

    // Check file extension
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!this.allowedExtensions.includes(extension)) {
      return { valid: false, error: `File extension not allowed: ${extension}` };
    }

    // Additional validation based on file type
    if (file.type.startsWith("image/")) {
      return await this.validateImageFile(file);
    }

    return { valid: true };
  }

  /**
   * Validate image file
   */
  private async validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check file signature (magic bytes)
      const buffer = await file.arrayBuffer();
      const headers = new Uint8Array(buffer.slice(0, 12));

      // JPEG: FF D8 FF
      if (file.type === "image/jpeg" && !(headers[0] === 0xff && headers[1] === 0xd8)) {
        return { valid: false, error: "Invalid JPEG file" };
      }

      // PNG: 89 50 4E 47
      if (
        file.type === "image/png" &&
        !(headers[0] === 0x89 && headers[1] === 0x50 && headers[2] === 0x4e)
      ) {
        return { valid: false, error: "Invalid PNG file" };
      }

      // WebP: RIFF ... WEBP
      if (
        file.type === "image/webp" &&
        !(headers[0] === 0x52 && headers[1] === 0x49 && headers[2] === 0x46)
      ) {
        return { valid: false, error: "Invalid WebP file" };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: "Failed to validate image file" };
    }
  }
}

/**
 * Virus scanning integration (placeholder)
 */
export class VirusScanner {
  /**
   * Scan file for malware
   * In production, integrate with ClamAV, Kaspersky, or similar
   */
  async scanFile(file: File): Promise<{ clean: boolean; reason?: string }> {
    if (process.env.VIRUS_SCANNER_API_KEY) {
      try {
        // Send to virus scanning service
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.VIRUS_SCANNER_API_URL}/scan`, {
          method: "POST",
          body: formData,
          headers: {
            "X-API-Key": process.env.VIRUS_SCANNER_API_KEY,
          },
        });

        const result = await response.json();
        return {
          clean: result.clean,
          reason: result.reason,
        };
      } catch (error) {
        console.error("Virus scan failed:", error);
        // Fail securely - reject upload if scan fails
        return { clean: false, reason: "Scan service unavailable" };
      }
    }

    // No scanner configured, assume safe
    return { clean: true };
  }
}

/**
 * Signed URL generation for secure downloads
 */
export class SignedURLGenerator {
  private readonly algorithm = "sha256";
  private readonly expirySeconds = 3600; // 1 hour

  /**
   * Generate signed URL
   */
  generateSignedURL(filePath: string, secret: string): string {
    const timestamp = Date.now();
    const expiresAt = timestamp + this.expirySeconds * 1000;

    // Create signature
    const message = `${filePath}${expiresAt}`;
    const signature = crypto.createHmac(this.algorithm, secret).update(message).digest("hex");

    // Build signed URL
    const params = new URLSearchParams({
      expires: expiresAt.toString(),
      signature,
    });

    return `${filePath}?${params.toString()}`;
  }

  /**
   * Verify signed URL
   */
  verifySignedURL(filePath: string, signature: string, expiresAt: number, secret: string): boolean {
    // Check expiration
    if (Date.now() > expiresAt) {
      return false;
    }

    // Verify signature
    const message = `${filePath}${expiresAt}`;
    const expectedSignature = crypto
      .createHmac(this.algorithm, secret)
      .update(message)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }
}

/**
 * File storage with security
 */
export class SecureFileStorage {
  private validator: FileUploadValidator;
  private scanner: VirusScanner;
  private signedURLGenerator: SignedURLGenerator;

  constructor() {
    this.validator = new FileUploadValidator();
    this.scanner = new VirusScanner();
    this.signedURLGenerator = new SignedURLGenerator();
  }

  /**
   * Upload file securely
   */
  async uploadFile(file: File, userId: string): Promise<string | null> {
    // Validate file
    const validation = await this.validator.validateFile(file);
    if (!validation.valid) {
      console.error("File validation failed:", validation.error);
      return null;
    }

    // Scan for malware
    const scan = await this.scanner.scanFile(file);
    if (!scan.clean) {
      console.error("Malware detected:", scan.reason);
      return null;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString("hex");
    const extension = file.name.split(".").pop();
    const filename = `${userId}/${timestamp}_${random}.${extension}`;

    // Upload to storage (S3, GCS, etc.)
    // This is a placeholder
    console.log(`Uploading file: ${filename}`);

    return filename;
  }

  /**
   * Generate download URL
   */
  getDownloadURL(filename: string, secret: string, duration: number = 3600): string {
    const signedURL = this.signedURLGenerator.generateSignedURL(filename, secret);
    return signedURL;
  }

  /**
   * Delete file
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      // Delete from storage
      console.log(`Deleting file: ${filename}`);
      return true;
    } catch (error) {
      console.error("Failed to delete file:", error);
      return false;
    }
  }
}

export const fileUploadValidator = new FileUploadValidator();
export const virusScanner = new VirusScanner();
export const signedURLGenerator = new SignedURLGenerator();
export const secureFileStorage = new SecureFileStorage();
