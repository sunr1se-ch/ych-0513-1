import { describe, it, expect, beforeEach } from 'vitest';
import { TrainingEngine } from './TrainingEngine';
import { RATING_THRESHOLDS, COMBO_RULES } from '@/config/constants';
import {
  THRESHOLD_TEST_SEGMENT,
  SIMPLE_2MARKER_SEGMENT,
  SIMPLE_3MARKER_SEGMENT,
  SIMPLE_5MARKER_SEGMENT,
  COMBO_TEST_SEGMENT,
  MULTI_POSITION_SEGMENT,
} from '@/test/fixtures';
import {
  runKeyPressSequence,
  runTimeline,
  advanceTimeAndCheckMissed,
  expectStatsMatch,
  expectPositionStats,
} from '@/test/utils';

describe('TrainingEngine - 评分阈值边界', () => {
  let engine: TrainingEngine;

  beforeEach(() => {
    engine = new TrainingEngine(THRESHOLD_TEST_SEGMENT);
  });

  it('偏差恰为 40ms 应评为 perfect', () => {
    const markerTime = THRESHOLD_TEST_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime + RATING_THRESHOLDS.PERFECT);

    expect(result).not.toBeNull();
    expect(result?.rating).toBe('perfect');
    expect(result?.deviationMs).toBe(RATING_THRESHOLDS.PERFECT);
  });

  it('偏差恰为 40ms（负方向）应评为 perfect', () => {
    const markerTime = THRESHOLD_TEST_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime - RATING_THRESHOLDS.PERFECT);

    expect(result).not.toBeNull();
    expect(result?.rating).toBe('perfect');
    expect(result?.deviationMs).toBe(RATING_THRESHOLDS.PERFECT);
  });

  it('偏差 41ms 应评为 good', () => {
    const markerTime = THRESHOLD_TEST_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime + RATING_THRESHOLDS.PERFECT + 1);

    expect(result).not.toBeNull();
    expect(result?.rating).toBe('good');
  });

  it('偏差恰为 90ms 应评为 good', () => {
    const markerTime = THRESHOLD_TEST_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime + RATING_THRESHOLDS.GOOD);

    expect(result).not.toBeNull();
    expect(result?.rating).toBe('good');
    expect(result?.deviationMs).toBe(RATING_THRESHOLDS.GOOD);
  });

  it('偏差 91ms 应评为 miss', () => {
    const markerTime = THRESHOLD_TEST_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime + RATING_THRESHOLDS.GOOD + 1);

    expect(result).not.toBeNull();
    expect(result?.rating).toBe('miss');
  });
});

describe('TrainingEngine - 响应窗口规则', () => {
  let engine: TrainingEngine;

  beforeEach(() => {
    engine = new TrainingEngine(SIMPLE_2MARKER_SEGMENT);
  });

  it('响应窗外（-501ms）按键不计 attempt', () => {
    const markerTime = SIMPLE_2MARKER_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime - 501);

    expect(result).toBeNull();
    expectStatsMatch(engine.getStats(), { totalAttempts: 0 });
    expect(engine.getNextMarkerIndex()).toBe(0);
  });

  it('响应窗外（+501ms）按键不计 attempt', () => {
    const markerTime = SIMPLE_2MARKER_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime + 501);

    expect(result).toBeNull();
    expectStatsMatch(engine.getStats(), { totalAttempts: 0 });
    expect(engine.getNextMarkerIndex()).toBe(0);
  });

  it('响应窗口左边界（-500ms）按键有效', () => {
    const markerTime = SIMPLE_2MARKER_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime - 500);

    expect(result).not.toBeNull();
    expectStatsMatch(engine.getStats(), { totalAttempts: 1 });
    expect(engine.getNextMarkerIndex()).toBe(1);
  });

  it('响应窗口右边界（+500ms）按键有效', () => {
    const markerTime = SIMPLE_2MARKER_SEGMENT.markers[0].timeMs;
    const result = engine.handleKeyPress(markerTime + 500);

    expect(result).not.toBeNull();
    expectStatsMatch(engine.getStats(), { totalAttempts: 1 });
    expect(engine.getNextMarkerIndex()).toBe(1);
  });

  it('窗内 500ms 内连按两次只记第一次', () => {
    const markerTime = SIMPLE_2MARKER_SEGMENT.markers[0].timeMs;
    const firstResult = engine.handleKeyPress(markerTime);
    expect(firstResult).not.toBeNull();
    expect(firstResult?.markerIndex).toBe(0);

    const secondResult = engine.handleKeyPress(markerTime + 100);
    expect(secondResult).toBeNull();

    expectStatsMatch(engine.getStats(), { totalAttempts: 1 });
    expect(engine.getNextMarkerIndex()).toBe(1);

    const nextMarkerResult = engine.handleKeyPress(markerTime + 1000);
    expect(nextMarkerResult).not.toBeNull();
    expect(nextMarkerResult?.markerIndex).toBe(1);
  });

  it('超过 500ms 后可对下一个标记响应', () => {
    const marker0Time = SIMPLE_2MARKER_SEGMENT.markers[0].timeMs;
    const marker1Time = SIMPLE_2MARKER_SEGMENT.markers[1].timeMs;

    engine.handleKeyPress(marker0Time);

    const tooEarly = engine.handleKeyPress(marker0Time + 499);
    expect(tooEarly).toBeNull();

    const ok = engine.handleKeyPress(marker1Time);
    expect(ok).not.toBeNull();
    expect(ok?.markerIndex).toBe(1);
  });
});

