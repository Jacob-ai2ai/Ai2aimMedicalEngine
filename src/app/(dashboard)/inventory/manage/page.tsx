/**
 * Inventory Management - Complete View
 * Manage all DME equipment, supplies, and stock levels
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const DUMMY_INVENTORY = [
  {
    id: 'INV-001',
    category: 'CPAP Machines',
    item: 'ResMed AirSense 11',
    sku: 'RES-AS11-001',
    quantityOnHand: 12,
    quantityAllocated: 5,
    quantityAvailable: 7,
    reorderPoint: 5,
    reorderQuantity: 10,
    unitCost: 850.00,
    sellingPrice: 1500.00,
    supplier: 'ResMed Canada',
    location: 'Edmonton',
    status: 'in_stock'
  },
  {
    id: 'INV-002',
    category: 'CPAP Masks',
    item: 'AirFit F20 Full Face Mask',
    sku: 'RES-F20-MED',
    quantityOnHand: 45,
    quantityAllocated: 12,
    quantityAvailable: 33,
    reorderPoint: 20,
    reorderQuantity: 50,
    unitCost: 85.00,
    sellingPrice: 150.00,
    supplier: 'ResMed Canada',
    location: 'Edmonton',
    status: 'in_stock'
  },
  {
    id: 'INV-003',
    category: 'Sleep Study Devices',
    item: 'ApneaLink Air',
    sku: 'RM-AL-AIR',
    quantityOnHand: 8,
    quantityAllocated: 6,
    quantityAvailable: 2,
    reorderPoint: 3,
    reorderQuantity: 5,
    unitCost: 450.00,
    sellingPrice: 0, // Rental only
    supplier: 'ResMed Canada',
    location: 'Calgary',
    status: 'low_stock'
  },
  {
    id: 'INV-004',
    category: 'Consumables',
    item: 'Disposable Filters (Pack of 12)',
    sku: 'FILT-DISP-12',
    quantityOnHand: 2,
    quantityAllocated: 0,
    quantityAvailable: 2,
    reorderPoint: 10,
    reorderQuantity: 100,
    unitCost: 2.50,
    sellingPrice: 5.00,
    supplier: 'Medical Supplies Inc',
    location: 'Edmonton',
    status: 'critical'
  },
  {
    id: 'INV-005',
    category: 'PFT Equipment',
    item: 'Spirometer Mouthpieces (Box of 100)',
    sku: 'SPIRO-MOUTH-100',
    quantityOnHand: 15,
    quantityAllocated: 2,
    quantityAvailable: 13,
    reorderPoint: 5,
    reorderQuantity: 20,
    unitCost: 35.00,
    sellingPrice: 0, // Included in PFT service
    supplier: 'Vitalograph',
    location: 'Both',
    status: 'in_stock'
  }
]

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState(DUMMY_INVENTORY)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !search || 
      item.item.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantityOnHand * item.unitCost), 0)
  const lowStockItems = inventory.filter(item => item.status === 'low_stock' || item.status === 'critical').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage DME equipment, supplies, and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/inventory/purchase-order'}>
            Create PO
          </Button>
          <Button onClick={() => window.location.href = '/dashboard/inventory/new'}>
            + Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Items</div>
          <div className="text-2xl font-bold">{inventory.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Value</div>
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Low Stock Items</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Locations</div>
          <div className="text-2xl font-bold">2</div>
          <div className="text-xs text-muted-foreground">Edmonton, Calgary</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Search by item name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <select className="border rounded px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="CPAP Machines">CPAP Machines</option>
            <option value="CPAP Masks">CPAP Masks</option>
            <option value="Sleep Study Devices">Sleep Study Devices</option>
            <option value="Consumables">Consumables</option>
            <option value="PFT Equipment">PFT Equipment</option>
          </select>
          <select className="border rounded px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">SKU</th>
                <th className="text-center p-3">On Hand</th>
                <th className="text-center p-3">Allocated</th>
                <th className="text-center p-3">Available</th>
                <th className="text-right p-3">Unit Cost</th>
                <th className="text-right p-3">Value</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id} className="border-b hover:bg-muted">
                  <td className="p-3">
                    <div className="font-medium">{item.item}</div>
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  </td>
                  <td className="p-3">{item.sku}</td>
                  <td className="text-center p-3 font-semibold">{item.quantityOnHand}</td>
                  <td className="text-center p-3 text-muted-foreground">{item.quantityAllocated}</td>
                  <td className="text-center p-3 font-bold">{item.quantityAvailable}</td>
                  <td className="text-right p-3">${item.unitCost.toFixed(2)}</td>
                  <td className="text-right p-3 font-semibold">
                    ${(item.quantityOnHand * item.unitCost).toFixed(2)}
                  </td>
                  <td className="text-center p-3">
                    <Badge variant={
                      item.status === 'in_stock' ? 'default' :
                      item.status === 'low_stock' ? 'secondary' : 'destructive'
                    }>
                      {item.status === 'critical' ? '⚠️ ' : ''}{item.status}
                    </Badge>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline" onClick={() => alert('Adjust stock')}>
                        Adjust
                      </Button>
                      {item.quantityAvailable <= item.reorderPoint && (
                        <Button size="sm" onClick={() => alert(`Reorder ${item.reorderQuantity} units`)}>
                          Reorder
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <Card className="p-4 border-yellow-500 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">⚠️ Low Stock Alert</div>
              <div className="text-sm mt-1">{lowStockItems} items need reordering</div>
            </div>
            <Button size="sm" onClick={() => window.location.href = '/dashboard/inventory/purchase-order'}>
              Create Purchase Order
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
