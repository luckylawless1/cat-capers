// engine.js — the rules of Cat Capers. Three scenes, each with its own
// clock and a tighter click radius than the last. Find every difference
// before the clock runs out: wrong clicks cost 5 seconds, three misses
// end the hunt, and chained finds build a streak that pays more per find.

import { SCENES } from './scenes.js';

export const MAX_MISSES = 3;
export const WRONG_CLICK_PENALTY = 5;
export const START_HINTS = 3;

export class Game {
  constructor(sound) {
    this.sound = sound;
    this.phase = 'title'; // title | play | clear | won | lost
    this.sceneIndex = 0;
    this.scene = SCENES[0];
    this.elapsed = 0;
    this.timeLeft = this.scene.time;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.misses = 0;
    this.hints = START_HINTS;
    this.found = new Set();
    this.marks = [];
    this.totalFound = 0;
    this.hintPulse = null;
    this.clearTimer = 0;
    this.lastMissAt = -9;
  }

  start() {
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.misses = 0;
    this.hints = START_HINTS;
    this.totalFound = 0;
    this.loadScene(0);
    this.sound.click();
  }

  loadScene(index) {
    this.sceneIndex = index;
    this.scene = SCENES[index];
    this.elapsed = 0;
    this.timeLeft = this.scene.time;
    this.found = new Set();
    this.marks = [];
    this.hintPulse = null;
    this.phase = 'play';
  }

  get remaining() {
    return this.scene.diffs.length - this.found.size;
  }

  get totalDiffs() {
    return SCENES.reduce((n, s) => n + s.diffs.length, 0);
  }

  update(dt) {
    if (this.phase === 'play') {
      this.elapsed += dt;
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.phase = 'lost';
        this.sound.gameOver();
      }
    } else if (this.phase === 'clear') {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) {
        if (this.sceneIndex + 1 < SCENES.length) this.loadScene(this.sceneIndex + 1);
        else {
          this.phase = 'won';
          this.sound.win();
        }
      }
    }
  }

  // A click in panel coordinates. `side` is the panel clicked (0 or 1);
  // differences sit at the same place in both panels, alive ones moving.
  clickAt(side, lx, ly, tNow) {
    if (this.phase !== 'play') return;
    let best = null;
    let bestDist = Infinity;
    for (const diff of this.scene.diffs) {
      if (this.found.has(diff.key)) continue;
      const p = diff.pos(tNow, side);
      const d = Math.hypot(p.x - lx, p.y - ly);
      if (d < bestDist) {
        bestDist = d;
        best = diff;
      }
    }
    if (best && bestDist <= this.scene.hitR) {
      this.found.add(best.key);
      this.marks.push({ diff: best, born: this.elapsed });
      this.totalFound += 1;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      this.score += 100 + (this.streak - 1) * 25;
      this.sound.find(this.streak);
      if (this.remaining === 0) {
        const bonus = Math.ceil(this.timeLeft) * 2;
        this.score += bonus;
        this.phase = 'clear';
        this.clearTimer = 1.8;
        this.sound.sceneClear();
      }
    } else {
      this.misses += 1;
      this.streak = 0;
      this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_PENALTY);
      this.lastMissAt = this.elapsed;
      this.sound.miss();
      if (this.misses >= MAX_MISSES) {
        this.phase = 'lost';
        this.sound.gameOver();
      } else if (this.timeLeft <= 0) {
        this.phase = 'lost';
        this.sound.gameOver();
      }
    }
  }

  useHint(tNow) {
    if (this.phase !== 'play' || this.hints <= 0) return;
    const next = this.scene.diffs.find((d) => !this.found.has(d.key));
    if (!next) return;
    this.hints -= 1;
    this.hintPulse = { diff: next, until: this.elapsed + 2.4 };
    this.sound.hint();
  }
}