describe('TrainingEngine - Combo 规则', () => {
  let engine: TrainingEngine;

  beforeEach(() => {
    engine = new TrainingEngine(COMBO_TEST_SEGMENT);
  });

  it('首次命中 combo 为 1', () => {
    const result = engine.handleKeyPress(COMBO_TEST_SEGMENT.markers[0].timeMs);
    expect(result?.rating).toBe('perfect');
    expectStatsMatch(engine.getStats(), { currentCombo: 1, maxCombo: 1 });
  });

  it('连续命中 combo 递增', () => {
    const markers = COMBO_TEST_SEGMENT.markers;

    runKeyPressSequence(engine, [
      { timeMs: markers[0].timeMs },
      { timeMs: markers[1].timeMs },
      { timeMs: markers[2].timeMs },
    ]);

    expectStatsMatch(engine.getStats(), {
      currentCombo: 3,
      maxCombo: 3,
      consecutiveMisses: 0,
    });
  });

  it('连续 2 次 miss 后再 hit 不断 combo', () => {
    const markers = COMBO_TEST_SEGMENT.markers;
    const perfectTime = markers[0].timeMs;
    const missTime1 = markers[1].timeMs + 200;
    const missTime2 = markers[2].timeMs + 200;
    const hitTime3 = markers[3].timeMs;

    runKeyPressSequence(engine, [
      { timeMs: perfectTime },
      { timeMs: missTime1 },
      { timeMs: missTime2 },
      { timeMs: hitTime3 },
    ]);

    const stats = engine.getStats();
    expect(stats.currentCombo).toBe(2);
    expect(stats.maxCombo).toBe(2);
    expect(stats.consecutiveMisses).toBe(0);
  });

  it('第 3 次连续 miss 时 combo 归零', () => {
    const markers = COMBO_TEST_SEGMENT.markers;
    const hitTime = markers[0].timeMs;
    const missTime1 = markers[1].timeMs + 200;
    const missTime2 = markers[2].timeMs + 200;
    const missTime3 = markers[3].timeMs + 200;

    runKeyPressSequence(engine, [
      { timeMs: hitTime },
      { timeMs: missTime1 },
      { timeMs: missTime2 },
      { timeMs: missTime3 },
    ]);

    const stats = engine.getStats();
    expect(stats.currentCombo).toBe(0);
    expect(stats.maxCombo).toBe(1);
    expect(stats.consecutiveMisses).toBe(3);
  });

  it('maxCombo 保持历史最高值', () => {
    const markers = COMBO_TEST_SEGMENT.markers;

    runKeyPressSequence(engine, [
      { timeMs: markers[0].timeMs },
      { timeMs: markers[1].timeMs },
      { timeMs: markers[2].timeMs + 200 },
      { timeMs: markers[3].timeMs + 200 },
      { timeMs: markers[4].timeMs + 200 },
    ]);

    const stats = engine.getStats();
    expect(stats.currentCombo).toBe(0);
    expect(stats.maxCombo).toBe(2);
  });

  it('hit 后重置 consecutiveMisses', () => {
    const markers = COMBO_TEST_SEGMENT.markers;

    runKeyPressSequence(engine, [
      { timeMs: markers[0].timeMs + 200 },
      { timeMs: markers[1].timeMs + 200 },
      { timeMs: markers[2].timeMs },
    ]);

    const stats = engine.getStats();
    expect(stats.consecutiveMisses).toBe(0);
    expect(stats.currentCombo).toBe(1);
  });
});

