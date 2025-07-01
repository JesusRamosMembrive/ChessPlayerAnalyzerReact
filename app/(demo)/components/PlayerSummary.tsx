"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Target, Zap } from "lucide-react"

interface PlayerSummaryProps {
  username: string
}

export function PlayerSummary({ username }: PlayerSummaryProps) {
  // Mock data based on username
  const getMockData = (username: string) => {
    const data = {
      magnus_carlsen: {
        totalGames: 1250,
        openingEntropy: 8.7,
        moveTimingConsistency: 94,
        winLossRatio: 2.3,
        comebackRate: 23,
      },
      hikaru_nakamura: {
        totalGames: 980,
        openingEntropy: 7.2,
        moveTimingConsistency: 87,
        winLossRatio: 1.9,
        comebackRate: 31,
      },
      gotham_chess: {
        totalGames: 650,
        openingEntropy: 6.1,
        moveTimingConsistency: 78,
        winLossRatio: 1.4,
        comebackRate: 18,
      },
    }
    return data[username as keyof typeof data] || data.magnus_carlsen
  }

  const playerData = getMockData(username)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>Analysis Results: {username}</span>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
            Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData.openingEntropy}</div>
            <div className="text-xs text-gray-400">Opening Entropy</div>
          </div>

          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData.moveTimingConsistency}%</div>
            <div className="text-xs text-gray-400">Move Timing</div>
          </div>

          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData.winLossRatio}</div>
            <div className="text-xs text-gray-400">Win/Loss Ratio</div>
          </div>

          <div className="text-center p-4 bg-gray-700/50 rounded-lg">
            <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">{playerData.comebackRate}%</div>
            <div className="text-xs text-gray-400">Comeback Rate</div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">Analysis based on {playerData.totalGames} games</div>
      </CardContent>
    </Card>
  )
}
