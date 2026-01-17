import { UserRole } from "@/types/database"
import { createServerSupabase } from "@/lib/supabase/server"

export type Permission = 
  | "patients:read"
  | "patients:write"
  | "prescriptions:read"
  | "prescriptions:write"
  | "prescriptions:approve"
  | "prescriptions:fill"
  | "communications:read"
  | "communications:write"
  | "automations:read"
  | "automations:write"
  | "ai_agents:read"
  | "ai_agents:write"
  | "admin:all"

// Role-based permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: ["admin:all"],
  physician: [
    "patients:read",
    "patients:write",
    "prescriptions:read",
    "prescriptions:write",
    "prescriptions:approve",
    "communications:read",
    "communications:write",
    "ai_agents:read",
  ],
  pharmacist: [
    "patients:read",
    "prescriptions:read",
    "prescriptions:write",
    "prescriptions:fill",
    "communications:read",
    "communications:write",
    "ai_agents:read",
  ],
  nurse: [
    "patients:read",
    "patients:write",
    "prescriptions:read",
    "communications:read",
    "communications:write",
    "ai_agents:read",
  ],
  billing: [
    "patients:read",
    "prescriptions:read",
    "communications:read",
    "ai_agents:read",
  ],
  compliance: [
    "patients:read",
    "prescriptions:read",
    "communications:read",
    "automations:read",
    "ai_agents:read",
  ],
  administrative: [
    "patients:read",
    "prescriptions:read",
    "communications:read",
    "communications:write",
    "automations:read",
    "ai_agents:read",
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role] || []
  
  // Admin has all permissions
  if (permissions.includes("admin:all")) {
    return true
  }
  
  return permissions.includes(permission)
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return profile?.role || null
}

export async function checkPermission(permission: Permission): Promise<boolean> {
  const role = await getUserRole()
  if (!role) {
    return false
  }
  return hasPermission(role, permission)
}
