import { useMemo } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { Trophy, Target, Clock, Zap } from 'lucide-react';

export const StatsPanel = () => {
  const stats = useTrainingStore((state) => state.stats);
  const bestRecord = useTrainingStore((state) => state.bestRecord);
  const segment = useTrainingStore((state) => state.currentSegment);

  const accuracy = useMemo(() => {
    if (stats.totalAttempts === 0) return 0;
    return ((stats.perfectCount + stats.goodCount) / stats.totalAttempts) * 100;
  }, [stats]);

  const positions = useMemo(() => {
    return Object.entries(stats.positionStats)
      .map(([position, data]) => ({
        position: parseInt(position),
        ...data,
        accuracy: data.total > 0 ? (data.hit / data.total) * 100 : 0,
      }))
      .sort((a, b) => a.position - b.position);
  }, [stats.positionStats]);

  const maxBarHeight = 120;

  return (
    <div className="bg-gradient-to-b from-red-sandalwood-800/80 to-red-sandalwood-900/80 rounded-2xl p-6 border border-gold-600/30 backdrop-blur-sm">
      <h3 className="text-gold-400 text-xl font-song font-bold mb-6 text-center">
        训练统计
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
          <Target className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <div className="text-paper-white/60 text-xs font-hei mb-1">命中率</div>
          <div className="text-gold-400 text-2xl font-song font-bold">
            {accuracy.toFixed(1)}%
          </div>
        </div>

        <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
          <Clock className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <div className="text-paper-white/60 text-xs font-hei mb-1">平均偏差</div>
          <div className="text-gold-400 text-2xl font-song font-bold">
            {stats.averageDeviation.toFixed(0)} ms
          </div>
        </div>

        <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
          <Zap className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <div className="text-paper-white/60 text-xs font-hei mb-1">总次数</div>
          <div className="text-gold-400 text-2xl font-song font-bold">
            {stats.totalAttempts} / {segment.markers.length}
          </div>
        </div>

        <div className="bg-red-sandalwood-900/50 rounded-xl p-4 text-center border border-gold-600/20">
          <div className="flex justify-center gap-2 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-gold-400" />
            <span className="inline-block w-3 h-3 rounded-full bg-jade-green" />
            <span className="inline-block w-3 h-3 rounded-full bg-vermilion" />
          </div>
          <div className="text-paper-white/60 text-xs font-hei mb-1">Perfect / Good / Miss</div>
          <div className="text-gold-400 text-lg font-song font-bold">
            {stats.perfectCount} / {stats.goodCount} / {stats.missCount}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-gold-300 text-sm font-hei mb-4 text-center">各把位命中率</h4>
        <div className="flex justify-around items-end h-40 gap-2">
          {positions.map((pos) => (
            <div key={pos.position} className="flex flex-col items-center flex-1">
              <div className="text-paper-white/80 text-xs font-hei mb-1">
                {pos.accuracy.toFixed(0)}%
              </div>
              <div className="relative w-full max-w-16 flex justify-center">
                <div
                  className="w-10 rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-400 transition-all duration-500"
                  style={{
                    height: `${(pos.accuracy / 100) * maxBarHeight}px`,
                    minHeight: pos.total > 0 ? '4px' : '0',
                  }}
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-red-sandalwood-700" />
              </div>
              <div className="text-gold-400 text-sm font-song font-bold mt-3">
                第{pos.position}把位
              </div>
              <div className="text-paper-white/50 text-xs font-hei">
                {pos.total} 次
              </div>
            </div>
          ))}
        </div>
      </div>

      {bestRecord && (
        <div className="bg-gradient-to-r from-gold-600/20 to-gold-500/10 rounded-xl p-4 border border-gold-500/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-gold-400" />
            <span className="text-gold-400 font-song font-bold">个人最佳成绩</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-paper-white/60 text-xs">最高连击</div>
              <div className="text-gold-300 font-bold">{bestRecord.maxCombo}</div>
            </div>
            <div>
              <div className="text-paper-white/60 text-xs">命中率</div>
              <div className="text-gold-300 font-bold">
                {(bestRecord.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-paper-white/60 text-xs">平均偏差</div>
              <div className="text-gold-300 font-bold">
                {bestRecord.averageDeviation.toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
