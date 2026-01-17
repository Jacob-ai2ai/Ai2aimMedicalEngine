"use client"

import { createClientSupabase } from "@/lib/supabase/client"

export interface RobotWebSocketMessage {
  type: "command" | "status" | "data" | "error"
  payload: Record<string, unknown>
  timestamp: string
}

export class RobotWebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("Robot WebSocket connected")
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onerror = (error) => {
          console.error("Robot WebSocket error:", error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("Robot WebSocket disconnected")
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  send(message: RobotWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket is not open. Message not sent.")
    }
  }

  onMessage(callback: (message: RobotWebSocketMessage) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as RobotWebSocketMessage
          callback(message)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Supabase Realtime for robot integration
export function createRobotRealtimeChannel(robotId: string) {
  const supabase = createClientSupabase()

  return supabase
    .channel(`robot_${robotId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "prescriptions",
    }, (payload) => {
      console.log("Robot prescription update:", payload)
    })
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "patients",
    }, (payload) => {
      console.log("Robot patient update:", payload)
    })
    .subscribe()
}
