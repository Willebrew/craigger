export class AudioManager {
  private ctx: AudioContext | null = null;
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch {
      // Web Audio not available
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playHop(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playDie(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  playSplash(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Filtered noise for splash
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  playScore(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523, 659]; // C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.linearRampToValueAtTime(0, start + 0.15);

      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  playLevelUp(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

      const start = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.linearRampToValueAtTime(0, start + 0.2);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }
}
