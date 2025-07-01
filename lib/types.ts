import { z } from "zod"

export const PlayerListItemSchema = z.object({
  username: z.string(),
  status: z.enum(["pending", "ready", "error", "in_progress", "completed", "failed"]),
  progress: z.number().min(0).max(100),
  requested_at: z.string(),
  total_games: z.number().optional(),
  done_games: z.number(),
  finished_at: z.string().optional(),
})

export type PlayerListItem = z.infer<typeof PlayerListItemSchema>

export const StreamEventSchema = z.object({
  type: z.string(),
  data: z.any(),
  timestamp: z.string(),
})

export type StreamEvent = z.infer<typeof StreamEventSchema>

export interface PlayerMetrics {
  username: string
  total_games: number
  analysis_complete: boolean
  metrics: {
    opening_entropy: number
    move_timing_consistency: number
    win_loss_ratio: number
    comeback_frequency: number
  }
  charts: {
    rating_progression: Array<{ date: string; rating: number }>
    opening_diversity: Array<{ opening: string; count: number }>
    time_usage: Array<{ move: number; time: number }>
  }
}
