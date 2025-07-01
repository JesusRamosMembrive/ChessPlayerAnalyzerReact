"use client"
import { useEffect, useState, useMemo } from "react"
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
  BrainCircuit,
  BookOpen,
  LineChartIcon,
  Castle,
  Clock,
  Target,
  Users,
  Zap,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import type { PlayerMetricsDetail } from "@/lib/types"
import { MetricDisplay } from "./components/metric-display"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const RoiChart = dynamic(() => import("./components/roi-chart").then((mod) => mod.RoiChart), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <Skeleton className="h-full w-full bg-gray-700" />
    </div>
  ),
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

  const roiChartData = useMemo(() => {
    if (!metrics?.performance?.roi_curve) return []
    return metrics.performance.roi_curve.map((roi, index) => ({
      month: index + 1,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  label="Tendencia ACPL"
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
                  label="Tendencia Match Rate"
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

        {/* Patrones de Apertura - Now full width */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BookOpen className="mr-2 text-yellow-400" /> Patrones de Apertura
            </CardTitle>
            <CardDescription className="text-gray-400">Análisis del repertorio de aperturas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <MetricDisplay
                  label="Diversidad de Aperturas (Entropía)"
                  value={formatNumber(metrics.opening_patterns.mean_entropy)}
                  tooltipText="Mide la diversidad del repertorio de aperturas usando la entropía de Shannon. Valores más altos indican mayor variedad."
                />
                <Progress value={Math.min(Math.abs(metrics.opening_patterns.mean_entropy) * 20, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <MetricDisplay
                  label="Profundidad de Novedad"
                  value={formatNumber(metrics.opening_patterns.novelty_depth)}
                  tooltipText="Profundidad promedio (en jugadas) donde el jugador se desvía de la teoría de aperturas conocida."
                />
                <Progress value={Math.min(metrics.opening_patterns.novelty_depth * 10, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <MetricDisplay
                  label="Amplitud de Aperturas"
                  value={metrics.opening_patterns.opening_breadth}
                  tooltipText="Número de aperturas diferentes (identificadas por su código ECO) jugadas."
                />
                <Progress value={Math.min(metrics.opening_patterns.opening_breadth * 5, 100)} className="h-2" />
              </div>
              <div className="space-y-2">
                <MetricDisplay
                  label="Tasa de 2ª/3ª Opción"
                  value={`${formatNumber(metrics.opening_patterns.second_choice_rate * 100)}%`}
                  tooltipText="Frecuencia con la que el jugador elige jugadas que son la segunda o tercera mejor opción del módulo, lo cual puede ser un comportamiento humano natural."
                />
                <Progress value={metrics.opening_patterns.second_choice_rate * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Block of Metrics */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Castle className="mr-2 text-indigo-400" /> Calidad por Fase de Juego
            </CardTitle>
            <CardDescription className="text-gray-400">
              Análisis del rendimiento (ACPL) en cada fase de la partida.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={phaseQualityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="name" stroke="#ffffff" />
                  <YAxis stroke="#ffffff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000000",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="acpl" name="ACPL" fill="#818cf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <MetricDisplay
                label="ACPL en Apertura"
                value={formatNumber(metrics.phase_quality.opening_acpl)}
                tooltipText="Pérdida media de centipeones durante la fase de apertura."
              />
              <MetricDisplay
                label="ACPL en Medio Juego"
                value={formatNumber(metrics.phase_quality.middlegame_acpl)}
                tooltipText="Pérdida media de centipeones durante el medio juego."
              />
              <MetricDisplay
                label="ACPL en Final"
                value={formatNumber(metrics.phase_quality.endgame_acpl)}
                tooltipText="Pérdida media de centipeones durante la fase final de la partida."
              />
              <MetricDisplay
                label="Tasa de Errores Graves"
                value={`${formatNumber(metrics.phase_quality.blunder_rate * 100)}%`}
                tooltipText="Porcentaje de jugadas que son errores graves (pérdida de más de 300 centipeones)."
              />
            </div>
          </CardContent>
        </Card>

        {/* Fourth Block of Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-2 text-cyan-400" /> Gestión del Tiempo
              </CardTitle>
              <CardDescription className="text-gray-400">Análisis de los patrones de uso del tiempo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricDisplay
                label="Tiempo Medio por Jugada"
                value={`${formatNumber(metrics.time_management.mean_move_time)}s`}
                tooltipText="Tiempo promedio en segundos que el jugador tarda en realizar una jugada."
              />
              <MetricDisplay
                label="Varianza del Tiempo"
                value={formatNumber(metrics.time_management.time_variance)}
                tooltipText="Mide la variabilidad en el tiempo de reflexión. Una varianza baja puede ser sospechosa."
              />
              <MetricDisplay
                label="Puntuación de Uniformidad"
                value={formatNumber(metrics.time_management.uniformity_score)}
                tooltipText="Un score que mide qué tan uniforme es el tiempo de respuesta. Valores negativos son más naturales, valores positivos altos son sospechosos."
              />
              <MetricDisplay
                label="Picos de Lag"
                value={metrics.time_management.lag_spike_count}
                tooltipText="Número de veces que el jugador tarda mucho en una jugada y luego realiza la siguiente muy rápido, un posible patrón de consulta a un módulo."
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="mr-2 text-rose-400" /> Precisión Bajo Presión (Clutch)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Rendimiento en momentos críticos de la partida.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricDisplay
                label="Diferencia Media en 'Clutch'"
                value={formatNumber(metrics.clutch_accuracy.avg_clutch_diff)}
                tooltipText="Diferencia promedio en la evaluación de la posición en los momentos finales y críticos de la partida. Los humanos tienden a empeorar, no a mejorar."
              />
              <MetricDisplay
                label="Porcentaje de Partidas 'Clutch'"
                value={`${formatNumber(metrics.clutch_accuracy.clutch_games_pct * 100)}%`}
                tooltipText="Porcentaje de partidas donde el jugador mostró una precisión inusualmente alta en situaciones de alta presión."
              />
            </CardContent>
          </Card>
        </div>

        {/* Fifth Block - Benchmarking */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="mr-2 text-emerald-400" /> Benchmarking vs Pares
            </CardTitle>
            <CardDescription className="text-gray-400">
              Comparación con jugadores de ELO similar (±200 puntos).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ACPL Percentile */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Calidad de Juego (ACPL)</h4>
                  <span className={`text-lg font-bold ${getPercentileColor(metrics.benchmark.percentile_acpl)}`}>
                    Percentil {metrics.benchmark.percentile_acpl}
                  </span>
                </div>
                <Progress value={metrics.benchmark.percentile_acpl} className="h-3" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Peor</span>
                  <span className={getPercentileColor(metrics.benchmark.percentile_acpl)}>
                    {getPercentileDescription(metrics.benchmark.percentile_acpl)}
                  </span>
                  <span>Mejor</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Interpretación:</strong>{" "}
                    {metrics.benchmark.percentile_acpl >= 90
                      ? "Su ACPL está en el top 10% - excepcionalmente bajo para su nivel. Esto puede ser sospechoso."
                      : metrics.benchmark.percentile_acpl >= 75
                        ? "Su ACPL está por encima del promedio de jugadores similares."
                        : metrics.benchmark.percentile_acpl >= 25
                          ? "Su ACPL está dentro del rango normal para jugadores de su nivel."
                          : "Su ACPL está por debajo del promedio, lo cual es típico para jugadores en desarrollo."}
                  </p>
                </div>
              </div>

              {/* Entropy Percentile */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Diversidad de Aperturas</h4>
                  <span className={`text-lg font-bold ${getPercentileColor(metrics.benchmark.percentile_entropy)}`}>
                    Percentil {metrics.benchmark.percentile_entropy}
                  </span>
                </div>
                <Progress value={metrics.benchmark.percentile_entropy} className="h-3" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Menos Diverso</span>
                  <span className={getPercentileColor(metrics.benchmark.percentile_entropy)}>
                    {getPercentileDescription(metrics.benchmark.percentile_entropy)}
                  </span>
                  <span>Más Diverso</span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Interpretación:</strong>{" "}
                    {metrics.benchmark.percentile_entropy >= 75
                      ? "Tiene un repertorio de aperturas muy diverso comparado con sus pares."
                      : metrics.benchmark.percentile_entropy >= 25
                        ? "Su diversidad de aperturas está dentro del rango normal."
                        : "Tiende a jugar un repertorio más limitado de aperturas, lo cual puede ser una estrategia válida."}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison with Peers */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Comparación Directa con Pares</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricDisplay
                  label="Diferencia en ACPL vs Pares"
                  value={
                    metrics.peer_delta_acpl > 0
                      ? `+${formatNumber(metrics.peer_delta_acpl)} (peor)`
                      : `${formatNumber(metrics.peer_delta_acpl)} (mejor)`
                  }
                  tooltipText="Diferencia en ACPL comparado con jugadores de ELO similar. Valores negativos indican mejor rendimiento."
                />
                <MetricDisplay
                  label="Diferencia en Coincidencia vs Pares"
                  value={
                    metrics.peer_delta_match > 0
                      ? `+${formatNumber(metrics.peer_delta_match * 100)}% (mayor)`
                      : `${formatNumber(metrics.peer_delta_match * 100)}% (menor)`
                  }
                  tooltipText="Diferencia en tasa de coincidencia con el módulo comparado con jugadores similares. Valores muy altos pueden ser sospechosos."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sixth Block - Tactical Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="mr-2 text-amber-400" /> Análisis Táctico
              </CardTitle>
              <CardDescription className="text-gray-400">
                Patrones de precisión táctica y rachas de jugadas perfectas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricDisplay
                label="Rachas de Precisión"
                value={metrics.tactical.precision_burst_count || "N/A"}
                tooltipText="Número de rachas de jugadas casi perfectas (>95% de precisión). Muchas rachas pueden indicar uso de asistencia."
              />
              <MetricDisplay
                label="Tasa de 2ª/3ª Opción Táctica"
                value={
                  metrics.tactical.second_choice_rate
                    ? `${formatNumber(metrics.tactical.second_choice_rate * 100)}%`
                    : "N/A"
                }
                tooltipText="Frecuencia de elección de líneas secundarias del módulo en posiciones tácticas. Los humanos tienden a elegir más líneas secundarias."
              />
              <div className="pt-4 border-t border-gray-700">
                <MetricDisplay
                  label="Puntuación de Selectividad"
                  value={`${formatNumber(metrics.selectivity_score)}%`}
                  tooltipText="Porcentaje de partidas donde la calidad está por encima de la mediana personal. Mide la consistencia del rendimiento."
                />
              </div>
              <div className="pt-4 border-t border-gray-700">
                <MetricDisplay
                  label="Racha Más Larga (ROI > 2.75)"
                  value={`${metrics.longest_streak} partidas`}
                  tooltipText="Racha más larga de partidas consecutivas con ROI superior a 2.75 (umbral estadístico de rendimiento excepcional)."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Castle className="mr-2 text-violet-400" /> Análisis de Finales
              </CardTitle>
              <CardDescription className="text-gray-400">
                Eficiencia y precisión en la fase final de la partida.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricDisplay
                label="Eficiencia de Conversión"
                value={`${metrics.endgame.conversion_efficiency}%`}
                tooltipText="Porcentaje de finales ganadores que se convierten exitosamente en victoria. Una eficiencia muy alta puede ser sospechosa."
              />
              <MetricDisplay
                label="Coincidencia con Tablebases"
                value={metrics.endgame.tb_match_rate ? `${formatNumber(metrics.endgame.tb_match_rate * 100)}%` : "N/A"}
                tooltipText="Porcentaje de coincidencia con las tablebases Syzygy en finales de pocas piezas. Una coincidencia perfecta es sospechosa."
              />
              <MetricDisplay
                label="Desviación DTZ"
                value={metrics.endgame.dtz_deviation ? formatNumber(metrics.endgame.dtz_deviation) : "N/A"}
                tooltipText="Desviación promedio en Distance-to-Zero (jugadas para mate/tablas). Valores muy bajos indican juego perfecto."
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <ShieldCheck className="mr-2 text-blue-400" /> Resumen del Análisis
            </CardTitle>
            <CardDescription className="text-gray-400">
              Evaluación integral basada en todas las métricas analizadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${riskScoreColor}`}>
                  {formatNumber(metrics.risk.risk_score, 0)}/100
                </div>
                <p className="text-sm text-gray-400">Puntuación de Riesgo Final</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-blue-400">{metrics.games_analyzed}</div>
                <p className="text-sm text-gray-400">Partidas Analizadas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-purple-400">{metrics.risk.suspicious_games_count}</div>
                <p className="text-sm text-gray-400">Partidas Sospechosas</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300 leading-relaxed">
                <strong>Conclusión:</strong>{" "}
                {metrics.risk.risk_score >= 75
                  ? "El análisis indica un riesgo ALTO de uso de asistencia externa. Se recomienda una investigación más detallada."
                  : metrics.risk.risk_score >= 50
                    ? "El análisis indica un riesgo MODERADO. Algunos patrones requieren atención adicional."
                    : metrics.risk.risk_score >= 25
                      ? "El análisis indica un riesgo BAJO. Los patrones están dentro de rangos normales con algunas anomalías menores."
                      : "El análisis indica un riesgo MUY BAJO. Los patrones de juego son consistentes con comportamiento humano natural."}
              </p>
            </div>
          </CardContent>
        </Card>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-64 rounded-lg bg-gray-800" />
          <Skeleton className="h-64 rounded-lg bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-80 lg:col-span-2 rounded-lg bg-gray-800" />
          <Skeleton className="h-80 rounded-lg bg-gray-800" />
        </div>
        <Skeleton className="h-80 rounded-lg bg-gray-800 mb-8" />
        <Skeleton className="h-80 rounded-lg bg-gray-800 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-56 rounded-lg bg-gray-800" />
          <Skeleton className="h-56 rounded-lg bg-gray-800" />
        </div>
        <Skeleton className="h-96 rounded-lg bg-gray-800 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-64 rounded-lg bg-gray-800" />
          <Skeleton className="h-64 rounded-lg bg-gray-800" />
        </div>
        <Skeleton className="h-64 rounded-lg bg-gray-800" />
      </main>
    </div>
  )
}
