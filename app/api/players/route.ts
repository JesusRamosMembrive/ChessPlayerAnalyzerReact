import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://your-new-url-here.ngrok-free.app/"

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/players`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add cache control to prevent stale data
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ error: "Failed to fetch players from backend" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    console.error("Attempting to connect to:", `${API_URL}/players`)
    return NextResponse.json(
      {
        error: "Unable to connect to backend API. Please ensure the backend is running.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    )
  }
}
