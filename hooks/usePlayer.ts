"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { getPlayer } from "@/lib/chess-api"
import { usePlayerStream } from "./usePlayerStream"
import type { Player } from "@/lib/types"

export function usePlayer(username: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["player", username],
    queryFn: ({ signal }) => getPlayer(username!, signal),
    enabled: !!username,
    staleTime: 30000, // 30 seconds
    refetchInterval: (data) => {
      // Stop polling if completed or error
      return data?.status === "pending" ? 5000 : false
    },
  })

  const { lastEvent } = usePlayerStream(username && query.data?.status === "pending" ? username : null)

  // Update cache optimistically when SSE events arrive
  useEffect(() => {
    if (!lastEvent || !username) return

    queryClient.setQueryData(["player", username], (oldData: Player | undefined) => {
      if (!oldData) return oldData

      const updates: Partial<Player> = {
        updated_at: new Date().toISOString(),
      }

      if (lastEvent.data.progress !== undefined) {
        updates.analysis_progress = lastEvent.data.progress
      }

      if (lastEvent.data.status) {
        updates.status = lastEvent.data.status
      }

      if (lastEvent.data.error) {
        updates.error = lastEvent.data.error
      }

      if (lastEvent.data.games_analyzed !== undefined) {
        updates.games_count = lastEvent.data.games_analyzed
      }

      return { ...oldData, ...updates }
    })

    // Refetch if completed to get final data
    if (lastEvent.type === "completed") {
      query.refetch()
    }
  }, [lastEvent, username, queryClient, query])

  return {
    ...query,
    player: query.data,
    isAnalyzing: query.data?.status === "pending",
    progress: query.data?.analysis_progress ?? 0,
  }
}
