"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { PlayerListItemSchema, type PlayerListItem } from "@/lib/types"
import { useProgressPolling } from "@/hooks/useProgressPolling"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { History, User, Calendar, RefreshCw, AlertCircle, Trash2, Square } from "lucide-react"

interface PlayersListProps {
  onError?: (error: any) => void
  onPlayerClick?: (username: string) => void
  onPlayerAdded?: (player: PlayerListItem) => void
}

export function PlayersList({ onError, onPlayerAdded }: PlayersListProps) {
  const [players, setPlayers] = useState<PlayerListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingPlayer, setLoadingPlayer] = useState<string | null>(null)
  const [deletingPlayer, setDeletingPlayer] = useState<string | null>(null)
  const [stoppingPlayer, setStoppingPlayer] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Use progress polling hook
  const { isPolling } = useProgressPolling({ players, setPlayers })

  // Function to add a new player to the list
  const addPlayer = (newPlayer: PlayerListItem) => {
    setPlayers((currentPlayers) => {
      // Check if player already exists
      const exists = currentPlayers.some((p) => p.username === newPlayer.username)
      if (exists) {
        // Update existing player
        return currentPlayers.map((p) => (p.username === newPlayer.username ? { ...p, ...newPlayer } : p))
      }
      // Add new player at the beginning
      return [newPlayer, ...currentPlayers]
    })
    onPlayerAdded?.(newPlayer)
  }

  // Expose addPlayer function globally so it can be called from parent
  useEffect(() => {
    // Store the function in a global reference that can be accessed
    if (typeof window !== "undefined") {
      ;(window as any).addPlayerToList = addPlayer
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).addPlayerToList
      }
    }
  }, [])

  const fetchPlayers = async (showToast = true) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching players from API...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch("/api/players", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API error response:", errorData)

        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Received data:", data)

      // Handle empty array
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected array")
      }

      if (data.length === 0) {
        setPlayers([])
        setError(null)
        return
      }

      // Validate and parse the data
      try {
        const validatedPlayers = PlayerListItemSchema.array().parse(data)
        setPlayers(validatedPlayers)
        setError(null)

        if (showToast && retryCount > 0) {
          toast({
            title: "Connection Restored",
            description: "Successfully loaded players",
          })
        }
      } catch (validationError) {
        console.error("Data validation error:", validationError)
        // Still show the data even if validation fails, but log the error
        setPlayers(data)
        setError(null)
      }
    } catch (error: any) {
      console.error("Failed to fetch players:", error)

      let errorMessage = "Failed to load players"

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        errorMessage = "Request timed out - backend may be slow or unavailable"
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error - unable to connect to API"
      } else if (error.message?.includes("backend")) {
        errorMessage = error.message
      } else {
        errorMessage = error.message || "Unknown error occurred"
      }

      setError(errorMessage)
      setPlayers([])

      if (showToast) {
        toast({
          title: "Error Loading Players",
          description: errorMessage,
          variant: "destructive",
        })
      }

      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerClick = async (username: string) => {
    if (loadingPlayer === username) return // Prevent double clicks

    // Check if player exists and if it's still being analyzed
    const player = players.find((p) => p.username === username)
    if (player && player.status === "pending") {
      toast({
        title: "Player Still Analyzing",
        description: `${username} is still being analyzed (${Math.round(player.progress || 0)}% complete). Please wait until analysis is complete.`,
        variant: "default",
      })
      return
    }

    try {
      setLoadingPlayer(username)
      console.log(`Fetching metrics for player: ${username}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`/api/metrics/player/${username}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Player metrics API error:", errorData)

        // Check if this is a 404 error (player not found)
        if (response.status === 404) {
          throw new Error(`Player '${username}' not found or not analyzed yet`)
        }

        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      const playerData = await response.json()
      console.log("Player metrics received:", playerData)

      // Navigate to results page with the username
      router.push(`/results?user=${username}`)
    } catch (error: any) {
      console.error(`Failed to fetch player metrics for ${username}:`, error)

      let errorMessage = "Failed to load player data"
      let variant: "default" | "destructive" = "destructive"

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        errorMessage = "Request timed out - player data may be loading"
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error - unable to connect to API"
      } else if (error.message?.includes("not found or not analyzed yet")) {
        errorMessage = `${username} has not been fully analyzed yet. Please try again later.`
        variant = "default" // Less alarming for this expected case
      } else {
        errorMessage = error.message || "Unknown error occurred"
      }

      toast({
        title: "Error Loading Player",
        description: errorMessage,
        variant: variant,
      })
    } finally {
      setLoadingPlayer(null)
    }
  }

  const handleStopAnalysis = async (username: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering player click

    if (stoppingPlayer === username) return // Prevent double click

    try {
      setStoppingPlayer(username)
      console.log(`Stopping analysis for player: ${username}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`/api/players/${username}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "stop" }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Stop analysis API error:", errorData)
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Remove the player from the list after stopping analysis
      setPlayers((prevPlayers) => prevPlayers.filter((player) => player.username !== username))

      toast({
        title: "Analysis Stopped",
        description: `Analysis for ${username} has been stopped and removed`,
      })
    } catch (error: any) {
      console.error(`Failed to stop analysis for ${username}:`, error)

      let errorMessage = "Failed to stop analysis"

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        errorMessage = "Request timeout - server may be slow"
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Network error - unable to connect to API"
      } else {
        errorMessage = error.message || "Unknown error occurred"
      }

      toast({
        title: "Error Stopping Analysis",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setStoppingPlayer(null)
    }
  }

  const handleDeletePlayer = async (username: string, event: React.MouseEvent) => {
    event.stopPropagation() // Evitar que se active el click del jugador

    if (deletingPlayer === username) return // Prevenir doble click

    try {
      setDeletingPlayer(username)
      console.log(`Deleting player: ${username}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`/api/players/${username}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Delete player API error:", errorData)
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Actualizar la lista eliminando el jugador
      setPlayers((prevPlayers) => prevPlayers.filter((player) => player.username !== username))

      toast({
        title: "Jugador eliminado",
        description: `El jugador ${username} ha sido eliminado exitosamente`,
      })
    } catch (error: any) {
      console.error(`Failed to delete player ${username}:`, error)

      let errorMessage = "Error al eliminar jugador"

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        errorMessage = "Tiempo de espera agotado - el servidor puede estar lento"
      } else if (error.message?.includes("Failed to fetch")) {
        errorMessage = "Error de red - no se pudo conectar a la API"
      } else {
        errorMessage = error.message || "Error desconocido"
      }

      toast({
        title: "Error al eliminar jugador",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setDeletingPlayer(null)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchPlayers(true)
  }

  useEffect(() => {
    fetchPlayers(false)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
            Pending
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
            Ready
          </Badge>
        )
      case "error":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
            Error
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <History className="w-5 h-5" />
            <span>Analyzed Players</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Skeleton loader */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-24"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Analyzed Players</span>
            {isPolling && (
              <div className="flex items-center space-x-1 text-xs text-yellow-400">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-400"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="text-white border-gray-600 hover:bg-gray-700 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-medium mb-2 text-red-400">Connection Error</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <div className="space-y-2 text-xs text-gray-500">
              <p>This usually means:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The backend server is not running</li>
                <li>The server URL has changed</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="mt-4 text-white border-gray-600 hover:bg-gray-700 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No players analyzed</p>
            <p className="text-sm">Start analyzing a player to see results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player) => {
              // Create a unique key that includes progress to force re-render
              const progressKey = `${player.username}-${player.progress || 0}-${player.status}-${player._updateId || ""}`

              return (
                <div
                  key={progressKey}
                  className={`flex items-center justify-between p-4 bg-gray-700/50 rounded-lg transition-colors cursor-pointer ${
                    loadingPlayer === player.username ? "opacity-50 cursor-wait" : "hover:bg-gray-700"
                  }`}
                  onClick={() => handlePlayerClick(player.username)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{player.username[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-white truncate">{player.username}</p>
                        {getStatusBadge(player.status)}
                        {loadingPlayer === player.username && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                      </div>

                      {/* Progress bar for pending status */}
                      {player.status === "pending" && player.progress !== undefined && (
                        <div className="mb-2">
                          <Progress
                            key={`progress-${progressKey}`}
                            value={Math.max(0, Math.min(100, player.progress))}
                            className="h-2"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {Math.round(Math.max(0, Math.min(100, player.progress)))}% complete
                            {player.done_games && player.total_games && (
                              <span className="ml-2">
                                ({player.done_games}/{player.total_games} games)
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        {player.total_games && (
                          <span className="flex items-center space-x-1">
                            <span>Games: {player.total_games}</span>
                          </span>
                        )}

                        {player.done_games && (
                          <span className="flex items-center space-x-1">
                            <span>Done: {player.done_games}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right text-xs text-gray-400">
                      {player.finished_at ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Finished: {formatDate(player.finished_at)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Started: {formatDate(player.requested_at || "")}</span>
                        </div>
                      )}
                    </div>

                    {/* Botón de parar análisis (solo para status pending) */}
                    {player.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                            disabled={stoppingPlayer === player.username}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {stoppingPlayer === player.username ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Parar análisis?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Esta acción parará el análisis en curso de <strong>{player.username}</strong> y eliminará
                              el jugador de la lista. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => handleStopAnalysis(player.username, e)}
                              className="bg-orange-600 text-white hover:bg-orange-700"
                            >
                              Parar Análisis
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {/* Botón de borrar con confirmación (solo para status ready o error) */}
                    {(player.status === "ready" || player.status === "error") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            disabled={deletingPlayer === player.username}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deletingPlayer === player.username ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Eliminar jugador?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Esta acción eliminará permanentemente el análisis de <strong>{player.username}</strong>.
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => handleDeletePlayer(player.username, e)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
