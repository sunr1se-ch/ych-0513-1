import { useTrainingStore } from '@/store/useTrainingStore';

export const ComboDisplay = () => {
  const currentCombo = useTrainingStore((state) => state.stats.currentCombo);
  const maxCombo = useTrainingStore((state) => state.stats.maxCombo);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${
          currentCombo >= 10 ? 'animate-glow' : ''
        } rounded-full bg-gradient-to-br from-red-sandalwood-700 to-red-sandalwood-900 p-6 border-4 border-gold-500`}
      >
        <div className="text-center">
          <div className="text-gold-200 text-sm font-hei mb-1">COMBO</div>
          <div
            className={`text-6xl font-song font-bold ${
              currentCombo > 0 ? 'text-gold-400' : 'text-gold-600'
            } transition-all duration-200`}
            style={{
              textShadow:
                currentCombo >= 10
                  ? '0 0 20px rgba(212, 175, 55, 0.8)'
                  : 'none',
            }}
          >
            {currentCombo}
          </div>
        </div>
        {currentCombo > 0 && (
          <div className="absolute -top-2 -right-2 bg-gold-500 text-red-sandalwood-900 text-xs font-bold px-2 py-1 rounded-full">
            最高 {maxCombo}
          </div>
        )}
      </div>
    </div>
  );
};
