export class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private sampleRate: number = 44100;

  public async generateSampleAudio(durationMs: number, markers: { timeMs: number; position: number }[]): Promise<string> {
    this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    const duration = durationMs / 1000;
    const buffer = this.audioContext.createBuffer(2, this.sampleRate * duration, this.sampleRate);

    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    const baseFreq = 196;
    const positionFreqMultiplier: Record<number, number> = {
      1: 1.0,
      2: 1.25,
      3: 1.5,
      4: 1.75,
    };

    for (let i = 0; i < buffer.length; i++) {
      const time = i / this.sampleRate;
      const timeMs = time * 1000;

      let envelope = 0.3;
      let currentPosition = 1;

      for (let j = 0; j < markers.length; j++) {
        const marker = markers[j];
        const nextMarker = markers[j + 1];

        if (timeMs >= marker.timeMs && (!nextMarker || timeMs < nextMarker.timeMs)) {
          currentPosition = marker.position;

          const glideStart = marker.timeMs - 200;
          const glideEnd = marker.timeMs + 200;

          if (timeMs >= glideStart && timeMs <= glideEnd) {
            const prevPosition = j > 0 ? markers[j - 1].position : marker.position;
            const glideProgress = (timeMs - glideStart) / (glideEnd - glideStart);
            const easedProgress = glideProgress < 0.5
              ? 2 * glideProgress * glideProgress
              : 1 - Math.pow(-2 * glideProgress + 2, 2) / 2;

            const startFreq = baseFreq * positionFreqMultiplier[prevPosition];
            const endFreq = baseFreq * positionFreqMultiplier[marker.position];
            const currentFreq = startFreq + (endFreq - startFreq) * easedProgress;

            const sample = this.generateNoteSample(currentFreq, time, 0.6);
            leftChannel[i] = sample;
            rightChannel[i] = sample;

            envelope = 0.8 * (1 - Math.abs(glideProgress - 0.5) * 0.5);
            break;
          }

          const stableProgress = nextMarker
            ? (timeMs - marker.timeMs) / (nextMarker.timeMs - marker.timeMs)
            : 0;
          envelope = 0.5 + Math.sin(stableProgress * Math.PI) * 0.2;
          break;
        }
      }

      const freq = baseFreq * positionFreqMultiplier[currentPosition];
      const sample = this.generateNoteSample(freq, time, envelope);

      if (leftChannel[i] === 0) {
        leftChannel[i] = sample;
        rightChannel[i] = sample;
      }

      if (i > 0 && i < buffer.length - 1) {
        const fadeIn = Math.min(1, time * 1000 / 50);
        const fadeOut = Math.min(1, (duration - time) * 1000 / 200);
        leftChannel[i] *= fadeIn * fadeOut;
        rightChannel[i] *= fadeIn * fadeOut;
      }
    }

    const wavBlob = this.bufferToWave(buffer);
    return URL.createObjectURL(wavBlob);
  }

  private generateNoteSample(frequency: number, time: number, amplitude: number): number {
    const fundamental = Math.sin(2 * Math.PI * frequency * time) * 0.6;
    const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.25;
    const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.12;
    const harmonic4 = Math.sin(2 * Math.PI * frequency * 4 * time) * 0.06;

    const vibrato = Math.sin(2 * Math.PI * 5 * time) * 0.02;
    const tremolo = 1 + Math.sin(2 * Math.PI * 6 * time) * 0.03;

    const noise = (Math.random() - 0.5) * 0.02;

    return (fundamental + harmonic2 + harmonic3 + harmonic4 + vibrato + noise) * amplitude * tremolo;
  }

  private bufferToWave(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, length - 8, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 2 * numChannels, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, length - 44, true);

    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    pos = 44;
    while (pos < length) {
      for (let i = 0; i < numChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
