/**
 * Rate limiting implementation for API protection
 * Can use Redis (Upstash) or in-memory for simple cases
 */

import { NextRequest } from "next/server"

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  
  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown"
  
  // Include path for per-endpoint limits
  const path = new URL(request.url).pathname
  
  return `${ip}:${path}`
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100, // 100 requests per minute
  }
): Promise<RateLimitResult> {
  const clientId = getClientId(request)
  const now = Date.now()
  const resetTime = now + config.interval

  const current = rateLimitStore.get(clientId)

  if (!current || current.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(clientId, { count: 1, resetTime })
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: resetTime,
    }
  }

  if (current.count >= config.uniqueTokenPerInterval) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: current.resetTime,
    }
  }

  // Increment counter
  current.count++
  rateLimitStore.set(clientId, current)

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - current.count,
    reset: current.resetTime,
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitError(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": reset.toString(),
      },
    }
  )
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers)
  headers.set("X-RateLimit-Limit", result.limit.toString())
  headers.set("X-RateLimit-Remaining", result.remaining.toString())
  headers.set("X-RateLimit-Reset", result.reset.toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Redis-based rate limiting (for production with Upstash)
 */
export async function checkRateLimitWithRedis(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000,
    uniqueTokenPerInterval: 100,
  }
): Promise<RateLimitResult> {
  // Check if Redis is configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    // Fallback to in-memory
    return checkRateLimit(request, config)
  }

  const clientId = getClientId(request)
  const key = `rate-limit:${clientId}`

  try {
    // Use Upstash Redis REST API
    const response = await fetch(`${redisUrl}/incr/${key}`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    })

    const data = await response.json()
    const count = data.result as number

    if (count === 1) {
      // Set expiration on first request
      await fetch(`${redisUrl}/expire/${key}/${Math.ceil(config.interval / 1000)}`, {
        headers: {
          Authorization: `Bearer ${redisToken}`,
        },
      })
    }

    const resetTime = Date.now() + config.interval

    if (count > config.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: config.uniqueTokenPerInterval,
        remaining: 0,
        reset: resetTime,
      }
    }

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - count,
      reset: resetTime,
    }
  } catch (error) {
    console.error("Redis rate limit error:", error)
    // Fallback to in-memory on error
    return checkRateLimit(request, config)
  }
}
