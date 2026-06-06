import { useEffect, useState } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';
import { RATING_COLORS, RATING_LABELS } from '@/config/constants';
import type { AttemptResult } from '@/types';

export const RatingFeedback = () => {
  const lastResult = useTrainingStore((state) => state.lastResult);
  const [displayResult, setDisplayResult] = useState<AttemptResult | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (lastResult) {
      setDisplayResult(lastResult);
      setShowAnimation(true);

      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        color: RATING_COLORS[lastResult.rating],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 800);

      const clearTimer = setTimeout(() => {
        setDisplayResult(null);
        setParticles([]);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [lastResult]);

  if (!displayResult) return null;

  const color = RATING_COLORS[displayResult.rating];
  const label = RATING_LABELS[displayResult.rating];

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="relative">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full animate-particles"
            style={{
              backgroundColor: particle.color,
              transform: `translate(${particle.x}px, ${particle.y}px)`,
              boxShadow: `0 0 10px ${particle.color}`,
            }}
          />
        ))}

        <div
          className={`text-center ${
            showAnimation ? 'animate-bounce-in' : 'opacity-0'
          }`}
        >
          <div
            className="text-8xl font-song font-bold mb-2"
            style={{
              color,
              textShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
            }}
          >
            {label}
          </div>
          <div
            className="text-3xl font-hei"
            style={{ color }}
          >
            {displayResult.deviationMs} ms
          </div>
          <div className="text-paper-white/60 text-lg font-hei mt-2">
            第{displayResult.position}把位
          </div>
        </div>
      </div>
    </div>
  );
};
