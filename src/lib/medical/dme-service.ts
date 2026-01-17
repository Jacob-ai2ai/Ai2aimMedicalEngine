import { createServerSupabase } from "@/lib/supabase/server"

export interface DMEEquipment {
  id: string
  equipment_code: string
  name: string
  category: "cpap" | "bipap" | "mask" | "supply" | "monitor"
  manufacturer?: string
  model?: string
  description?: string
  unit_cost?: number
  rental_rate_monthly?: number
  requires_prescription: boolean
  insurance_code?: string
}

export interface DMEInventoryItem {
  id: string
  equipment_id: string
  serial_number?: string
  status: "available" | "assigned" | "maintenance" | "retired"
  assigned_to_patient_id?: string
  assigned_at?: string
  last_maintenance_date?: string
  next_maintenance_date?: string
  purchase_date?: string
  warranty_expires?: string
  location?: string
  notes?: string
  equipment?: DMEEquipment
}

export interface StockLevel {
  category: string
  total: number
  available: number
  assigned: number
  maintenance: number
  retired: number
}

export class DMEService {
  /**
   * Get available equipment by category
   */
  async getAvailableEquipment(
    category?: string,
    limit: number = 100
  ): Promise<DMEEquipment[]> {
    const supabase = await createServerSupabase()
    let query = supabase
      .from("dme_equipment")
      .select("*")
      .limit(limit)

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query.order("name", { ascending: true })

    if (error) {
      console.error("Error fetching DME equipment:", error)
      return []
    }

    return data || []
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(equipmentId: string): Promise<DMEEquipment | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_equipment")
      .select("*")
      .eq("id", equipmentId)
      .single()

    if (error) {
      console.error("Error fetching equipment:", error)
      return null
    }

    return data
  }

  /**
   * Get inventory items for equipment
   */
  async getInventoryForEquipment(
    equipmentId: string,
    status?: string
  ): Promise<DMEInventoryItem[]> {
    const supabase = await createServerSupabase()
    let query = supabase
      .from("dme_inventory")
      .select(`
        *,
        equipment:dme_equipment_id (*)
      `)
      .eq("equipment_id", equipmentId)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("serial_number", { ascending: true })

    if (error) {
      console.error("Error fetching inventory:", error)
      return []
    }

    return data || []
  }

  /**
   * Get equipment by serial number
   */
  async getEquipmentBySerial(
    serialNumber: string
  ): Promise<DMEInventoryItem | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_inventory")
      .select(`
        *,
        equipment:dme_equipment_id (*)
      `)
      .eq("serial_number", serialNumber)
      .single()

    if (error) {
      console.error("Error fetching equipment by serial:", error)
      return null
    }

    return data
  }

  /**
   * Check stock levels by category
   */
  async checkStockLevels(category?: string): Promise<StockLevel[]> {
    const supabase = await createServerSupabase()
    let query = supabase
      .from("dme_inventory")
      .select("equipment_id, status, equipment:dme_equipment_id!inner(category)")

    if (category) {
      query = query.eq("equipment.category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error checking stock levels:", error)
      return []
    }

    if (!data) {
      return []
    }

    // Aggregate by category
    const categoryMap = new Map<string, StockLevel>()

    for (const item of data) {
      const cat = (item.equipment as any)?.category || "unknown"
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          category: cat,
          total: 0,
          available: 0,
          assigned: 0,
          maintenance: 0,
          retired: 0,
        })
      }

      const level = categoryMap.get(cat)!
      level.total++

      switch (item.status) {
        case "available":
          level.available++
          break
        case "assigned":
          level.assigned++
          break
        case "maintenance":
          level.maintenance++
          break
        case "retired":
          level.retired++
          break
      }
    }

    return Array.from(categoryMap.values())
  }

  /**
   * Assign equipment to patient
   */
  async assignEquipmentToPatient(
    inventoryId: string,
    patientId: string
  ): Promise<boolean> {
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from("dme_inventory")
      .update({
        status: "assigned",
        assigned_to_patient_id: patientId,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", inventoryId)

    if (error) {
      console.error("Error assigning equipment:", error)
      return false
    }

    return true
  }

  /**
   * Return equipment from patient
   */
  async returnEquipment(inventoryId: string): Promise<boolean> {
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from("dme_inventory")
      .update({
        status: "available",
        assigned_to_patient_id: null,
        assigned_at: null,
      })
      .eq("id", inventoryId)

    if (error) {
      console.error("Error returning equipment:", error)
      return false
    }

    return true
  }

  /**
   * Get equipment assigned to patient
   */
  async getPatientEquipment(patientId: string): Promise<DMEInventoryItem[]> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_inventory")
      .select(`
        *,
        equipment:dme_equipment_id (*)
      `)
      .eq("assigned_to_patient_id", patientId)
      .in("status", ["assigned"])

    if (error) {
      console.error("Error fetching patient equipment:", error)
      return []
    }

    return data || []
  }

  /**
   * Create new equipment in catalog
   */
  async createEquipment(equipment: Partial<DMEEquipment>): Promise<DMEEquipment | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_equipment")
      .insert({
        equipment_code: equipment.equipment_code!,
        name: equipment.name!,
        category: equipment.category!,
        manufacturer: equipment.manufacturer || null,
        model: equipment.model || null,
        description: equipment.description || null,
        unit_cost: equipment.unit_cost || null,
        rental_rate_monthly: equipment.rental_rate_monthly || null,
        requires_prescription: equipment.requires_prescription ?? true,
        insurance_code: equipment.insurance_code || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating equipment:", error)
      return null
    }

    return data
  }

  /**
   * Add inventory item (equipment instance)
   */
  async addInventoryItem(
    equipmentId: string,
    serialNumber?: string,
    purchaseDate?: string,
    warrantyExpires?: string,
    location?: string
  ): Promise<DMEInventoryItem | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_inventory")
      .insert({
        equipment_id: equipmentId,
        serial_number: serialNumber || null,
        status: "available",
        purchase_date: purchaseDate || null,
        warranty_expires: warrantyExpires || null,
        location: location || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding inventory item:", error)
      return null
    }

    return data
  }

  /**
   * Update equipment maintenance dates
   */
  async updateMaintenance(
    inventoryId: string,
    lastMaintenanceDate: string,
    nextMaintenanceDate: string
  ): Promise<boolean> {
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from("dme_inventory")
      .update({
        last_maintenance_date: lastMaintenanceDate,
        next_maintenance_date: nextMaintenanceDate,
      })
      .eq("id", inventoryId)

    if (error) {
      console.error("Error updating maintenance:", error)
      return false
    }

    return true
  }

  /**
   * Get equipment needing maintenance
   */
  async getEquipmentNeedingMaintenance(
    daysAhead: number = 30
  ): Promise<DMEInventoryItem[]> {
    const supabase = await createServerSupabase()
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysAhead)

    const { data, error } = await supabase
      .from("dme_inventory")
      .select(`
        *,
        equipment:dme_equipment_id (*)
      `)
      .not("next_maintenance_date", "is", null)
      .lte("next_maintenance_date", targetDate.toISOString().split("T")[0])
      .neq("status", "retired")

    if (error) {
      console.error("Error fetching equipment needing maintenance:", error)
      return []
    }

    return data || []
  }
}

export const dmeService = new DMEService()
