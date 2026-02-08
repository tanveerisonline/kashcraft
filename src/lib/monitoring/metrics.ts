import * as Sentry from "@sentry/nextjs";

// Prompt 135 & 136: Monitoring and Performance Dashboard

/**
 * Sentry configuration and initialization
 */
export const initializeSentry = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === "development",
    });
  }
};

/**
 * Performance metrics collection
 */
export interface PerformanceMetrics {
  pathname: string;
  duration: number;
  timestamp: number;
  userAgent?: string;
  cacheHit?: boolean;
}

export interface ErrorMetrics {
  message: string;
  stack?: string;
  timestamp: number;
  pathname?: string;
  statusCode?: number;
}

export interface ApiMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp?: number;
  responseSize?: number;
  cacheStatus?: "hit" | "miss";
}

/**
 * Metrics collector
 */
export class MetricsCollector {
  private metrics: {
    performance: PerformanceMetrics[];
    errors: ErrorMetrics[];
    api: ApiMetrics[];
  } = {
    performance: [],
    errors: [],
    api: [],
  };

  private maxMetrics = 1000;

  /**
   * Record performance metric
   */
  recordPerformance(metric: PerformanceMetrics) {
    this.metrics.performance.push({
      ...metric,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.performance.length > this.maxMetrics) {
      this.metrics.performance = this.metrics.performance.slice(-this.maxMetrics);
    }

    // Send to analytics
    this.sendToAnalytics("performance", metric);
  }

  /**
   * Record error metric
   */
  recordError(error: ErrorMetrics) {
    this.metrics.errors.push({
      ...error,
      timestamp: Date.now(),
    });

    if (this.metrics.errors.length > this.maxMetrics) {
      this.metrics.errors = this.metrics.errors.slice(-this.maxMetrics);
    }

    // Send to Sentry
    this.sendToSentry(error);

    // Send to analytics
    this.sendToAnalytics("error", error);
  }

  /**
   * Record API metric
   */
  recordApi(metric: ApiMetrics) {
    this.metrics.api.push({
      ...metric,
      timestamp: Date.now(),
    });

    if (this.metrics.api.length > this.maxMetrics) {
      this.metrics.api = this.metrics.api.slice(-this.maxMetrics);
    }

    this.sendToAnalytics("api", metric);
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    return {
      performance: {
        count: this.metrics.performance.length,
        avgDuration: this.getAverageDuration(),
        slowestPage: this.getSlowestPage(),
      },
      errors: {
        count: this.metrics.errors.length,
        types: this.getErrorTypes(),
      },
      api: {
        count: this.metrics.api.length,
        avgDuration: this.getAverageApiDuration(),
        errorRate: this.getApiErrorRate(),
        cacheHitRate: this.getCacheHitRate(),
      },
    };
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  // Private helper methods
  private getAverageDuration(): number {
    if (this.metrics.performance.length === 0) return 0;
    const sum = this.metrics.performance.reduce((acc, m) => acc + m.duration, 0);
    return sum / this.metrics.performance.length;
  }

  private getSlowestPage(): { pathname: string; duration: number } | null {
    if (this.metrics.performance.length === 0) return null;
    return this.metrics.performance.reduce((slowest, m) =>
      m.duration > slowest.duration ? m : slowest
    ) as any;
  }

  private getErrorTypes(): Record<string, number> {
    const types: Record<string, number> = {};
    this.metrics.errors.forEach((e) => {
      types[e.message] = (types[e.message] || 0) + 1;
    });
    return types;
  }

  private getAverageApiDuration(): number {
    if (this.metrics.api.length === 0) return 0;
    const sum = this.metrics.api.reduce((acc, m) => acc + m.duration, 0);
    return sum / this.metrics.api.length;
  }

  private getApiErrorRate(): number {
    if (this.metrics.api.length === 0) return 0;
    const errors = this.metrics.api.filter((m) => m.statusCode >= 400).length;
    return errors / this.metrics.api.length;
  }

  private getCacheHitRate(): number {
    if (this.metrics.api.length === 0) return 0;
    const hits = this.metrics.api.filter((m) => m.cacheStatus === "hit").length;
    return hits / this.metrics.api.length;
  }

  private sendToAnalytics(type: string, data: any) {
    // Send to Google Analytics or custom analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", type, {
        event_category: "performance",
        ...data,
      });
    }
  }

  private sendToSentry(error: ErrorMetrics) {
    if (error.statusCode && error.statusCode >= 400) {
      Sentry.captureException(new Error(error.message), {
        tags: {
          page: error.pathname,
        },
      });
    }
  }
}

/**
 * Core Web Vitals metrics
 */
export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  [key: string]: any; // Add index signature to allow for arbitrary properties
}

/**
 * Web Vitals collector
 */
export class WebVitalsCollector {
  static collectWebVitals(metric: any) {
    const vitals: CoreWebVitals = {};

    if (metric.name === "LCP") {
      vitals.lcp = metric.value;
    } else if (metric.name === "FID") {
      vitals.fid = metric.value;
    } else if (metric.name === "CLS") {
      vitals.cls = metric.value;
    } else if (metric.name === "TTFB") {
      vitals.ttfb = metric.value;
    }

    // Send to analytics
    if (typeof window !== "undefined") {
      if ((window as any).gtag) {
        (window as any).gtag("event", "page_view", {
          event_category: "web_vitals",
          ...vitals,
        });
      }

      // Send to Sentry
      Sentry.captureMessage("Web Vitals", {
        level: "info",
        contexts: {
          webVitals: vitals,
        },
      });
    }
  }

  static getThresholds() {
    return {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 600, needsImprovement: 1200 },
    };
  }
}

/**
 * Global metrics instance
 */
export const globalMetrics = new MetricsCollector();

/**
 * Export metrics as JSON for dashboard
 */
export const exportMetricsJson = () => {
  return JSON.stringify(globalMetrics.getMetrics(), null, 2);
};

/**
 * API response timing middleware
 */
export const recordApiTiming = async (endpoint: string, method: string, fn: () => Promise<any>) => {
  const startTime = performance.now();

  try {
    const response = await fn();
    const duration = performance.now() - startTime;

    globalMetrics.recordApi({
      endpoint,
      method,
      statusCode: response.status || 200,
      duration,
      responseSize: new Blob([JSON.stringify(response)]).size,
      cacheStatus: response.headers?.get("x-cache") === "HIT" ? "hit" : "miss",
    });

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;

    globalMetrics.recordApi({
      endpoint,
      method,
      statusCode: 500,
      duration,
    });

    throw error;
  }
};

/**
 * Database query timing wrapper
 */
export const recordQueryTiming = async <T>(queryName: string, fn: () => Promise<T>): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    globalMetrics.recordApi({
      endpoint: `db:${queryName}`,
      method: "QUERY",
      statusCode: 200,
      duration,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    globalMetrics.recordApi({
      endpoint: `db:${queryName}`,
      method: "QUERY",
      statusCode: 500,
      duration,
    });

    throw error;
  }
};
