export interface AnalyzePlayerResponse {
  task_id: string
  message: string
  username: string
}

export async function analyzePlayer(username: string): Promise<AnalyzePlayerResponse> {
  const response = await fetch(`/api/players/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchPlayerMetrics(username: string) {
  const response = await fetch(`/api/metrics/player/${username}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchPlayers() {
  const response = await fetch("/api/players")

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}
