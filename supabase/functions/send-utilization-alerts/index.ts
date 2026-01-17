// Edge Function: Send Staff Utilization Alerts
// Runs hourly during business hours to alert on low utilization

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date().toISOString().split('T')[0]
    
    // Get underutilized staff (below 75% utilization)
    const { data: underutilized, error } = await supabase.rpc('get_underutilized_staff', {
      p_date: today,
      p_threshold: 75.0
    })

    if (error) throw error

    if (!underutilized || underutilized.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All staff properly utilized' 
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    // Send alerts for each underutilized staff member
    const alerts = []
    for (const staff of underutilized) {
      const alert = {
        type: 'low_utilization',
        severity: staff.utilization_percentage < 50 ? 'high' : 'medium',
        staff_id: staff.staff_id,
        staff_name: staff.staff_name,
        message: `${staff.staff_name} has only ${staff.utilization_percentage.toFixed(0)}% utilization with ${Math.floor(staff.available_minutes / 30)} open slots`,
        revenue_potential: staff.revenue_potential,
        action_required: 'Fill open slots or adjust schedule'
      }
      
      alerts.push(alert)
      
      // Insert notification into database
      await supabase.from('notifications').insert({
        user_id: staff.staff_id,
        type: 'utilization_alert',
        title: 'Low Utilization Alert',
        message: alert.message,
        data: { revenue_potential: staff.revenue_potential },
        priority: alert.severity
      })
    }

    // Send summary to admin
    const { data: admins } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (admins) {
      for (const admin of admins) {
        await supabase.from('notifications').insert({
          user_id: admin.id,
          type: 'admin_alert',
          title: `${underutilized.length} Staff Members Underutilized`,
          message: `Total potential revenue: $${underutilized.reduce((sum, s) => sum + s.revenue_potential, 0).toFixed(2)}`,
          data: { staff_count: underutilized.length, alerts },
          priority: 'high'
        })
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      alerts_sent: alerts.length,
      underutilized_staff: underutilized.length
    }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error('Error sending utilization alerts:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
