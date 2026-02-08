/**
 * Performance Budget Configuration
 * Enforces bundle size limits, Lighthouse targets, and Web Vitals thresholds
 */

interface PerformanceBudgetConfig {
  bundles: BundleConfig[];
  lighthouse: LighthouseTargets;
  webVitals: WebVitalsThresholds;
  apiResponse: ApiResponseBudget;
  database: DatabaseBudget;
  assets: AssetBudget;
}

interface BundleConfig {
  name: string;
  path: string;
  // sizes in bytes
  budgetSize: number;
  warnAtSize: number;
  failure?: string;
}

interface LighthouseTargets {
  performance: number; // 0-100
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

interface WebVitalsThresholds {
  lcp: number; // Largest Contentful Paint in ms (target: < 2500ms)
  fid: number; // First Input Delay in ms (target: < 100ms, deprecated)
  cls: number; // Cumulative Layout Shift (target: < 0.1)
  ttfb: number; // Time to First Byte in ms (target: < 600ms)
  inp?: number; // Interaction to Next Paint in ms (target: < 200ms)
}

interface ApiResponseBudget {
  p50: number; // 50th percentile in ms
  p75: number; // 75th percentile in ms
  p95: number; // 95th percentile in ms
  p99: number; // 99th percentile in ms
  maxPayloadSize: number; // in bytes
}

interface DatabaseBudget {
  queryTime: number; // max query duration in ms
  connectionPoolSize: number;
  maxConnections: number;
  replicationLag: number; // in ms
}

interface AssetBudget {
  totalBundleSize: number; // bytes
  cssSize: number; // bytes
  jsSize: number; // bytes
  imageSize: number; // bytes per image
  fontSize: number; // bytes
}

// Performance Budget Configuration
export const performanceBudget: PerformanceBudgetConfig = {
  bundles: [
    // Main application bundle
    {
      name: "main",
      path: ".next/static/chunks/main-*.js",
      budgetSize: 150 * 1024, // 150KB
      warnAtSize: 120 * 1024, // warn at 120KB
    },
    // React bundle
    {
      name: "react",
      path: ".next/static/chunks/react-*.js",
      budgetSize: 150 * 1024, // 150KB
      warnAtSize: 120 * 1024,
    },
    // UI components bundle
    {
      name: "ui-components",
      path: ".next/static/chunks/ui-*.js",
      budgetSize: 100 * 1024, // 100KB
      warnAtSize: 80 * 1024,
    },
    // Database layer bundle
    {
      name: "database",
      path: ".next/static/chunks/database-*.js",
      budgetSize: 80 * 1024, // 80KB
      warnAtSize: 60 * 1024,
    },
    // API utilities bundle
    {
      name: "api",
      path: ".next/static/chunks/api-*.js",
      budgetSize: 60 * 1024, // 60KB
      warnAtSize: 45 * 1024,
    },
    // Common utilities
    {
      name: "common",
      path: ".next/static/chunks/common-*.js",
      budgetSize: 100 * 1024, // 100KB
      warnAtSize: 80 * 1024,
    },
    // Total CSS
    {
      name: "css-total",
      path: ".next/static/**/*.css",
      budgetSize: 50 * 1024, // 50KB total CSS
      warnAtSize: 40 * 1024,
    },
    // Total JS (all chunks combined)
    {
      name: "js-total",
      path: ".next/static/chunks/**/*.js",
      budgetSize: 500 * 1024, // 500KB total JS
      warnAtSize: 400 * 1024,
    },
  ],

  lighthouse: {
    performance: 90,
    accessibility: 95,
    bestPractices: 95,
    seo: 95,
    pwa: 90,
  },

  webVitals: {
    lcp: 2500, // Largest Contentful Paint: < 2.5 seconds
    fid: 100, // First Input Delay: < 100ms (deprecated but included)
    cls: 0.1, // Cumulative Layout Shift: < 0.1
    ttfb: 600, // Time to First Byte: < 600ms
    inp: 200, // Interaction to Next Paint: < 200ms
  },

  apiResponse: {
    p50: 100, // 50th percentile: 100ms
    p75: 200, // 75th percentile: 200ms
    p95: 500, // 95th percentile: 500ms
    p99: 1000, // 99th percentile: 1 second
    maxPayloadSize: 1 * 1024 * 1024, // 1MB max payload
  },

  database: {
    queryTime: 100, // 100ms max query time
    connectionPoolSize: 10,
    maxConnections: 50,
    replicationLag: 500, // 500ms max replication lag
  },

  assets: {
    totalBundleSize: 500 * 1024, // 500KB total bundle
    cssSize: 50 * 1024, // 50KB CSS
    jsSize: 400 * 1024, // 400KB JS
    imageSize: 100 * 1024, // 100KB per image
    fontSize: 50 * 1024, // 50KB fonts
  },
};

/**
 * Performance Budget Validator
 */
export class PerformanceBudgetValidator {
  /**
   * Check if bundle size is within budget
   */
  static checkBundleSize(name: string, actualSize: number): BundleCheckResult {
    const config = performanceBudget.bundles.find((b) => b.name === name);

    if (!config) {
      return { status: "unknown", message: `Bundle ${name} not found in budget` };
    }

    if (actualSize > config.budgetSize) {
      return {
        status: "failure",
        message: `Bundle "${name}" exceeds budget: ${this.formatBytes(
          actualSize
        )} > ${this.formatBytes(config.budgetSize)}`,
        overBudgetBy: actualSize - config.budgetSize,
      };
    }

    if (actualSize > config.warnAtSize) {
      return {
        status: "warning",
        message: `Bundle "${name}" approaching budget: ${this.formatBytes(
          actualSize
        )} (${this.formatBytes(config.warnAtSize)} warning threshold)`,
        overWarnBy: actualSize - config.warnAtSize,
      };
    }

    return {
      status: "success",
      message: `Bundle "${name}" within budget: ${this.formatBytes(actualSize)}`,
      remaining: config.budgetSize - actualSize,
    };
  }

