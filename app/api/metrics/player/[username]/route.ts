import { type NextRequest, NextResponse } from "next/server"

const API_URL = " https://6170-87-221-57-241.ngrok-free.app"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Fetching metrics for player: ${username}`)
    console.log(`API URL: ${API_URL}`)

    const backendUrl = `${API_URL.replace(/\/$/, "")}/metrics/player/${username}`
    console.log(`Full backend URL: ${backendUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Add ngrok-specific headers to bypass browser warnings
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "NextJS-API-Route",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend error response: ${errorText}`)

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
    console.log(`Player metrics data received:`, data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching player metrics:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout - backend may be slow or unavailable" }, { status: 408 })
    }

    if (error.message?.includes("fetch")) {
      return NextResponse.json({ error: "Unable to connect to backend server" }, { status: 503 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
