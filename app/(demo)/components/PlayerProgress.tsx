"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface PlayerProgressProps {
  username: string
  initialProgress?: number
}

export function PlayerProgress({ username, initialProgress = 0 }: PlayerProgressProps) {
  const [progress, setProgress] = useState(initialProgress)
  const [status, setStatus] = useState<"pending" | "ready">("pending")

  useEffect(() => {
    if (status === "ready") return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          setStatus("ready")
          return 100
        }
        return newProgress
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Analyzing {username}</span>
          </div>
          <Badge
            variant="outline"
            className={
              status === "ready"
                ? "bg-green-500/20 text-green-400 border-green-500"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500"
            }
          >
            {status === "ready" ? "Complete" : "In Progress"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{Math.round(progress)}% complete</span>
            <span>{status === "ready" ? "Analysis finished" : "Processing games..."}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
