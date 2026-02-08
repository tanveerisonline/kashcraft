/**
 * Content Security Policy (CSP) Configuration
 * Prevents XSS attacks by restricting script and resource loading
 */

export interface CSPConfig {
  directives: Record<string, string[]>;
  reportUri?: string;
  reportOnly?: boolean;
}

/**
 * Production CSP configuration
 * Strict policy that only allows scripts from trusted sources
 */
export const productionCSPConfig: CSPConfig = {
  directives: {
    // Default fallback for all directives
    "default-src": ["'self'"],

    // Script sources - only from self and trusted CDNs
    "script-src": [
      "'self'",
      "https://cdn.jsdelivr.net",
      "https://cdn.cloudflare.com",
      "https://googletagmanager.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://cdn.segment.com",
      "'nonce-{NONCE}'", // For inline scripts with nonce
    ],

    // Script source for module scripts
    "script-src-elem": [
      "'self'",
      "https://cdn.jsdelivr.net",
      "https://cdn.cloudflare.com",
      "https://googletagmanager.com",
      "https://www.googletagmanager.com",
    ],

    // Styles
    "style-src": [
      "'self'",
      "https://fonts.googleapis.com",
      "'nonce-{NONCE}'", // For inline styles with nonce
    ],

    "style-src-elem": ["'self'", "https://fonts.googleapis.com"],

    // Images
    "img-src": [
      "'self'",
      "data:",
      "https:",
      "https://images.example.com",
      "https://cdn.example.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],

    // Fonts
    "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],

    // Media (audio/video)
    "media-src": ["'self'"],

    // Objects (embed, object)
    "object-src": ["'none'"],

    // iframes
    "frame-src": [
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      "https://www.paypal.com",
    ],

    // Form submissions
    "form-action": ["'self'"],

    // Frame ancestors (prevents clickjacking)
    "frame-ancestors": ["'none'"],

    // Worker sources
    "worker-src": ["'self'"],

    // Connect sources (fetch, XHR, WebSocket)
    "connect-src": [
      "'self'",
      "https://api.example.com",
      "https://sentry.io",
      "https://*.sentry.io",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
      "https://cdn.segment.com",
    ],

    // Base URI (restricts <base> tags)
    "base-uri": ["'self'"],

    // Manifest
    "manifest-src": ["'self'"],

    // Upgrade insecure requests to HTTPS
    "upgrade-insecure-requests": [],
  },
  reportUri: process.env.CSP_REPORT_URI || "/api/security/csp-violation",
  reportOnly: false,
};

/**
 * Development CSP configuration (more permissive for development)
 */
export const developmentCSPConfig: CSPConfig = {
  directives: {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:", "https:"],
    "connect-src": ["'self'", "https:", "ws:", "wss:"],
    "frame-ancestors": ["'self'"],
  },
  reportUri: "/api/security/csp-violation",
  reportOnly: true,
};

/**
 * Generate CSP header value
 */
export function generateCSPHeader(config: CSPConfig): string {
  const directives = Object.entries(config.directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");

  if (config.reportUri) {
    return `${directives}; report-uri ${config.reportUri}`;
  }

  return directives;
}

/**
 * Generate nonce for inline scripts/styles
 */
export function generateNonce(): string {
  const nonce = Buffer.from(Math.random().toString()).toString("base64").slice(7, 20);
  return nonce;
}

/**
 * CSP Violation Report structure
 */
export interface CSPViolationReport {
  "document-uri": string;
  "violated-directive": string;
  "effective-directive": string;
  "original-policy": string;
  "blocked-uri": string;
  "status-code": number;
  disposition: "enforce" | "report";
  referrer: string;
  "source-file": string;
  "line-number": number;
  "column-number": number;
}

/**
 * Log CSP violations
 */
export async function logCSPViolation(report: CSPViolationReport) {
  try {
    // Send to Sentry
    console.error("CSP Violation:", {
      directive: report["violated-directive"],
      blockedUri: report["blocked-uri"],
      sourcefile: report["source-file"],
      lineNumber: report["line-number"],
    });

    // Send to security logging service
    await fetch("/api/security/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "csp-violation",
        data: report,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error("Failed to log CSP violation:", error);
  }
}

/**
 * Next.js configuration for CSP headers
 */
export const cspHeaderConfig = {
  async headers() {
    const config =
      process.env.NODE_ENV === "production" ? productionCSPConfig : developmentCSPConfig;

    const cspHeader = generateCSPHeader(config);
    const headerName = config.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: headerName,
            value: cspHeader,
          },
        ],
      },
    ];
  },
};