  /**
   * Check Lighthouse scores
   */
  static checkLighthouseScores(scores: Partial<LighthouseTargets>): LighthouseCheckResult {
    const targets = performanceBudget.lighthouse;
    const failures: string[] = [];
    const warnings: string[] = [];

    Object.entries(scores).forEach(([category, score]) => {
      const target = targets[category as keyof LighthouseTargets];
      if (target && score < target) {
        failures.push(`${category}: ${score} (target: ${target})`);
      } else if (target && score < target + 5) {
        warnings.push(`${category}: ${score} (target: ${target})`);
      }
    });

    return {
      status: failures.length > 0 ? "failure" : warnings.length > 0 ? "warning" : "success",
      failures,
      warnings,
    };
  }

  /**
   * Check Web Vitals thresholds
   */
  static checkWebVitals(vitals: Partial<WebVitalsThresholds>): WebVitalsCheckResult {
    const thresholds = performanceBudget.webVitals;
    const failures: string[] = [];
    const warnings: string[] = [];

    // LCP check
    if (vitals.lcp && vitals.lcp > thresholds.lcp) {
      failures.push(`LCP: ${vitals.lcp}ms (target: ${thresholds.lcp}ms)`);
    } else if (vitals.lcp && vitals.lcp > thresholds.lcp * 0.8) {
      warnings.push(`LCP: ${vitals.lcp}ms (target: ${thresholds.lcp}ms)`);
    }

    // CLS check
    if (vitals.cls && vitals.cls > thresholds.cls) {
      failures.push(`CLS: ${vitals.cls} (target: ${thresholds.cls})`);
    } else if (vitals.cls && vitals.cls > thresholds.cls * 0.8) {
      warnings.push(`CLS: ${vitals.cls} (target: ${thresholds.cls})`);
    }

    // TTFB check
    if (vitals.ttfb && vitals.ttfb > thresholds.ttfb) {
      failures.push(`TTFB: ${vitals.ttfb}ms (target: ${thresholds.ttfb}ms)`);
    } else if (vitals.ttfb && vitals.ttfb > thresholds.ttfb * 0.8) {
      warnings.push(`TTFB: ${vitals.ttfb}ms (target: ${thresholds.ttfb}ms)`);
    }

    // INP check (if available)
    if (vitals.inp && vitals.inp > thresholds.inp!) {
      failures.push(`INP: ${vitals.inp}ms (target: ${thresholds.inp}ms)`);
    } else if (vitals.inp && vitals.inp > thresholds.inp! * 0.8) {
      warnings.push(`INP: ${vitals.inp}ms (target: ${thresholds.inp}ms)`);
    }

    return {
      status: failures.length > 0 ? "failure" : warnings.length > 0 ? "warning" : "success",
      failures,
      warnings,
    };
  }

