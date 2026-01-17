/**
 * Custom Edge Component
 * Styled edge for workflow connections
 */

'use client'

import React from 'react'
import { EdgeProps, getBezierPath } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'

export function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}: EdgeProps) {
  const { skin } = useSkin()
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  return (
    <>
      <path
        id={id}
        style={style}
        className={cn(
          "fill-none stroke-2",
          skin === "legacy" 
            ? "stroke-emerald-500" 
            : "stroke-primary"
        )}
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  )
}
