import { NextResponse } from "next/server"

const API_URL = "https://d68a-87-221-57-241.ngrok-free.app"

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Fetching metrics for player: ${username}`)
    console.log("Attempting to connect to backend:", `${API_URL}/metrics/player/${username}`)

    const response = await fetch(`${API_URL}/metrics/player/${username}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Add ngrok bypass header if using ngrok
        ...(API_URL.includes("ngrok") && { "ngrok-skip-browser-warning": "true" }),
      },
      // Add cache control to prevent stale data
      cache: "no-store",
      // Add timeout using AbortController for better compatibility
      signal: (() => {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 10000)
        return controller.signal
      })(),
    })

    console.log("Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend API error: ${response.status} ${response.statusText}`, errorText)

      // Return 404 for player not found
      if (response.status === 404) {
        return NextResponse.json({ error: "Player metrics not found" }, { status: 404 })
      }

      return NextResponse.json(
        {
          error: "Failed to fetch player metrics",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Successfully fetched player metrics:", data)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("API route error:", error)
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      cause: error.cause,
    })

    // Handle different types of errors
    let errorMessage = "Unable to connect to backend API"
    let statusCode = 503

    if (error.name === "AbortError" || error.name === "TimeoutError") {
      errorMessage = "Backend API request timed out"
      statusCode = 504
    } else if (error.message?.includes("fetch")) {
      errorMessage = "Network error connecting to backend API"
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        backend_url: `${API_URL}/metrics/player/${params.username}`,
        suggestion: "Please ensure the backend server is running and accessible",
      },
      { status: statusCode },
    )
  }
}
