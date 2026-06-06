import type { BestRecord } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';

export class Storage {
  public static getBestRecords(): Record<string, BestRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BEST_RECORDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load best records:', error);
    }
    return {};
  }

  public static getBestRecord(segmentId: string): BestRecord | null {
    const records = this.getBestRecords();
    return records[segmentId] || null;
  }

  public static saveBestRecord(record: BestRecord): boolean {
    try {
      const records = this.getBestRecords();
      const existing = records[record.segmentId];

      if (!existing || this.isBetterRecord(record, existing)) {
        records[record.segmentId] = record;
        localStorage.setItem(STORAGE_KEYS.BEST_RECORDS, JSON.stringify(records));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save best record:', error);
      return false;
    }
  }

  private static isBetterRecord(newRecord: BestRecord, existing: BestRecord): boolean {
    if (newRecord.accuracy > existing.accuracy) {
      return true;
    }
    if (newRecord.accuracy === existing.accuracy) {
      if (newRecord.maxCombo > existing.maxCombo) {
        return true;
      }
      if (newRecord.maxCombo === existing.maxCombo) {
        return newRecord.averageDeviation < existing.averageDeviation;
      }
    }
    return false;
  }

  public static clearAllRecords(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.BEST_RECORDS);
    } catch (error) {
      console.error('Failed to clear records:', error);
    }
  }
}
