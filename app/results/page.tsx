"use client"
import { useEffect, useState, useMemo, Suspense } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Download,
  Share2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  User,
  ShieldCheck,
  Gauge,
  LineChartIcon,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import type { PlayerMetricsDetail } from "@/lib/types"
import { MetricDisplay } from "./components/metric-display"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

const RoiChart = dynamic(() => import("./components/roi-chart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <Skeleton className="h-full w-full bg-gray-700" />
    </div>
  ),
})

// Helper to format numbers
const formatNumber = (num: number | null | undefined, decimals = 2) => {
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

function ResultsPageContent({ username }: { username: string }) {
  const router = useRouter()
  const [metrics, setMetrics] = useState<PlayerMetricsDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Call the internal Next.js API route
        const response = await fetch(`/api/metrics/player/${username}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch player metrics (${response.status})`)
        }
        const data: PlayerMetricsDetail = await response.json()
        setMetrics(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [username])

  const roiChartData = useMemo(() => {
    if (!metrics?.performance?.roi_curve) return []
    return metrics.performance.roi_curve.map((roi, index) => ({
      name: `G${index + 1}`,
      roi: roi,
    }))
  }, [metrics])

  const phaseQualityData = useMemo(() => {
    if (!metrics?.phase_quality) return []
    return [
      { name: "Apertura", acpl: metrics.phase_quality.opening_acpl },
      { name: "Medio Juego", acpl: metrics.phase_quality.middlegame_acpl },
      { name: "Final", acpl: metrics.phase_quality.endgame_acpl },
    ]
  }, [metrics])

  if (isLoading) {
    return <ResultsSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar los datos</h2>
        <p className="text-gray-400 mb-6 text-center">{error}</p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">No hay datos disponibles para este jugador</h2>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    )
  }

  const riskScoreColor = getRiskColor(metrics.risk.risk_score)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{metrics.username}</h1>
                  <p className="text-sm text-gray-400">
                    Análisis completado el {new Date(metrics.analyzed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Puntuación de Riesgo</CardTitle>
              <ShieldCheck className={`w-5 h-5 ${riskScoreColor}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${riskScoreColor}`}>
                {formatNumber(metrics.risk.risk_score, 0)}/100
              </div>
              <p className="text-xs text-gray-500">Evaluación general de sospecha</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Partidas Analizadas</CardTitle>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{metrics.games_analyzed}</div>
              <p className="text-xs text-gray-500">
                Del {new Date(metrics.first_game_date).toLocaleDateString()} al{" "}
                {new Date(metrics.last_game_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Rendimiento Intrínseco</CardTitle>
              <Gauge className="w-5 h-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{formatNumber(metrics.avg_ipr, 0)}</div>
              <p className="text-xs text-gray-500">ELO estimado según sus jugadas</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Mejora Súbita</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-4xl font-bold ${metrics.step_function_detected ? "text-orange-400" : "text-green-400"}`}
              >
                {metrics.step_function_detected ? "Detectada" : "No"}
              </div>
              <p className="text-xs text-gray-500">Magnitud: {formatNumber(metrics.step_function_magnitude, 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Second Block of Metrics - Improved ROI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <LineChartIcon className="mr-2 text-green-400" /> Análisis Longitudinal (ROI)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Evolución del rendimiento del jugador a lo largo del tiempo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <RoiChart data={roiChartData} />
              </div>
              {/* ROI Statistics */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">ROI Medio</p>
                  <p className="text-lg font-semibold text-green-400">{formatNumber(metrics.roi_mean, 0)}</p>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">ROI Máximo</p>
                  <p className="text-lg font-semibold text-blue-400">{formatNumber(metrics.roi_max, 0)}</p>
                </div>
                <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Desviación ROI</p>
                  <p className="text-lg font-semibold text-purple-400">{formatNumber(metrics.roi_std, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 text-orange-400" /> Tendencias
              </CardTitle>
              <CardDescription className="text-gray-400">Análisis de tendencias temporales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <MetricDisplay
                  title="Tendencia ACPL"
                  value={`${formatNumber(metrics.performance.trend_acpl)} cp/100 partidas`}
                  tooltipText="Cambio en ACPL por cada 100 partidas. Valores negativos indican mejora."
                />
                <div className="mt-2">
                  <Progress value={Math.min(Math.abs(metrics.performance.trend_acpl) / 10, 100)} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.performance.trend_acpl < -50
                      ? "Mejora significativa"
                      : metrics.performance.trend_acpl < 0
                        ? "Mejora gradual"
                        : metrics.performance.trend_acpl < 50
                          ? "Estable"
                          : "Empeoramiento"}
                  </p>
                </div>
              </div>

              <div>
                <MetricDisplay
                  title="Tendencia Match Rate"
                  value={`${formatNumber(metrics.performance.trend_match_rate * 100)}%/100 partidas`}
                  tooltipText="Cambio en tasa de coincidencia por cada 100 partidas."
                />
                <div className="mt-2">
                  <Progress
                    value={Math.min(Math.abs(metrics.performance.trend_match_rate) * 1000, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.performance.trend_match_rate > 0.05
                      ? "Aumento significativo"
                      : metrics.performance.trend_match_rate > 0
                        ? "Aumento gradual"
                        : metrics.performance.trend_match_rate > -0.05
                          ? "Estable"
                          : "Disminución"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Evaluación de Tendencia</p>
                  <div
                    className={`text-2xl font-bold ${
                      metrics.performance.trend_acpl < -100 && metrics.performance.trend_match_rate > 0.02
                        ? "text-red-400"
                        : metrics.performance.trend_acpl < -50
                          ? "text-orange-400"
                          : "text-green-400"
                    }`}
                  >
                    {metrics.performance.trend_acpl < -100 && metrics.performance.trend_match_rate > 0.02
                      ? "⚠️ Sospechoso"
                      : metrics.performance.trend_acpl < -50
                        ? "📈 Mejorando"
                        : "✅ Normal"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10 mb-8">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-32 bg-gray-700" />
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
              <div>
                <Skeleton className="h-6 w-40 mb-1 bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24 bg-gray-700" />
            <Skeleton className="h-8 w-24 bg-gray-700" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-32 rounded-lg bg-gray-800" />
          <Skeleton className="h-32 rounded-lg bg-gray-800" />
          <Skeleton className="h-32 rounded-lg bg-gray-800" />
          <Skeleton className="h-32 rounded-lg bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-96 lg:col-span-2 rounded-lg bg-gray-800" />
          <Skeleton className="h-96 rounded-lg bg-gray-800" />
        </div>
      </main>
    </div>
  )
}

export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsPage />
    </Suspense>
  )
}

function ResultsPage() {
  const searchParams = useSearchParams()
  const username = searchParams.get("user")

  if (!username) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No se especificó un jugador</h2>
        <p className="text-gray-400">Por favor, vuelve y selecciona un jugador para ver el análisis.</p>
      </div>
    )
  }

  return <ResultsPageContent username={username} />
}
