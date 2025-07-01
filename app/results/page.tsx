"use client"

import { CardDescription } from "@/components/ui/card"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, Clock, Target, Zap } from "lucide-react"
import Link from "next/link"
import { fetchPlayerMetrics } from "@/lib/chess-api"
import { MetricDisplay } from "./components/metric-display"
import ResultsLoading from "./loading"
import { formatNumber, getRiskColor, getPercentileColor, getPercentileDescription } from "@/lib/helpers"

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

function ResultsContent() {
  const searchParams = useSearchParams()
  const username = searchParams.get("user")

  const {
    data: playerData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["playerMetrics", username],
    queryFn: () => fetchPlayerMetrics(username!),
    enabled: !!username,
  })

  if (!username) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Player Selected</h1>
          <p className="text-gray-400 mb-6">Please select a player to view their analysis results.</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <ResultsLoading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Error Loading Results</h1>
          <p className="text-gray-400 mb-6">{error.message}</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-gray-600 hover:bg-gray-700 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold">{username}</h1>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                  Analysis Complete
                </Badge>
              </div>
              <p className="text-gray-400">Comprehensive analysis of {playerData?.total_games || 0} games</p>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricDisplay
              title="Opening Entropy"
              value={playerData?.metrics?.opening_entropy || 0}
              unit=""
              description="Diversity in opening choices"
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <MetricDisplay
              title="Move Timing"
              value={playerData?.metrics?.move_timing_consistency || 0}
              unit="%"
              description="Consistency in move timing"
              icon={<Clock className="w-5 h-5" />}
              color="purple"
            />
            <MetricDisplay
              title="Win/Loss Ratio"
              value={playerData?.metrics?.win_loss_ratio || 0}
              unit=""
              description="Overall performance ratio"
              icon={<Target className="w-5 h-5" />}
              color="green"
            />
            <MetricDisplay
              title="Comeback Rate"
              value={playerData?.metrics?.comeback_frequency || 0}
              unit="%"
              description="Frequency of dramatic turnarounds"
              icon={<Zap className="w-5 h-5" />}
              color="orange"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rating Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Opening Diversity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Time Usage Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics and Charts */}
          {/* First Block of Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {/* Icon for Metrics */}
                  Métricas de Calidad
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Indicadores de la calidad y consistencia del juego.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  label="Pérdida Media de Centipeones (ACPL)"
                  value={formatNumber(playerData?.metrics?.avg_acpl)}
                  tooltipText="Valor promedio perdido por jugadas subóptimas. Un valor bajo es mejor. Un ACPL muy bajo para el rating del jugador puede ser sospechoso."
                />
                <MetricDisplay
                  label="Desviación Estándar de ACPL"
                  value={formatNumber(playerData?.metrics?.std_acpl)}
                  tooltipText="Mide la consistencia. Valores muy bajos pueden indicar una uniformidad poco natural."
                />
                <MetricDisplay
                  label="Coincidencia con el Módulo"
                  value={`${formatNumber(playerData?.metrics?.avg_match_rate * 100)}%`}
                  tooltipText="Porcentaje promedio de jugadas que coinciden con la primera opción del módulo de análisis."
                />
                <MetricDisplay
                  label="Desviación Estándar de Coincidencia"
                  value={`${formatNumber(playerData?.metrics?.std_match_rate * 100)}%`}
                  tooltipText="Consistencia de la tasa de coincidencia. Una variabilidad baja puede ser una señal de alerta."
                />
                <MetricDisplay
                  label="Rating de Rendimiento Intrínseco (IPR)"
                  value={formatNumber(playerData?.metrics?.avg_ipr, 0)}
                  tooltipText="Rating ELO estimado basado en la calidad de las jugadas, usando el modelo de Regan."
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {/* Icon for Risk Factors */}
                  Factores de Riesgo
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Factores específicos que contribuyen a la puntuación de riesgo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(playerData?.metrics?.risk_factors || {}).length > 0 ? (
                  Object.entries(playerData?.metrics?.risk_factors || {}).map(([factor, value]) => (
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
                    value={`${formatNumber(playerData?.metrics?.confidence_level * 100, 0)}%`}
                    tooltipText="El nivel de confianza de la evaluación de riesgo, basado en los datos disponibles."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second Block of Metrics - Redesigned ROI Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {/* Icon for ROI */}
                  Análisis Longitudinal (ROI)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Métricas clave del rendimiento del jugador a lo largo del tiempo.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-700/30 rounded-lg">
                  {/* Icon for Mean ROI */}
                  <p className="text-sm text-gray-400 mb-1">ROI Medio</p>
                  <p className="text-5xl font-bold text-green-400">{formatNumber(playerData?.metrics?.roi_mean, 0)}</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-700/30 rounded-lg">
                  {/* Icon for Max ROI */}
                  <p className="text-sm text-gray-400 mb-1">ROI Máximo</p>
                  <p className="text-5xl font-bold text-blue-400">{formatNumber(playerData?.metrics?.roi_max, 0)}</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-700/30 rounded-lg">
                  {/* Icon for ROI Std */}
                  <p className="text-sm text-gray-400 mb-1">Desviación ROI</p>
                  <p className="text-5xl font-bold text-purple-400">{formatNumber(playerData?.metrics?.roi_std, 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {/* Icon for Trends */}
                  Tendencias
                </CardTitle>
                <CardDescription className="text-gray-400">Análisis de tendencias temporales.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <MetricDisplay
                    label="Tendencia ACPL"
                    value={`${formatNumber(playerData?.metrics?.trend_acpl)} cp/100 partidas`}
                    tooltipText="Cambio en ACPL por cada 100 partidas. Valores negativos indican mejora."
                  />
                  <div className="mt-2">
                    {/* Progress Bar for ACPL Trend */}
                    <p className="text-xs text-gray-500 mt-1">
                      {playerData?.metrics?.trend_acpl < -50
                        ? "Mejora significativa"
                        : playerData?.metrics?.trend_acpl < 0
                          ? "Mejora gradual"
                          : playerData?.metrics?.trend_acpl < 50
                            ? "Estable"
                            : "Empeoramiento"}
                    </p>
                  </div>
                </div>

                <div>
                  <MetricDisplay
                    label="Tendencia Match Rate"
                    value={`${formatNumber(playerData?.metrics?.trend_match_rate * 100)}%/100 partidas`}
                    tooltipText="Cambio en tasa de coincidencia por cada 100 partidas."
                  />
                  <div className="mt-2">
                    {/* Progress Bar for Match Rate Trend */}
                    <p className="text-xs text-gray-500 mt-1">
                      {playerData?.metrics?.trend_match_rate > 0.05
                        ? "Aumento significativo"
                        : playerData?.metrics?.trend_match_rate > 0
                          ? "Aumento gradual"
                          : playerData?.metrics?.trend_match_rate > -0.05
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
                        playerData?.metrics?.trend_acpl < -100 && playerData?.metrics?.trend_match_rate > 0.02
                          ? "text-red-400"
                          : playerData?.metrics?.trend_acpl < -50
                            ? "text-orange-400"
                            : "text-green-400"
                      }`}
                    >
                      {playerData?.metrics?.trend_acpl < -100 && playerData?.metrics?.trend_match_rate > 0.02
                        ? "⚠️ Sospechoso"
                        : playerData?.metrics?.trend_acpl < -50
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
                {/* Icon for Opening Patterns */}
                Patrones de Apertura
              </CardTitle>
              <CardDescription className="text-gray-400">Análisis del repertorio de aperturas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <MetricDisplay
                    label="Diversidad de Aperturas (Entropía)"
                    value={formatNumber(playerData?.metrics?.opening_entropy)}
                    tooltipText="Mide la diversidad del repertorio de aperturas usando la entropía de Shannon. Valores más altos indican mayor variedad."
                  />
                  {/* Progress Bar for Opening Entropy */}
                </div>
                <div className="space-y-2">
                  <MetricDisplay
                    label="Profundidad de Novedad"
                    value={formatNumber(playerData?.metrics?.novelty_depth)}
                    tooltipText="Profundidad promedio (en jugadas) donde el jugador se desvía de la teoría de aperturas conocida."
                  />
                  {/* Progress Bar for Novelty Depth */}
                </div>
                <div className="space-y-2">
                  <MetricDisplay
                    label="Amplitud de Aperturas"
                    value={playerData?.metrics?.opening_breadth}
                    tooltipText="Número de aperturas diferentes (identificadas por su código ECO) jugadas."
                  />
                  {/* Progress Bar for Opening Breadth */}
                </div>
                <div className="space-y-2">
                  <MetricDisplay
                    label="Tasa de 2ª/3ª Opción"
                    value={`${formatNumber(playerData?.metrics?.second_choice_rate * 100)}%`}
                    tooltipText="Frecuencia con la que el jugador elige jugadas que son la segunda o tercera mejor opción del módulo, lo cual puede ser un comportamiento humano natural."
                  />
                  {/* Progress Bar for Second Choice Rate */}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Block of Metrics */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {/* Icon for Phase Quality */}
                Calidad por Fase de Juego
              </CardTitle>
              <CardDescription className="text-gray-400">
                Análisis del rendimiento (ACPL) en cada fase de la partida.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">ACPL por Fase de Juego</h4>
                {/* Bar Chart for ACPL by Phase */}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Distribución de Pérdidas por Fase</h4>
                  {/* Pie Chart for Loss Distribution by Phase */}
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Tasa de Errores Graves</h4>
                  {/* Pie Chart for Blunder Rate */}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricDisplay
                  label="ACPL en Apertura"
                  value={formatNumber(playerData?.metrics?.opening_acpl)}
                  tooltipText="Pérdida media de centipeones durante la fase de apertura."
                />
                <MetricDisplay
                  label="ACPL en Medio Juego"
                  value={formatNumber(playerData?.metrics?.middlegame_acpl)}
                  tooltipText="Pérdida media de centipeones durante el medio juego."
                />
                <MetricDisplay
                  label="ACPL en Final"
                  value={formatNumber(playerData?.metrics?.endgame_acpl)}
                  tooltipText="Pérdida media de centipeones durante la fase final de la partida."
                />
                <MetricDisplay
                  label="Tasa de Errores Graves"
                  value={`${formatNumber(playerData?.metrics?.blunder_rate * 100)}%`}
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
                  {/* Icon for Time Management */}
                  Gestión del Tiempo
                </CardTitle>
                <CardDescription className="text-gray-400">Análisis de los patrones de uso del tiempo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  label="Tiempo Medio por Jugada"
                  value={`${formatNumber(playerData?.metrics?.mean_move_time)}s`}
                  tooltipText="Tiempo promedio en segundos que el jugador tarda en realizar una jugada."
                />
                <MetricDisplay
                  label="Varianza del Tiempo"
                  value={formatNumber(playerData?.metrics?.time_variance)}
                  tooltipText="Mide la variabilidad en el tiempo de reflexión. Una varianza baja puede ser sospechosa."
                />
                <MetricDisplay
                  label="Puntuación de Uniformidad"
                  value={formatNumber(playerData?.metrics?.uniformity_score)}
                  tooltipText="Un score que mide qué tan uniforme es el tiempo de respuesta. Valores negativos son más naturales, valores positivos altos son sospechosos."
                />
                <MetricDisplay
                  label="Picos de Lag"
                  value={playerData?.metrics?.lag_spike_count}
                  tooltipText="Número de veces que el jugador tarda mucho en una jugada y luego realiza la siguiente muy rápido, un posible patrón de consulta a un módulo."
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {/* Icon for Clutch Accuracy */}
                  Precisión Bajo Presión (Clutch)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Rendimiento en momentos críticos de la partida.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  label="Diferencia Media en 'Clutch'"
                  value={formatNumber(playerData?.metrics?.avg_clutch_diff)}
                  tooltipText="Diferencia promedio en la evaluación de la posición en los momentos finales y críticos de la partida. Los humanos tienden a empeorar, no a mejorar."
                />
                <MetricDisplay
                  label="Porcentaje de Partidas 'Clutch'"
                  value={`${formatNumber(playerData?.metrics?.clutch_games_pct * 100)}%`}
                  tooltipText="Porcentaje de partidas donde el jugador mostró una precisión inusualmente alta en situaciones de alta presión."
                />
              </CardContent>
            </Card>
          </div>

          {/* Fifth Block - Benchmarking */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                {/* Icon for Benchmarking */}
                Benchmarking vs Pares
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
                    <span
                      className={`text-lg font-bold ${getPercentileColor(playerData?.metrics?.percentile_acpl || 0)}`}
                    >
                      Percentil {playerData?.metrics?.percentile_acpl || 0}
                    </span>
                  </div>
                  {/* Progress Bar for ACPL Percentile */}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Peor</span>
                    <span className={getPercentileColor(playerData?.metrics?.percentile_acpl || 0)}>
                      {getPercentileDescription(playerData?.metrics?.percentile_acpl || 0)}
                    </span>
                    <span>Mejor</span>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Interpretación:</strong>{" "}
                      {playerData?.metrics?.percentile_acpl >= 90
                        ? "Su ACPL está en el top 10% - excepcionalmente bajo para su nivel. Esto puede ser sospechoso."
                        : playerData?.metrics?.percentile_acpl >= 75
                          ? "Su ACPL está por encima del promedio de jugadores similares."
                          : playerData?.metrics?.percentile_acpl >= 25
                            ? "Su ACPL está dentro del rango normal para jugadores de su nivel."
                            : "Su ACPL está por debajo del promedio, lo cual es típico para jugadores en desarrollo."}
                    </p>
                  </div>
                </div>

                {/* Entropy Percentile */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Diversidad de Aperturas</h4>
                    <span
                      className={`text-lg font-bold ${getPercentileColor(playerData?.metrics?.percentile_entropy || 0)}`}
                    >
                      Percentil {playerData?.metrics?.percentile_entropy || 0}
                    </span>
                  </div>
                  {/* Progress Bar for Entropy Percentile */}
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Menos Diverso</span>
                    <span className={getPercentileColor(playerData?.metrics?.percentile_entropy || 0)}>
                      {getPercentileDescription(playerData?.metrics?.percentile_entropy || 0)}
                    </span>
                    <span>Más Diverso</span>
                  </div>
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Interpretación:</strong>{" "}
                      {playerData?.metrics?.percentile_entropy >= 75
                        ? "Tiene un repertorio de aperturas muy diverso comparado con sus pares."
                        : playerData?.metrics?.percentile_entropy >= 25
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
                      playerData?.metrics?.peer_delta_acpl > 0
                        ? `+${formatNumber(playerData?.metrics?.peer_delta_acpl)} (peor)`
                        : `${formatNumber(playerData?.metrics?.peer_delta_acpl)} (mejor)`
                    }
                    tooltipText="Diferencia en ACPL comparado con jugadores de ELO similar. Valores negativos indican mejor rendimiento."
                  />
                  <MetricDisplay
                    label="Diferencia en Coincidencia vs Pares"
                    value={
                      playerData?.metrics?.peer_delta_match > 0
                        ? `+${formatNumber(playerData?.metrics?.peer_delta_match * 100)}% (mayor)`
                        : `${formatNumber(playerData?.metrics?.peer_delta_match * 100)}% (menor)`
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
                <CardTitle className="text-white">Análisis Táctico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  label="Rachas de Precisión"
                  value={playerData?.metrics?.precision_burst_count || "N/A"}
                  tooltipText="Número de rachas de jugadas casi perfectas (>95% de precisión). Muchas rachas pueden indicar uso de asistencia."
                />
                <MetricDisplay
                  label="Tasa de 2ª/3ª Opción Táctica"
                  value={
                    playerData?.metrics?.second_choice_rate
                      ? `${formatNumber(playerData?.metrics?.second_choice_rate * 100)}%`
                      : "N/A"
                  }
                  tooltipText="Frecuencia de elección de líneas secundarias del módulo en posiciones tácticas. Los humanos tienden a elegir más líneas secundarias."
                />
                <div className="pt-4 border-t border-gray-700">
                  <MetricDisplay
                    label="Puntuación de Selectividad"
                    value={`${formatNumber(playerData?.metrics?.selectivity_score)}%`}
                    tooltipText="Porcentaje de partidas donde la calidad está por encima de la mediana personal. Mide la consistencia del rendimiento."
                  />
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <MetricDisplay
                    label="Racha Más Larga (ROI > 2.75)"
                    value={`${playerData?.metrics?.longest_streak} partidas`}
                    tooltipText="Racha más larga de partidas consecutivas con ROI superior a 2.75 (umbral estadístico de rendimiento excepcional)."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Análisis de Finales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MetricDisplay
                  label="Eficiencia de Conversión"
                  value={`${playerData?.metrics?.conversion_efficiency}%`}
                  tooltipText="Porcentaje de finales ganadores que se convierten exitosamente en victoria. Una eficiencia muy alta puede ser sospechosa."
                />
                <MetricDisplay
                  label="Coincidencia con Tablebases"
                  value={
                    playerData?.metrics?.tb_match_rate
                      ? `${formatNumber(playerData?.metrics?.tb_match_rate * 100)}%`
                      : "N/A"
                  }
                  tooltipText="Porcentaje de coincidencia con las tablebases Syzygy en finales de pocas piezas. Una coincidencia perfecta es sospechosa."
                />
                <MetricDisplay
                  label="Desviación DTZ"
                  value={playerData?.metrics?.dtz_deviation ? formatNumber(playerData?.metrics?.dtz_deviation) : "N/A"}
                  tooltipText="Desviación promedio en Distance-to-Zero (jugadas para mate/tablas). Valores muy bajos indican juego perfecto."
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Resumen del Análisis</CardTitle>
              <CardDescription className="text-gray-400">
                Evaluación integral basada en todas las métricas analizadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getRiskColor(playerData?.metrics?.risk_score || 0)}`}>
                    {formatNumber(playerData?.metrics?.risk_score, 0)}/100
                  </div>
                  <p className="text-sm text-gray-400">Puntuación de Riesgo Final</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-blue-400">{playerData?.total_games || 0}</div>
                  <p className="text-sm text-gray-400">Partidas Analizadas</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-purple-400">
                    {playerData?.metrics?.suspicious_games_count || 0}
                  </div>
                  <p className="text-sm text-gray-400">Partidas Sospechosas</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-300 leading-relaxed">
                  <strong>Conclusión:</strong>{" "}
                  {playerData?.metrics?.risk_score >= 75
                    ? "El análisis indica un riesgo ALTO de uso de asistencia externa. Se recomienda una investigación más detallada."
                    : playerData?.metrics?.risk_score >= 50
                      ? "El análisis indica un riesgo MODERADO. Algunos patrones requieren atención adicional."
                      : playerData?.metrics?.risk_score >= 25
                        ? "El análisis indica un riesgo BAJO. Los patrones están dentro de rangos normales con algunas anomalías menores."
                        : "El análisis indica un riesgo MUY BAJO. Los patrones de juego son consistentes con comportamiento humano natural."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<ResultsLoading />}>
        <ResultsContent />
      </Suspense>
    </QueryClientProvider>
  )
}
