"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, TrendingUp, Clock, BarChart3, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { analyzePlayer } from "@/lib/chess-api"
import { Toaster } from "@/components/ui/toaster"

const PlayersList = dynamic(() => import("@/components/players-list").then(mod => ({ default: mod.PlayersList })), {
  ssr: false,
  loading: () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <span>Loading Players...</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-700/50 rounded-lg"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

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

function ChessAnalyzerHomeContent() {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const analyzeMutation = useMutation({
    mutationFn: analyzePlayer,
    onSuccess: (data) => {
      toast({
        title: "Analysis Started",
        description: `Analysis for ${username} has been queued (Task: ${data.task_id})`,
      })
      queryClient.invalidateQueries({ queryKey: ["players"] })
      setUsername("")
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis",
        variant: "destructive",
      })
    },
  })

  const handleAnalysisClick = (username: string) => {
    router.push(`/results?user=${username}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    analyzeMutation.mutate(username.trim())
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Chess Analyzer</h1>
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

            <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Search className="w-5 h-5" />
                  <span className="text-white">New Analysis</span>
                </CardTitle>
                <CardDescription className="text-white">Enter a chess.com username to analyze</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Enter chess.com username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    disabled={analyzeMutation.isPending}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    disabled={!username.trim() || analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
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

          {/* Analyzed Players List */}
          <PlayersList onError={(error: any) => console.error("Failed to load players:", error)} />
        </div>
      </div>
    </div>
  )
}

export default function ChessAnalyzerHome() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChessAnalyzerHomeContent />
      <Toaster />
    </QueryClientProvider>
  )
}
