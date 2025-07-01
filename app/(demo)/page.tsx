"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PlayerForm } from "./components/PlayerForm"
import { PlayerProgress } from "./components/PlayerProgress"
import { PlayerSummary } from "./components/PlayerSummary"
import { Toaster } from "@/components/ui/toaster"
import { PlayersList } from "@/components/players-list"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
    },
  },
})

export default function DemoPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [refetchPlayers, setRefetchPlayers] = useState<(() => Promise<void>) | null>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Chess Analyzer Demo</h1>
            <p className="text-muted-foreground dark:text-gray-400">
              Real-time chess player analysis with live progress updates
            </p>
          </div>

          <div className="grid gap-8">
            {" "}
            {/* Increased gap */}
            <div className="flex justify-center">
              <PlayerForm refetchPlayers={refetchPlayers} />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Monitor Player (enter username):
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter username to monitor"
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                />
              </div>

              {selectedPlayer && (
                <div className="grid md:grid-cols-2 gap-6">
                  <PlayerProgress username={selectedPlayer} />
                  <PlayerSummary username={selectedPlayer} />
                </div>
              )}
            </div>
            {/* New PlayersList section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <PlayersList 
                onError={(error) => console.error("PlayersList external error:", error)} 
                onRefetch={setRefetchPlayers}
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  )
}
