import { useEffect, useCallback } from 'react';
import { useTrainingStore } from '@/store/useTrainingStore';

export const useKeyboard = () => {
  const handleKeyPress = useTrainingStore((state) => state.handleKeyPress);
  const phase = useTrainingStore((state) => state.phase);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();

        if (phase === 'playing') {
          handleKeyPress();
        }
      }
    },
    [phase, handleKeyPress]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
