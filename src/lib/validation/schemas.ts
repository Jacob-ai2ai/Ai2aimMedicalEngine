/**
 * Zod validation schemas for API input validation
 */

import { z } from "zod"

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const uuidSchema = z.string().uuid("Invalid UUID format")

export const emailSchema = z.string().email("Invalid email address")

export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  "Invalid phone number format"
)

export const dateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  "Invalid date format"
)

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  fullName: z.string().min(2, "Full name is required"),
  phone: phoneSchema.optional(),
  role: z.enum([
    "admin",
    "physician",
    "pharmacist",
    "nurse",
    "billing",
    "compliance",
    "administrative",
  ]).optional(),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
})

// ============================================================================
// PATIENT SCHEMAS
// ============================================================================

export const createPatientSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: dateSchema.optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code").optional(),
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: phoneSchema.optional(),
  medicalHistory: z.array(z.record(z.unknown())).optional(),
  allergies: z.array(z.string()).optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

// ============================================================================
// PRESCRIPTION SCHEMAS
// ============================================================================

export const createPrescriptionSchema = z.object({
  prescriptionNumber: z.string().min(1, "Prescription number is required"),
  patientId: uuidSchema,
  medicationId: uuidSchema,
  dosage: z.string().min(1, "Dosage is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  refills: z.number().int().min(0, "Refills must be non-negative").max(12, "Maximum 12 refills"),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  expiresAt: dateSchema.optional(),
})

export const updatePrescriptionSchema = z.object({
  dosage: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  refills: z.number().int().min(0).max(12).optional(),
  instructions: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "filled", "dispensed", "cancelled"]).optional(),
  notes: z.string().optional(),
  approvedBy: uuidSchema.optional(),
  filledBy: uuidSchema.optional(),
})

// ============================================================================
// MEDICATION SCHEMAS
// ============================================================================

export const createMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  genericName: z.string().optional(),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  ndcCode: z.string().regex(/^\d{4,5}-\d{3,4}-\d{1,2}$/, "Invalid NDC code format").optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
})

export const updateMedicationSchema = createMedicationSchema.partial()

// ============================================================================
// COMMUNICATION SCHEMAS
// ============================================================================

export const createCommunicationSchema = z.object({
  communicationType: z.enum(["letter", "referral", "message", "notification"]),
  direction: z.enum(["inbound", "outbound"]),
  subject: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  patientId: uuidSchema.optional(),
  fromUserId: uuidSchema.optional(),
  toUserId: uuidSchema.optional(),
  relatedPrescriptionId: uuidSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const updateCommunicationSchema = z.object({
  content: z.string().optional(),
  isRead: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================================
// AI AGENT SCHEMAS
// ============================================================================

export const createAgentSessionSchema = z.object({
  agentId: uuidSchema,
  context: z.record(z.unknown()).optional(),
})

export const sendMessageSchema = z.object({
  sessionId: uuidSchema,
  message: z.string().min(1, "Message cannot be empty"),
  context: z.record(z.unknown()).optional(),
})

// ============================================================================
// AUTOMATION SCHEMAS
// ============================================================================

export const createAutomationSchema = z.object({
  name: z.string().min(1, "Automation name is required"),
  description: z.string().optional(),
  triggerType: z.enum(["event", "schedule", "condition", "webhook"]),
  triggerConfig: z.record(z.unknown()),
  actionType: z.enum(["notification", "task", "api_call", "ai_agent", "workflow"]),
  actionConfig: z.record(z.unknown()),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).max(10).optional(),
})

export const updateAutomationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  actionConfig: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).max(10).optional(),
})

// ============================================================================
// RAG DOCUMENT SCHEMAS
// ============================================================================

export const createRagDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  documentType: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const updateRagDocumentSchema = createRagDocumentSchema.partial()

export const searchRagSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().int().positive().max(100).optional(),
  similarityThreshold: z.number().min(0).max(1).optional(),
  documentType: z.string().optional(),
})

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export const filterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  ...paginationSchema.shape,
})

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate request body against a schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const params: Record<string, any> = Object.fromEntries(searchParams.entries())
    
    // Convert numeric strings to numbers
    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (!isNaN(Number(value)) && value !== "") {
        params[key] = Number(value)
      }
    })
    
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(error: z.ZodError) {
  return new Response(
    JSON.stringify({
      error: "Validation failed",
      message: "The request data is invalid",
      details: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Sanitize object inputs recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T]
    } else if (typeof value === "object" && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value)
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}
