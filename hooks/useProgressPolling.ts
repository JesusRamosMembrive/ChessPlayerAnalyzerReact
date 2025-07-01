import { useEffect, useRef, useState } from "react"
import type { PlayerListItem } from "@/lib/types"

interface UseProgressPollingProps {
  players: PlayerListItem[]
  setPlayers: React.Dispatch<React.SetStateAction<PlayerListItem[]>>
}

export function useProgressPolling({ players, setPlayers }: UseProgressPollingProps) {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const pendingPlayers = players.filter((player) => player.status === "pending")

  const fetchPlayerProgress = async (username: string): Promise<PlayerListItem | null> => {
    try {
      const response = await fetch(`/api/players/${username}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Player not found, might have been deleted
          return null
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Failed to fetch progress for ${username}:`, error)
      return null
    }
  }

  const updatePlayersProgress = async () => {
    if (pendingPlayers.length === 0) {
      return
    }

    console.log(`Polling progress for ${pendingPlayers.length} pending players`)

    const updates = await Promise.allSettled(
      pendingPlayers.map((player) => fetchPlayerProgress(player.username))
    )

    setPlayers((currentPlayers) => {
      return currentPlayers.map((player) => {
        if (player.status !== "pending") {
          return player
        }

        // Find the corresponding update
        const playerIndex = pendingPlayers.findIndex((p) => p.username === player.username)
        if (playerIndex === -1) {
          return player
        }

        const updateResult = updates[playerIndex]
        if (updateResult.status === "fulfilled" && updateResult.value) {
          const updatedData = updateResult.value
          console.log(`Updated progress for ${player.username}:`, updatedData)
          return {
            ...player,
            ...updatedData,
          }
        }

        return player
      })
    })
  }

  useEffect(() => {
    if (pendingPlayers.length > 0) {
      if (!isPolling) {
        console.log("Starting progress polling...")
        setIsPolling(true)
        
        // Initial update
        updatePlayersProgress()
        
        // Set up interval
        intervalRef.current = setInterval(updatePlayersProgress, 2000) // Poll every 2 seconds
      }
    } else {
      if (isPolling) {
        console.log("Stopping progress polling...")
        setIsPolling(false)
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pendingPlayers.length, isPolling])

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
