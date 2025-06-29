"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { PlayerListItemSchema, type PlayerListItem } from "@/lib/types"
import { History, User, Calendar, Globe, Zap } from "lucide-react"

interface PlayersListProps {
  onError?: (error: any) => void
}

export function PlayersList({ onError }: PlayersListProps) {
  const [players, setPlayers] = useState<PlayerListItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

    const fetchPlayers = async () => {
      try {
        setLoading(true)
        setPlayers([]) // Clear any existing data

        // Use /api prefix for same-origin requests (Next.js API routes)
        const response = await fetch("/api/players", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        // Handle empty array
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected array")
        }

        if (data.length === 0) {
          setPlayers([])
          return
        }

        // Validate and parse the data
        const validatedPlayers = PlayerListItemSchema.array().parse(data)
        setPlayers(validatedPlayers)
      } catch (error: any) {
        console.error("Failed to fetch players:", error)

        if (error.name === "AbortError") {
          toast({
            title: "Request Timeout",
            description: "Failed to load players: request timed out",
            variant: "destructive",
          })
        } else if (error.message.includes("Failed to fetch")) {
          // Network error - likely CORS or connection issue
          toast({
            title: "Connection Error",
            description: "Unable to connect to the API. Please check if the backend is running.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error Loading Players",
            description: error.message || "Failed to load analyzed players",
            variant: "destructive",
          })
        }

        onError?.(error)
        setPlayers([])
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    }

    fetchPlayers()

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [onError, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
            Pending
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
            Ready
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
            Error
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <History className="w-5 h-5" />
            <span>Analyzed Players</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Skeleton loader */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <History className="w-5 h-5" />
          <span>Analyzed Players</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No players analyzed</p>
            <p className="text-sm">Start analyzing a player to see results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.username}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{player.username[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-white truncate">{player.username}</p>
                      {getStatusBadge(player.status)}
                    </div>

                    {/* Progress bar for pending status */}
                    {player.status === "pending" && player.progress !== undefined && (
                      <div className="mb-2">
                        <Progress value={player.progress} className="h-1" />
                        <p className="text-xs text-gray-400 mt-1">{player.progress}% complete</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      {player.total_games && (
                        <span className="flex items-center space-x-1">
                          <span>Games: {player.total_games}</span>
                        </span>
                      )}

                      {player.done_games && (
                        <span className="flex items-center space-x-1">
                          <span>Done: {player.done_games}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-gray-400 ml-4">
                  {player.finished_at ? (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Finished: {formatDate(player.finished_at)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Started: {formatDate(player.requested_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
