# Security & Compliance Implementation Guide

## Overview

This guide covers the comprehensive security and compliance infrastructure implemented for the Kashcraft e-commerce platform. The system addresses:

- **Web Security:** CSP, CSRF, XSS, SQL injection prevention
- **Authentication:** Bcrypt hashing (12+ rounds), session tokens, token rotation
- **Authorization:** RBAC with 4 roles and 20 permissions
- **Data Protection:** AES-256-GCM encryption, HTTPS enforcement
- **Payment Security:** PCI DSS compliance, tokenization, fraud detection
- **Privacy:** GDPR compliance with data export and deletion
- **Audit:** Comprehensive security event logging
- **Input Validation:** Zod schemas with frontend and backend validation
- **File Security:** Upload validation, malware scanning, signed URLs

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  NETWORK & TRANSPORT SECURITY                  │   │
│  │  - HTTPS/TLS 1.2+ enforcement                  │   │
│  │  - HSTS headers (31536000s)                    │   │
│  │  - Security headers (CSP, X-Frame-Options)     │   │
│  └─────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  INPUT & DATA VALIDATION                       │   │
│  │  - Zod schema validation                       │   │
│  │  - XSS prevention & sanitization               │   │
│  │  - SQL injection prevention (Prisma)           │   │
│  │  - CSRF token validation                       │   │
│  └─────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AUTHENTICATION & SESSION MANAGEMENT           │   │
│  │  - Bcrypt password hashing (12 rounds)         │   │
│  │  - Session token management                    │   │
│  │  - Token rotation & refresh                    │   │
│  │  - Session timeouts (1h, 30min idle)           │   │
│  │  - 2FA support (TOTP, backup codes)            │   │
│  └─────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AUTHORIZATION & ACCESS CONTROL                │   │
│  │  - RBAC (4 roles: admin, moderator, etc.)      │   │
│  │  - 20+ permissions                             │   │
│  │  - Resource ownership validation               │   │
│  │  - Rate limiting by role                       │   │
│  └─────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  DATA PROTECTION                               │   │
│  │  - AES-256-GCM encryption for PII              │   │
│  │  - Encrypted database backups                  │   │
│  │  - Encryption key management                   │   │
│  │  - PCI DSS compliance (no card storage)        │   │
│  └─────────────────────────────────────────────────┘   │
│                      ↓                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AUDIT & MONITORING                            │   │
│  │  - Security event logging                      │   │
│  │  - Login attempt tracking                      │   │
│  │  - Admin action audit trails                   │   │
│  │  - Suspicious activity detection               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Content Security Policy (CSP)

**File:** `src/lib/security/csp.ts`

Restricts script loading to prevent XSS attacks.

### Configuration

```typescript
// Production CSP - Strict policy
const productionCSPConfig = {
  "script-src": [
    "'self'",
    "https://cdn.jsdelivr.net",
    "https://googletagmanager.com",
    "'nonce-{NONCE}'", // For inline scripts
  ],
  "style-src": ["'self'", "https://fonts.googleapis.com", "'nonce-{NONCE}'"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
  "connect-src": ["'self'", "https://api.example.com", "https://sentry.io"],
  "frame-ancestors": ["'none'"], // Prevent clickjacking
};
```

### Features

- ✅ Nonce-based inline script/style support
- ✅ Report-only mode for development
- ✅ CSP violation reporting endpoint
- ✅ Environment-specific configuration

### Usage

```typescript
// CSP violations are logged to /api/security/csp-violation
// Automatically sent to Sentry for monitoring
```

---

## 2. CSRF Protection

**File:** `src/lib/security/csrf.ts`

Token-based CSRF protection with SameSite cookies.

### Configuration

```typescript
// Generate CSRF token
const manager = new CSRFTokenManager();
const token = await manager.createToken();

// Verify token on mutations
const isValid = await manager.verifyToken(token);

// SameSite cookie configuration
// Strict: Only same-site requests
// Lax: Same-site + top-level navigation
```

### Features

- ✅ Cryptographically secure token generation
- ✅ Constant-time token comparison (prevents timing attacks)
- ✅ SameSite cookie configuration
- ✅ Token refresh capability
- ✅ React hook for token management

### Usage

```typescript
// React component
const { token, getHeaders, getFormData } = useCSRFToken();

// Add to API request
fetch("/api/orders", {
  method: "POST",
  headers: getHeaders(),
  body: JSON.stringify(orderData),
});

// Add to form
const formData = getFormData();
formData.append("orderData", JSON.stringify(orderData));
```

---

## 3. XSS Prevention

**File:** `src/lib/security/xss-prevention.ts`

Input sanitization and HTML escaping.

### Features

