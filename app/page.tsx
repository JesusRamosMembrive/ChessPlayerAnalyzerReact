"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PlayersList } from "@/components/players-list"
import type { PlayerListItem } from "@/lib/types"
import { Search, TrendingUp, Users, BarChart3, Play } from "lucide-react"
import { QueryClient } from "react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000,
    },
  },
})

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()
  const addPlayerRef = useRef<((player: PlayerListItem) => void) | null>(null)

  const handleAnalyze = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a Chess.com username to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      console.log(`Starting analysis for: ${username}`)

      // Create the new player object to add to the list immediately
      const newPlayer: PlayerListItem = {
        username: username.trim(),
        status: "pending",
        progress: 0,
        requested_at: new Date().toISOString(),
        total_games: undefined,
        done_games: 0,
        finished_at: undefined,
      }

      // Add player to the list immediately
      if (addPlayerRef.current) {
        addPlayerRef.current(newPlayer)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Analysis API error:", errorData)

        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Analysis started successfully:", result)

      toast({
        title: "Analysis Started",
        description: `Started analyzing ${username}. This may take a few minutes.`,
      })

      // Clear the input
      setUsername("")
    } catch (error: any) {
      console.error("Failed to start analysis:", error)

      let errorMessage = "Failed to start analysis"

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        errorMessage = "Request timed out - please try again"
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error - unable to connect to API"
      } else if (error.message?.includes("already exists") || error.message?.includes("already being analyzed")) {
        errorMessage = `${username} is already being analyzed or has been analyzed`
      } else if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        errorMessage = `Chess.com user "${username}" not found`
      } else {
        errorMessage = error.message || "Unknown error occurred"
      }

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnalyzing) {
      handleAnalyze()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-4xl font-bold text-white">Chess Analyzer</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Analyze your Chess.com games and discover patterns in your play style, opening preferences, and performance
            trends.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Performance Analysis</p>
                  <p className="text-2xl font-bold text-white">Advanced</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Players Analyzed</p>
                  <p className="text-2xl font-bold text-white">1,200+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-400">Games Processed</p>
                  <p className="text-2xl font-bold text-white">50K+</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Search className="w-5 h-5" />
                <span>Start Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Chess.com Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username (e.g., hikaru)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isAnalyzing}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !username.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Analysis...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">What we analyze:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    Opening Repertoire
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    Time Management
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    Win/Loss Patterns
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    Rating Trends
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          <PlayersList
            onError={(error) => {
              console.error("PlayersList error:", error)
            }}
            onPlayerAdded={(addPlayerFn) => {
              addPlayerRef.current = addPlayerFn
            }}
          />
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Analysis Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Performance Tracking</h3>
                <p className="text-gray-400">
                  Track your rating progression, win rates, and performance across different time controls and game
                  formats.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <Search className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Opening Analysis</h3>
                <p className="text-gray-400">
                  Discover your most played openings, success rates, and identify areas for improvement in your
                  repertoire.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Detailed Statistics</h3>
                <p className="text-gray-400">
                  Get comprehensive statistics about your games, including time usage, move accuracy, and tactical
                  patterns.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
