import { expect } from 'vitest';
import type { AttemptResult, SessionStats } from '@/types';
import { TrainingEngine } from '@/modules/TrainingEngine';

export interface KeyPressEvent {
  timeMs: number;
}

export const runKeyPressSequence = (
  engine: TrainingEngine,
  keyPresses: KeyPressEvent[]
): AttemptResult[] => {
  const results: AttemptResult[] = [];
  for (const kp of keyPresses) {
    const result = engine.handleKeyPress(kp.timeMs);
    if (result) {
      results.push(result);
    }
  }
  return results;
};

export const runTimeline = (
  engine: TrainingEngine,
  timePoints: number[]
): { keyPressResults: AttemptResult[]; missedResults: AttemptResult[] } => {
  const keyPressResults: AttemptResult[] = [];
  const missedResults: AttemptResult[] = [];

  for (const timeMs of timePoints) {
    const missed = engine.checkMissedMarkers(timeMs);
    missedResults.push(...missed);

    const result = engine.handleKeyPress(timeMs);
    if (result) {
      keyPressResults.push(result);
    }
  }

  return { keyPressResults, missedResults };
};

export const advanceTimeAndCheckMissed = (
  engine: TrainingEngine,
  targetTimeMs: number
): AttemptResult[] => {
  return engine.checkMissedMarkers(targetTimeMs);
};

export const expectStatsMatch = (
  stats: SessionStats,
  expected: {
    totalAttempts?: number;
    perfectCount?: number;
    goodCount?: number;
    missCount?: number;
    currentCombo?: number;
    maxCombo?: number;
    consecutiveMisses?: number;
    averageDeviation?: number;
  }
) => {
  if (expected.totalAttempts !== undefined) {
    expect(stats.totalAttempts).toBe(expected.totalAttempts);
  }
  if (expected.perfectCount !== undefined) {
    expect(stats.perfectCount).toBe(expected.perfectCount);
  }
  if (expected.goodCount !== undefined) {
    expect(stats.goodCount).toBe(expected.goodCount);
  }
  if (expected.missCount !== undefined) {
    expect(stats.missCount).toBe(expected.missCount);
  }
  if (expected.currentCombo !== undefined) {
    expect(stats.currentCombo).toBe(expected.currentCombo);
  }
  if (expected.maxCombo !== undefined) {
    expect(stats.maxCombo).toBe(expected.maxCombo);
  }
  if (expected.consecutiveMisses !== undefined) {
    expect(stats.consecutiveMisses).toBe(expected.consecutiveMisses);
  }
  if (expected.averageDeviation !== undefined) {
    expect(stats.averageDeviation).toBeCloseTo(expected.averageDeviation, 3);
  }
};

export const expectPositionStats = (
  stats: SessionStats,
  position: number,
  expected: {
    total?: number;
    hit?: number;
    perfect?: number;
    good?: number;
    miss?: number;
    avgDeviation?: number;
  }
) => {
  const posStat = stats.positionStats[position];
  expect(posStat).toBeDefined();

  if (expected.total !== undefined) {
    expect(posStat.total).toBe(expected.total);
  }
  if (expected.hit !== undefined) {
    expect(posStat.hit).toBe(expected.hit);
  }
  if (expected.perfect !== undefined) {
    expect(posStat.perfect).toBe(expected.perfect);
  }
  if (expected.good !== undefined) {
    expect(posStat.good).toBe(expected.good);
  }
  if (expected.miss !== undefined) {
    expect(posStat.miss).toBe(expected.miss);
  }
  if (expected.avgDeviation !== undefined) {
    expect(posStat.avgDeviation).toBeCloseTo(expected.avgDeviation, 3);
  }
};
