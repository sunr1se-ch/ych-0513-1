import { useMemo } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';

export const ProgressBar = () => {
  const currentTimeMs = useTrainingStore((state) => state.currentTimeMs);
  const segment = useTrainingStore((state) => state.currentSegment);
  const stats = useTrainingStore((state) => state.stats);
  const phase = useTrainingStore((state) => state.phase);

  const progress = useMemo(() => {
    if (segment.durationMs === 0) return 0;
    return Math.min((currentTimeMs / segment.durationMs) * 100, 100);
  }, [currentTimeMs, segment.durationMs]);

  const nextMarker = useMemo(() => {
    const nextIndex = stats.results.length;
    if (nextIndex < segment.markers.length) {
      return segment.markers[nextIndex];
    }
    return null;
  }, [segment.markers, stats.results.length]);

  const timeToNextMarker = useMemo(() => {
    if (!nextMarker || phase !== 'playing') return null;
    return Math.max(0, nextMarker.timeMs - currentTimeMs);
  }, [nextMarker, currentTimeMs, phase]);

  const isNearMarker = useMemo(() => {
    return timeToNextMarker !== null && timeToNextMarker <= 500;
  }, [timeToNextMarker]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-paper-white text-sm font-hei">
          {formatTime(currentTimeMs)}
        </div>
        <div className="text-gold-400 text-xs font-hei">
          {segment.name}
        </div>
        <div className="text-paper-white/60 text-sm font-hei">
          {formatTime(segment.durationMs)}
        </div>
      </div>

      <div className="relative h-3 bg-red-sandalwood-900/50 rounded-full overflow-hidden border border-red-sandalwood-700">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        {segment.markers.map((marker, index) => {
          const markerPos = (marker.timeMs / segment.durationMs) * 100;
          const isPassed = index < stats.results.length;
          const result = stats.results[index];
          let markerColor = 'bg-gold-500';

          if (isPassed && result) {
            if (result.rating === 'perfect') markerColor = 'bg-gold-400';
            else if (result.rating === 'good') markerColor = 'bg-jade-green';
            else markerColor = 'bg-vermilion';
          }

          return (
            <div
              key={index}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${markerColor} ${
                !isPassed && nextMarker?.timeMs === marker.timeMs && isNearMarker
                  ? 'animate-pulse-gold scale-125'
                  : ''
              } transition-all duration-200`}
              style={{ left: `calc(${markerPos}% - 6px)` }}
              title={`第${marker.position}把位 - ${marker.timeMs}ms`}
            />
          );
        })}

        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-paper-white rounded-full shadow-lg"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex justify-center items-center gap-4">
        {nextMarker && phase === 'playing' && (
          <div
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              isNearMarker
                ? 'animate-pulse-gold border-gold-400 bg-gold-500/20'
                : 'border-gold-600/50 bg-red-sandalwood-800/50'
            }`}
          >
            <div className="text-gold-300 text-xs font-hei text-center">
              下一个
            </div>
            <div className="text-gold-400 text-xl font-song font-bold text-center">
              第{nextMarker.position}把位
            </div>
            {timeToNextMarker !== null && (
              <div className="text-paper-white text-sm font-hei text-center">
                {(timeToNextMarker / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
