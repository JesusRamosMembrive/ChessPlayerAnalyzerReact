"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { usePlayer } from "@/hooks/usePlayer"
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"

interface PlayerProgressProps {
  username: string
}

export function PlayerProgress({ username }: PlayerProgressProps) {
  const { player, isLoading, error, isAnalyzing, progress } = usePlayer(username)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading player data...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8 text-red-500">
          <AlertCircle className="w-6 h-6 mr-2" />
          {error.message}
        </CardContent>
      </Card>
    )
  }

  if (!player) return null

  const getStatusIcon = () => {
    switch (player.status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (player.status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700"
      case "completed":
        return "bg-green-500/20 text-green-700"
      case "error":
        return "bg-red-500/20 text-red-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{username}</span>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{player.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analysis Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {player.games_count && <p className="text-sm text-muted-foreground">{player.games_count} games analyzed</p>}
          </div>
        )}

        {player.status === "completed" && (
          <div className="text-sm text-green-600">✓ Analysis completed successfully</div>
        )}

        {player.status === "error" && player.error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">Error: {player.error}</div>
        )}

        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(player.updated_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