- ✅ HTML sanitization using DOMPurify
- ✅ URL sanitization (prevents javascript: URLs)
- ✅ XSS pattern detection
- ✅ HTML tag stripping
- ✅ React integration for safe rendering

### Usage

```typescript
// Sanitize user input
const safeHTML = sanitizeHTML(userHTML, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href', 'target'],
});

// Escape HTML entities
const escaped = escapeHTML(userText);

// Safe URL
const safeURL = sanitizeURL(userURL);

// React component for safe rendering
<SafeHTML content={userHTML} className="user-content" />

// Detect XSS patterns
if (detectXSSPattern(userInput)) {
  // Log and reject
}
```

---

## 4. Input Validation with Zod

**File:** `src/lib/security/validation.ts`

Schema-based validation for all inputs.

### Schemas

```typescript
// Password validation
passwordSchema; // 12+ chars, uppercase, lowercase, digit, special

// Email validation
emailSchema; // RFC 5322 compliant

// User registration
userRegistrationSchema; // Email, password, terms acceptance

// Product review
productReviewSchema; // Rating 1-5, title, content

// Order creation
orderSchema; // Items, addresses, coupon

// File upload
fileUploadSchema; // Max 10MB, safe types
```

### Usage

```typescript
// Validate with error handling
const result = await validateSchemaWithErrors(userRegistrationSchema, formData);

if (!result.success) {
  // Show errors to user
  console.error(result.errors);
}

// Parse and throw on error
const validated = await passwordSchema.parseAsync(password);
```

---

## 5. Authentication Security

**File:** `src/lib/security/auth-security.ts`

Bcrypt password hashing, session tokens, token rotation.

### Password Management

```typescript
// Hash password (12 rounds)
const hash = await passwordManager.hashPassword(password);

// Verify password
const isMatch = await passwordManager.verifyPassword(password, hash);

// Check if needs rehashing
if (passwordManager.needsRehash(hash)) {
  // Rehash with new rounds
}
```

### Session Management

```typescript
// Create session
const session = await sessionManager.createSession(userId, ipAddress, userAgent);

// Session includes:
// - token (for API requests)
// - refreshToken (for getting new tokens)
// - expiresAt (1 hour)
// - absoluteTimeout (7 days max)
// - idleTimeout (30 minutes)

// Verify token
const isValid = sessionManager.verifyToken(session, token);

// Refresh session (rotates tokens)
const newSession = await sessionManager.refreshSession(session, refreshToken);

// Get expiry info
const expiry = sessionManager.getExpiryInfo(session);
// { expiresIn, absoluteTimeout, idleTimeout, isExpired, ... }
```

### Features

- ✅ Bcrypt with 12+ rounds (NIST recommended)
- ✅ Session token rotation on refresh
- ✅ Multiple timeout mechanisms:
  - Token expiration (1 hour)
  - Idle timeout (30 minutes)
  - Absolute timeout (7 days max)
- ✅ Secure password reset with time-limited tokens
- ✅ 2FA support (TOTP, backup codes)

---

## 6. Authorization & RBAC

**File:** `src/lib/security/authorization.ts`

Role-based access control with 4 roles and 20 permissions.

### Roles

```typescript
enum UserRole {
  ADMIN = "admin", // Full access
  MODERATOR = "moderator", // Content review
  CUSTOMER = "customer", // Shopping + profile
  GUEST = "guest", // View only
}
```

### Permissions

```typescript
// Admin: All 20 permissions including
- manage:users
- manage:products
- manage:orders
- manage:categories
- view:analytics

// Customer: Shopping permissions
- view:products
- create:orders
- view:own_orders
- update:profile
- create:reviews

// Guest: Public access
- view:products_guest
```

### Usage

```typescript
// Check permission
if (hasPermission(userRole, Permission.MANAGE_USERS)) {
  // Show admin panel
}

// Require permission middleware
export const requireAdmin = requirePermission(Permission.MANAGE_ADMINS);

// Check resource ownership
if (
  isResourceOwner({
    resourceUserId: order.userId,
    requestUserId: session.user.id,
    isAdmin: session.user.role === "admin",
  })
) {
  // Allow access
}

// Log authorization attempt
await logAuthorizationAttempt({
  userId,
  action: "access_admin_panel",
  permission: Permission.MANAGE_USERS,
  allowed: false,
  timestamp: new Date(),
  ipAddress,
  userAgent,
});
```

---

## 7. Data Encryption

**File:** `src/lib/security/encryption.ts`

AES-256-GCM encryption for sensitive data.

### Usage

