export class AudioPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private onTimeUpdate: ((currentTimeMs: number) => void) | null = null;
  private onEnded: (() => void) | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', this.handleEnded.bind(this));
  }

  public setOnTimeUpdate(callback: (currentTimeMs: number) => void): void {
    this.onTimeUpdate = callback;
  }

  public setOnEnded(callback: () => void): void {
    this.onEnded = callback;
  }

  public async load(url: string): Promise<void> {
    if (!this.audioElement) return;

    try {
      this.audioElement.src = url;
      await this.audioElement.load();
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  public async loadFromBlob(blob: Blob): Promise<void> {
    if (!this.audioElement) return;

    try {
      const url = URL.createObjectURL(blob);
      this.audioElement.src = url;
      await this.audioElement.load();
    } catch (error) {
      console.error('Failed to load audio from blob:', error);
      throw error;
    }
  }

  public async initAudioContext(): Promise<void> {
    if (this.audioContext || !this.audioElement) return;

    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextConstructor();
      this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Failed to init audio context:', error);
    }
  }

  public async play(startTimeMs: number = 0): Promise<void> {
    if (!this.audioElement) return;

    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.audioElement.currentTime = startTimeMs / 1000;
      await this.audioElement.play();
      this.isPlaying = true;
      this.startTime = performance.now() - startTimeMs;
      this.startTimeTracking();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  public pause(): void {
    if (!this.audioElement || !this.isPlaying) return;

    this.audioElement.pause();
    this.pauseTime = this.getCurrentTimeMs();
    this.isPlaying = false;
    this.stopTimeTracking();
  }

  public stop(): void {
    if (!this.audioElement) return;

    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.stopTimeTracking();
  }

  public getCurrentTimeMs(): number {
    if (!this.isPlaying) {
      return this.pauseTime;
    }
    return performance.now() - this.startTime;
  }

  public getDurationMs(): number {
    if (!this.audioElement || isNaN(this.audioElement.duration)) {
      return 0;
    }
    return this.audioElement.duration * 1000;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startTimeTracking(): void {
    const track = () => {
      if (this.isPlaying && this.onTimeUpdate) {
        this.onTimeUpdate(this.getCurrentTimeMs());
      }
      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(track);
      }
    };
    this.animationFrameId = requestAnimationFrame(track);
  }

  private stopTimeTracking(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private handleEnded(): void {
    this.isPlaying = false;
    this.stopTimeTracking();
    if (this.onEnded) {
      this.onEnded();
    }
  }

  public destroy(): void {
    this.stop();
    if (this.audioElement) {
      this.audioElement.removeEventListener('ended', this.handleEnded.bind(this));
      this.audioElement.src = '';
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioElement = null;
    this.audioContext = null;
    this.sourceNode = null;
  }
}
