// audio.js — every sound in Cat Capers is synthesised with WebAudio at
// play time: no audio files, no network. A find is a bright two-note
// "meow-chime", a miss is a low thud, a hint hums, and finishing a scene
// plays a little purr-arpeggio.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  // The context must be born inside a user gesture, so it is created
  // lazily on the first click or keypress.
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, at, dur, type = 'sine', gain = 0.16) {
    const ctx = this.ensure();
    if (!ctx || !this.enabled) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  find(streak = 1) {
    // A rising chirp; longer streaks start higher, like an excited cat.
    const base = 620 + Math.min(streak, 6) * 60;
    this.tone(base, 0, 0.12, 'triangle', 0.18);
    this.tone(base * 1.335, 0.07, 0.16, 'triangle', 0.18);
    this.tone(base * 2, 0.13, 0.1, 'sine', 0.07);
  }

  miss() {
    this.tone(150, 0, 0.18, 'sawtooth', 0.06);
    this.tone(110, 0.02, 0.2, 'square', 0.04);
  }

  hint() {
    this.tone(880, 0, 0.14, 'sine', 0.1);
    this.tone(880, 0.2, 0.14, 'sine', 0.1);
  }

  click() {
    this.tone(440, 0, 0.05, 'triangle', 0.08);
  }

  sceneClear() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => this.tone(f, i * 0.09, 0.22, 'triangle', 0.15));
  }

  gameOver() {
    const notes = [392, 330, 262, 196];
    notes.forEach((f, i) => this.tone(f, i * 0.13, 0.24, 'triangle', 0.13));
  }

  win() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((f, i) => this.tone(f, i * 0.1, 0.26, 'triangle', 0.15));
  }
}
