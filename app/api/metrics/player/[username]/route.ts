import { type NextRequest, NextResponse } from "next/server"

// Use a specific env var for the Python backend, with a fallback
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL ?? "https://8a4f-87-221-57-241.ngrok-free.app/"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const backendUrl = `${PYTHON_BACKEND_URL.replace(/\/$/, "")}/metrics/player/${username}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "NextJS-API-Route",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend error response from ${backendUrl}: ${errorText}`)

      if (response.status === 404) {
        return NextResponse.json({ error: `Player '${username}' not found or not analyzed yet` }, { status: 404 })
      }

      return NextResponse.json(
        {
          error: `Backend error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in API route /api/metrics/player/[username]:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout - backend may be slow or unavailable" }, { status: 408 })
    }

    if (error.message?.includes("fetch")) {
      return NextResponse.json({ error: "Unable to connect to backend server" }, { status: 503 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
