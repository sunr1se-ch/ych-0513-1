export interface PositionMarker {
  timeMs: number;
  position: number;
  label?: string;
}

export interface TrainingSegment {
  id: string;
  name: string;
  description: string;
  audioFile: string;
  durationMs: number;
  markers: PositionMarker[];
  preCountDownMs: number;
}

export type Rating = 'perfect' | 'good' | 'miss';

export interface AttemptResult {
  markerIndex: number;
  position: number;
  expectedTimeMs: number;
  actualTimeMs: number;
  deviationMs: number;
  rating: Rating;
}

export interface PositionStat {
  total: number;
  hit: number;
  perfect: number;
  good: number;
  miss: number;
  avgDeviation: number;
}

export interface SessionStats {
  totalAttempts: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  currentCombo: number;
  maxCombo: number;
  consecutiveMisses: number;
  averageDeviation: number;
  positionStats: Record<number, PositionStat>;
  results: AttemptResult[];
}

export interface BestRecord {
  segmentId: string;
  maxCombo: number;
  accuracy: number;
  averageDeviation: number;
  timestamp: number;
}

export interface RatingThresholds {
  PERFECT: number;
  GOOD: number;
}

export interface ComboRules {
  MAX_CONSECUTIVE_MISS: number;
}

export type TrainingPhase = 'idle' | 'countdown' | 'playing' | 'paused' | 'finished';
