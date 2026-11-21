// main.js — boots Cat Capers: canvas, sound, game state, renderer and
// input, then the animation loop. The ?shot= modes freeze one
// deterministic frame (fixed clock, scripted finds) so the maker's
// screenshots are real renders of the game exactly as it plays.

import { SoundFX } from './audio.js';
import { Game } from './engine.js';
import { Renderer, VIEW_W, VIEW_H } from './render.js';
import { Input } from './input.js';
import { SCENES } from './scenes.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

const sound = new SoundFX();
const game = new Game(sound);
const renderer = new Renderer();
const view = { t: 0, mouse: null, magnifier: false };
new Input(canvas, game, view);

const params = new URLSearchParams(location.search);
const shot = params.get('shot');

function preFind(keys) {
  for (const key of keys) {
    const diff = game.scene.diffs.find((d) => d.key === key);
    game.found.add(key);
    game.marks.push({ diff, born: game.elapsed - 0.6 });
    game.totalFound += 1;
  }
}

function stageShot() {
  game.start();
  if (shot === 'cafe') {
    game.elapsed = 47;
    game.timeLeft = 193;
    game.score = 390;
    game.streak = 3;
    preFind(['bow', 'lamp']);
    const toy = game.scene.diffs.find((d) => d.key === 'toy');
    game.hintPulse = { diff: toy, until: game.elapsed + 2 };
    view.magnifier = true;
    view.mouse = { x: 20 + 150, y: 140 + 94, side: 0, lx: 150, ly: 94 };
  } else if (shot === 'garden') {
    game.loadScene(1);
    game.phase = 'play';
    game.elapsed = 58;
    game.timeLeft = 152;
    game.score = 1310;
    game.streak = 2;
    game.totalFound = SCENES[0].diffs.length;
    preFind(['potkitten', 'flower']);
  } else if (shot === 'room') {
    game.loadScene(2);
    game.phase = 'play';
    game.elapsed = 96;
    game.timeLeft = 61;
    game.score = 2140;
    game.streak = 4;
    game.totalFound = SCENES[0].diffs.length + SCENES[1].diffs.length;
    preFind(['boxcat', 'picture', 'sofacat']);
    const yarn = game.scene.diffs.find((d) => d.key === 'yarn');
    game.hintPulse = { diff: yarn, until: game.elapsed + 2 };
  } else if (shot === 'title') {
    game.phase = 'title';
  }
  view.t = 12.35;
  renderer.draw(ctx, game, view);
  window.__shotReady = true;
}

if (shot) {
  stageShot();
} else {
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    view.t += dt;
    game.update(dt);
    const shown = { ...view, mouse: view.magnifier ? view.mouse : null };
    renderer.draw(ctx, game, shown);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
