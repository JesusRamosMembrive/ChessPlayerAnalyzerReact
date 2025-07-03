"use client"

import { useEffect, useRef, useState } from "react"
import { StreamEventSchema, type StreamEvent } from "@/lib/types"

export function usePlayerStream(username: string | null) {
  const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!username) {
      setLastEvent(null)
      setIsConnected(false)
      setError(null)
      return
    }

    const eventSource = new EventSource(`/api/stream/${username}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const parsedEvent = StreamEventSchema.parse(data)
        setLastEvent(parsedEvent)
      } catch (err) {
        console.error("Failed to parse SSE event:", err)
        setError("Failed to parse server event")
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError("Connection lost")
    }

    return () => {
      eventSource.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [username])

  return {
    lastEvent,
    isConnected,
    error,
    disconnect: () => {
      eventSourceRef.current?.close()
      setIsConnected(false)
    },
  }
}
