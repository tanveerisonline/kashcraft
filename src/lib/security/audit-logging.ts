/**
 * Security Audit Logging
 * Tracks security events, login attempts, admin actions, data access
 */

/**
 * Audit log event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  LOGOUT = "logout",
  PASSWORD_CHANGE = "password_change",
  PASSWORD_RESET = "password_reset",
  SESSION_TIMEOUT = "session_timeout",
  SESSION_INVALIDATED = "session_invalidated",

  // Account events
  ACCOUNT_CREATED = "account_created",
  ACCOUNT_UPDATED = "account_updated",
  ACCOUNT_DELETED = "account_deleted",
  EMAIL_VERIFIED = "email_verified",
  EMAIL_CHANGED = "email_changed",

  // Authorization events
  PERMISSION_DENIED = "permission_denied",
  ROLE_CHANGED = "role_changed",
  ACCESS_DENIED = "access_denied",

  // Data events
  DATA_EXPORTED = "data_exported",
  DATA_DELETED = "data_deleted",
  DATA_ACCESSED = "data_accessed",

  // Admin events
  ADMIN_LOGIN = "admin_login",
  ADMIN_ACTION = "admin_action",
  SYSTEM_CONFIG_CHANGED = "system_config_changed",
  USER_SUSPENSION = "user_suspension",
  USER_BAN = "user_ban",

  // Security events
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  BRUTE_FORCE_ATTEMPT = "brute_force_attempt",
  MALWARE_DETECTED = "malware_detected",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",

  // Payment events
  PAYMENT_PROCESSED = "payment_processed",
  PAYMENT_FAILED = "payment_failed",
  REFUND_PROCESSED = "refund_processed",
  PAYMENT_METHOD_ADDED = "payment_method_added",
  PAYMENT_METHOD_REMOVED = "payment_method_removed",

  // File events
  FILE_UPLOADED = "file_uploaded",
  FILE_DELETED = "file_deleted",
  FILE_ACCESSED = "file_accessed",
}

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  userRole?: string;
  ipAddress: string;
  userAgent: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  details: Record<string, any>;
  status: "success" | "failure";
  errorMessage?: string;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Audit Logger Service
 */
export class AuditLogger {
  /**
   * Log audit event
   */
  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<string> {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry,
    };

    // Store in database
    console.log(`[${auditEntry.severity.toUpperCase()}] ${entry.eventType}:`, {
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      action: entry.action,
      details: entry.details,
    });

    // Send to security monitoring system
    if (entry.severity === "high" || entry.severity === "critical") {
      await this.alertSecurityTeam(auditEntry);
    }

    return auditEntry.id;
  }

  /**
   * Log login attempt
   */
  async logLoginAttempt(
    userId: string | undefined,
    ipAddress: string,
    userAgent: string,
    success: boolean
  ): Promise<string> {
    return this.log({
      eventType: success ? AuditEventType.LOGIN_SUCCESS : AuditEventType.LOGIN_FAILURE,
      userId,
      ipAddress,
      userAgent,
      action: `User login ${success ? "successful" : "failed"}`,
      details: { success },
      status: success ? "success" : "failure",
      severity: success ? "low" : "medium",
    });
  }

  /**
   * Log admin action
   */
  async logAdminAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    return this.log({
      eventType: AuditEventType.ADMIN_ACTION,
      userId,
      ipAddress,
      userAgent,
      resourceType,
      resourceId,
      action,
      details: { changes },
      status: "success",
      severity: "high",
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    return this.log({
      eventType: AuditEventType.DATA_ACCESSED,
      userId,
      ipAddress,
      userAgent,
      resourceType,
      resourceId,
      action: `Accessed ${resourceType} ${resourceId}`,
      details: {},
      status: "success",
      severity: "low",
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    ipAddress: string,
    activity: string,
    details: Record<string, any>
  ): Promise<string> {
    return this.log({
      eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
      ipAddress,
      userAgent: "",
      action: activity,
      details,
      status: "failure",
      severity: "critical",
    });
  }

  /**
   * Log brute force attempt
   */
  async logBruteForceAttempt(
    identifier: string,
    ipAddress: string,
    attemptCount: number
  ): Promise<string> {
    return this.log({
      eventType: AuditEventType.BRUTE_FORCE_ATTEMPT,
      ipAddress,
      userAgent: "",
      action: `Brute force attempt on ${identifier}`,
      details: { identifier, attemptCount },
      status: "failure",
      severity: "critical",
    });
  }

  /**
   * Alert security team
   */
  private async alertSecurityTeam(entry: AuditLogEntry): Promise<void> {
    try {
      // Send email to security team
      console.error(`SECURITY ALERT: ${entry.eventType}`, {
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        timestamp: entry.timestamp,
        severity: entry.severity,
      });

      // Send to Sentry
      // Send to security dashboard
      // Send SMS/PagerDuty if critical
    } catch (error) {
      console.error("Failed to alert security team:", error);
    }
  }

  /**
   * Generate ID for audit entry
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Query audit logs
   */
  async query(
    filters: Partial<{
      userId: string;
      eventType: AuditEventType;
      ipAddress: string;
      startDate: Date;
      endDate: Date;
      severity: string;
    }>,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    // Query from database with filters
    console.log("Querying audit logs with filters:", filters);

    return [];
  }

  /**
   * Export audit logs
   */
  async exportLogs(
    format: "json" | "csv" = "json",
    filters?: Partial<{
      startDate: Date;
      endDate: Date;
    }>
  ): Promise<Buffer> {
    const logs = await this.query(filters || {}, 10000);

    if (format === "json") {
      return Buffer.from(JSON.stringify(logs, null, 2));
    } else {
      // Convert to CSV
      const csv = [
        ["Timestamp", "Event Type", "User ID", "IP Address", "Action", "Status"].join(","),
        ...logs.map((log) =>
          [
            log.timestamp.toISOString(),
            log.eventType,
            log.userId || "",
            log.ipAddress,
            log.action,
            log.status,
          ].join(",")
        ),
      ].join("\n");

      return Buffer.from(csv);
    }
  }

  /**
   * Archive old logs
   */
  async archiveLogs(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    console.log(`Archiving audit logs older than ${cutoffDate.toISOString()}`);

    // Archive to cold storage (S3, GCS, etc.)
    // Delete from hot database

    return 0;
  }

  /**
   * Analyze logs for patterns
   */
  async analyzeForThreats(): Promise<{
    bruteForceAttempts: number;
    suspiciousIPs: string[];
    failedLogins: number;
    unauthorizedAccess: number;
  }> {
    return {
      bruteForceAttempts: 0,
      suspiciousIPs: [],
      failedLogins: 0,
      unauthorizedAccess: 0,
    };
  }
}

/**
 * Helper middleware for logging requests
 */
export function createAuditLoggingMiddleware(auditLogger: AuditLogger) {
  return async (request: Request, context: any) => {
    const startTime = Date.now();
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    try {
      // Get user from session
      const session = context.session;

      // Log request
      await auditLogger.log({
        eventType: AuditEventType.DATA_ACCESSED,
        userId: session?.user?.id,
        ipAddress,
        userAgent,
        action: `${request.method} ${new URL(request.url).pathname}`,
        details: {},
        status: "success",
        severity: "low",
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }

    return null;
  };
}

export const auditLogger = new AuditLogger();
