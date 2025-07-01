import { type NextRequest, NextResponse } from "next/server"

const API_URL = "https://31cc-87-221-57-241.ngrok-free.app"

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

    // Manejar respuesta exitosa - 204 No Content no tiene JSON
    let data
    if (response.status === 204) {
      // 204 No Content - operación exitosa sin contenido
      data = { message: `Player '${username}' deleted successfully` }
      console.log(`Player '${username}' deleted successfully (204 No Content)`)
    } else {
      // Otras respuestas exitosas con contenido JSON
      data = await response.json()
      console.log(`Player deletion response:`, data)
    }

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
