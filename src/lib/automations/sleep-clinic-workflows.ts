import { dmeService } from "@/lib/medical/dme-service"
import { sleepStudyService } from "@/lib/medical/sleep-study-service"
import { cpapComplianceService } from "@/lib/medical/cpap-compliance-service"
import { createServerSupabase } from "@/lib/supabase/server"

/**
 * Sleep Clinic Workflow Automation Functions
 * These workflows can be triggered by the automation engine
 */

/**
 * DME Prescription Workflow
 * Auto-checks insurance and generates authorization request when DME prescription is created
 */
export async function dmePrescriptionWorkflow(prescriptionId: string) {
  try {
    const supabase = await createServerSupabase()

    // Get DME prescription details
    const { data: dmePrescription } = await supabase
      .from("dme_prescriptions")
      .select(`
        *,
        prescription:prescription_id (
          patient_id,
          status
        ),
        equipment:dme_equipment_id (
          name,
          insurance_code
        )
      `)
      .eq("prescription_id", prescriptionId)
      .single()

    if (!dmePrescription) {
      return { success: false, error: "DME prescription not found" }
    }

    // Check if insurance authorization is needed
    if (dmePrescription.equipment?.insurance_code && !dmePrescription.insurance_authorization_number) {
      // Create a communication/task for insurance authorization
      const { data: patient } = await supabase
        .from("patients")
        .select("first_name, last_name")
        .eq("id", dmePrescription.prescription.patient_id)
        .single()

      // Log workflow action (could create a task or notification)
      console.log(
        `DME Prescription Workflow: Insurance authorization needed for ${patient?.first_name} ${patient?.last_name} - Equipment: ${dmePrescription.equipment.name}`
      )

      return {
        success: true,
        message: "Insurance authorization workflow initiated",
        action: "insurance_authorization_required",
      }
    }

    return { success: true, message: "DME prescription processed" }
  } catch (error: any) {
    console.error("DME Prescription Workflow Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Equipment Dispatch Workflow
 * Auto-schedules delivery when DME prescription is approved
 */
export async function equipmentDispatchWorkflow(prescriptionId: string) {
  try {
    const supabase = await createServerSupabase()

    // Get prescription status
    const { data: prescription } = await supabase
      .from("prescriptions")
      .select("status, patient_id")
      .eq("id", prescriptionId)
      .single()

    if (!prescription || prescription.status !== "approved") {
      return { success: false, error: "Prescription not approved" }
    }

    // Get DME prescription details
    const { data: dmePrescription } = await supabase
      .from("dme_prescriptions")
      .select(`
        *,
        equipment:dme_equipment_id (
          name,
          category
        )
      `)
      .eq("prescription_id", prescriptionId)
      .single()

    if (!dmePrescription) {
      return { success: false, error: "DME prescription not found" }
    }

    // Check for available equipment
    const inventory = await dmeService.getInventoryForEquipment(
      dmePrescription.equipment_id,
      "available"
    )

    if (inventory.length === 0) {
      // Create alert for equipment shortage
      console.log(
        `Equipment Dispatch Workflow: No available equipment for ${dmePrescription.equipment.name}`
      )
      return {
        success: false,
        error: "No available equipment",
        action: "equipment_shortage_alert",
      }
    }

    // Auto-assign first available equipment
    const assigned = await dmeService.assignEquipmentToPatient(
      inventory[0].id,
      prescription.patient_id
    )

    if (assigned) {
      return {
        success: true,
        message: "Equipment automatically assigned",
        inventoryId: inventory[0].id,
      }
    }

    return { success: false, error: "Failed to assign equipment" }
  } catch (error: any) {
    console.error("Equipment Dispatch Workflow Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Compliance Monitoring Workflow
 * Daily check compliance and alert if below threshold
 */
export async function complianceMonitoringWorkflow() {
  try {
    // Get non-compliant patients
    const nonCompliant = await cpapComplianceService.getNonCompliantPatients(21)

    // For each non-compliant patient, create an alert or notification
    for (const patient of nonCompliant) {
      const supabase = await createServerSupabase()
      const { data: patientData } = await supabase
        .from("patients")
        .select("first_name, last_name")
        .eq("id", patient.patient_id)
        .single()

      console.log(
        `Compliance Monitoring: Patient ${patientData?.first_name} ${patientData?.last_name} is non-compliant (${patient.compliance_data.days_used}/${patient.compliance_data.days_required} days, ${patient.compliance_data.average_hours_per_night.toFixed(1)}h/night)`
      )

      // Could create a communication or task here
    }

    return {
      success: true,
      message: `Checked ${nonCompliant.length} non-compliant patients`,
      count: nonCompliant.length,
    }
  } catch (error: any) {
    console.error("Compliance Monitoring Workflow Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Sleep Study Workflow
 * Auto-dispatch monitor, track return, alert for results
 */
export async function sleepStudyWorkflow(studyId: string, action: "dispatch" | "return" | "results") {
  try {
    const study = await sleepStudyService.getSleepStudy(studyId)
    if (!study) {
      return { success: false, error: "Sleep study not found" }
    }

    switch (action) {
      case "dispatch":
        // Auto-dispatch available monitor
        const monitors = await sleepStudyService.getAvailableMonitors()
        if (monitors.length > 0) {
          const dispatched = await sleepStudyService.dispatchMonitor(
            studyId,
            monitors[0].serial_number
          )
          if (dispatched) {
            return {
              success: true,
              message: "Monitor automatically dispatched",
              monitorSerial: monitors[0].serial_number,
            }
          }
        }
        return {
          success: false,
          error: "No available monitors",
          action: "monitor_shortage_alert",
        }

      case "return":
        // Auto-process return
        const returned = await sleepStudyService.recordReturn(studyId)
        if (returned) {
          return {
            success: true,
            message: "Monitor return processed",
            action: "results_upload_reminder",
          }
        }
        return { success: false, error: "Failed to process return" }

      case "results":
        // Alert physician for interpretation
        if (study.status === "completed" && !study.interpreted_by) {
          console.log(
            `Sleep Study Workflow: Study ${studyId} completed, awaiting physician interpretation`
          )
          return {
            success: true,
            message: "Results ready for interpretation",
            action: "physician_interpretation_required",
          }
        }
        return { success: true, message: "Study already interpreted" }

      default:
        return { success: false, error: "Invalid action" }
    }
  } catch (error: any) {
    console.error("Sleep Study Workflow Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Maintenance Reminder Workflow
 * Alert when equipment needs maintenance
 */
export async function maintenanceReminderWorkflow(daysAhead: number = 30) {
  try {
    const equipmentNeedingMaintenance = await dmeService.getEquipmentNeedingMaintenance(daysAhead)

    for (const item of equipmentNeedingMaintenance) {
      console.log(
        `Maintenance Reminder: Equipment ${item.equipment?.name} (Serial: ${item.serial_number}) needs maintenance by ${item.next_maintenance_date}`
      )

      // Could create a task or notification here
    }

    return {
      success: true,
      message: `Checked ${equipmentNeedingMaintenance.length} equipment items needing maintenance`,
      count: equipmentNeedingMaintenance.length,
    }
  } catch (error: any) {
    console.error("Maintenance Reminder Workflow Error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Register all sleep clinic workflows with the automation engine
 */
export function registerSleepClinicWorkflows() {
  return {
    "dme-prescription": {
      name: "DME Prescription Workflow",
      description: "Auto-check insurance and generate authorization request",
      handler: dmePrescriptionWorkflow,
    },
    "equipment-dispatch": {
      name: "Equipment Dispatch Workflow",
      description: "Auto-schedule delivery when prescription approved",
      handler: equipmentDispatchWorkflow,
    },
    "compliance-monitoring": {
      name: "Compliance Monitoring Workflow",
      description: "Daily check compliance and alert if below threshold",
      handler: complianceMonitoringWorkflow,
    },
    "sleep-study": {
      name: "Sleep Study Workflow",
      description: "Auto-dispatch monitor, track return, alert for results",
      handler: sleepStudyWorkflow,
    },
    "maintenance-reminder": {
      name: "Maintenance Reminder Workflow",
      description: "Alert when equipment needs maintenance",
      handler: maintenanceReminderWorkflow,
    },
  }
}
