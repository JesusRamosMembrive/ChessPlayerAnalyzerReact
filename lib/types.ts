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

// At the end of the file, add the new schemas and types for detailed player metrics.

export const OpeningPatternsSchema = z.object({
  mean_entropy: z.number(),
  novelty_depth: z.number(),
  opening_breadth: z.number(),
  second_choice_rate: z.number(),
})

export const RiskSchema = z.object({
  risk_score: z.number(),
  risk_factors: z.record(z.string(), z.number()),
  confidence_level: z.number(),
  suspicious_games_count: z.number(),
})

export const PerformanceSchema = z.object({
  trend_acpl: z.number(),
  trend_match_rate: z.number(),
  roi_curve: z.array(z.number()),
})

export const PhaseQualitySchema = z.object({
  opening_acpl: z.number(),
  middlegame_acpl: z.number(),
  endgame_acpl: z.number(),
  opening_blunder_rate: z.number().nullable(),
  middlegame_blunder_rate: z.number().nullable(),
  endgame_blunder_rate: z.number().nullable(),
  blunder_rate: z.number(),
})

export const BenchmarkSchema = z.object({
  percentile_acpl: z.number(),
  percentile_entropy: z.number(),
})

export const TacticalSchema = z.object({
  precision_burst_count: z.number().nullable(),
  second_choice_rate: z.number().nullable(),
})

export const EndgameSchema = z.object({
  conversion_efficiency: z.number(),
  tb_match_rate: z.number().nullable(),
  dtz_deviation: z.number().nullable(),
})

export const TimeManagementSchema = z.object({
  mean_move_time: z.number(),
  time_variance: z.number(),
  uniformity_score: z.number(),
  lag_spike_count: z.number(),
})

export const ClutchAccuracySchema = z.object({
  avg_clutch_diff: z.number(),
  clutch_games_pct: z.number(),
})

export const PlayerMetricsDetailSchema = z.object({
  username: z.string(),
  games_analyzed: z.number(),
  avg_acpl: z.number(),
  std_acpl: z.number(),
  avg_match_rate: z.number(),
  std_match_rate: z.number(),
  avg_ipr: z.number(),
  roi_mean: z.number(),
  roi_max: z.number(),
  roi_std: z.number(),
  roi_curve: z.array(z.number()),
  step_function_detected: z.boolean(),
  step_function_magnitude: z.number(),
  longest_streak: z.number(),
  peer_delta_acpl: z.number(),
  peer_delta_match: z.number(),
  selectivity_score: z.number(),
  time_patterns: z.any().nullable(),
  opening_patterns: OpeningPatternsSchema,
  trend_acpl: z.number(),
  trend_match_rate: z.number(),
  risk: RiskSchema,
  performance: PerformanceSchema,
  phase_quality: PhaseQualitySchema,
  benchmark: BenchmarkSchema,
  tactical: TacticalSchema,
  endgame: EndgameSchema,
  time_management: TimeManagementSchema,
  clutch_accuracy: ClutchAccuracySchema,
  first_game_date: z.string(),
  last_game_date: z.string(),
  analyzed_at: z.string(),
  favorite_openings: z.array(z.any()),
})

export type PlayerMetricsDetail = z.infer<typeof PlayerMetricsDetailSchema>
