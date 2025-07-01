"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { analyzePlayer } from "@/lib/chess-api"
import { Search, Loader2 } from "lucide-react"

interface PlayerFormProps {
  refetchPlayers?: (() => Promise<void>) | null
}

export function PlayerForm({ refetchPlayers }: PlayerFormProps) {
  const [username, setUsername] = useState("")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const analyzeMutation = useMutation({
    mutationFn: analyzePlayer,
    onSuccess: (data) => {
      toast({
        title: "Analysis Started",
        description: `Analysis for ${username} has been queued (Task: ${data.task_id})`,
      })
      // Invalidate to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["player", username] })

      // Refetch players list to add the new player card automatically
      if (refetchPlayers) {
        refetchPlayers().catch(err => {
          console.error("Failed to refetch players:", err);
        });
      }

      setUsername("")
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    analyzeMutation.mutate(username.trim())
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Analyze Player
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter chess.com username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={analyzeMutation.isPending}
          />
          <Button type="submit" className="w-full" disabled={!username.trim() || analyzeMutation.isPending}>
            {analyzeMutation.isPending ? (
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
