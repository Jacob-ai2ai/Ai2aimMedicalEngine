/**
 * Node Editor Component
 * Configuration panel for editing workflow nodes
 */

'use client'

import React, { useState, useEffect } from 'react'
import { VisualWorkflowNode, WorkflowNodeType } from '@/types/workflow-visual'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { X, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'

interface NodeEditorProps {
  node: VisualWorkflowNode | null
  onSave: (nodeId: string, config: Record<string, any>) => void
  onClose: () => void
}

export function NodeEditor({ node, onSave, onClose }: NodeEditorProps) {
  const { skin } = useSkin()
  const [config, setConfig] = useState<Record<string, any>>({})
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {})
      setLabel(node.data.label || '')
    }
  }, [node])

  if (!node) return null

  const handleSave = () => {
    onSave(node.id, { ...config, label })
  }

  const renderConfigFields = () => {
    switch (node.data.type) {
      case 'trigger':
        return (
          <div className="space-y-4">
            <div>
              <Label>Trigger Type</Label>
              <Select
                value={config.triggerType || 'event'}
                onValueChange={(value) => setConfig({ ...config, triggerType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.triggerType === 'event' && (
              <div>
                <Label>Event Type</Label>
                <Input
                  value={config.eventType || ''}
                  onChange={(e) => setConfig({ ...config, eventType: e.target.value })}
                  placeholder="e.g., sleep_study.created"
                />
              </div>
            )}
            {config.triggerType === 'schedule' && (
              <>
                <div>
                  <Label>Schedule</Label>
                  <Select
                    value={config.schedule || 'daily'}
                    onValueChange={(value) => setConfig({ ...config, schedule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hour (0-23)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={config.hour || 0}
                    onChange={(e) => setConfig({ ...config, hour: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}
          </div>
        )

      case 'database':
        return (
          <div className="space-y-4">
            <div>
              <Label>Table</Label>
              <Input
                value={config.table || ''}
                onChange={(e) => setConfig({ ...config, table: e.target.value })}
                placeholder="e.g., patients"
              />
            </div>
            <div>
              <Label>Operation</Label>
              <Select
                value={config.operation || 'select'}
                onValueChange={(value) => setConfig({ ...config, operation: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'api-call':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL</Label>
              <Input
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select
                value={config.method || 'POST'}
                onValueChange={(value) => setConfig({ ...config, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'notification':
        return (
          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Input
                value={config.recipient || ''}
                onChange={(e) => setConfig({ ...config, recipient: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={config.subject || ''}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                placeholder="Notification subject"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Notification message"
                rows={4}
              />
            </div>
          </div>
        )

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label>Field</Label>
              <Input
                value={config.field || ''}
                onChange={(e) => setConfig({ ...config, field: e.target.value })}
                placeholder="e.g., compliance"
              />
            </div>
            <div>
              <Label>Operator</Label>
              <Select
                value={config.operator || 'equals'}
                onValueChange={(value) => setConfig({ ...config, operator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder="Comparison value"
              />
            </div>
          </div>
        )

      case 'delay':
        return (
          <div>
            <Label>Delay (milliseconds)</Label>
            <Input
              type="number"
              min="0"
              value={config.delayMs || 1000}
              onChange={(e) => setConfig({ ...config, delayMs: parseInt(e.target.value) })}
            />
          </div>
        )

      case 'sleep-clinic-cpap':
        return (
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select
                value={config.action || 'check-compliance'}
                onValueChange={(value) => setConfig({ ...config, action: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-compliance">Check Compliance</SelectItem>
                  <SelectItem value="sync-data">Sync Device Data</SelectItem>
                  <SelectItem value="calculate">Calculate Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.action === 'check-compliance' && (
              <div>
                <Label>Days to Check</Label>
                <Input
                  type="number"
                  min="1"
                  value={config.days || 21}
                  onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>
        )

      case 'sleep-clinic-dme':
        return (
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select
                value={config.action || 'check-inventory'}
                onValueChange={(value) => setConfig({ ...config, action: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-inventory">Check Inventory</SelectItem>
                  <SelectItem value="assign">Assign Equipment</SelectItem>
                  <SelectItem value="get-inventory">Get Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.action === 'check-inventory' && (
              <div>
                <Label>Equipment Type</Label>
                <Input
                  value={config.equipmentType || ''}
                  onChange={(e) => setConfig({ ...config, equipmentType: e.target.value })}
                  placeholder="e.g., CPAP"
                />
              </div>
            )}
          </div>
        )

      case 'sleep-clinic-sleep-study':
        return (
          <div>
            <Label>Action</Label>
            <Select
              value={config.action || 'dispatch'}
              onValueChange={(value) => setConfig({ ...config, action: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dispatch">Dispatch Monitor</SelectItem>
                <SelectItem value="return">Record Return</SelectItem>
                <SelectItem value="get-available">Get Available Monitors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'sleep-clinic-pft':
        return (
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select
                value={config.action || 'schedule'}
                onValueChange={(value) => setConfig({ ...config, action: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schedule">Schedule Test</SelectItem>
                  <SelectItem value="record-results">Record Results</SelectItem>
                  <SelectItem value="get-tests">Get Patient Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.action === 'schedule' && (
              <div>
                <Label>Test Type</Label>
                <Select
                  value={config.testType || 'spirometry'}
                  onValueChange={(value) => setConfig({ ...config, testType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spirometry">Spirometry</SelectItem>
                    <SelectItem value="lung-volume">Lung Volume</SelectItem>
                    <SelectItem value="diffusion">Diffusion Capacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )

      case 'ai-agent':
        return (
          <div className="space-y-4">
            <div>
              <Label>Agent Role</Label>
              <Select
                value={config.agentRole || 'physician'}
                onValueChange={(value) => setConfig({ ...config, agentRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physician">Physician</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Message to send to AI agent"
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className={cn(
            "text-sm",
            skin === "legacy" ? "text-slate-500" : "text-foreground/60"
          )}>
            No configuration needed for this node type.
          </div>
        )
    }
  }

  return (
    <Card className={cn(
      "w-80 h-full flex flex-col",
      skin === "legacy" ? "bg-white border-slate-200" : "aeterna-glass border-white/10"
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between pb-3",
        skin === "legacy" ? "border-b border-slate-200" : "border-b border-white/10"
      )}>
        <CardTitle className={cn(
          "text-sm font-black uppercase tracking-widest",
          skin === "legacy" ? "text-slate-900" : "text-foreground"
        )}>
          Edit Node
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pt-4">
        <div>
          <Label>Label</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Node label"
          />
        </div>
        
        {renderConfigFields()}
      </CardContent>
      
      <div className={cn(
        "p-4 border-t",
        skin === "legacy" ? "border-slate-200" : "border-white/10"
      )}>
        <Button onClick={handleSave} className="w-full" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </Card>
  )
}
