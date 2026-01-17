import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { verifyCsrfToken, createCsrfError } from "@/lib/security/csrf"
import { checkRateLimitWithRedis, createRateLimitError } from "@/lib/security/rate-limit"

// Security headers for all responses
const securityHeaders = {
  // Prevent XSS attacks
  "X-XSS-Protection": "1; mode=block",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // HSTS (only in production)
  ...(process.env.NODE_ENV === "production" && {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  }),
}

// Content Security Policy
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.builder.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://cdn.builder.io",
  "media-src 'self' blob:",
  "frame-src 'self' https://cdn.builder.io",
  "worker-src 'self' blob:",
].join("; ")

// Protected route patterns
const protectedRoutes = [
  // "/patients",
  // "/prescriptions",
  // "/communications",
  // "/ai-agents",
]

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/auth",
  "/api/health",
  "/dashboard",
  "/hub",
  "/inventory",
  "/specialists",
  "/diagnostic-iq",
  "/purchasing",
  "/reports",
  "/automations",
]

// API routes that need CSRF protection
const apiRoutes = "/api/"

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn("Supabase not configured - skipping auth middleware")
    return NextResponse.next()
  }

  // Start building response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  response.headers.set("Content-Security-Policy", cspHeader)

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith(apiRoutes)) {
    const rateLimitResult = await checkRateLimitWithRedis(request, {
      interval: 60 * 1000, // 1 minute
      uniqueTokenPerInterval: 100, // 100 requests per minute
    })

    if (!rateLimitResult.success) {
      return createRateLimitError(rateLimitResult.reset)
    }

    // Add rate limit headers directly to response
    response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString())

    // CSRF protection for non-GET API requests
    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method)
    if (isMutation) {
      const csrfValid = await verifyCsrfToken(request)
      if (!csrfValid) {
        return createCsrfError()
      }
    }
  }

  // Supabase auth check
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(route))

  // Protect authenticated routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (path.startsWith("/login") || path.startsWith("/auth/login")) {
    if (user) {
      const redirect = request.nextUrl.searchParams.get("redirect")
      return NextResponse.redirect(new URL(redirect || "/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
