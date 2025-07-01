"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { playerMetrics } from "@/lib/chess-api"
import { usePlayer } from "@/hooks/usePlayer"
import { BarChart3, TrendingUp, AlertTriangle, Zap } from "lucide-react"

interface PlayerSummaryProps {
  username: string
}

export function PlayerSummary({ username }: PlayerSummaryProps) {
  const { player } = usePlayer(username)

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["playerMetrics", username],
    queryFn: ({ signal }) => playerMetrics(username, signal),
    enabled: player?.status === "completed",
  })

  if (player?.status !== "completed") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
          Analysis must be completed to view metrics
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">Loading metrics...</CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Player Summary - {username}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.total_games}</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatPercentage(metrics.win_rate)}</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.comeback_games}</div>
            <div className="text-sm text-muted-foreground">Comebacks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.suspicious_patterns}</div>
            <div className="text-sm text-muted-foreground">Suspicious</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Opening Diversity</span>
            </div>
            <Badge variant="outline">{formatPercentage(metrics.opening_diversity)}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Rating Consistency</span>
            </div>
            <Badge variant="outline">{formatPercentage(metrics.rating_consistency)}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Avg Game Length</span>
            </div>
            <Badge variant="outline">{metrics.avg_game_length} moves</Badge>
          </div>

          {metrics.suspicious_patterns > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">Suspicious Patterns Detected</span>
              </div>
              <Badge variant="destructive">{metrics.suspicious_patterns}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