```typescript
const encryptionService = new EncryptionService();

// Encrypt PII
const encrypted = encryptionService.encrypt(userEmail);

// Decrypt
const decrypted = encryptionService.decrypt(encrypted);

// Hash (one-way, for verification)
const hash = encryptionService.hashData(password);
const isMatch = encryptionService.verifyHash(password, hash);

// Encrypt database backups
const backup = Buffer.from(databaseDump);
const encrypted = await encryptDatabaseBackup(backup);

// Decrypt backups
const decrypted = await decryptDatabaseBackup(encryptedBackup);
```

### Features

- ✅ AES-256-GCM encryption (authenticated)
- ✅ Unique IV per encryption
- ✅ Authentication tag validation
- ✅ Key derivation from environment
- ✅ HTTPS enforcement in production
- ✅ HSTS headers

---

## 8. File Upload Security

**File:** `src/lib/security/file-upload-security.ts`

File type validation, malware scanning, signed URLs.

### Usage

```typescript
// Validate file
const validation = await fileUploadValidator.validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
}

// Scan for malware
const scan = await virusScanner.scanFile(file);
if (!scan.clean) {
  console.error("Malware detected:", scan.reason);
}

// Upload securely
const filename = await secureFileStorage.uploadFile(file, userId);

// Generate signed download URL
const url = secureFileStorage.getDownloadURL(filename, secret);

// Verify signed URL
const valid = signedURLGenerator.verifySignedURL(filename, signature, expiresAt, secret);

// Delete file
await secureFileStorage.deleteFile(filename);
```

### Features

- ✅ MIME type validation
- ✅ File extension validation
- ✅ File signature verification (magic bytes)
- ✅ Size limits (10MB default)
- ✅ Malware scanning integration
- ✅ Signed URLs for secure downloads
- ✅ HMAC-based signature verification

---

## 9. GDPR Compliance

**File:** `src/lib/security/gdpr-compliance.ts`

Data export, deletion, cookie consent, privacy policy.

### Usage

```typescript
const gdpr = new GDPRService();

// Export user data
const exportFile = await gdpr.generateExportFile(userId);
// Returns JSON with all user data

// Request deletion
const request = await gdpr.requestDeletion(userId, reason);
// status: 'pending' → 'completed'

// Anonymize instead of delete
await gdpr.anonymizeUserData(userId);

// React hook for consent
const { consents, saveConsents, requestDataExport } = useGDPRCompliance();

// Show privacy options
{consents && (
  <>
    <label>
      <input
        type="checkbox"
        checked={consents.analytics}
        onChange={(e) => saveConsents({
          ...consents,
          analytics: e.target.checked,
        })}
      />
      Analytics cookies
    </label>
  </>
)}
```

### Features

- ✅ Compliant right to be forgotten
- ✅ Data export in JSON format
- ✅ 30-day data retention after deletion
- ✅ Cookie consent banner
- ✅ Privacy policy template
- ✅ Audit trail of consent
- ✅ Non-deletable data for compliance (orders for tax)

---

## 10. PCI DSS Compliance

**File:** `src/lib/security/pci-dss-compliance.ts`

Payment security without storing card data.

### Usage

```typescript
const processor = new PCI_DSSPaymentProcessor();

// Process payment with token (never card data)
const result = await processor.processPaymentWithToken(
  paymentGatewayToken, // From Stripe, PayPal, etc.
  amount,
  currency
);
// Returns: { transactionId, status }

// Save payment method (tokenization)
const token = await processor.savePaymentMethod(userId, gateToken);

// Charge saved method
const result = await processor.chargePaymentMethod(userId, savedToken, amount);

// Check for fraud
const detector = new FraudDetector();
const fraud = await detector.checkForFraud({
  userId,
  amount,
  currency,
  ipAddress,
  location,
  device,
  timestamp: new Date(),
});

if (fraud.isSuspicious) {
  // Require additional verification
  await detector.requireAdditionalVerification(userId, transactionId);
}

// Log payment event
await logPaymentEvent({
  type: "payment_success",
  userId,
  amount,
  transactionId,
  status: "completed",
  timestamp: new Date(),
});
```

### Features

- ✅ Zero card data storage
- ✅ Payment gateway tokenization
- ✅ Fraud detection
- ✅ 3D Secure support
- ✅ Transaction logging (never logs card data)
- ✅ Webhook signature validation
- ✅ Automated alerts for suspicious activity

---

## 11. Security Audit Logging

**File:** `src/lib/security/audit-logging.ts`

Comprehensive security event logging.

### Usage

