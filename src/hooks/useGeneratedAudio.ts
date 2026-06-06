import { useState, useEffect, useCallback } from 'react';
import { AudioGenerator } from '@/modules/AudioGenerator';
import type { TrainingSegment } from '@/types';

export const useGeneratedAudio = (segment: TrainingSegment) => {
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const generator = new AudioGenerator();
      const markers = segment.markers.map((m) => ({
        timeMs: m.timeMs,
        position: m.position,
      }));
      const url = await generator.generateSampleAudio(segment.durationMs, markers);
      setAudioUrl(url);
      generator.destroy();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  }, [segment]);

  useEffect(() => {
    generateAudio();

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [generateAudio, audioUrl]);

  return { audioUrl, isGenerating, error, regenerate: generateAudio };
};
