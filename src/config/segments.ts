import type { TrainingSegment } from '@/types';

export const TRAINING_SEGMENTS: TrainingSegment[] = [
  {
    id: 'sample-01',
    name: '二人台《走西口》选段',
    description: '基础换把练习，包含第1-3把位的滑音转换',
    audioFile: '/audio/sample.mp3',
    durationMs: 16000,
    preCountDownMs: 3000,
    markers: [
      { timeMs: 1500, position: 1, label: '第一把位' },
      { timeMs: 3200, position: 2, label: '第二把位' },
      { timeMs: 4800, position: 3, label: '第三把位' },
      { timeMs: 6500, position: 2, label: '第二把位' },
      { timeMs: 8200, position: 1, label: '第一把位' },
      { timeMs: 9800, position: 2, label: '第二把位' },
      { timeMs: 11500, position: 3, label: '第三把位' },
      { timeMs: 13200, position: 2, label: '第二把位' },
      { timeMs: 14800, position: 1, label: '第一把位' },
    ],
  },
  {
    id: 'sample-02',
    name: '四胡独奏练习曲',
    description: '进阶练习，包含快速换把和第4把位',
    audioFile: '/audio/sample2.mp3',
    durationMs: 20000,
    preCountDownMs: 3000,
    markers: [
      { timeMs: 1200, position: 1, label: '第一把位' },
      { timeMs: 2500, position: 2, label: '第二把位' },
      { timeMs: 3800, position: 3, label: '第三把位' },
      { timeMs: 5100, position: 4, label: '第四把位' },
      { timeMs: 6400, position: 3, label: '第三把位' },
      { timeMs: 7700, position: 2, label: '第二把位' },
      { timeMs: 9000, position: 1, label: '第一把位' },
      { timeMs: 10300, position: 2, label: '第二把位' },
      { timeMs: 11600, position: 3, label: '第三把位' },
      { timeMs: 12900, position: 4, label: '第四把位' },
      { timeMs: 14200, position: 3, label: '第三把位' },
      { timeMs: 15500, position: 2, label: '第二把位' },
      { timeMs: 16800, position: 1, label: '第一把位' },
      { timeMs: 18100, position: 1, label: '第一把位' },
    ],
  },
];

export const getSegmentById = (id: string): TrainingSegment | undefined => {
  return TRAINING_SEGMENTS.find((s) => s.id === id);
};

export const getDefaultSegment = (): TrainingSegment => {
  return TRAINING_SEGMENTS[0];
};
