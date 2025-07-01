import { NextResponse } from "next/server"

const API_BASE_URL = "https://31cc-87-221-57-241.ngrok-free.app"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/players`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Failed to fetch from external API", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/players:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ username }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: "Failed to start analysis via external API", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 202 })
  } catch (error) {
    console.error("Error in POST /api/players:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
