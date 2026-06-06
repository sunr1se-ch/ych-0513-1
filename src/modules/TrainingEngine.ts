import type {
  TrainingSegment,
  AttemptResult,
  SessionStats,
  Rating,
  PositionStat,
} from '@/types';
import { RATING_THRESHOLDS, COMBO_RULES } from '@/config/constants';

export class TrainingEngine {
  private segment: TrainingSegment;
  private stats: SessionStats;
  private nextMarkerIndex: number = 0;
  private lastAttemptTime: number = 0;
  private attemptWindowMs: number = 500;

  constructor(segment: TrainingSegment) {
    this.segment = segment;
    this.stats = this.initStats();
  }

  private initStats(): SessionStats {
    const positionStats: Record<number, PositionStat> = {};
    const positions = [...new Set(this.segment.markers.map((m) => m.position))].sort();
    positions.forEach((pos) => {
      positionStats[pos] = {
        total: 0,
        hit: 0,
        perfect: 0,
        good: 0,
        miss: 0,
        avgDeviation: 0,
      };
    });

    return {
      totalAttempts: 0,
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
      currentCombo: 0,
      maxCombo: 0,
      consecutiveMisses: 0,
      averageDeviation: 0,
      positionStats,
      results: [],
    };
  }

  public getStats(): SessionStats {
    return { ...this.stats };
  }

  public getSegment(): TrainingSegment {
    return this.segment;
  }

  public getNextMarkerIndex(): number {
    return this.nextMarkerIndex;
  }

  public getNextMarker() {
    if (this.nextMarkerIndex < this.segment.markers.length) {
      return this.segment.markers[this.nextMarkerIndex];
    }
    return null;
  }

  public handleKeyPress(actualTimeMs: number): AttemptResult | null {
    if (this.nextMarkerIndex >= this.segment.markers.length) {
      return null;
    }

    if (actualTimeMs - this.lastAttemptTime < this.attemptWindowMs) {
      return null;
    }

    const marker = this.segment.markers[this.nextMarkerIndex];
    const windowStart = marker.timeMs - this.attemptWindowMs;
    const windowEnd = marker.timeMs + this.attemptWindowMs;

    if (actualTimeMs < windowStart || actualTimeMs > windowEnd) {
      return null;
    }

    this.lastAttemptTime = actualTimeMs;
    const deviationMs = Math.abs(actualTimeMs - marker.timeMs);
    const rating = this.calculateRating(deviationMs);

    const result: AttemptResult = {
      markerIndex: this.nextMarkerIndex,
      position: marker.position,
      expectedTimeMs: marker.timeMs,
      actualTimeMs,
      deviationMs,
      rating,
    };

    this.updateStats(result);
    this.nextMarkerIndex++;

    return result;
  }

  private calculateRating(deviationMs: number): Rating {
    if (deviationMs <= RATING_THRESHOLDS.PERFECT) {
      return 'perfect';
    } else if (deviationMs <= RATING_THRESHOLDS.GOOD) {
      return 'good';
    } else {
      return 'miss';
    }
  }

  private updateStats(result: AttemptResult): void {
    this.stats.totalAttempts++;
    this.stats.results.push(result);

    const posStat = this.stats.positionStats[result.position];
    if (posStat) {
      posStat.total++;
      if (result.rating === 'perfect') {
        posStat.perfect++;
        posStat.hit++;
        this.stats.perfectCount++;
      } else if (result.rating === 'good') {
        posStat.good++;
        posStat.hit++;
        this.stats.goodCount++;
      } else {
        posStat.miss++;
        this.stats.missCount++;
      }

      const totalDeviation =
        posStat.avgDeviation * (posStat.total - 1) + result.deviationMs;
      posStat.avgDeviation = totalDeviation / posStat.total;
    }

    if (result.rating === 'miss') {
      this.stats.consecutiveMisses++;
      if (this.stats.consecutiveMisses >= COMBO_RULES.MAX_CONSECUTIVE_MISS) {
        this.stats.currentCombo = 0;
      }
    } else {
      this.stats.consecutiveMisses = 0;
      this.stats.currentCombo++;
      if (this.stats.currentCombo > this.stats.maxCombo) {
        this.stats.maxCombo = this.stats.currentCombo;
      }
    }

    const totalDeviationAll = this.stats.results.reduce((sum, r) => sum + r.deviationMs, 0);
    this.stats.averageDeviation = totalDeviationAll / this.stats.results.length;
  }

  public checkMissedMarkers(currentTimeMs: number): AttemptResult[] {
    const missedResults: AttemptResult[] = [];

    while (this.nextMarkerIndex < this.segment.markers.length) {
      const marker = this.segment.markers[this.nextMarkerIndex];
      const missThreshold = marker.timeMs + this.attemptWindowMs;

      if (currentTimeMs > missThreshold) {
        const result: AttemptResult = {
          markerIndex: this.nextMarkerIndex,
          position: marker.position,
          expectedTimeMs: marker.timeMs,
          actualTimeMs: currentTimeMs,
          deviationMs: currentTimeMs - marker.timeMs,
          rating: 'miss',
        };
        this.updateStats(result);
        missedResults.push(result);
        this.nextMarkerIndex++;
      } else {
        break;
      }
    }

    return missedResults;
  }

  public isFinished(): boolean {
    return this.nextMarkerIndex >= this.segment.markers.length;
  }

  public reset(): void {
    this.stats = this.initStats();
    this.nextMarkerIndex = 0;
    this.lastAttemptTime = 0;
  }

  public getAccuracy(): number {
    if (this.stats.totalAttempts === 0) return 0;
    return (this.stats.perfectCount + this.stats.goodCount) / this.stats.totalAttempts;
  }
}