describe('TrainingEngine - 自动 Miss 检测', () => {
  let engine: TrainingEngine;

  beforeEach(() => {
    engine = new TrainingEngine(SIMPLE_5MARKER_SEGMENT);
  });

  it('时钟推进越过标记窗口自动记 miss', () => {
    const markerTime = SIMPLE_5MARKER_SEGMENT.markers[0].timeMs;
    const missed = advanceTimeAndCheckMissed(engine, markerTime + 501);

    expect(missed.length).toBe(1);
    expect(missed[0].rating).toBe('miss');
    expect(missed[0].markerIndex).toBe(0);
    expectStatsMatch(engine.getStats(), {
      totalAttempts: 1,
      missCount: 1,
      consecutiveMisses: 1,
    });
  });

  it('一次跳过多个标记须依次补记', () => {
    const markers = SIMPLE_5MARKER_SEGMENT.markers;
    const jumpToTime = markers[2].timeMs + 501;

    const missed = advanceTimeAndCheckMissed(engine, jumpToTime);

    expect(missed.length).toBe(3);
    expect(missed[0].markerIndex).toBe(0);
    expect(missed[1].markerIndex).toBe(1);
    expect(missed[2].markerIndex).toBe(2);
    expect(engine.getNextMarkerIndex()).toBe(3);
  });

  it('补记 miss 计入连续 miss 计数', () => {
    const markers = SIMPLE_5MARKER_SEGMENT.markers;

    advanceTimeAndCheckMissed(engine, markers[0].timeMs + 501);
    expectStatsMatch(engine.getStats(), { consecutiveMisses: 1 });

    advanceTimeAndCheckMissed(engine, markers[1].timeMs + 501);
    expectStatsMatch(engine.getStats(), { consecutiveMisses: 2 });

    advanceTimeAndCheckMissed(engine, markers[2].timeMs + 501);
    expectStatsMatch(engine.getStats(), { consecutiveMisses: 3, currentCombo: 0 });
  });

  it('补记 miss 触发 combo 归零', () => {
    const markers = SIMPLE_5MARKER_SEGMENT.markers;

    runKeyPressSequence(engine, [{ timeMs: markers[0].timeMs }]);
    expectStatsMatch(engine.getStats(), { currentCombo: 1 });

    advanceTimeAndCheckMissed(engine, markers[1].timeMs + 501);
    expectStatsMatch(engine.getStats(), { consecutiveMisses: 1, currentCombo: 1 });

    advanceTimeAndCheckMissed(engine, markers[2].timeMs + 501);
    expectStatsMatch(engine.getStats(), { consecutiveMisses: 2, currentCombo: 1 });

    advanceTimeAndCheckMissed(engine, markers[3].timeMs + 501);
    expectStatsMatch(engine.getStats(), { consecutiveMisses: 3, currentCombo: 0, maxCombo: 1 });
  });

  it('未越过窗口时不记 miss', () => {
    const markerTime = SIMPLE_5MARKER_SEGMENT.markers[0].timeMs;
    const missed = advanceTimeAndCheckMissed(engine, markerTime + 500);

    expect(missed.length).toBe(0);
    expectStatsMatch(engine.getStats(), { totalAttempts: 0 });
  });
});

