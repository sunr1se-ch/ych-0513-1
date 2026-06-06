import type { TrainingSegment, PositionMarker } from '@/types';

export const createTestMarkers = (count: number, startMs: number = 1000, intervalMs: number = 1000): PositionMarker[] => {
  const markers: PositionMarker[] = [];
  for (let i = 0; i < count; i++) {
    markers.push({
      timeMs: startMs + i * intervalMs,
      position: (i % 4) + 1,
      label: `第${(i % 4) + 1}把位`,
    });
  }
  return markers;
};

export const createTestSegment = (markers: PositionMarker[], id: string = 'test-segment'): TrainingSegment => {
  const lastMarkerTime = markers.length > 0 ? markers[markers.length - 1].timeMs : 0;
  return {
    id,
    name: '测试片段',
    description: '用于自动化测试的练习片段',
    audioFile: '/audio/test.mp3',
    durationMs: lastMarkerTime + 2000,
    preCountDownMs: 1000,
    markers,
  };
};

export const SIMPLE_2MARKER_SEGMENT = createTestSegment([
  { timeMs: 1000, position: 1, label: '第一把位' },
  { timeMs: 2000, position: 2, label: '第二把位' },
]);

export const SIMPLE_3MARKER_SEGMENT = createTestSegment([
  { timeMs: 1000, position: 1, label: '第一把位' },
  { timeMs: 2000, position: 2, label: '第二把位' },
  { timeMs: 3000, position: 3, label: '第三把位' },
]);

export const SIMPLE_5MARKER_SEGMENT = createTestSegment([
  { timeMs: 1000, position: 1, label: '第一把位' },
  { timeMs: 2000, position: 2, label: '第二把位' },
  { timeMs: 3000, position: 3, label: '第三把位' },
  { timeMs: 4000, position: 2, label: '第二把位' },
  { timeMs: 5000, position: 1, label: '第一把位' },
]);

export const MULTI_POSITION_SEGMENT = createTestSegment([
  { timeMs: 1000, position: 1 },
  { timeMs: 2000, position: 1 },
  { timeMs: 3000, position: 2 },
  { timeMs: 4000, position: 2 },
  { timeMs: 5000, position: 3 },
  { timeMs: 6000, position: 3 },
]);

export const COMBO_TEST_SEGMENT = createTestSegment([
  { timeMs: 1000, position: 1 },
  { timeMs: 2000, position: 2 },
  { timeMs: 3000, position: 3 },
  { timeMs: 4000, position: 2 },
  { timeMs: 5000, position: 1 },
  { timeMs: 6000, position: 2 },
  { timeMs: 7000, position: 3 },
]);

export const THRESHOLD_TEST_SEGMENT = createTestSegment([
  { timeMs: 2000, position: 1 },
]);
