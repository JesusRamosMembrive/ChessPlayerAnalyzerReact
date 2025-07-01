"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlayerForm } from "./components/PlayerForm"
import { PlayerSummary } from "./components/PlayerSummary"
import { TrendingUp, Clock, BarChart3, Zap, History, Calendar } from "lucide-react"

export default function DemoPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  // Mock data for demonstration
  const mockPlayers = [
    {
      username: "magnus_carlsen",
      status: "ready" as const,
      progress: 100,
      requested_at: "2024-01-15T10:30:00Z",
      total_games: 1250,
      done_games: 1250,
      finished_at: "2024-01-15T12:45:00Z",
    },
    {
      username: "hikaru_nakamura",
      status: "pending" as const,
      progress: 75,
      requested_at: "2024-01-15T11:00:00Z",
      total_games: 980,
      done_games: 735,
      finished_at: undefined,
    },
    {
      username: "gotham_chess",
      status: "ready" as const,
      progress: 100,
      requested_at: "2024-01-14T15:20:00Z",
      total_games: 650,
      done_games: 650,
      finished_at: "2024-01-14T16:30:00Z",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Chess Analyzer - Demo</h1>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500">
              Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Main Analysis Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Analyze Chess Performance</h2>
            <p className="text-gray-400 text-lg mb-8">
              Discover patterns, detect anomalies, and gain insights from chess.com game data
            </p>

            <PlayerForm onSubmit={(username) => console.log("Demo: Analyzing", username)} />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Opening Entropy</h3>
                <p className="text-sm text-gray-400">Analyze opening diversity vs ELO consistency</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Move Timing</h3>
                <p className="text-sm text-gray-400">Detect suspicious timing patterns</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Win/Loss Stats</h3>
                <p className="text-sm text-gray-400">Comprehensive game outcome analysis</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-semibold mb-2 text-white">Comeback Analysis</h3>
                <p className="text-sm text-gray-400">Identify dramatic game turnarounds</p>
              </CardContent>
            </Card>
          </div>

          {/* Demo Players List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <History className="w-5 h-5" />
                <span>Demo Players</span>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500">
                  Sample Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPlayers.map((player) => (
                  <div
                    key={player.username}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg transition-colors cursor-pointer hover:bg-gray-700"
                    onClick={() => setSelectedPlayer(player.username)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{player.username[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-white truncate">{player.username}</p>
                          <Badge
                            variant="outline"
                            className={
                              player.status === "ready"
                                ? "bg-green-500/20 text-green-400 border-green-500"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500"
                            }
                          >
                            {player.status === "ready" ? "Ready" : "Pending"}
                          </Badge>
                        </div>

                        {player.status === "pending" && (
                          <div className="mb-2">
                            <Progress value={player.progress} className="h-1" />
                            <p className="text-xs text-gray-400 mt-1">{player.progress}% complete</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Games: {player.total_games}</span>
                          <span>Done: {player.done_games}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-400 ml-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {player.finished_at
                            ? `Finished: ${new Date(player.finished_at).toLocaleDateString()}`
                            : `Started: ${new Date(player.requested_at).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Player Summary */}
          {selectedPlayer && (
            <div className="mt-6">
              <PlayerSummary username={selectedPlayer} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
