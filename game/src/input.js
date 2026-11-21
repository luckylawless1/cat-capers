// input.js — mouse and keyboard. Clicks land in panel coordinates;
// M toggles the magnifier loupe (which shows the OTHER panel at ×2),
// H spends a hint charge. On the title and end screens, the big button
// starts (or restarts) the hunt.

import { PANEL_H, PANEL_W } from './scenes.js';
import { PANELS, BUTTON } from './render.js';

export class Input {
  constructor(canvas, game, view) {
    this.canvas = canvas;
    this.game = game;
    this.view = view;

    canvas.addEventListener('mousemove', (e) => {
      view.mouse = this.locate(e);
    });
    canvas.addEventListener('mouseleave', () => {
      view.mouse = null;
    });
    canvas.addEventListener('click', (e) => {
      game.sound.ensure();
      const loc = this.locate(e);
      if (!loc) return;
      if (game.phase === 'title' || game.phase === 'won' || game.phase === 'lost') {
        if (loc.x >= BUTTON.x && loc.x <= BUTTON.x + BUTTON.w && loc.y >= BUTTON.y && loc.y <= BUTTON.y + BUTTON.h) {
          game.start();
        }
        return;
      }
      if (loc.side !== null) game.clickAt(loc.side, loc.lx, loc.ly, view.t);
    });
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'm') {
        view.magnifier = !view.magnifier;
        game.sound.click();
      } else if (k === 'h') {
        game.useHint(view.t);
      } else if (k === ' ' && (game.phase === 'title' || game.phase === 'won' || game.phase === 'lost')) {
        e.preventDefault();
        game.sound.ensure();
        game.start();
      }
    });
  }

  // Map a mouse event to canvas space and, when inside a panel, to the
  // panel-local coordinates the engine speaks.
  locate(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
    let side = null;
    let lx = 0;
    let ly = 0;
    for (let i = 0; i < PANELS.length; i++) {
      const p = PANELS[i];
      if (x >= p.x && x < p.x + PANEL_W && y >= p.y && y < p.y + PANEL_H) {
        side = i;
        lx = x - p.x;
        ly = y - p.y;
      }
    }
    return { x, y, side, lx, ly };
  }
}
