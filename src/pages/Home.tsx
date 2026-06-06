import { useEffect } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGeneratedAudio } from '@/hooks/useGeneratedAudio';
import { ComboDisplay } from '@/components/ComboDisplay';
import { ProgressBar } from '@/components/ProgressBar';
import { RatingFeedback } from '@/components/RatingFeedback';
import { StatsPanel } from '@/components/StatsPanel';
import { ControlButtons } from '@/components/ControlButtons';
import { Countdown } from '@/components/Countdown';
import { FinalResult } from '@/components/FinalResult';
import { Music2 } from 'lucide-react';

export default function Home() {
  const currentSegment = useTrainingStore((state) => state.currentSegment);
  const setGeneratedAudioUrl = useTrainingStore((state) => state.setGeneratedAudioUrl);
  const loadBestRecord = useTrainingStore((state) => state.loadBestRecord);
  const phase = useTrainingStore((state) => state.phase);
  const stats = useTrainingStore((state) => state.stats);

  const { audioUrl, isGenerating } = useGeneratedAudio(currentSegment);

  useKeyboard();

  useEffect(() => {
    if (audioUrl) {
      setGeneratedAudioUrl(audioUrl);
    }
  }, [audioUrl, setGeneratedAudioUrl]);

  useEffect(() => {
    loadBestRecord();
  }, [loadBestRecord]);

  return (
    <div
      className="min-h-screen bg-ink-black relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(92, 26, 26, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
          linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)
        `,
      }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212, 175, 55, 0.1) 10px, rgba(212, 175, 55, 0.1) 11px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(92, 26, 26, 0.1) 10px, rgba(92, 26, 26, 0.1) 11px)
          `,
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12 animate-scroll-reveal">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-gold-500" />
            <Music2 className="w-8 h-8 text-gold-400" />
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-gold-500" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-song font-bold text-gold-400 mb-3"
            style={{
              textShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
            }}
          >
            四胡换把滑音时值偏差训练
          </h1>
          <p className="text-paper-white/60 font-hei text-lg">
            二人台戏班排练室 · 精准训练系统
          </p>
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gold-400" />
              <span className="text-paper-white/60">Perfect ≤40ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-jade-green" />
              <span className="text-paper-white/60">Good ≤90ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-vermilion" />
              <span className="text-paper-white/60">Miss 连续3次断Combo</span>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gradient-to-b from-red-sandalwood-800/60 to-red-sandalwood-900/60 rounded-2xl p-6 border border-gold-600/30 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-8">
                  <ComboDisplay />
                </div>

                <ProgressBar />
              </div>

              <ControlButtons isGenerating={isGenerating} />
            </div>

            <div className="lg:col-span-1">
              <StatsPanel />
            </div>
          </div>

          <div className="bg-red-sandalwood-900/40 rounded-xl p-4 border border-gold-600/20">
            <h3 className="text-gold-400 font-song font-bold mb-3 text-center">
              换把时刻表（毫秒）
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-paper-white/60 font-hei">
                    <th className="px-3 py-2 text-left">序号</th>
                    <th className="px-3 py-2 text-center">时间</th>
                    <th className="px-3 py-2 text-center">把位</th>
                    <th className="px-3 py-2 text-center">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSegment.markers.map((marker, index) => {
                    const result = stats.results[index];
                    let statusColor = 'text-paper-white/40';
                    let statusText = '等待';

                    if (result) {
                      if (result.rating === 'perfect') {
                        statusColor = 'text-gold-400';
                        statusText = 'Perfect';
                      } else if (result.rating === 'good') {
                        statusColor = 'text-jade-green';
                        statusText = 'Good';
                      } else {
                        statusColor = 'text-vermilion';
                        statusText = 'Miss';
                      }
                    } else if (
                      index === stats.results.length &&
                      phase === 'playing'
                    ) {
                      statusColor = 'text-gold-400 animate-pulse';
                      statusText = '进行中';
                    }

                    return (
                      <tr
                        key={index}
                        className="border-t border-gold-600/10 hover:bg-gold-500/5"
                      >
                        <td className="px-3 py-2 text-paper-white/60 font-hei">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 text-center text-paper-white font-mono">
                          {marker.timeMs}ms
                        </td>
                        <td className="px-3 py-2 text-center text-gold-400 font-song font-bold">
                          第{marker.position}把位
                        </td>
                        <td className={`px-3 py-2 text-center font-hei ${statusColor}`}>
                          {result ? (
                            <span className="flex items-center justify-center gap-1">
                              {statusText}
                              <span className="text-xs">({result.deviationMs}ms)</span>
                            </span>
                          ) : (
                            statusText
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center text-paper-white/40 text-sm font-hei">
          <p>按 <kbd className="px-2 py-0.5 bg-red-sandalwood-900 rounded border border-gold-600/30 text-gold-400">空格</kbd> 键在换把滑音标记处响应</p>
          <p className="mt-2">© 二人台戏班排练辅助系统</p>
        </footer>
      </div>

      <Countdown />
      <RatingFeedback />
      <FinalResult />
    </div>
  );
}
