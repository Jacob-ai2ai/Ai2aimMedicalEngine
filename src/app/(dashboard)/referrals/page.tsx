"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Filter, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Referral {
  id: string
  referral_number: string
  patient_id?: string
  referral_type: string
  reason_for_referral: string
  status: string
  received_date: string
  referring_physician_name?: string
  referring_clinic_name?: string
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    fetchReferrals()
  }, [statusFilter, typeFilter])

  async function fetchReferrals() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (typeFilter !== "all") {
        params.append("type", typeFilter)
      }

      const response = await fetch(`/api/referrals?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || [])
      }
    } catch (error) {
      console.error("Error fetching referrals:", error)
      toast.error("Failed to load referrals")
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    received: "bg-blue-100 text-blue-800",
    reviewed: "bg-yellow-100 text-yellow-800",
    scheduled: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const typeLabels = {
    sleep_study: "Sleep Study",
    cpap_titration: "CPAP Titration",
    pft: "PFT",
    respiratory_consult: "Respiratory Consult",
    dme: "DME",
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neural-glow">Referrals</h1>
          <p className="text-muted-foreground">
            Manage referral forms and track processing status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sleep_study">Sleep Study</SelectItem>
              <SelectItem value="cpap_titration">CPAP Titration</SelectItem>
              <SelectItem value="pft">PFT</SelectItem>
              <SelectItem value="respiratory_consult">Respiratory Consult</SelectItem>
              <SelectItem value="dme">DME</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : referrals.length === 0 ? (
        <Card className="aeterna-glass">
          <CardContent className="py-8 text-center text-muted-foreground">
            No referrals found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => (
            <Card key={referral.id} className="aeterna-glass hover:bg-muted/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">
                        {referral.referral_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {typeLabels[referral.referral_type as keyof typeof typeLabels] ||
                          referral.referral_type}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      statusColors[
                        referral.status as keyof typeof statusColors
                      ] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {referral.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Received</p>
                    <p className="font-medium">
                      {new Date(referral.received_date).toLocaleDateString()}
                    </p>
                  </div>
                  {referral.referring_physician_name && (
                    <div>
                      <p className="text-muted-foreground">Referring Physician</p>
                      <p className="font-medium">
                        {referral.referring_physician_name}
                      </p>
                    </div>
                  )}
                  {referral.referring_clinic_name && (
                    <div>
                      <p className="text-muted-foreground">Clinic</p>
                      <p className="font-medium">{referral.referring_clinic_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Reason</p>
                    <p className="font-medium line-clamp-2">
                      {referral.reason_for_referral}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
