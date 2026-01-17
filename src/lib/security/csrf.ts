import { cookies } from "next/headers"
import crypto from "crypto"

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = "csrf-token"
const CSRF_HEADER_NAME = "x-csrf-token"

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("base64url")
}

/**
 * Get or create CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!token) {
    token = generateCsrfToken()
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return token
}

/**
 * Validate CSRF token from request headers
 */
export async function validateCsrfToken(headerToken: string | null): Promise<boolean> {
  if (!headerToken) {
    return false
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!cookieToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}

/**
 * Middleware to verify CSRF token for non-GET requests
 */
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const method = request.method.toUpperCase()

  // CSRF protection only needed for state-changing methods
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true
  }

  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  return await validateCsrfToken(headerToken)
}

/**
 * Get CSRF token name for client-side usage
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME
}

/**
 * Create CSRF error response
 */
export function createCsrfError() {
  return new Response(
    JSON.stringify({
      error: "Invalid CSRF token",
      message: "The request could not be verified. Please refresh and try again.",
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}
