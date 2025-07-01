"use client"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldCheck, BrainCircuit, LineChartIcon, Zap, AlertCircle } from "lucide-react"
import type { PlayerMetricsDetail } from "@/lib/types"
import { MetricDisplay } from "./components/metric-display"
import ResultsPageLoading from "./loading"
import { Suspense } from "react"

// Dynamically import the chart component with SSR disabled
const RoiChart = dynamic(() => import("./components/roi-chart"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-500">Loading Chart...</div>,
})

// Helper to format numbers
const formatNumber = (num: number, decimals = 2) => {
  if (num === null || num === undefined) return "N/A"
  return num.toFixed(decimals)
}

// Helper to get risk color
const getRiskColor = (score: number) => {
  if (score > 75) return "text-red-400"
  if (score > 50) return "text-orange-400"
  if (score > 25) return "text-yellow-400"
  return "text-green-400"
}

// Helper to get percentile color
const getPercentileColor = (percentile: number) => {
  if (percentile >= 90) return "text-red-400"
  if (percentile >= 75) return "text-orange-400"
  if (percentile >= 50) return "text-yellow-400"
  if (percentile >= 25) return "text-blue-400"
  return "text-green-400"
}

// Helper to get percentile description
const getPercentileDescription = (percentile: number) => {
  if (percentile >= 95) return "Excepcional (Top 5%)"
  if (percentile >= 90) return "Muy Alto (Top 10%)"
  if (percentile >= 75) return "Alto (Top 25%)"
  if (percentile >= 50) return "Por Encima de la Media"
  if (percentile >= 25) return "Por Debajo de la Media"
  return "Bajo (Bottom 25%)"
}

async function getPlayerData(username: string): Promise<PlayerMetricsDetail | null> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/metrics/player/${username}`
    const res = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!res.ok) {
      console.error(`API Error fetching ${apiUrl}: ${res.status} ${res.statusText}`)
      return null
    }
    return res.json()
  } catch (error) {
    console.error("Fetch Error:", error)
    return null
  }
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { user?: string }
}) {
  const username = searchParams.user

  if (!username) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No player username provided. Please go back and select a player.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Suspense fallback={<ResultsPageLoading username={username} />}>
      <PlayerResults username={username} />
    </Suspense>
  )
}

async function PlayerResults({ username }: { username: string }) {
  const data = await getPlayerData(username)

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            Could not load analysis results for <strong>{username}</strong>. The backend might be down or the analysis
            is not complete.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const roiChartData = data.performance.roi_curve.map((value, index) => ({
    name: `G${index + 1}`,
    roi: value,
  }))

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Report: {data.username}</h1>
          <p className="text-gray-400 mt-1">
            Analyzed {data.games_analyzed} games from {formatDate(data.first_game_date)} to{" "}
            {formatDate(data.last_game_date)}.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Final Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheck className="text-green-400" />
                  <span>Final Summary</span>
                </CardTitle>
                <CardDescription>
                  Consolidated view of the most important metrics and automated conclusion.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricDisplay
                  title="Overall Risk Score"
                  value={data.risk.risk_score.toFixed(0)}
                  tooltipText="A score from 0-100 indicating suspicion level."
                  valueClassName="text-green-400"
                />
                <MetricDisplay
                  title="Confidence Level"
                  value={data.risk.confidence_level.toFixed(2)}
                  unit="%"
                  tooltipText="Our confidence in the accuracy of the risk score."
                />
                <MetricDisplay
                  title="Suspicious Games"
                  value={data.risk.suspicious_games_count}
                  tooltipText="Number of games flagged with highly unusual patterns."
                />
              </CardContent>
            </Card>

            {/* Longitudinal Analysis (ROI) */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChartIcon />
                  <span>Longitudinal Analysis (ROI)</span>
                </CardTitle>
                <CardDescription>Return on Investment (Performance vs Expectation) over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <RoiChart data={roiChartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  title="Avg. ACPL"
                  value={data.avg_acpl.toFixed(2)}
                  tooltipText="Average Centipawn Loss. Lower is better."
                />
                <MetricDisplay
                  title="Avg. Match Rate"
                  value={data.avg_match_rate.toFixed(2)}
                  unit="%"
                  tooltipText="How often the player's move matches the engine's top choice."
                />
                <MetricDisplay
                  title="Opening Entropy"
                  value={data.opening_patterns.mean_entropy.toFixed(2)}
                  tooltipText="Diversity of openings played. Higher is more diverse."
                />
              </CardContent>
            </Card>

            {/* Tactical Analysis */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BrainCircuit />
                  <span>Tactical Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  title="Precision Bursts"
                  value={data.tactical.precision_burst_count}
                  tooltipText="Number of times with a long streak of perfect moves."
                />
                <MetricDisplay
                  title="2nd Choice Rate"
                  value={data.tactical.second_choice_rate?.toFixed(2)}
                  unit="%"
                  tooltipText="Frequency of playing the engine's second-best move."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
