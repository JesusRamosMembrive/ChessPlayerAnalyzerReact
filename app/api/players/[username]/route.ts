import { NextResponse } from "next/server"

const API_URL = "https://31cc-87-221-57-241.ngrok-free.app"

export async function POST(request: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Starting analysis for player: ${username}`)
    console.log("Attempting to connect to backend:", `${API_URL}/players/${username}`)

    const response = await fetch(`${API_URL}/players/${username}`, {
      method: "POST",
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
        setTimeout(() => controller.abort(), 30000) // 30 second timeout for analysis
        return controller.signal
      })(),
    })

    console.log("Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend API error: ${response.status} ${response.statusText}`, errorText)

      return NextResponse.json(
        {
          error: "Failed to start analysis",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Analysis started successfully:", data)

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
        backend_url: `${API_URL}/players/${params.username}`,
        suggestion: "Please ensure the backend server is running and accessible",
      },
      { status: statusCode },
    )
  }
}

export async function GET(request: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Fetching player data: ${username}`)
    console.log("Attempting to connect to backend:", `${API_URL}/players/${username}`)

    const response = await fetch(`${API_URL}/players/${username}`, {
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
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }

      return NextResponse.json(
        {
          error: "Failed to fetch player data",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Successfully fetched player data:", data)

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
        backend_url: `${API_URL}/players/${params.username}`,
        suggestion: "Please ensure the backend server is running and accessible",
      },
      { status: statusCode },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    console.log(`Deleting player: ${username}`)
    console.log("Attempting to connect to backend:", `${API_URL}/players/${username}`)

    const response = await fetch(`${API_URL}/players/${username}`, {
      method: "DELETE",
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
        setTimeout(() => controller.abort(), 15000) // 15 second timeout for deletion
        return controller.signal
      })(),
    })

    console.log("Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend API error: ${response.status} ${response.statusText}`, errorText)

      // Return 404 for player not found
      if (response.status === 404) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 })
      }

      return NextResponse.json(
        {
          error: "Failed to delete player",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Check if response has content
    let data = {}
    try {
      const text = await response.text()
      if (text) {
        data = JSON.parse(text)
      }
    } catch (parseError) {
      // If no content or invalid JSON, that's fine for DELETE
      console.log("No JSON response body (expected for DELETE)")
    }

    console.log(`Player ${username} deleted successfully`)

    return NextResponse.json({
      success: true,
      message: `Player ${username} deleted successfully`,
      ...data,
    })
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
        backend_url: `${API_URL}/players/${params.username}`,
        suggestion: "Please ensure the backend server is running and accessible",
      },
      { status: statusCode },
    )
  }
}
