import { NextResponse } from "next/server"
import { AbortSignal } from "abort-controller"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http:localhost:8000"

export async function GET() {
  try {
    console.log("Attempting to connect to backend:", `${API_URL}/players`)

    const response = await fetch(`${API_URL}/players`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Add ngrok bypass header if using ngrok
        ...(API_URL.includes("ngrok") && { "ngrok-skip-browser-warning": "true" }),
      },
      // Add cache control to prevent stale data
      cache: "no-store",
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    console.log("Backend response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`Backend API error: ${response.status} ${response.statusText}`, errorText)

      // Return empty array for 404 (no players found) instead of error
      if (response.status === 404) {
        return NextResponse.json([])
      }

      return NextResponse.json(
        {
          error: "Failed to fetch players from backend",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Successfully fetched players:", Array.isArray(data) ? data.length : "invalid format")

    // Ensure we return an array
    if (!Array.isArray(data)) {
      console.warn("Backend returned non-array data:", typeof data)
      return NextResponse.json([])
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("API route error:", error)
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      cause: error.cause,
    })
    console.error("Attempting to connect to:", `${API_URL}/players`)

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
        backend_url: `${API_URL}/players`,
        suggestion: "Please ensure the backend server is running and accessible",
      },
      { status: statusCode },
    )
  }
}
