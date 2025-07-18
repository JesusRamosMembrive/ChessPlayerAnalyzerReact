import { type NextRequest, NextResponse } from "next/server"
import { API_URL } from "../../../constants"

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Fetching player info: ${username}`)

    const backendUrl = `${API_URL.replace(/\/$/, "")}/players/${username}`
    console.log(`Full backend URL: ${backendUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

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

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend error response: ${errorText}`)

      if (response.status === 404) {
        return NextResponse.json({ error: `Player '${username}' not found` }, { status: 404 })
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
    console.log(`Player info received:`, data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching player info:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 408 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Starting analysis for player: ${username}`)

    const backendUrl = `${API_URL.replace(/\/$/, "")}/players/${username}`
    console.log(`Full backend URL: ${backendUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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
        return NextResponse.json({ error: `Player '${username}' not found` }, { status: 404 })
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
    console.log(`Analysis started for ${username}:`, data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error starting analysis:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout - backend may be slow or unavailable" }, { status: 408 })
    }

    if (error.message?.includes("fetch")) {
      return NextResponse.json({ error: "Unable to connect to backend server" }, { status: 503 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Deleting player: ${username}`)
    console.log(`API URL: ${API_URL}`)

    const backendUrl = `${API_URL.replace(/\/$/, "")}/players/${username}`
    console.log(`Full backend URL: ${backendUrl}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(backendUrl, {
      method: "DELETE",
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
        return NextResponse.json({ error: `Player '${username}' not found` }, { status: 404 })
      }

      return NextResponse.json(
        {
          error: `Backend error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Handle 204 No Content (successful deletion with no response body)
    if (response.status === 204) {
      console.log(`Player '${username}' deleted successfully (204 No Content)`)
      return NextResponse.json({ message: `Player '${username}' deleted successfully` })
    }

    // For other successful responses, try to parse JSON
    const data = await response.json()
    console.log(`Player deletion response:`, data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error deleting player:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout - backend may be slow or unavailable" }, { status: 408 })
    }

    if (error.message?.includes("fetch")) {
      return NextResponse.json({ error: "Unable to connect to backend server" }, { status: 503 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params
    const body = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if this is a stop request
    if (body.action === "stop") {
      console.log(`Stopping analysis for player: ${username}`)

      const backendUrl = `${API_URL.replace(/\/$/, "")}/players/${username}/stop`
      console.log(`Full backend URL: ${backendUrl}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
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
          return NextResponse.json({ error: `Player '${username}' not found` }, { status: 404 })
        }

        return NextResponse.json(
          {
            error: `Backend error: ${response.status} ${response.statusText}`,
            details: errorText,
          },
          { status: response.status },
        )
      }

      // Handle 204 No Content or other successful responses
      if (response.status === 204) {
        console.log(`Analysis stopped for '${username}' (204 No Content)`)
        return NextResponse.json({ message: `Analysis stopped for '${username}'` })
      }

      const data = await response.json()
      console.log(`Stop analysis response:`, data)

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Error stopping analysis:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout - backend may be slow or unavailable" }, { status: 408 })
    }

    if (error.message?.includes("fetch")) {
      return NextResponse.json({ error: "Unable to connect to backend server" }, { status: 503 })
    }

    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
