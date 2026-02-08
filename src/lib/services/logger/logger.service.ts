import * as Sentry from "@sentry/nextjs";

export class LoggerService {
  info(message: string, meta?: object): void {
    console.log(`[INFO] ${message}`, meta);
  }

  error(message: string, error: Error, meta?: object): void {
    console.error(`[ERROR] ${message}`, error, meta);
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, { extra: { message, meta } });
    }
  }

  warn(message: string, meta?: object): void {
    console.warn(`[WARN] ${message}`, meta);
  }

  debug(message: string, meta?: object): void {
    console.debug(`[DEBUG] ${message}`, meta);
  }
}
