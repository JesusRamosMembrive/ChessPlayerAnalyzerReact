"use client"
import { useEffect, useState } from "react"
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
  BrainCircuit,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import type { PlayerMetricsDetail } from "@/lib/types"
import { MetricDisplay } from "./components/metric-display"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function AnalysisResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedUser = searchParams.get("user")

  const [metrics, setMetrics] = useState<PlayerMetricsDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedUser) {
      router.push("/")
      return
    }

    const fetchMetrics = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/metrics/player/${selectedUser}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch player metrics")
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
  }, [selectedUser, router])

  if (isLoading) {
    return <ResultsSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error al cargar los datos</h2>
        <p className="text-gray-400 mb-6">{error}</p>
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

        {/* First Block of Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BrainCircuit className="mr-2 text-blue-400" /> Métricas de Calidad
              </CardTitle>
              <CardDescription className="text-gray-400">
                Indicadores de la calidad y consistencia del juego.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricDisplay
                label="Pérdida Media de Centipeones (ACPL)"
                value={formatNumber(metrics.avg_acpl)}
                tooltipText="Valor promedio perdido por jugadas subóptimas. Un valor bajo es mejor. Un ACPL muy bajo para el rating del jugador puede ser sospechoso."
              />
              <MetricDisplay
                label="Desviación Estándar de ACPL"
                value={formatNumber(metrics.std_acpl)}
                tooltipText="Mide la consistencia. Valores muy bajos pueden indicar una uniformidad poco natural."
              />
              <MetricDisplay
                label="Coincidencia con el Módulo"
                value={`${formatNumber(metrics.avg_match_rate * 100)}%`}
                tooltipText="Porcentaje promedio de jugadas que coinciden con la primera opción del módulo de análisis."
              />
              <MetricDisplay
                label="Desviación Estándar de Coincidencia"
                value={`${formatNumber(metrics.std_match_rate * 100)}%`}
                tooltipText="Consistencia de la tasa de coincidencia. Una variabilidad baja puede ser una señal de alerta."
              />
              <MetricDisplay
                label="Rating de Rendimiento Intrínseco (IPR)"
                value={formatNumber(metrics.avg_ipr, 0)}
                tooltipText="Rating ELO estimado basado en la calidad de las jugadas, usando el modelo de Regan."
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShieldCheck className="mr-2 text-red-400" /> Factores de Riesgo
              </CardTitle>
              <CardDescription className="text-gray-400">
                Factores específicos que contribuyen a la puntuación de riesgo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(metrics.risk.risk_factors).length > 0 ? (
                Object.entries(metrics.risk.risk_factors).map(([factor, value]) => (
                  <div key={factor} className="flex items-center justify-between">
                    <p className="text-sm text-gray-300 capitalize">{factor.replace(/_/g, " ")}</p>
                    <p className="text-sm font-semibold text-red-400">{formatNumber(value * 100, 0)}%</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No se detectaron factores de riesgo específicos.
                </p>
              )}
              <div className="pt-4 border-t border-gray-700">
                <MetricDisplay
                  label="Nivel de Confianza"
                  value={`${formatNumber(metrics.risk.confidence_level * 100, 0)}%`}
                  tooltipText="El nivel de confianza de la evaluación de riesgo, basado en los datos disponibles."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>Más secciones de análisis detallado próximamente...</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg bg-gray-800" />
          <Skeleton className="h-64 rounded-lg bg-gray-800" />
        </div>
      </main>
    </div>
  )
}
