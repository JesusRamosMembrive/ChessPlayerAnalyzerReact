import { z } from "zod"
import {
  PlayerMetricsDetailSchema as PlayerMetricsSchema,
  type PlayerMetricsDetail as PlayerMetrics,
} from "./types"

class ChessApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ChessApiError"
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function apiRequest<T>(endpoint: string, options: RequestInit & { schema?: z.ZodSchema<T> } = {}): Promise<T> {
  const { schema, ...fetchOptions } = options
  const url = `/api${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ChessApiError(errorData.detail || `HTTP ${response.status}`, response.status, errorData)
  }

  const data = await response.json()
  return schema ? schema.parse(data) : data
}

async function retryRequest<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) break
      if (error instanceof ChessApiError && error.status < 500) break

      const delay = baseDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }

  throw lastError!
}

export interface AnalysisResponse {
  task_id: string
  message: string
}

export async function getPlayer(username: string, signal?: AbortSignal): Promise<any> {
  return retryRequest(() =>
    apiRequest(`/players/${username}`, {
      signal,
    }),
  )
}

export async function analyzePlayer(username: string): Promise<AnalysisResponse> {
  console.log(`Starting analysis for player: ${username}`)
  
  const response = await fetch(`/api/players/${username}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Analysis API error:', errorData)
    
    throw new Error(
      errorData.error || 
      errorData.details || 
      `HTTP ${response.status}: ${response.statusText}`
    )
  }

  const data = await response.json()
  console.log('Analysis response:', data)
  
  return data
}

export async function refreshPlayer(username: string): Promise<{ task_id: string }> {
  return apiRequest(`/players/${username}/refresh`, {
    method: "POST",
    schema: z.object({ task_id: z.string() }),
  })
}

export async function resetPlayer(username: string): Promise<{ message: string }> {
  return apiRequest(`/players/${username}/reset`, {
    method: "POST",
    schema: z.object({ message: z.string() }),
  })
}

export async function deletePlayer(username: string): Promise<{ message: string }> {
  return apiRequest(`/players/${username}`, {
    method: "DELETE",
    schema: z.object({ message: z.string() }),
  })
}

export async function taskStatus(taskId: string, signal?: AbortSignal): Promise<any> {
  return retryRequest(() =>
    apiRequest(`/tasks/${taskId}`, {
      signal,
    }),
  )
}

export async function gameDetail(gameId: string, signal?: AbortSignal): Promise<any> {
  return retryRequest(() =>
    apiRequest(`/games/${gameId}`, {
      signal,
    }),
  )
}

export async function playerMetrics(username: string, signal?: AbortSignal): Promise<PlayerMetrics> {
  return retryRequest(() =>
    apiRequest(`/metrics/player/${username}`, {
      schema: PlayerMetricsSchema,
      signal,
    }),
  )
}

export async function gameMetrics(gameId: string, signal?: AbortSignal): Promise<any> {
  return retryRequest(() =>
    apiRequest(`/metrics/game/${gameId}`, {
      signal,
    }),
  )
}
