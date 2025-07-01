import { z } from "zod"

export const PlayerListItemSchema = z.object({
  username: z.string(),
  task_id: z.string().optional().nullable(),
  status: z.enum(["pending", "in_progress", "completed", "failed", "ready"]),
  requested_at: z.string().datetime(),
  finished_at: z.string().datetime().optional().nullable(),
})

export const PlayerListSchema = z.array(PlayerListItemSchema)

export const TaskSchema = z.object({
  task_id: z.string(),
  status: z.string(),
  progress: z.number(),
  total: z.number(),
  message: z.string(),
})

export const GameSchema = z.object({
  id: z.string(),
  white: z.string(),
  black: z.string(),
  result: z.string(),
  date: z.string(),
  pgn: z.string(),
})

export const PlayerMetricsSchema = z.object({
  username: z.string(),
  games_analyzed: z.number(),
  avg_acpl: z.number(),
  avg_match_rate: z.number(),
  avg_ipr: z.number(),
  step_function_detected: z.boolean(),
  step_function_magnitude: z.number(),
  risk_score: z.number(),
})

export const GameMetricsSchema = z.object({
  game_id: z.string(),
  acpl: z.number(),
  match_rate: z.number(),
  ipr: z.number(),
})

export const PlayerSchema = z.object({
  username: z.string(),
  games_analyzed: z.number(),
  last_analyzed: z.string().optional().nullable(),
  status: z.string(),
})

export const PlayerMetricsDetailSchema = z.object({
  username: z.string(),
  games_analyzed: z.number(),
  first_game_date: z.string(),
  last_game_date: z.string(),
  analyzed_at: z.string(),
  avg_acpl: z.number(),
  std_acpl: z.number(),
  avg_match_rate: z.number(),
  std_match_rate: z.number(),
  avg_ipr: z.number(),
  selectivity_score: z.number(),
  longest_streak: z.number(),
  peer_delta_acpl: z.number(),
  peer_delta_match: z.number(),
  roi_mean: z.number(),
  roi_max: z.number(),
  roi_std: z.number(),
  step_function_detected: z.boolean(),
  step_function_magnitude: z.number(),
  performance: z.object({
    roi_curve: z.array(z.number()),
    trend_acpl: z.number(),
    trend_match_rate: z.number(),
  }),
  risk: z.object({
    risk_score: z.number(),
    confidence_level: z.number(),
    suspicious_games_count: z.number(),
    risk_factors: z.record(z.number()),
  }),
  opening_patterns: z.object({
    mean_entropy: z.number(),
    novelty_depth: z.number(),
    opening_breadth: z.number(),
    second_choice_rate: z.number(),
  }),
  phase_quality: z.object({
    opening_acpl: z.number(),
    middlegame_acpl: z.number(),
    endgame_acpl: z.number(),
    blunder_rate: z.number(),
  }),
  time_management: z.object({
    mean_move_time: z.number(),
    time_variance: z.number(),
    uniformity_score: z.number(),
    lag_spike_count: z.number(),
  }),
  clutch_accuracy: z.object({
    avg_clutch_diff: z.number(),
    clutch_games_pct: z.number(),
  }),
  benchmark: z.object({
    percentile_acpl: z.number(),
    percentile_entropy: z.number(),
  }),
  tactical: z.object({
    precision_burst_count: z.number().nullable(),
    second_choice_rate: z.number().nullable(),
  }),
  endgame: z.object({
    conversion_efficiency: z.number(),
    tb_match_rate: z.number().nullable(),
    dtz_deviation: z.number().nullable(),
  }),
})

export type PlayerListItem = z.infer<typeof PlayerListItemSchema>
export type PlayerMetricsDetail = z.infer<typeof PlayerMetricsDetailSchema>
export type Player = z.infer<typeof PlayerSchema>
export type Task = z.infer<typeof TaskSchema>
export type Game = z.infer<typeof GameSchema>
export type PlayerMetrics = z.infer<typeof PlayerMetricsSchema>
export type GameMetrics = z.infer<typeof GameMetricsSchema>
