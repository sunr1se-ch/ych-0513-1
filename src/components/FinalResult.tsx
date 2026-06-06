import { useMemo } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { Trophy, Star, RotateCcw } from 'lucide-react';
import { RATING_COLORS } from '@/config/constants';

export const FinalResult = () => {
  const phase = useTrainingStore((state) => state.phase);
  const stats = useTrainingStore((state) => state.stats);
  const isNewBestRecord = useTrainingStore((state) => state.isNewBestRecord);
  const resetTraining = useTrainingStore((state) => state.resetTraining);
  const startTraining = useTrainingStore((state) => state.startTraining);

  const accuracy = useMemo(() => {
    if (stats.totalAttempts === 0) return 0;
    return ((stats.perfectCount + stats.goodCount) / stats.totalAttempts) * 100;
  }, [stats]);

  const getGrade = () => {
    if (accuracy >= 90) return { label: 'S', color: '#D4AF37', desc: '大师级！' };
    if (accuracy >= 80) return { label: 'A', color: '#3A8A5E', desc: '非常优秀！' };
    if (accuracy >= 70) return { label: 'B', color: '#4A90A4', desc: '表现不错！' };
    if (accuracy >= 60) return { label: 'C', color: '#E67E22', desc: '继续努力！' };
    return { label: 'D', color: '#C0392B', desc: '多加练习！' };
  };

  const grade = getGrade();

  if (phase !== 'finished') return null;

  return (
    <div className="fixed inset-0 bg-ink-black/90 flex items-center justify-center z-40 backdrop-blur-md p-4">
      <div className="bg-gradient-to-b from-red-sandalwood-800 to-red-sandalwood-900 rounded-3xl p-8 max-w-lg w-full border-2 border-gold-500/50 shadow-2xl animate-scroll-reveal relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

        {isNewBestRecord && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-400 text-red-sandalwood-900 px-6 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
            <Star className="w-4 h-4" />
            新纪录！
            <Star className="w-4 h-4" />
          </div>
        )}

        <h2 className="text-gold-400 text-3xl font-song font-bold text-center mb-6 mt-4">
          训练完成
        </h2>

        <div className="flex justify-center mb-6">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center border-4 animate-glow"
            style={{
              borderColor: grade.color,
              background: `radial-gradient(circle, ${grade.color}22 0%, transparent 70%)`,
            }}
          >
            <div
              className="text-6xl font-song font-bold"
              style={{ color: grade.color }}
            >
              {grade.label}
            </div>
          </div>
        </div>

        <p
          className="text-center text-xl font-song mb-8"
          style={{ color: grade.color }}
        >
          {grade.desc}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
            <div className="text-paper-white/60 text-xs font-hei mb-1">命中率</div>
            <div className="text-gold-400 text-3xl font-song font-bold">
              {accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
            <div className="text-paper-white/60 text-xs font-hei mb-1">最高连击</div>
            <div className="text-gold-400 text-3xl font-song font-bold">
              {stats.maxCombo}
            </div>
          </div>

          <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
            <div className="text-paper-white/60 text-xs font-hei mb-1">平均偏差</div>
            <div className="text-gold-400 text-3xl font-song font-bold">
              {stats.averageDeviation.toFixed(0)} ms
            </div>
          </div>

          <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
            <div className="text-paper-white/60 text-xs font-hei mb-1">评级统计</div>
            <div className="flex justify-center gap-3 text-lg font-bold">
              <span style={{ color: RATING_COLORS.perfect }}>{stats.perfectCount}</span>
              <span style={{ color: RATING_COLORS.good }}>{stats.goodCount}</span>
              <span style={{ color: RATING_COLORS.miss }}>{stats.missCount}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetTraining}
            className="flex-1 px-6 py-3 bg-red-sandalwood-700 hover:bg-red-sandalwood-600 text-paper-white font-song font-bold rounded-xl border border-gold-600/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            返回
          </button>
          <button
            onClick={() => startTraining()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-red-sandalwood-900 font-song font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            再来一次
          </button>
        </div>
      </div>
    </div>
  );
};
