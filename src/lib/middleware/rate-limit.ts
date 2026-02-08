// src/lib/middleware/rate-limit.ts

// Placeholder interface for RateLimitResult
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number // Timestamp when the limit resets
}

export class RateLimiter {
  private limits: Map<string, { count: number; lastReset: number }> = new Map()

  constructor(private defaultLimit: number = 100, private defaultWindow: number = 60 * 1000) {} // 100 requests per minute

  async checkLimit(identifier: string, limit?: number, window?: number): Promise<RateLimitResult> {
    const currentLimit = limit || this.defaultLimit
    const currentWindow = window || this.defaultWindow
    const now = Date.now()

    if (!this.limits.has(identifier)) {
      this.limits.set(identifier, { count: 0, lastReset: now })
    }

    const clientData = this.limits.get(identifier)!

    if (now - clientData.lastReset > currentWindow) {
      // Reset the count if the window has passed
      clientData.count = 0
      clientData.lastReset = now
    }

    if (clientData.count < currentLimit) {
      clientData.count++
      return {
        allowed: true,
        remaining: currentLimit - clientData.count,
        reset: clientData.lastReset + currentWindow,
      }
    } else {
      return {
        allowed: false,
        remaining: 0,
        reset: clientData.lastReset + currentWindow,
      }
    }
  }
}
