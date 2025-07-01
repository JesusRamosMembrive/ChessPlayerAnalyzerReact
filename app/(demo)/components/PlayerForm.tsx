"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"

interface PlayerFormProps {
  onSubmit: (username: string) => void
}

export function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onSubmit(username.trim())
    setUsername("")
    setIsLoading(false)
  }

  return (
    <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Search className="w-5 h-5" />
          <span className="text-white">New Analysis</span>
        </CardTitle>
        <CardDescription className="text-white">Enter a chess.com username to analyze</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter chess.com username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              "Start Analysis"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
