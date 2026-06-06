import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from './Storage';
import type { BestRecord } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';

describe('Storage - 个人最佳存档', () => {
  const TEST_SEGMENT_ID = 'test-segment-001';
  const ANOTHER_SEGMENT_ID = 'test-segment-002';

  const createRecord = (
    segmentId: string,
    accuracy: number,
    maxCombo: number,
    averageDeviation: number
  ): BestRecord => ({
    segmentId,
    accuracy,
    maxCombo,
    averageDeviation,
    timestamp: Date.now(),
  });

  beforeEach(() => {
    Storage.clearAllRecords();
  });

  describe('基础 CRUD', () => {
    it('无记录时 getBestRecord 返回 null', () => {
      const record = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(record).toBeNull();
    });

    it('首次保存返回 true 并写入记录', () => {
      const record = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      const result = Storage.saveBestRecord(record);

      expect(result).toBe(true);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved).toEqual(record);
    });

    it('不同片段的记录互不影响', () => {
      const record1 = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      const record2 = createRecord(ANOTHER_SEGMENT_ID, 0.9, 15, 25);

      Storage.saveBestRecord(record1);
      Storage.saveBestRecord(record2);

      expect(Storage.getBestRecord(TEST_SEGMENT_ID)?.segmentId).toBe(TEST_SEGMENT_ID);
      expect(Storage.getBestRecord(ANOTHER_SEGMENT_ID)?.segmentId).toBe(ANOTHER_SEGMENT_ID);
    });

    it('clearAllRecords 清空所有记录', () => {
      Storage.saveBestRecord(createRecord(TEST_SEGMENT_ID, 0.8, 10, 30));
      expect(Storage.getBestRecord(TEST_SEGMENT_ID)).not.toBeNull();

      Storage.clearAllRecords();
      expect(Storage.getBestRecord(TEST_SEGMENT_ID)).toBeNull();
    });
  });

  describe('覆盖规则：命中率优先', () => {
    it('命中率更高时覆盖旧记录', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.7, 10, 30);
      Storage.saveBestRecord(existing);

      const better = createRecord(TEST_SEGMENT_ID, 0.8, 8, 40);
      const result = Storage.saveBestRecord(better);

      expect(result).toBe(true);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.accuracy).toBe(0.8);
      expect(saved?.maxCombo).toBe(8);
    });

    it('命中率更低时不覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      Storage.saveBestRecord(existing);

      const worse = createRecord(TEST_SEGMENT_ID, 0.7, 15, 20);
      const result = Storage.saveBestRecord(worse);

      expect(result).toBe(false);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.accuracy).toBe(0.8);
    });
  });

  describe('覆盖规则：命中率相同则比较 maxCombo', () => {
    it('命中率相同，maxCombo 更高时覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      Storage.saveBestRecord(existing);

      const better = createRecord(TEST_SEGMENT_ID, 0.8, 12, 40);
      const result = Storage.saveBestRecord(better);

      expect(result).toBe(true);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.maxCombo).toBe(12);
    });

    it('命中率相同，maxCombo 更低时不覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      Storage.saveBestRecord(existing);

      const worse = createRecord(TEST_SEGMENT_ID, 0.8, 8, 20);
      const result = Storage.saveBestRecord(worse);

      expect(result).toBe(false);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.maxCombo).toBe(10);
    });
  });

  describe('覆盖规则：命中率和 maxCombo 相同则比较平均偏差', () => {
    it('命中率和 maxCombo 相同，平均偏差更小时覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 40);
      Storage.saveBestRecord(existing);

      const better = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      const result = Storage.saveBestRecord(better);

      expect(result).toBe(true);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.averageDeviation).toBe(30);
    });

    it('命中率和 maxCombo 相同，平均偏差更大时不覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      Storage.saveBestRecord(existing);

      const worse = createRecord(TEST_SEGMENT_ID, 0.8, 10, 40);
      const result = Storage.saveBestRecord(worse);

      expect(result).toBe(false);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.averageDeviation).toBe(30);
    });
  });

  describe('覆盖规则：完全持平', () => {
    it('三项指标完全持平不覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      const originalTimestamp = existing.timestamp;
      Storage.saveBestRecord(existing);

      const same = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      same.timestamp = originalTimestamp + 1000;
      const result = Storage.saveBestRecord(same);

      expect(result).toBe(false);
      const saved = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(saved?.timestamp).toBe(originalTimestamp);
    });
  });

  describe('边界情形', () => {
    it('命中率差距极小但仍更高时覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8000, 10, 30);
      Storage.saveBestRecord(existing);

      const better = createRecord(TEST_SEGMENT_ID, 0.8001, 8, 40);
      const result = Storage.saveBestRecord(better);

      expect(result).toBe(true);
    });

    it('平均偏差差距极小但仍更小时覆盖', () => {
      const existing = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30.001);
      Storage.saveBestRecord(existing);

      const better = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30.000);
      const result = Storage.saveBestRecord(better);

      expect(result).toBe(true);
    });

    it('多轮竞争后保留最佳', () => {
      const record1 = createRecord(TEST_SEGMENT_ID, 0.6, 5, 50);
      const record2 = createRecord(TEST_SEGMENT_ID, 0.7, 8, 45);
      const record3 = createRecord(TEST_SEGMENT_ID, 0.7, 10, 40);
      const record4 = createRecord(TEST_SEGMENT_ID, 0.7, 10, 35);
      const record5 = createRecord(TEST_SEGMENT_ID, 0.8, 8, 30);

      expect(Storage.saveBestRecord(record1)).toBe(true);
      expect(Storage.saveBestRecord(record2)).toBe(true);
      expect(Storage.saveBestRecord(record3)).toBe(true);
      expect(Storage.saveBestRecord(record4)).toBe(true);
      expect(Storage.saveBestRecord(record5)).toBe(true);

      const final = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(final?.accuracy).toBe(0.8);
      expect(final?.maxCombo).toBe(8);
      expect(final?.averageDeviation).toBe(30);
    });

    it('劣化记录连续尝试均不覆盖', () => {
      const best = createRecord(TEST_SEGMENT_ID, 0.9, 15, 25);
      Storage.saveBestRecord(best);

      const worse1 = createRecord(TEST_SEGMENT_ID, 0.8, 20, 20);
      const worse2 = createRecord(TEST_SEGMENT_ID, 0.9, 14, 20);
      const worse3 = createRecord(TEST_SEGMENT_ID, 0.9, 15, 26);
      const same = createRecord(TEST_SEGMENT_ID, 0.9, 15, 25);

      expect(Storage.saveBestRecord(worse1)).toBe(false);
      expect(Storage.saveBestRecord(worse2)).toBe(false);
      expect(Storage.saveBestRecord(worse3)).toBe(false);
      expect(Storage.saveBestRecord(same)).toBe(false);

      const final = Storage.getBestRecord(TEST_SEGMENT_ID);
      expect(final).toEqual(best);
    });
  });

  describe('持久化验证', () => {
    it('数据正确存储到 localStorage', () => {
      const record = createRecord(TEST_SEGMENT_ID, 0.85, 12, 28);
      Storage.saveBestRecord(record);

      const raw = localStorage.getItem(STORAGE_KEYS.BEST_RECORDS);
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed[TEST_SEGMENT_ID]).toEqual(record);
    });

    it('getBestRecords 返回所有记录', () => {
      const record1 = createRecord(TEST_SEGMENT_ID, 0.8, 10, 30);
      const record2 = createRecord(ANOTHER_SEGMENT_ID, 0.9, 15, 25);

      Storage.saveBestRecord(record1);
      Storage.saveBestRecord(record2);

      const all = Storage.getBestRecords();
      expect(all[TEST_SEGMENT_ID]).toEqual(record1);
      expect(all[ANOTHER_SEGMENT_ID]).toEqual(record2);
    });
  });
});
