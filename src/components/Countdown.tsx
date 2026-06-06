import { useTrainingStore } from '@/store/useTrainingStore';

export const Countdown = () => {
  const phase = useTrainingStore((state) => state.phase);
  const countdownMs = useTrainingStore((state) => state.countdownMs);

  if (phase !== 'countdown') return null;

  const countdownSeconds = Math.ceil(countdownMs / 1000);

  return (
    <div className="fixed inset-0 bg-ink-black/80 flex items-center justify-center z-40 backdrop-blur-sm">
      <div className="text-center">
        <div className="text-gold-300 text-2xl font-song mb-8 animate-float">
          准备开始
        </div>
        <div
          className="text-9xl font-song font-bold text-gold-400 animate-bounce-in"
          key={countdownSeconds}
          style={{
            textShadow: '0 0 40px rgba(212, 175, 55, 0.8), 0 0 80px rgba(212, 175, 55, 0.4)',
          }}
        >
          {countdownSeconds}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {[3, 2, 1].map((num) => (
            <div
              key={num}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                countdownSeconds <= num ? 'bg-gold-400 scale-125' : 'bg-gold-800'
              }`}
              style={{
                boxShadow: countdownSeconds <= num ? '0 0 15px rgba(212, 175, 55, 0.8)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
