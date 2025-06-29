import { z } from "zod"

export const PlayerStatusSchema = z.enum(["pending", "completed", "error", "not_found"])

export const PlayerSchema = z.object({
  username: z.string(),
  status: PlayerStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  games_count: z.number().optional(),
  analysis_progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
})

export const TaskSchema = z.object({
  id: z.string(),
  status: PlayerStatusSchema,
  progress: z.number().min(0).max(100),
  error: z.string().optional(),
})

export const GameSchema = z.object({
  id: z.string(),
  white_player: z.string(),
  black_player: z.string(),
  result: z.string(),
  date: z.string(),
  moves: z.array(z.string()),
  time_control: z.string().optional(),
})

export const PlayerMetricsSchema = z.object({
  username: z.string(),
  total_games: z.number(),
  win_rate: z.number(),
  avg_game_length: z.number(),
  opening_diversity: z.number(),
  suspicious_patterns: z.number(),
  comeback_games: z.number(),
  rating_consistency: z.number(),
})

export const GameMetricsSchema = z.object({
  game_id: z.string(),
  avg_move_time: z.number(),
  blunder_count: z.number(),
  accuracy: z.number(),
  comeback_potential: z.number(),
})

export const StreamEventSchema = z.object({
  type: z.enum(["progress", "completed", "error"]),
  data: z.object({
    username: z.string(),
    progress: z.number().optional(),
    status: PlayerStatusSchema.optional(),
    error: z.string().optional(),
    games_analyzed: z.number().optional(),
    total_games: z.number().optional(),
  }),
})

export const PlayerListItemSchema = z.object({
  username: z.string(),
  status: z.enum(["pending", "ready", "error"]),
  progress: z.number(),
  total_games: z.number().optional(),
  done_games: z.number().optional(),
  requested_at: z.string(),
  finished_at: z.string().optional(),
  error: z.string().optional().nullable(),
})

export type Player = z.infer<typeof PlayerSchema>
export type Task = z.infer<typeof TaskSchema>
export type Game = z.infer<typeof GameSchema>
export type PlayerMetrics = z.infer<typeof PlayerMetricsSchema>
export type GameMetrics = z.infer<typeof GameMetricsSchema>
export type StreamEvent = z.infer<typeof StreamEventSchema>
export type PlayerStatus = z.infer<typeof PlayerStatusSchema>
export type PlayerListItem = z.infer<typeof PlayerListItemSchema>
