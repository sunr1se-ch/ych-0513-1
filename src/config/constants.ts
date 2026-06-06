import type { RatingThresholds, ComboRules } from '@/types';

export const RATING_THRESHOLDS: RatingThresholds = {
  PERFECT: 40,
  GOOD: 90,
};

export const COMBO_RULES: ComboRules = {
  MAX_CONSECUTIVE_MISS: 3,
};

export const STORAGE_KEYS = {
  BEST_RECORDS: 'siHuTraining_bestRecords',
};

export const RATING_COLORS: Record<string, string> = {
  perfect: '#D4AF37',
  good: '#3A8A5E',
  miss: '#C0392B',
};

export const RATING_LABELS: Record<string, string> = {
  perfect: 'PERFECT',
  good: 'GOOD',
  miss: 'MISS',
};
