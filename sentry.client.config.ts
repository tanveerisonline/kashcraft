import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === "development",
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
  beforeSend(event) {
    // Skip errors from localhost
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return null;
    }
    return event;
  },
});
