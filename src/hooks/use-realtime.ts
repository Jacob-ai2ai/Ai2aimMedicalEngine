"use client"

import { useEffect, useState } from "react"
import { createClientSupabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtime<T>(
  table: string,
  filter?: string,
  callback?: (payload: { new?: T; old?: T; eventType: string }) => void
) {
  const [data, setData] = useState<T[]>([])
  const supabase = createClientSupabase()

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      let query = supabase.from(table).select("*")
      if (filter) {
        query = query.eq(filter.split("=")[0], filter.split("=")[1])
      }
      const { data: initialData } = await query
      if (initialData) {
        setData(initialData as T[])
      }
    }

    fetchData()

    // Set up realtime subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: filter,
        },
        (payload) => {
          if (callback) {
            callback({
              new: payload.new as T,
              old: payload.old as T,
              eventType: payload.eventType,
            })
          }

          // Update local state
          if (payload.eventType === "INSERT") {
            setData((prev) => [...prev, payload.new as T])
          } else if (payload.eventType === "UPDATE") {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === (payload.new as any).id ? (payload.new as T) : item
              )
            )
          } else if (payload.eventType === "DELETE") {
            setData((prev) => prev.filter((item: any) => item.id !== (payload.old as any).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, callback])

  return data
}
