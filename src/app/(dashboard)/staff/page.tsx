/**
 * Staff Management Page
 * View and manage all staff members (clinicians, admin, marketing)
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function StaffPage() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    loadStaff()
  }, [roleFilter])

  async function loadStaff() {
    try {
      setLoading(true)
      // Using existing patients API pattern
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success) {
        setStaff(result.data || [])
      }
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStaff = staff.filter((s: any) => {
    const matchesSearch = !search || 
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || s.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage clinicians, administrative staff, and team members</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/staff/new'}>
          + Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Roles</option>
            <option value="physician">Physicians</option>
            <option value="nurse">Nurses</option>
            <option value="administrative">Administrative</option>
            <option value="pharmacist">Pharmacists</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </Card>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-12">Loading staff...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member: any) => (
            <Card 
              key={member.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/dashboard/staff/${member.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{member.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <Badge>{member.role || 'unknown'}</Badge>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Phone:</span>{' '}
                  {member.phone || 'Not provided'}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/dashboard/staff/${member.id}/schedule`
                  }}
                >
                  Schedule
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = `/dashboard/staff/${member.id}/productivity`
                  }}
                >
                  Productivity
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredStaff.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No staff members found</p>
        </Card>
      )}
    </div>
  )
}
