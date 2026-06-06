import { Play, Pause, RotateCcw, Music } from 'lucide-react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { TRAINING_SEGMENTS } from '@/config/segments';

interface ControlButtonsProps {
  isGenerating: boolean;
}

export const ControlButtons = ({ isGenerating }: ControlButtonsProps) => {
  const phase = useTrainingStore((state) => state.phase);
  const currentSegment = useTrainingStore((state) => state.currentSegment);
  const startTraining = useTrainingStore((state) => state.startTraining);
  const pauseTraining = useTrainingStore((state) => state.pauseTraining);
  const resumeTraining = useTrainingStore((state) => state.resumeTraining);
  const resetTraining = useTrainingStore((state) => state.resetTraining);
  const setSegment = useTrainingStore((state) => state.setSegment);

  const handleStart = async () => {
    if (phase === 'idle' || phase === 'finished') {
      await startTraining();
    }
  };

  const handlePause = () => {
    if (phase === 'playing') {
      pauseTraining();
    }
  };

  const handleResume = async () => {
    if (phase === 'paused') {
      await resumeTraining();
    }
  };

  const handleReset = () => {
    resetTraining();
  };

  const handleSegmentChange = (segmentId: string) => {
    if (phase !== 'idle' && phase !== 'finished') return;
    const segment = TRAINING_SEGMENTS.find((s) => s.id === segmentId);
    if (segment) {
      setSegment(segment);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <label className="text-gold-300 text-sm font-hei flex items-center gap-2">
          <Music className="w-4 h-4" />
          选择片段：
        </label>
        <select
          value={currentSegment.id}
          onChange={(e) => handleSegmentChange(e.target.value)}
          disabled={phase !== 'idle' && phase !== 'finished'}
          className="bg-red-sandalwood-800 text-paper-white border border-gold-600/50 rounded-lg px-4 py-2 font-hei focus:outline-none focus:border-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {TRAINING_SEGMENTS.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.name}
            </option>
          ))}
        </select>
      </div>

      <div className="text-paper-white/60 text-sm font-hei text-center mb-6">
        {currentSegment.description}
      </div>

      <div className="flex justify-center gap-4">
        {phase === 'idle' && (
          <button
            onClick={handleStart}
            disabled={isGenerating}
            className="group relative px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-red-sandalwood-900 font-song font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-gold-500/30"
          >
            <span className="flex items-center gap-2">
              <Play className="w-6 h-6" />
              {isGenerating ? '生成音频中...' : '开始训练'}
            </span>
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        )}

        {phase === 'playing' && (
          <button
            onClick={handlePause}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-sandalwood-600 to-red-sandalwood-700 hover:from-red-sandalwood-500 hover:to-red-sandalwood-600 text-paper-white font-song font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <Pause className="w-5 h-5" />
              暂停
            </span>
          </button>
        )}

        {phase === 'paused' && (
          <button
            onClick={handleResume}
            className="group relative px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-red-sandalwood-900 font-song font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              继续
            </span>
          </button>
        )}

        {(phase === 'playing' || phase === 'paused' || phase === 'finished') && (
          <button
            onClick={handleReset}
            className="group relative px-6 py-3 bg-gradient-to-r from-red-sandalwood-700 to-red-sandalwood-800 hover:from-red-sandalwood-600 hover:to-red-sandalwood-700 text-paper-white font-song font-bold rounded-xl border border-gold-600/30 transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              重新开始
            </span>
          </button>
        )}

        {phase === 'finished' && (
          <button
            onClick={handleStart}
            className="group relative px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-red-sandalwood-900 font-song font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              再来一次
            </span>
          </button>
        )}
      </div>

      {(phase === 'playing' || phase === 'countdown') && (
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-sandalwood-800/50 rounded-full border border-gold-600/30">
            <kbd className="px-3 py-1 bg-red-sandalwood-900 text-gold-400 font-mono font-bold rounded-lg border border-gold-600/50 shadow-inner">
              Space
            </kbd>
            <span className="text-paper-white/80 font-hei text-sm">
              听到换把滑音时按下空格键
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