  /**
   * Check API response times
   */
  static checkApiResponseTime(responseTime: number): ApiResponseCheckResult {
    const budget = performanceBudget.apiResponse;

    if (responseTime > budget.p99) {
      return {
        status: "failure",
        message: `API response time ${responseTime}ms exceeds P99 budget (${budget.p99}ms)`,
        actualTime: responseTime,
        budgetTime: budget.p99,
      };
    }

    if (responseTime > budget.p95) {
      return {
        status: "warning",
        message: `API response time ${responseTime}ms exceeds P95 budget (${budget.p95}ms)`,
        actualTime: responseTime,
        budgetTime: budget.p95,
      };
    }

    return {
      status: "success",
      message: `API response time ${responseTime}ms within budget`,
      actualTime: responseTime,
      budgetTime: budget.p50,
    };
  }

  /**
   * Format bytes to human readable
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

/**
 * Performance Budget CI Integration
 */
export const performanceBudgetCI = {
  /**
   * Generate GitHub Actions format output
   */
  generateGitHubActionsOutput: (results: BudgetCheckResults) => {
    let output = "";

    results.bundles.forEach((result) => {
      if (result.status === "failure") {
        output += `::error::${result.message}\n`;
      } else if (result.status === "warning") {
        output += `::warning::${result.message}\n`;
      } else {
        output += `✓ ${result.message}\n`;
      }
    });

    if (results.lighthouse.status === "failure") {
      results.lighthouse.failures.forEach((failure) => {
        output += `::error::Lighthouse - ${failure}\n`;
      });
    }

    if (results.webVitals.status === "failure") {
      results.webVitals.failures.forEach((failure) => {
        output += `::error::Web Vitals - ${failure}\n`;
      });
    }

    return output;
  },

  /**
   * Generate JSON report
   */
  generateJsonReport: (results: BudgetCheckResults) => {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        status: results.overallStatus,
        bundles: results.bundles,
        lighthouse: {
          status: results.lighthouse.status,
          failures: results.lighthouse.failures,
          warnings: results.lighthouse.warnings,
        },
        webVitals: {
          status: results.webVitals.status,
          failures: results.webVitals.failures,
          warnings: results.webVitals.warnings,
        },
      },
      null,
      2
    );
  },
};

/**
 * Type Definitions
 */
interface BundleCheckResult {
  status: "success" | "warning" | "failure" | "unknown";
  message: string;
  overBudgetBy?: number;
  overWarnBy?: number;
  remaining?: number;
}

interface LighthouseCheckResult {
  status: "success" | "warning" | "failure";
  failures: string[];
  warnings: string[];
}

interface WebVitalsCheckResult {
  status: "success" | "warning" | "failure";
  failures: string[];
  warnings: string[];
}

interface ApiResponseCheckResult {
  status: "success" | "warning" | "failure";
  message: string;
  actualTime: number;
  budgetTime: number;
}

interface BudgetCheckResults {
  overallStatus: "success" | "warning" | "failure";
  bundles: BundleCheckResult[];
  lighthouse: LighthouseCheckResult;
  webVitals: WebVitalsCheckResult;
}
