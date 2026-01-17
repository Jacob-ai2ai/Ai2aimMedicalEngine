import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { command, parameters } = body

    if (!command) {
      return NextResponse.json({ error: "Missing command" }, { status: 400 })
    }

    // Process robot command
    let result: Record<string, unknown> = { success: true }

    switch (command) {
      case "get_prescription":
        if (parameters?.prescriptionId) {
          const { data } = await supabase
            .from("prescriptions")
            .select("*")
            .eq("id", parameters.prescriptionId)
            .single()
          result.data = data
        }
        break

      case "get_patient":
        if (parameters?.patientId) {
          const { data } = await supabase
            .from("patients")
            .select("*")
            .eq("id", parameters.patientId)
            .single()
          result.data = data
        }
        break

      case "update_prescription_status":
        if (parameters?.prescriptionId && parameters?.status) {
          const { data } = await supabase
            .from("prescriptions")
            .update({ status: parameters.status })
            .eq("id", parameters.prescriptionId)
            .select()
            .single()
          result.data = data
        }
        break

      case "create_communication":
        if (parameters?.content) {
          const { data } = await supabase
            .from("communications")
            .insert({
              communication_type: parameters.type || "message",
              direction: "inbound",
              content: parameters.content,
              patient_id: parameters.patientId,
            })
            .select()
            .single()
          result.data = data
        }
        break

      default:
        return NextResponse.json({ error: `Unknown command: ${command}` }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing robot command:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
