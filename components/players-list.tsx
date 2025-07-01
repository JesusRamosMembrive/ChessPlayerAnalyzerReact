"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { List, AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react"
import type { PlayerListItem } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

async function fetchPlayers(): Promise<PlayerListItem[]> {
  const res = await fetch("/api/players")
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    console.error("Failed to fetch players:", errorData)
    throw new Error("Failed to fetch players")
  }
  return res.json()
}

export function PlayersList({
  onError,
  onPlayerAdded,
}: {
  onError: (error: Error) => void
  onPlayerAdded: (addPlayerFn: (player: PlayerListItem) => void) => void
}) {
  const queryClient = useQueryClient()

  const { data, error, isLoading } = useQuery<PlayerListItem[]>({
    queryKey: ["players"],
    queryFn: fetchPlayers,
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.some((p) => p.status === "pending" || p.status === "in_progress")) {
        return 5000 // Poll every 5 seconds if there are active analyses
      }
      return false // Otherwise, stop polling
    },
  })

  useEffect(() => {
    if (error) {
      onError(error as Error)
    }
  }, [error, onError])

  useEffect(() => {
    onPlayerAdded((player) => {
      queryClient.setQueryData<PlayerListItem[]>(["players"], (oldData) => {
        if (!oldData) return [player]
        if (oldData.find((p) => p.username.toLowerCase() === player.username.toLowerCase())) {
          return oldData.map((p) =>
            p.username.toLowerCase() === player.username.toLowerCase() ? { ...p, status: "pending" } : p,
          )
        }
        return [player, ...oldData]
      })
    })
  }, [onPlayerAdded, queryClient])

  const renderPlayerStatus = (player: PlayerListItem) => {
    switch (player.status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="flex items-center space-x-1 border-blue-500 text-blue-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
            <span>In Progress</span>
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center space-x-1 border-green-500 text-green-500">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </Badge>
        )
      default:
        return <Badge variant="secondary">{player.status}</Badge>
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <List className="w-5 h-5" />
          <span>Recent Analyses</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 bg-gray-700/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Could not load player list. Please try again later.</AlertDescription>
            </Alert>
          )}
          {data && data.length === 0 && !isLoading && (
            <p className="text-gray-400 text-center py-4">No analyses yet. Enter a username to start.</p>
          )}
          {data &&
            data.map((player) => (
              <Link
                key={player.username}
                href={player.status === "completed" ? `/results?user=${player.username}` : "#"}
                passHref
                className={player.status === "completed" ? "block" : undefined}
                style={{ pointerEvents: player.status === "completed" ? "auto" : "none" }}
              >
                <div className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white">{player.username}</span>
                    {renderPlayerStatus(player)}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={player.progress || 0} className="w-full [&>div]:bg-blue-500" />
                    <span className="text-sm text-gray-300 w-24 text-right">
                      {player.done_games}/{player.total_games || "?"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                    <span>Requested {formatDistanceToNow(new Date(player.requested_at), { addSuffix: true })}</span>
                    {player.status === "completed" && (
                      <Button variant="link" className="h-auto p-0 text-blue-400 hover:text-blue-300">
                        View Results
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
