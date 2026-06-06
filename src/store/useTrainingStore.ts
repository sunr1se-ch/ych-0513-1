import { create } from 'zustand';
import type {
  TrainingSegment,
  SessionStats,
  AttemptResult,
  TrainingPhase,
  BestRecord,
} from '@/types';
import { AudioPlayer } from '@/modules/AudioPlayer';
import { TrainingEngine } from '@/modules/TrainingEngine';
import { Storage } from '@/modules/Storage';
import { getDefaultSegment } from '@/config/segments';

interface TrainingState {
  phase: TrainingPhase;
  currentSegment: TrainingSegment;
  currentTimeMs: number;
  countdownMs: number;
  stats: SessionStats;
  lastResult: AttemptResult | null;
  bestRecord: BestRecord | null;
  isNewBestRecord: boolean;
  audioPlayer: AudioPlayer | null;
  trainingEngine: TrainingEngine | null;
  generatedAudioUrl: string | null;

  setSegment: (segment: TrainingSegment) => void;
  setGeneratedAudioUrl: (url: string) => void;
  initAudio: () => Promise<void>;
  startTraining: () => Promise<void>;
  pauseTraining: () => void;
  resumeTraining: () => Promise<void>;
  stopTraining: () => void;
  resetTraining: () => void;
  handleKeyPress: () => void;
  loadBestRecord: () => void;
}

const initialSegment = getDefaultSegment();

const createInitialStats = (segment: TrainingSegment): SessionStats => {
  const positions = [...new Set(segment.markers.map((m) => m.position))].sort();
  const positionStats: SessionStats['positionStats'] = {};
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
};

export const useTrainingStore = create<TrainingState>((set, get) => ({
  phase: 'idle',
  currentSegment: initialSegment,
  currentTimeMs: 0,
  countdownMs: 0,
  stats: createInitialStats(initialSegment),
  lastResult: null,
  bestRecord: null,
  isNewBestRecord: false,
  audioPlayer: null,
  trainingEngine: null,
  generatedAudioUrl: null,

  setSegment: (segment: TrainingSegment) => {
    set({
      currentSegment: segment,
      stats: createInitialStats(segment),
      generatedAudioUrl: null,
    });
    get().loadBestRecord();
  },

  setGeneratedAudioUrl: (url: string) => {
    set({ generatedAudioUrl: url });
  },

  initAudio: async () => {
    const { currentSegment, generatedAudioUrl } = get();
    const audioPlayer = new AudioPlayer();
    const trainingEngine = new TrainingEngine(currentSegment);

    audioPlayer.setOnTimeUpdate((currentTimeMs) => {
      const { trainingEngine: engine, phase } = get();
      if (!engine || phase !== 'playing') return;

      set({ currentTimeMs });

      const missed = engine.checkMissedMarkers(currentTimeMs);
      if (missed.length > 0) {
        missed.forEach((result) => {
          set({
            lastResult: result,
            stats: engine.getStats(),
          });
        });
      }

      if (engine.isFinished()) {
        get().stopTraining();
      }
    });

    audioPlayer.setOnEnded(() => {
      get().stopTraining();
    });

    if (generatedAudioUrl) {
      await audioPlayer.load(generatedAudioUrl);
    } else {
      await audioPlayer.load(currentSegment.audioFile);
    }

    set({
      audioPlayer,
      trainingEngine,
    });
  },

  startTraining: async () => {
    const { audioPlayer, trainingEngine, currentSegment } = get();

    if (!audioPlayer || !trainingEngine) {
      await get().initAudio();
    }

    const player = get().audioPlayer;
    const engine = get().trainingEngine;

    if (!player || !engine) return;

    set({
      phase: 'countdown',
      countdownMs: currentSegment.preCountDownMs,
      currentTimeMs: 0,
      stats: createInitialStats(currentSegment),
      lastResult: null,
      isNewBestRecord: false,
    });

    engine.reset();

    const countdownInterval = setInterval(() => {
      const { countdownMs } = get();
      const newCountdown = countdownMs - 100;

      if (newCountdown <= 0) {
        clearInterval(countdownInterval);
        player.play(0);
        set({
          phase: 'playing',
          countdownMs: 0,
        });
      } else {
        set({ countdownMs: newCountdown });
      }
    }, 100);
  },

  pauseTraining: () => {
    const { audioPlayer, phase } = get();
    if (!audioPlayer || phase !== 'playing') return;

    audioPlayer.pause();
    set({ phase: 'paused' });
  },

  resumeTraining: async () => {
    const { audioPlayer, currentTimeMs, phase } = get();
    if (!audioPlayer || phase !== 'paused') return;

    await audioPlayer.play(currentTimeMs);
    set({ phase: 'playing' });
  },

  stopTraining: () => {
    const { audioPlayer, trainingEngine, currentSegment } = get();
    if (audioPlayer) {
      audioPlayer.stop();
    }

    if (trainingEngine) {
      const accuracy = trainingEngine.getAccuracy();
      const stats = trainingEngine.getStats();

      const newRecord: BestRecord = {
        segmentId: currentSegment.id,
        maxCombo: stats.maxCombo,
        accuracy,
        averageDeviation: stats.averageDeviation,
        timestamp: Date.now(),
      };

      const isNewBest = Storage.saveBestRecord(newRecord);
      if (isNewBest) {
        get().loadBestRecord();
      }

      set({
        isNewBestRecord: isNewBest,
      });
    }

    set({ phase: 'finished' });
  },

  resetTraining: () => {
    const { audioPlayer, trainingEngine, currentSegment } = get();
    if (audioPlayer) {
      audioPlayer.stop();
    }
    if (trainingEngine) {
      trainingEngine.reset();
    }

    set({
      phase: 'idle',
      currentTimeMs: 0,
      countdownMs: 0,
      stats: createInitialStats(currentSegment),
      lastResult: null,
      isNewBestRecord: false,
    });
  },

  handleKeyPress: () => {
    const { audioPlayer, trainingEngine, phase } = get();
    if (!audioPlayer || !trainingEngine || phase !== 'playing') return;

    const currentTime = audioPlayer.getCurrentTimeMs();
    const result = trainingEngine.handleKeyPress(currentTime);

    if (result) {
      set({
        lastResult: result,
        stats: trainingEngine.getStats(),
      });
    }
  },

  loadBestRecord: () => {
    const { currentSegment } = get();
    const record = Storage.getBestRecord(currentSegment.id);
    set({ bestRecord: record });
  },
}));
