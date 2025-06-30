import { NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function GET() {
  try {
    console.log("Fetching players from API...")
    console.log("Attempting to connect to backend:", `${API_URL}/players`)
    const response = await fetch(`${API_URL}/players`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add cache control to prevent stale data
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend response status: ${response.status}`)
      console.error(`Backend API error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json({ error: "Failed to fetch players from backend" }, { status: response.status })
    }

    const data = await response.json()
    console.log("API response status:", response.status)
    console.log("Received data:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    console.error("Attempting to connect to backend:", `${API_URL}/players`)
    return NextResponse.json(
      { error: "Unable to connect to backend API. Please ensure the backend is running.", details: error instanceof Error ? error.message : String(error) },
      { status: 503 },
    )
  }
}
