"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { PlayerListItem } from "@/lib/types"

interface UseProgressPollingProps {
  players: PlayerListItem[]
  setPlayers: React.Dispatch<React.SetStateAction<PlayerListItem[]>>
  intervalMs?: number
}

export function useProgressPolling({ players, setPlayers, intervalMs = 2000 }: UseProgressPollingProps) {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPlayerProgress = async (username: string) => {
    try {
      const response = await fetch(`/api/players/${username}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`Failed to fetch progress for ${username}:`, response.status)
        return null
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching progress for ${username}:`, error)
      return null
    }
  }

  const updatePlayersProgress = async () => {
    const pendingPlayers = players.filter((player) => player.status === "pending")

    if (pendingPlayers.length === 0) {
      return
    }

    const progressUpdates = await Promise.allSettled(
      pendingPlayers.map(async (player) => {
        const progressData = await fetchPlayerProgress(player.username)
        return { username: player.username, data: progressData }
      }),
    )

    setPlayers((currentPlayers) => {
      return currentPlayers.map((player) => {
        const update = progressUpdates.find(
          (result) => result.status === "fulfilled" && result.value.username === player.username,
        )

        if (update && update.status === "fulfilled" && update.value.data) {
          const newData = update.value.data
          return {
            ...player,
            status: newData.status || player.status,
            progress: newData.progress !== undefined ? newData.progress : player.progress,
            total_games: newData.total_games || player.total_games,
            done_games: newData.done_games || player.done_games,
            finished_at: newData.finished_at || player.finished_at,
          }
        }

        return player
      })
    })
  }

  const startPolling = () => {
    if (intervalRef.current) return // Already polling

    setIsPolling(true)
    intervalRef.current = setInterval(updatePlayersProgress, intervalMs)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }

  // Auto start/stop polling based on pending players
  useEffect(() => {
    const hasPendingPlayers = players.some((player) => player.status === "pending")

    if (hasPendingPlayers && !isPolling) {
      startPolling()
    } else if (!hasPendingPlayers && isPolling) {
      stopPolling()
    }
  }, [players, isPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  return {
    isPolling,
    startPolling,
    stopPolling,
  }
}