```typescript
const audit = new AuditLogger();

// Log login attempt
await audit.logLoginAttempt(userId, ipAddress, userAgent, success);

// Log admin action
await audit.logAdminAction(
  userId,
  "update_product",
  "product",
  productId,
  { price: 99.99, stock: 50 },
  ipAddress,
  userAgent
);

// Log data access
await audit.logDataAccess(userId, "order", orderId, ipAddress, userAgent);

// Log suspicious activity
await audit.logSuspiciousActivity(ipAddress, "brute_force", { userId, attemptCount: 5 });

// Query logs
const logs = await audit.query({
  userId,
  eventType: AuditEventType.LOGIN_FAILURE,
  startDate: new Date("2024-01-01"),
  endDate: new Date(),
  severity: "high",
});

// Export logs
const csvBuffer = await audit.exportLogs("csv");

// Archive old logs
const archived = await audit.archiveLogs(90); // Older than 90 days
```

### Event Types

- Login success/failure
- Password changes
- Account creation/deletion
- Admin actions
- Permission denials
- Suspicious activity
- Brute force attempts
- Payment transactions
- File uploads/access

---

## Security Checklist for Deployment

### Before Going Live

- [ ] HTTPS/TLS 1.2+ enabled in production
- [ ] CSP headers configured and tested
- [ ] CSRF protection on all mutations
- [ ] All inputs validated with Zod
- [ ] XSS prevention implemented
- [ ] SQL injection protection verified (using Prisma)
- [ ] Passwords hashed with bcrypt (12 rounds)
- [ ] Session management configured
- [ ] RBAC roles and permissions set
- [ ] Resource ownership validation implemented
- [ ] Sensitive data encrypted (AES-256-GCM)
- [ ] PCI DSS compliance verified
- [ ] Payment gateway tokenization enabled
- [ ] File upload security configured
- [ ] GDPR compliance verified
- [ ] Audit logging enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Monitoring and alerting (Sentry)
- [ ] Dependency scanning enabled

### Regular Security Tasks

- [ ] Weekly audit log review
- [ ] Monthly security updates
- [ ] Quarterly penetration testing
- [ ] Annual compliance audit
- [ ] Regular dependency updates
- [ ] Password rotation for admin accounts
- [ ] Certificate renewal (SSL/TLS)
- [ ] Backup encryption verification
- [ ] Incident response drills

---

## Security Headers

Applied to all responses for additional protection:

```typescript
// Implemented in next.config.ts
headers: {
  'Content-Security-Policy': generateCSPHeader(config),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}
```

---

## Environment Variables Required

```bash
# Authentication
ENCRYPTION_KEY=your-256-bit-key
BCRYPT_ROUNDS=12

# Session
SESSION_SECRET=your-session-secret
SESSION_TIMEOUT=3600
SESSION_IDLE_TIMEOUT=1800

# CSRF
CSRF_SECRET=your-csrf-secret

# Payment (PCI DSS)
PAYMENT_GATEWAY_URL=https://api.stripe.com
PAYMENT_GATEWAY_KEY=sk_live_xxxxx

# Virus scanning
VIRUS_SCANNER_API_URL=https://virus-scanner.api
VIRUS_SCANNER_API_KEY=your-api-key

# File storage
FILE_STORAGE_BUCKET=your-s3-bucket
FILE_STORAGE_REGION=us-east-1

# CSP reporting
CSP_REPORT_URI=/api/security/csp-violation

# GDPR
GDPR_RETENTION_DAYS=1095 # 3 years

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## Incident Response Plan

### 1. Security Breach Detection

- Monitor audit logs for suspicious activity
- Sentry alerts for security events
- Rate limiting triggers

### 2. Immediate Actions

1. **Isolate**: Stop the breach source
2. **Assess**: Determine scope and impact
3. **Notify**: Alert security team and management
4. **Preserve**: Archive evidence (audit logs, backups)

### 3. Investigation

- Review audit logs
- Analyze system changes
- Identify compromised accounts
- Determine attack vector

### 4. Containment

- Reset compromised passwords
- Revoke sessions
- Rotate security keys
- Patch vulnerabilities

### 5. Recovery

- Restore from clean backups
- Apply security updates
- Restore user access
- Monitor for recurrence

### 6. Post-Incident

- Conduct root cause analysis
- Identify improvements
- Update documentation
- Compliance notification if required

---

## Vulnerability Disclosure Policy

**Report Security Issues:**

Security vulnerabilities should be reported confidentially to: `security@kashcraft.com`

**Please do NOT:**

- Post publicly on social media
- File public GitHub issues
- Notify customers before we confirm

**Process:**

1. Report vulnerability with details
2. We acknowledge receipt within 24 hours
3. Investigation and fix (target 30 days)
4. Verify fix and release update
5. Credit reporter (if desired)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [GDPR Compliance](https://gdpr.eu/)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security-management.html)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

---

## Contact & Support

For security questions:

- Email: security@kashcraft.com
- Security team: Available 24/7 for critical issues
- Doc updates: Check this guide regularly for latest practices
