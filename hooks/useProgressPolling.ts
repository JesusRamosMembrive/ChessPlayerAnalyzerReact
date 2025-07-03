"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import type { PlayerListItem } from "@/lib/types"

interface UseProgressPollingProps {
  players: PlayerListItem[]
  setPlayers: React.Dispatch<React.SetStateAction<PlayerListItem[]>>
}

export function useProgressPolling({ players, setPlayers }: UseProgressPollingProps) {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingPlayersRef = useRef<PlayerListItem[]>([])

  const pendingPlayers = useMemo(() => {
    const filtered = players.filter((player) => player.status === "pending")
    pendingPlayersRef.current = filtered
    return filtered
  }, [players])

  const fetchPlayerProgress = useCallback(async (username: string): Promise<PlayerListItem | null> => {
    try {
      console.log(`Fetching progress for player: ${username}`)

      const response = await fetch(`/api/players/${username}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Player ${username} not found, might have been deleted`)
          return null
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`Progress data for ${username}:`, data)
      return data
    } catch (error) {
      console.error(`Failed to fetch progress for ${username}:`, error)
      return null
    }
  }, [])

  const updatePlayersProgress = useCallback(async () => {
    const currentPendingPlayers = pendingPlayersRef.current
    if (currentPendingPlayers.length === 0) {
      return
    }

    console.log(
      `Polling progress for ${currentPendingPlayers.length} pending players:`,
      currentPendingPlayers.map((p) => p.username),
    )

    const updates = await Promise.allSettled(currentPendingPlayers.map((player) => fetchPlayerProgress(player.username)))

    setPlayers((currentPlayers) => {
      let hasUpdates = false
      const updatedPlayers = currentPlayers.map((player) => {
        if (player.status !== "pending") {
          return player
        }

        // Find the corresponding update
        const playerIndex = currentPendingPlayers.findIndex((p) => p.username === player.username)
        if (playerIndex === -1) {
          return player
        }

        const updateResult = updates[playerIndex]
        if (updateResult.status === "fulfilled" && updateResult.value) {
          const updatedData = updateResult.value

          // Ensure progress is a number
          const newProgress =
            typeof updatedData.progress === "string"
              ? Number.parseFloat(updatedData.progress)
              : updatedData.progress || 0

          // Check if there's actually an update
          const progressChanged = Math.abs((player.progress || 0) - newProgress) > 0.01
          const statusChanged = player.status !== updatedData.status
          const gamesChanged = player.done_games !== updatedData.done_games

          if (progressChanged || statusChanged || gamesChanged) {
            hasUpdates = true
            console.log(`Progress update for ${player.username}:`, {
              oldProgress: player.progress,
              newProgress: newProgress,
              oldStatus: player.status,
              newStatus: updatedData.status,
              oldDoneGames: player.done_games,
              newDoneGames: updatedData.done_games,
            })

            return {
              ...player,
              ...updatedData,
              progress: newProgress,
              // Force a unique key to ensure re-render
              _updateId: Date.now() + Math.random(),
            }
          }
        }

        return player
      })

      if (hasUpdates) {
        console.log("Players updated, returning new array")
        return [...updatedPlayers]
      }

      return currentPlayers
    })
  }, [setPlayers, fetchPlayerProgress])

  useEffect(() => {
    const hasPendingPlayers = pendingPlayers.length > 0

    if (hasPendingPlayers && !isPolling) {
      console.log(
        "Starting progress polling for players:",
        pendingPlayers.map((p) => p.username),
      )
      setIsPolling(true)

      // Initial update
      updatePlayersProgress()

      // Set up interval - poll every 2 seconds
      intervalRef.current = setInterval(() => {
        updatePlayersProgress()
      }, 2000)
    } else if (!hasPendingPlayers && isPolling) {
      console.log("Stopping progress polling - no pending players")
      setIsPolling(false)

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pendingPlayers.length, isPolling, updatePlayersProgress])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { isPolling }
}
