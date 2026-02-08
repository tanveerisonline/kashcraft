import { NextRequest, NextResponse } from "next/server";
import { RouteHandler } from "./auth-middleware"; // Reusing RouteHandler type

// In-memory store for rate limiting. In a production environment, consider Redis or a similar distributed cache.
const requestCounts = new Map<string, { count: number; lastReset: number }>();

export function withRateLimit(limit: number, windowMs: number) {
  return (handler: RouteHandler) => {
    return async (request: NextRequest, ...args: any[]) => {
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

      const now = Date.now();
      let client = requestCounts.get(ip);

      if (!client || now - client.lastReset > windowMs) {
        // Reset count if window has passed or if it's a new client
        client = { count: 0, lastReset: now };
        requestCounts.set(ip, client);
      }

      if (client.count >= limit) {
        return NextResponse.json({ message: "Too Many Requests" }, { status: 429 });
      }

      client.count++;
      requestCounts.set(ip, client);

      return handler(request, ...args);
    };
  };
}
