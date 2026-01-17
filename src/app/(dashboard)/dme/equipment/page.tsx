"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DMEEquipmentSelector } from "@/components/sleep-clinic/dme-equipment-selector"
import { EquipmentStatusBadge } from "@/components/sleep-clinic/equipment-status-badge"
import { SerialNumberTracker } from "@/components/sleep-clinic/serial-number-tracker"
import { EquipmentAssignmentCard } from "@/components/sleep-clinic/equipment-assignment-card"
import { DMEEquipment, DMEInventoryItem, StockLevel } from "@/lib/medical/dme-service"
import { dmeService } from "@/lib/medical/dme-service"
import { Plus, Search, Package, Filter } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DMEEquipmentPage() {
  const [equipment, setEquipment] = useState<DMEEquipment[]>([])
  const [inventory, setInventory] = useState<DMEInventoryItem[]>([])
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [selectedCategory])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch equipment catalog
      const categoryParam = selectedCategory !== "all" ? selectedCategory : undefined
      const equipmentData = await dmeService.getAvailableEquipment(
        categoryParam as any,
        100
      )
      setEquipment(equipmentData)

      // Fetch stock levels
      const stockData = await dmeService.checkStockLevels(categoryParam)
      setStockLevels(stockData)

      // Fetch inventory for first equipment item (or all if category selected)
      if (equipmentData.length > 0) {
        const firstEquipmentId = equipmentData[0].id
        const inventoryData = await dmeService.getInventoryForEquipment(firstEquipmentId)
        setInventory(inventoryData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load equipment data")
    } finally {
      setLoading(false)
    }
  }

  const filteredEquipment = equipment.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.equipment_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "cpap", label: "CPAP" },
    { value: "bipap", label: "BiPAP" },
    { value: "mask", label: "Masks" },
    { value: "supply", label: "Supplies" },
    { value: "monitor", label: "Monitors" },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neural-glow">DME Equipment Management</h1>
          <p className="text-muted-foreground">
            Manage CPAP, BiPAP, masks, supplies, and sleep monitors
          </p>
        </div>
        <Button asChild>
          <Link href="/dme/equipment/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Link>
        </Button>
      </div>

      {/* Stock Levels Overview */}
      {stockLevels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stockLevels.map((level) => (
            <Card key={level.category} className="aeterna-glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {level.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{level.available}</p>
                  <p className="text-xs text-muted-foreground">
                    {level.assigned} assigned, {level.total} total
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="aeterna-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipment Catalog</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search equipment..."
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : filteredEquipment.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No equipment found</p>
              ) : (
                <div className="space-y-2">
                  {filteredEquipment.map((eq) => (
                    <div
                      key={eq.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {eq.equipment_code} {eq.model && `• ${eq.model}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {eq.rental_rate_monthly && (
                          <p className="text-sm">
                            ${eq.rental_rate_monthly}/mo
                          </p>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dme/equipment/${eq.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Serial Number Tracker */}
        <div>
          <SerialNumberTracker />
        </div>
      </div>

      {/* Inventory Items */}
      {inventory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <EquipmentAssignmentCard
                  key={item.id}
                  equipment={item}
                  onAssignmentChange={fetchData}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
