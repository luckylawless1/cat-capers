// render.js — everything the player sees: the HUD (clock bar, remaining
// pips, streak, hints, misses), the twin panels, gold markers on found
// differences, hint pulses, the ×2 loupe, and the title / clear / end
// screens.

import { PANEL_W, PANEL_H, SCENES } from './scenes.js';
import { drawCat } from './cats.js';
import { MAX_MISSES } from './engine.js';

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const PANELS = [
  { x: 20, y: 140 },
  { x: 656, y: 140 },
];
export const BUTTON = { x: 490, y: 428, w: 300, h: 56 };

const GOLD = '#f4b41a';
const INK = '#f7ead9';
const DIM = '#b8a6c9';

function rr(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function text(ctx, str, x, y, font, fill, align = 'left') {
  ctx.fillStyle = fill;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

export class Renderer {
  draw(ctx, game, view) {
    // backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grad.addColorStop(0, '#2a1438');
    grad.addColorStop(1, '#170b20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (game.phase === 'title') {
      this.drawTitle(ctx, view);
      return;
    }
    this.drawHud(ctx, game);
    for (let side = 0; side < 2; side++) this.drawPanel(ctx, game, view, side);
    if (view.magnifier && view.mouse && view.mouse.side !== null && game.phase === 'play') {
      this.drawLoupe(ctx, game, view);
    }
    if (game.phase === 'clear') this.drawCentreCard(ctx, 'SCENE CLEAR!', `${game.scene.name} — every cat accounted for`, '#7be495');
    if (game.phase === 'won') this.drawEnd(ctx, game, true);
    if (game.phase === 'lost') this.drawEnd(ctx, game, false);
    // footer help line
    text(ctx, 'Click a difference in either picture · M — loupe (shows the other panel ×2) · H — hint · wrong click −5s · 3 misses ends the hunt',
      640, 692, '15px system-ui, sans-serif', DIM, 'center');
    text(ctx, `FOUND ${game.totalFound} / ${game.totalDiffs}`, 640, 636, 'bold 17px system-ui, sans-serif', INK, 'center');
  }

  drawHud(ctx, game) {
    text(ctx, 'CAT CAPERS', 24, 44, 'bold 30px Georgia, serif', GOLD);
    text(ctx, `Scene ${game.sceneIndex + 1} of ${SCENES.length} — ${game.scene.name} · ${game.scene.sub}`,
      24, 72, '16px system-ui, sans-serif', DIM);
    // score
    text(ctx, 'SCORE', 1256, 30, '12px system-ui, sans-serif', DIM, 'right');
    text(ctx, String(game.score).padStart(6, '0'), 1256, 58, 'bold 28px ui-monospace, monospace', INK, 'right');

    // clock bar
    const bx = 400;
    const bw = 480;
    const frac = Math.max(0, game.timeLeft / game.scene.time);
    rr(ctx, bx, 22, bw, 20, 10, 'rgba(255,255,255,0.14)');
    rr(ctx, bx, 22, Math.max(20, bw * frac), 20, 10, game.timeLeft < 30 ? '#e0483e' : '#3fbf72');
    text(ctx, `${Math.ceil(game.timeLeft)}s`, bx + bw / 2, 66, 'bold 19px system-ui, sans-serif', INK, 'center');

    // remaining pips: gold = found, hollow = still hiding
    text(ctx, 'REMAINING', 24, 112, '12px system-ui, sans-serif', DIM);
    game.scene.diffs.forEach((d, i) => {
      const x = 118 + i * 26;
      const y = 105;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      if (game.found.has(d.key)) {
        ctx.fillStyle = GOLD;
        ctx.fill();
        ctx.strokeStyle = '#2b2130';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4.5, y);
        ctx.lineTo(x - 1, y + 3.6);
        ctx.lineTo(x + 5, y - 4);
        ctx.stroke();
      } else {
        ctx.strokeStyle = DIM;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
    });
    text(ctx, `${game.remaining} to find`, 118 + game.scene.diffs.length * 26 + 10, 112, 'bold 16px system-ui, sans-serif', INK);

    // streak, hints, misses — right side of the second row
    if (game.streak >= 2) text(ctx, `STREAK ×${game.streak}`, 760, 112, 'bold 17px system-ui, sans-serif', '#ff9f43');
    text(ctx, 'HINTS (H)', 1010, 112, '12px system-ui, sans-serif', DIM, 'right');
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(1032 + i * 24, 105, 8, 0, Math.PI * 2);
      ctx.fillStyle = i < game.hints ? '#7fd4ff' : 'rgba(255,255,255,0.15)';
      ctx.fill();
    }
    text(ctx, 'MISSES', 1256, 88, '12px system-ui, sans-serif', DIM, 'right');
    for (let i = 0; i < MAX_MISSES; i++) {
      text(ctx, '♥', 1210 + i * 24, 114, '19px system-ui, sans-serif', i < game.misses ? 'rgba(255,255,255,0.18)' : '#e0483e');
    }
  }

  drawPanel(ctx, game, view, side) {
    const p = PANELS[side];
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    rr(ctx, p.x - 5, p.y - 5, PANEL_W + 10, PANEL_H + 10, 10, '#0f0817');
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, PANEL_W, PANEL_H, 6);
    ctx.clip();
    ctx.translate(p.x, p.y);
    game.scene.paint(ctx, side, view.t);
    // found markers ride the difference (alive ones keep moving)
    for (const mark of game.marks) {
      const pos = mark.diff.pos(view.t, side);
      const age = Math.max(0, game.elapsed - mark.born);
      const pop = age < 0.25 ? 0.6 + (age / 0.25) * 0.4 : 1;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 17 * pop, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fff3cf';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 13 * pop, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#2b7a3d';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(pos.x - 6, pos.y + 1);
      ctx.lineTo(pos.x - 1.5, pos.y + 6);
      ctx.lineTo(pos.x + 7, pos.y - 5);
      ctx.stroke();
    }
    // hint pulse
    if (game.hintPulse && game.elapsed < game.hintPulse.until) {
      const pos = game.hintPulse.diff.pos(view.t, side);
      const k = (game.hintPulse.until - game.elapsed) / 2.4;
      for (let i = 0; i < 3; i++) {
        const r = 14 + ((1 - k) * 3 + i) * 13;
        ctx.strokeStyle = `rgba(127, 212, 255, ${Math.max(0, 0.75 - i * 0.22) * k + 0.1})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r % 60, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(247,234,217,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, PANEL_W, PANEL_H, 6);
    ctx.stroke();
  }

  drawLoupe(ctx, game, view) {
    const m = view.mouse;
    const other = 1 - m.side;
    const op = PANELS[other];
    const R = 88;
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#000';
    ctx.fillRect(m.x - R, m.y - R, R * 2, R * 2);
    ctx.translate(m.x, m.y);
    ctx.scale(2, 2);
    ctx.translate(-(op.x + m.lx), -(op.y + m.ly));
    ctx.translate(op.x, op.y);
    game.scene.paint(ctx, other, view.t);
    ctx.restore();
    ctx.strokeStyle = '#e0218a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(m.x, m.y, R, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, '×2 OTHER PANEL', m.x, m.y + R + 20, 'bold 12px system-ui, sans-serif', '#ff7ac0', 'center');
  }

  drawCentreCard(ctx, title, sub, color) {
    rr(ctx, 340, 300, 600, 130, 16, 'rgba(15,8,23,0.88)');
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(340, 300, 600, 130, 16);
    ctx.stroke();
    text(ctx, title, 640, 356, 'bold 40px Georgia, serif', color, 'center');
    text(ctx, sub, 640, 394, '17px system-ui, sans-serif', INK, 'center');
  }

  drawEnd(ctx, game, wonGame) {
    ctx.fillStyle = 'rgba(10,5,16,0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const title = wonGame ? 'YOU FOUND THEM ALL!' : 'THE HUNT IS OVER';
    const why = wonGame
      ? `Final score ${game.score} · best streak ×${game.bestStreak} · all ${game.totalDiffs} differences found`
      : game.misses >= MAX_MISSES
        ? `Three misses — the cats keep their secrets. Score ${game.score}, ${game.totalFound} of ${game.totalDiffs} found`
        : `The clock ran out. Score ${game.score}, ${game.totalFound} of ${game.totalDiffs} found`;
    text(ctx, title, 640, 300, 'bold 48px Georgia, serif', wonGame ? '#7be495' : '#e0483e', 'center');
    text(ctx, why, 640, 344, '19px system-ui, sans-serif', INK, 'center');
    this.drawButton(ctx, wonGame ? 'PLAY AGAIN' : 'TRY AGAIN');
  }

  drawButton(ctx, label) {
    rr(ctx, BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h, 14, GOLD);
    rr(ctx, BUTTON.x, BUTTON.y, BUTTON.w, 6, 3, 'rgba(255,255,255,0.35)');
    text(ctx, label, BUTTON.x + BUTTON.w / 2, BUTTON.y + 37, 'bold 22px system-ui, sans-serif', '#2b2130', 'center');
  }

  drawTitle(ctx, view) {
    text(ctx, 'CAT CAPERS', 640, 148, 'bold 84px Georgia, serif', GOLD, 'center');
    text(ctx, 'spot the difference — in a world absolutely full of cats', 640, 196, 'italic 23px Georgia, serif', INK, 'center');
    text(ctx, 'Three scenes — a cat café, a garden chase, a cozy living room. 22 differences hide in the twins,', 640, 262, '18px system-ui, sans-serif', DIM, 'center');
    text(ctx, 'and most of them are cats: a bow changes colour, a kitten appears, a cat flips around. One difference', 640, 290, '18px system-ui, sans-serif', DIM, 'center');
    text(ctx, 'in every scene is alive and moves. Wrong clicks cost 5 seconds; three misses end the hunt.', 640, 318, '18px system-ui, sans-serif', DIM, 'center');
    // the cast, sitting on a shelf
    rr(ctx, 190, 566, 900, 12, 6, '#4a2c5a');
    const cast = [
      { fur: '#e8913a', cream: '#fdeeda', dark: '#b45f1d', inner: '#f2a0a8', pattern: 'tabby', pose: 'sit', x: 280 },
      { fur: '#33303e', cream: '#55506a', dark: '#17141f', inner: '#c98a94', pattern: 'solid', pose: 'loaf', x: 420 },
      { fur: '#f7f3ea', cream: '#ffffff', dark: '#cbbfa8', inner: '#f2a0a8', pattern: 'solid', pose: 'play', x: 545 },
      { fur: '#9aa3ad', cream: '#eef1f4', dark: '#6b7280', inner: '#f2a0a8', pattern: 'tabby', pose: 'stand', x: 690 },
      { fur: '#f7f3ea', cream: '#ffffff', dark: '#8a6f4d', inner: '#f2a0a8', pattern: 'patch', patch: '#e8913a', pose: 'sit', x: 830 },
      { fur: '#e8d5b5', cream: '#f7ecd7', dark: '#5b4232', inner: '#d99a94', pattern: 'points', pose: 'sleep', x: 965 },
    ];
    for (const c of cast) drawCat(ctx, { ...c, y: 566, s: 1.05, t: view.t, phase: c.x });
    this.drawButton(ctx, 'START THE HUNT');
    text(ctx, 'M — magnifier loupe · H — hint (3 charges)', 640, 660, '15px system-ui, sans-serif', DIM, 'center');
  }
}