describe('TrainingEngine - 统计数据一致性', () => {
  let engine: TrainingEngine;

  beforeEach(() => {
    engine = new TrainingEngine(MULTI_POSITION_SEGMENT);
  });

  it('各把位 perfect/good/miss 计数与尝试序列一致', () => {
    const markers = MULTI_POSITION_SEGMENT.markers;

    const { keyPressResults } = runTimeline(engine, [
      markers[0].timeMs,
      markers[1].timeMs + 50,
      markers[2].timeMs + 150,
      markers[3].timeMs,
      markers[4].timeMs + 70,
      markers[5].timeMs + 20,
    ]);

    expect(keyPressResults.length).toBe(6);

    const stats = engine.getStats();
    expect(stats.perfectCount).toBe(3);
    expect(stats.goodCount).toBe(2);
    expect(stats.missCount).toBe(1);
    expect(stats.totalAttempts).toBe(6);

    expectPositionStats(stats, 1, { total: 2, perfect: 1, good: 1, miss: 0, hit: 2 });
    expectPositionStats(stats, 2, { total: 2, perfect: 1, good: 0, miss: 1, hit: 1 });
    expectPositionStats(stats, 3, { total: 2, perfect: 1, good: 1, miss: 0, hit: 2 });
  });

  it('命中率计算正确', () => {
    const markers = MULTI_POSITION_SEGMENT.markers;

    runTimeline(engine, [
      markers[0].timeMs,
      markers[1].timeMs + 200,
      markers[2].timeMs,
      markers[3].timeMs + 200,
      markers[4].timeMs,
      markers[5].timeMs + 200,
    ]);

    const accuracy = engine.getAccuracy();
    expect(accuracy).toBe(0.5);
  });

  it('全程平均偏差与尝试序列一致', () => {
    const markers = MULTI_POSITION_SEGMENT.markers;

    runTimeline(engine, [
      markers[0].timeMs + 10,
      markers[1].timeMs + 20,
      markers[2].timeMs + 30,
    ]);

    const stats = engine.getStats();
    expect(stats.averageDeviation).toBeCloseTo(20, 3);
  });

  it('各把位平均偏差计算正确', () => {
    const markers = MULTI_POSITION_SEGMENT.markers;

    runTimeline(engine, [
      markers[0].timeMs + 10,
      markers[1].timeMs + 30,
      markers[2].timeMs + 50,
      markers[3].timeMs + 70,
    ]);

    expectPositionStats(engine.getStats(), 1, { avgDeviation: 20 });
    expectPositionStats(engine.getStats(), 2, { avgDeviation: 60 });
  });

  it('包含 miss 时平均偏差仍正确计算', () => {
    const markers = MULTI_POSITION_SEGMENT.markers;

    runTimeline(engine, [
      markers[0].timeMs + 10,
      markers[1].timeMs + 200,
      markers[2].timeMs + 30,
    ]);

    const stats = engine.getStats();
    expect(stats.averageDeviation).toBeCloseTo(80, 3);
  });
});

describe('TrainingEngine - 混合场景', () => {
  it('完整练习流程：按键 + 自动 miss 混合场景（连续 3 次 miss 触发 combo 归零）', () => {
    const engine = new TrainingEngine(COMBO_TEST_SEGMENT);
    const markers = COMBO_TEST_SEGMENT.markers;

    const result1 = engine.handleKeyPress(markers[0].timeMs);
    expect(result1?.rating).toBe('perfect');

    const missed1 = advanceTimeAndCheckMissed(engine, markers[1].timeMs + 501);
    expect(missed1.length).toBe(1);

    const result3 = engine.handleKeyPress(markers[2].timeMs);
    expect(result3?.rating).toBe('perfect');

    advanceTimeAndCheckMissed(engine, markers[5].timeMs + 501);

    const stats = engine.getStats();
    expect(stats.totalAttempts).toBe(6);
    expect(stats.perfectCount).toBe(2);
    expect(stats.missCount).toBe(4);
    expect(stats.consecutiveMisses).toBe(3);
    expect(stats.currentCombo).toBe(0);
    expect(stats.maxCombo).toBe(2);
  });

  it('连续 2 次 miss 后不断 combo', () => {
    const engine = new TrainingEngine(SIMPLE_5MARKER_SEGMENT);
    const markers = SIMPLE_5MARKER_SEGMENT.markers;

    const result1 = engine.handleKeyPress(markers[0].timeMs);
    expect(result1?.rating).toBe('perfect');

    const missed = advanceTimeAndCheckMissed(engine, markers[1].timeMs + 501);
    expect(missed.length).toBe(1);

    const result3 = engine.handleKeyPress(markers[2].timeMs);
    expect(result3?.rating).toBe('perfect');

    advanceTimeAndCheckMissed(engine, markers[4].timeMs + 501);

    const stats = engine.getStats();
    expect(stats.totalAttempts).toBe(5);
    expect(stats.perfectCount).toBe(2);
    expect(stats.missCount).toBe(3);
    expect(stats.consecutiveMisses).toBe(2);
    expect(stats.currentCombo).toBe(2);
    expect(stats.maxCombo).toBe(2);
  });

  it('reset 后状态完全重置', () => {
    const engine = new TrainingEngine(SIMPLE_2MARKER_SEGMENT);
    const markers = SIMPLE_2MARKER_SEGMENT.markers;

    runKeyPressSequence(engine, [
      { timeMs: markers[0].timeMs },
      { timeMs: markers[1].timeMs },
    ]);

    expect(engine.isFinished()).toBe(true);
    expect(engine.getStats().totalAttempts).toBe(2);

    engine.reset();

    expect(engine.isFinished()).toBe(false);
    expect(engine.getNextMarkerIndex()).toBe(0);
    expectStatsMatch(engine.getStats(), {
      totalAttempts: 0,
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
      currentCombo: 0,
      maxCombo: 0,
      consecutiveMisses: 0,
      averageDeviation: 0,
    });
  });
});
