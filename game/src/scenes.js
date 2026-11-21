// scenes.js — the three hand-painted scenes of Cat Capers, and the
// differences hiding in them. Every scene is painted twice from the same
// code (side 0 = left panel, side 1 = right panel); a difference is any
// place where the painting consults `side`. Cats everywhere: a proper
// clowder in every panel, and most differences are cat differences — a
// bow changes colour, a kitten appears, a cat flips around, a hat comes
// off. One difference per scene is ALIVE: its position is a function of
// time, different in each panel, so its hit area moves as it moves.
//
// Panel space is 604 × 460; diff positions are panel coordinates.

import { drawCat, drawFish, drawButterfly } from './cats.js';
import { scatter } from './rng.js';

export const PANEL_W = 604;
export const PANEL_H = 460;

// --- cat colourways -------------------------------------------------------
const ORANGE = { fur: '#e8913a', cream: '#fdeeda', dark: '#b45f1d', inner: '#f2a0a8', pattern: 'tabby' };
const GINGER = { fur: '#d2691e', cream: '#ffe9d2', dark: '#9c4a12', inner: '#f2a0a8', pattern: 'tabby' };
const GREY = { fur: '#9aa3ad', cream: '#eef1f4', dark: '#6b7280', inner: '#f2a0a8', pattern: 'tabby' };
const BLACK = { fur: '#33303e', cream: '#55506a', dark: '#17141f', inner: '#c98a94', pattern: 'solid' };
const WHITE = { fur: '#f7f3ea', cream: '#ffffff', dark: '#cbbfa8', inner: '#f2a0a8', pattern: 'solid' };
const CREAM = { fur: '#f0d9ae', cream: '#fdf3dd', dark: '#c8a76a', inner: '#f2a0a8', pattern: 'solid' };
const CALICO = { fur: '#f7f3ea', cream: '#ffffff', dark: '#8a6f4d', inner: '#f2a0a8', pattern: 'patch', patch: '#e8913a' };
const SIAMESE = { fur: '#e8d5b5', cream: '#f7ecd7', dark: '#5b4232', inner: '#d99a94', pattern: 'points' };
const BLUE = { fur: '#7d8ca3', cream: '#e8edf5', dark: '#54657e', inner: '#f2a0a8', pattern: 'solid' };

// --- tiny shape helpers ---------------------------------------------------
function rr(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}
function circ(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function line(ctx, x1, y1, x2, y2, stroke, w) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// =========================================================================
// Scene 1 — Cat Café. Twelve cats: one in a teacup, one behind the
// counter, one asleep on it, and a kitten batting a hanging toy that
// never stops swinging (the alive difference).
// =========================================================================

const cafeToyPos = (t, side) => {
  const pivot = { x: 516, y: 238 };
  const ang = Math.sin(t * 2.2 + (side ? 1.9 : 0)) * 0.52;
  return { x: pivot.x + Math.sin(ang) * 48, y: pivot.y + Math.cos(ang) * 48 };
};

function paintCafe(ctx, side, t) {
  // wall and floor
  rr(ctx, 0, 0, PANEL_W, PANEL_H, 0, '#f6e3c2');
  rr(ctx, 0, 352, PANEL_W, 108, 0, '#b07a4a');
  for (let i = 0; i < 6; i++) line(ctx, 0, 352 + i * 20, PANEL_W, 352 + i * 20, 'rgba(90,55,25,0.25)', 2);
  rr(ctx, 0, 344, PANEL_W, 9, 0, '#8a5a30');

  // window (left) with sky, sun and — on the left panel only — a bird
  rr(ctx, 28, 36, 168, 178, 8, '#a8d8f0');
  rr(ctx, 28, 36, 168, 178, 8, 'rgba(255,255,255,0.12)');
  circ(ctx, 62, 72, 17, '#ffd94d');
  if (side === 0) {
    // the bird: present on the left, flown away on the right
    ctx.fillStyle = '#3a86c8';
    ctx.beginPath();
    ctx.ellipse(148, 96, 11, 7.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(157, 92);
    ctx.lineTo(168, 88);
    ctx.lineTo(158, 99);
    ctx.closePath();
    ctx.fill();
    circ(ctx, 156, 90, 5, '#3a86c8');
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.moveTo(160, 90);
    ctx.lineTo(166, 92);
    ctx.lineTo(160, 94);
    ctx.closePath();
    ctx.fill();
  }
  line(ctx, 112, 36, 112, 214, '#7a4a22', 6);
  line(ctx, 28, 124, 196, 124, '#7a4a22', 6);
  rr(ctx, 22, 30, 180, 190, 10, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(28, 36, 168, 178, 8);
  ctx.stroke();
  rr(ctx, 20, 210, 184, 12, 4, '#8a5a30'); // sill
  // cat on the sill
  drawCat(ctx, { ...CALICO, x: 112, y: 210, s: 0.78, pose: 'sit', tail: 'swish', t, phase: 1 });

  // chalkboard menu (right of window)
  rr(ctx, 404, 34, 172, 138, 6, '#3c4a42');
  ctx.strokeStyle = '#8a5a30';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(404, 34, 172, 138, 6);
  ctx.stroke();
  ctx.fillStyle = '#fdf6e3';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('MENU', 424, 62);
  ctx.font = '13px Georgia, serif';
  const menu = ['tuna toast ... 5', 'salmon soup .. 7', 'milk, warm ... 3', 'catnip tea ... 4'];
  menu.forEach((m, i) => ctx.fillText(m, 424, 88 + i * 20));
  if (side === 0) {
    // the chalk paw print: left panel only
    ctx.fillStyle = 'rgba(253,246,227,0.9)';
    circ(ctx, 548, 140, 6, 'rgba(253,246,227,0.9)');
    for (let i = 0; i < 4; i++) circ(ctx, 538 + i * 7, 130 - Math.abs(i - 1.5) * 2, 3, 'rgba(253,246,227,0.9)');
  }
  // a cat peeking from behind the menu board
  drawCat(ctx, { ...BLUE, x: 398, y: 176, s: 0.66, pose: 'peek', flip: true });

  // hanging lamps; the middle one is lit on the left, dark on the right
  const lamp = (x, lit) => {
    line(ctx, x, 0, x, 44, '#4a3626', 3);
    ctx.fillStyle = lit ? '#ffd94d' : '#8d8578';
    ctx.beginPath();
    ctx.moveTo(x - 20, 74);
    ctx.lineTo(x, 42);
    ctx.lineTo(x + 20, 74);
    ctx.closePath();
    ctx.fill();
    if (lit) {
      circ(ctx, x, 80, 7, '#fff3b0');
      circ(ctx, x, 80, 16, 'rgba(255,217,77,0.25)');
    }
  };
  lamp(238, true);
  lamp(308, side === 0);
  lamp(378, true);

  // counter across the back
  drawCat(ctx, { ...CREAM, x: 348, y: 204, s: 0.92, pose: 'peek', accessory: 'collar', bowColor: '#c0392b' }); // barista
  rr(ctx, 292, 200, 312, 42, 4, '#8a5a30');
  rr(ctx, 292, 200, 312, 10, 4, '#a06a38');
  rr(ctx, 292, 242, 312, 96, 0, '#6e4525');
  for (let i = 0; i < 4; i++) rr(ctx, 306 + i * 76, 254, 62, 70, 4, '#7d5230');
  // cats on the counter: a sleeper, and (right panel only) an extra kitten
  drawCat(ctx, { ...BLACK, x: 512, y: 200, s: 0.85, pose: 'sleep', t, phase: 2 });
  if (side === 1) drawCat(ctx, { ...WHITE, x: 448, y: 198, s: 0.5, pose: 'sit', eyes: 'happy' });

  // table 1 (left): an orange tabby sitting on it, a grey-or-ginger cat
  // on the chair beside it, a kitten underneath
  rr(ctx, 52, 318, 176, 12, 5, '#8a5a30');
  rr(ctx, 66, 330, 10, 62, 3, '#6e4525');
  rr(ctx, 204, 330, 10, 62, 3, '#6e4525');
  drawCat(ctx, { ...ORANGE, x: 128, y: 318, s: 0.92, pose: 'sit', tail: 'curl' });
  // saucer of fish biscuits by the tabby
  circ(ctx, 178, 314, 15, '#e8e2d4');
  drawFish(ctx, 178, 312, 0.8, '#d9a05a');
  // chair + its cat (grey on the left, ginger on the right)
  rr(ctx, 238, 300, 46, 8, 3, '#7a4a22');
  rr(ctx, 242, 308, 7, 84, 3, '#7a4a22');
  rr(ctx, 273, 308, 7, 84, 3, '#7a4a22');
  rr(ctx, 238, 262, 8, 44, 3, '#7a4a22');
  drawCat(ctx, { ...(side === 0 ? GREY : GINGER), x: 261, y: 302, s: 0.88, pose: 'sit', tail: 'up' });
  drawCat(ctx, { ...WHITE, x: 96, y: 430, s: 0.6, pose: 'stand', tail: 'up' });

  // table 2 (right): the teacup cat — its bow changes colour
  rr(ctx, 356, 330, 168, 12, 5, '#8a5a30');
  rr(ctx, 370, 342, 10, 56, 3, '#6e4525');
  rr(ctx, 500, 342, 10, 56, 3, '#6e4525');
  // cup and saucer
  circ(ctx, 440, 326, 24, '#e8e2d4');
  rr(ctx, 420, 300, 40, 26, 6, '#7fb3d5');
  ctx.strokeStyle = '#7fb3d5';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(466, 313, 8, -1.1, 1.1);
  ctx.stroke();
  drawCat(ctx, {
    ...CREAM, x: 440, y: 306, s: 0.52, pose: 'peek',
    accessory: 'bow', bowColor: side === 0 ? '#e0218a' : '#00a896',
  });
  circ(ctx, 392, 322, 13, '#e8e2d4');
  drawFish(ctx, 392, 320, 0.7, '#d9a05a');

  // floor cats: a stretch, the toy-batting kitten, a siamese by the door
  drawCat(ctx, { ...ORANGE, x: 300, y: 436, s: 0.9, pose: 'stretch', flip: true });
  // the hanging toy on its wall arm — the ALIVE difference
  line(ctx, 516, 238, 560, 238, '#4a3626', 4);
  line(ctx, 560, 200, 560, 238, '#4a3626', 4);
  const toy = cafeToyPos(t, side);
  line(ctx, 516, 238, toy.x, toy.y, '#888', 2);
  circ(ctx, toy.x, toy.y, 9, '#e0218a');
  circ(ctx, toy.x - 3, toy.y - 3, 3, '#ff7ac0');
  drawCat(ctx, { ...GREY, x: 522, y: 348, s: 0.72, pose: 'play', t, phase: 0.5 });
  rr(ctx, 492, 344, 62, 10, 4, '#7a4a22'); // the kitten's stool
  drawCat(ctx, { ...SIAMESE, x: 572, y: 442, s: 0.92, pose: 'sit', tail: 'curl' });
}

// =========================================================================
// Scene 2 — Garden Chase. Eleven cats among the flower beds: one naps on
// the wall in a sun hat, one chases the butterfly that is this scene's
// alive difference, one hides in a flower pot, one is only ears in a bush.
// =========================================================================

const gardenFlyPos = (t, side) => {
  const c = side === 0 ? { x: 300, y: 218 } : { x: 452, y: 196 };
  return {
    x: c.x + Math.sin(t * 1.7 + (side ? 2.1 : 0)) * 34,
    y: c.y + Math.sin(t * 2.6 + (side ? 1.2 : 0)) * 14,
  };
};

function paintGarden(ctx, side, t) {
  // sky and grass
  rr(ctx, 0, 0, PANEL_W, PANEL_H, 0, '#bfe6f5');
  rr(ctx, 0, 252, PANEL_W, 208, 0, '#79c25a');
  for (const p of scatter(46, 77)) {
    const gx = p.x * PANEL_W;
    const gy = 262 + p.y * 190;
    line(ctx, gx, gy, gx - 2, gy - 6 - p.r * 5, '#5da244', 2);
    line(ctx, gx, gy, gx + 3, gy - 5 - p.r * 4, '#5da244', 2);
  }
  circ(ctx, 556, 52, 24, '#ffd94d');
  circ(ctx, 556, 52, 34, 'rgba(255,217,77,0.25)');

  // the back wall, and the cat asleep on it (sun hat on the left only)
  rr(ctx, 0, 122, PANEL_W, 40, 0, '#c08552');
  for (let i = 0; i < 10; i++) line(ctx, i * 62, 122, i * 62, 162, 'rgba(90,55,25,0.35)', 2);
  line(ctx, 0, 142, PANEL_W, 142, 'rgba(90,55,25,0.35)', 2);
  rr(ctx, 0, 114, PANEL_W, 10, 0, '#a06a38');
  drawCat(ctx, { ...ORANGE, x: 148, y: 116, s: 0.95, pose: 'sleep', t, phase: 0 });
  if (side === 0) {
    // sun hat over the sleeper's head (head rests near x+23·s, y−13·s)
    ctx.fillStyle = '#f6c945';
    ctx.beginPath();
    ctx.ellipse(171, 100, 17, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(171, 95, 9.5, 5.5, 0, Math.PI, 0);
    ctx.fill();
  }

  // tree (left) with a black cat in its shadow
  rr(ctx, 36, 150, 20, 130, 6, '#7a4a22');
  circ(ctx, 46, 108, 52, '#4e9b47');
  circ(ctx, 84, 132, 38, '#5cab54');
  circ(ctx, 14, 138, 32, '#5cab54');
  ctx.fillStyle = 'rgba(30,60,30,0.18)';
  ctx.beginPath();
  ctx.ellipse(70, 292, 56, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  drawCat(ctx, { ...BLACK, x: 66, y: 300, s: 0.9, pose: 'sit', tail: 'down' });

  // fence (right) with a kitten sitting on a post
  for (let i = 0; i < 5; i++) {
    rr(ctx, 452 + i * 32, 176, 9, 76, 3, '#a4713e');
  }
  line(ctx, 446, 196, 604, 196, '#a4713e', 6);
  line(ctx, 446, 228, 604, 228, '#a4713e', 6);
  drawCat(ctx, { ...CREAM, x: 560, y: 178, s: 0.58, pose: 'sit', tail: 'swish', t, phase: 3 });

  // birdbath with a cat beside it
  rr(ctx, 508, 300, 10, 34, 3, '#b9c4cc');
  ctx.fillStyle = '#b9c4cc';
  ctx.beginPath();
  ctx.ellipse(513, 298, 30, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8fd0f0';
  ctx.beginPath();
  ctx.ellipse(513, 296, 24, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  drawCat(ctx, { ...BLUE, x: 470, y: 336, s: 0.82, pose: 'sit', tail: 'curl' });

  // bench with a loaf underneath
  rr(ctx, 330, 356, 150, 9, 4, '#8a5a30');
  rr(ctx, 338, 330, 8, 30, 3, '#8a5a30');
  rr(ctx, 464, 330, 8, 30, 3, '#8a5a30');
  rr(ctx, 338, 366, 8, 30, 3, '#6e4525');
  rr(ctx, 464, 366, 8, 30, 3, '#6e4525');
  drawCat(ctx, { ...GREY, x: 405, y: 398, s: 0.88, pose: 'loaf' });

  // the bush, and — on the left panel only — the cat hiding in it
  circ(ctx, 548, 300, 34, '#4e9b47');
  circ(ctx, 574, 318, 26, '#5cab54');
  circ(ctx, 522, 320, 24, '#57a34e');
  if (side === 0) drawCat(ctx, { ...GINGER, x: 548, y: 292, s: 0.6, pose: 'peek' });

  // flower beds along the bottom; one big flower changes colour
  const bed = (x, y, color, big) => {
    circ(ctx, x, y, big ? 13 : 8, color);
    circ(ctx, x, y, big ? 5 : 3.2, '#ffd94d');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      circ(ctx, x + Math.cos(a) * (big ? 10 : 6), y + Math.sin(a) * (big ? 10 : 6), big ? 5.5 : 3.6, color);
    }
    line(ctx, x, y + 8, x, y + 26, '#4e9b47', 3);
  };
  bed(180, 388, '#e77a90', false);
  bed(232, 402, '#ffb347', false);
  bed(300, 392, side === 0 ? '#d93636' : '#8e44ad', true);
  bed(356, 406, '#e77a90', false);
  bed(120, 416, '#ffb347', false);
  bed(470, 420, '#e77a90', false);
  bed(528, 404, '#ffb347', false);

  // flower pot — with a kitten in it on the left, empty on the right
  ctx.fillStyle = '#c96f3b';
  ctx.beginPath();
  ctx.moveTo(66, 356);
  ctx.lineTo(114, 356);
  ctx.lineTo(106, 398);
  ctx.lineTo(74, 398);
  ctx.closePath();
  ctx.fill();
  rr(ctx, 62, 348, 56, 10, 3, '#b45f2d');
  if (side === 0) drawCat(ctx, { ...WHITE, x: 90, y: 352, s: 0.62, pose: 'peek', eyes: 'happy' });
  // soil line either way
  rr(ctx, 68, 352, 44, 5, 2, '#5b4232');

  // the watering can changes colour
  const canColor = side === 0 ? '#3f9e4d' : '#3a86c8';
  rr(ctx, 540, 402, 44, 28, 5, canColor);
  ctx.fillStyle = canColor;
  ctx.beginPath();
  ctx.moveTo(584, 408);
  ctx.lineTo(598, 398);
  ctx.lineTo(600, 406);
  ctx.lineTo(586, 418);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = canColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(562, 400, 12, Math.PI, Math.PI * 2);
  ctx.stroke();

  // a winding path, and the stretching cat who flips direction
  ctx.fillStyle = '#e5cf9f';
  ctx.beginPath();
  ctx.moveTo(196, 460);
  ctx.quadraticCurveTo(220, 380, 268, 330);
  ctx.quadraticCurveTo(300, 300, 330, 262);
  ctx.lineTo(366, 262);
  ctx.quadraticCurveTo(330, 310, 306, 344);
  ctx.quadraticCurveTo(268, 396, 258, 460);
  ctx.closePath();
  ctx.fill();
  drawCat(ctx, { ...CALICO, x: 218, y: 428, s: 0.92, pose: 'stretch', flip: side === 1 });

  // grass cats: a roller, two playing kittens, and the butterfly chaser
  drawCat(ctx, { ...CREAM, x: 140, y: 330, s: 0.8, pose: 'loaf', flip: true });
  drawCat(ctx, { ...ORANGE, x: 372, y: 446, s: 0.6, pose: 'play', t, phase: 1.4 });
  drawCat(ctx, { ...GREY, x: 420, y: 446, s: 0.6, pose: 'play', flip: true, t, phase: 2.6 });
  drawCat(ctx, { ...ORANGE, x: 330, y: 306, s: 1.0, pose: 'stand', tail: 'up', eyes: 'happy' });

  // the butterfly — the ALIVE difference, in a different meadow per panel
  const fly = gardenFlyPos(t, side);
  drawButterfly(ctx, fly.x, fly.y, 1.1, '#e0218a', t, 0);
}

// =========================================================================
// Scene 3 — Cozy Living Room. Twelve cats: a loaf on the sofa who changes
// colour, a cat in the cardboard box (or is it?), a kitten in a slipper
// who only exists on the right, and a ball of yarn that rolls forever —
// the alive difference.
// =========================================================================

const roomYarnPos = (t, side) => ({
  x: 306 + Math.sin(t * 0.9 + (side ? 2.4 : 0)) * 26,
  y: 440,
});

function drawYarnBall(ctx, x, y, r, color) {
  circ(ctx, x, y, r, color);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 1.6;
  for (const a of [0.4, 1.5, 2.6]) {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.45, a, 0, Math.PI * 2);
    ctx.stroke();
  }
  // loose strand trailing off
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.7, y + r * 0.6);
  ctx.quadraticCurveTo(x + r + 12, y + r + 4, x + r + 22, y + r * 0.4);
  ctx.stroke();
}

function paintRoom(ctx, side, t) {
  // wall, floor, skirting
  rr(ctx, 0, 0, PANEL_W, PANEL_H, 0, '#f3ddc4');
  rr(ctx, 0, 362, PANEL_W, 98, 0, '#a4713e');
  for (let i = 0; i < 5; i++) line(ctx, 0, 362 + i * 22, PANEL_W, 362 + i * 22, 'rgba(90,55,25,0.22)', 2);
  rr(ctx, 0, 354, PANEL_W, 9, 0, '#8a5a30');

  // window with curtains; a tail hangs from behind the right curtain
  rr(ctx, 36, 36, 150, 168, 6, '#bfe0f2');
  circ(ctx, 70, 70, 14, '#ffd94d');
  line(ctx, 111, 36, 111, 204, '#8a5a30', 5);
  line(ctx, 36, 120, 186, 120, '#8a5a30', 5);
  ctx.strokeStyle = '#8a5a30';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(36, 36, 150, 168, 6);
  ctx.stroke();
  rr(ctx, 30, 28, 34, 190, 8, '#c0392b');
  rr(ctx, 158, 28, 34, 190, 8, '#c0392b');
  if (side === 0) {
    // the curtain cat's tail: left panel only
    ctx.strokeStyle = ORANGE.fur;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(196, 150);
    ctx.quadraticCurveTo(206, 190, 198, 226);
    ctx.stroke();
    ctx.strokeStyle = ORANGE.dark;
    ctx.beginPath();
    ctx.moveTo(199, 214);
    ctx.quadraticCurveTo(200, 220, 198, 226);
    ctx.stroke();
  }
  // two cats on the window cushion
  rr(ctx, 44, 196, 134, 12, 5, '#e8b4b8');
  drawCat(ctx, { ...ORANGE, x: 92, y: 196, s: 0.62, pose: 'sit', tail: 'curl' });
  drawCat(ctx, { ...GREY, x: 142, y: 196, s: 0.58, pose: 'sit', flip: true, tail: 'swish', t, phase: 1 });

  // picture frame: a fish on the left, a yarn ball on the right
  rr(ctx, 252, 52, 100, 78, 4, '#8a5a30');
  rr(ctx, 260, 60, 84, 62, 2, '#fdf6e3');
  if (side === 0) drawFish(ctx, 302, 91, 2.2, '#e8913a');
  else drawYarnBall(ctx, 302, 91, 15, '#3a86c8');

  // bookshelf (right): two shelf cats and a row of books, one missing
  rr(ctx, 428, 84, 164, 250, 6, '#7a4a22');
  rr(ctx, 438, 94, 144, 232, 4, '#96683c');
  line(ctx, 438, 172, 582, 172, '#7a4a22', 7);
  line(ctx, 438, 250, 582, 250, '#7a4a22', 7);
  // kitten on top of the shelf
  drawCat(ctx, { ...WHITE, x: 505, y: 84, s: 0.58, pose: 'sit', tail: 'down' });
  // top shelf: plant + jars
  rr(ctx, 452, 140, 26, 30, 3, '#c96f3b');
  circ(ctx, 465, 132, 13, '#4e9b47');
  rr(ctx, 540, 138, 20, 32, 4, '#7fb3d5');
  rr(ctx, 566, 146, 14, 24, 4, '#e77a90');
  // middle shelf: a loaf among the books
  const bookCols = ['#c0392b', '#3a86c8', '#3f9e4d', '#e8913a', '#8e44ad'];
  bookCols.forEach((c, i) => rr(ctx, 446 + i * 17, 208, 13, 40, 2, c));
  drawCat(ctx, { ...CALICO, x: 552, y: 248, s: 0.66, pose: 'loaf' });
  // bottom shelf: the book row — one book is gone on the right panel
  const row = ['#3a86c8', '#d93636', '#3f9e4d', '#e8913a', '#8e44ad', '#e77a90', '#3a86c8', '#f4b41a'];
  row.forEach((c, i) => {
    if (side === 1 && i === 5) return; // the missing book
    rr(ctx, 446 + i * 17, 288, 13, 40, 2, c);
  });
  line(ctx, 438, 328, 582, 328, '#7a4a22', 7);

  // armchair (left) with a sleeping cat
  rr(ctx, 26, 276, 108, 84, 14, '#7d8ca3');
  rr(ctx, 20, 300, 26, 60, 10, '#6b7a90');
  rr(ctx, 114, 300, 26, 60, 10, '#6b7a90');
  rr(ctx, 34, 262, 92, 34, 12, '#8d9db2');
  drawCat(ctx, { ...CREAM, x: 80, y: 292, s: 0.85, pose: 'sleep', t, phase: 4 });

  // sofa (centre): the loaf who changes colour, black → white
  rr(ctx, 168, 268, 220, 92, 14, '#b5524d');
  rr(ctx, 160, 292, 28, 68, 10, '#a04742');
  rr(ctx, 372, 292, 28, 68, 10, '#a04742');
  rr(ctx, 178, 252, 200, 38, 12, '#c05c56');
  rr(ctx, 282, 256, 6, 100, 3, '#a04742');
  drawCat(ctx, { ...(side === 0 ? BLACK : WHITE), x: 228, y: 262, s: 0.95, pose: 'loaf' });
  drawCat(ctx, { ...SIAMESE, x: 336, y: 262, s: 0.8, pose: 'sit', tail: 'curl' });

  // floor lamp beside the sofa — its shade changes colour
  line(ctx, 404, 356, 404, 268, '#4a3626', 5);
  line(ctx, 388, 356, 420, 356, '#4a3626', 6);
  ctx.fillStyle = side === 0 ? '#f4b41a' : '#e77a90';
  ctx.beginPath();
  ctx.moveTo(388, 268);
  ctx.lineTo(398, 238);
  ctx.lineTo(410, 238);
  ctx.lineTo(420, 268);
  ctx.closePath();
  ctx.fill();

  // coffee table with a kitten peeking underneath
  rr(ctx, 216, 372, 150, 9, 4, '#8a5a30');
  rr(ctx, 226, 381, 8, 34, 3, '#6e4525');
  rr(ctx, 348, 381, 8, 34, 3, '#6e4525');
  drawCat(ctx, { ...GINGER, x: 292, y: 384, s: 0.55, pose: 'peek' });
  circ(ctx, 250, 366, 12, '#e8e2d4');
  drawFish(ctx, 250, 364, 0.65, '#d9a05a');

  // the cardboard box: a cat peeks out on the left; on the right the
  // flaps are shut and the box is (supposedly) empty
  rr(ctx, 452, 356, 96, 62, 3, '#c99e67');
  rr(ctx, 452, 356, 96, 10, 3, '#b8905a');
  if (side === 0) {
    // open flaps + peeking cat
    ctx.fillStyle = '#b8905a';
    ctx.beginPath();
    ctx.moveTo(452, 356);
    ctx.lineTo(428, 330);
    ctx.lineTo(452, 326);
    ctx.lineTo(466, 352);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(548, 356);
    ctx.lineTo(574, 332);
    ctx.lineTo(548, 326);
    ctx.lineTo(534, 352);
    ctx.closePath();
    ctx.fill();
    drawCat(ctx, { ...ORANGE, x: 500, y: 360, s: 0.8, pose: 'peek', eyes: 'happy' });
  } else {
    // closed flaps
    ctx.fillStyle = '#b8905a';
    ctx.beginPath();
    ctx.moveTo(452, 356);
    ctx.lineTo(500, 338);
    ctx.lineTo(500, 356);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(548, 356);
    ctx.lineTo(500, 338);
    ctx.lineTo(500, 356);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(90,55,25,0.55)';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('CATS', 484, 396);

  // the rug, the yarn player, and the ALIVE rolling yarn ball
  ctx.fillStyle = '#8e44ad';
  ctx.beginPath();
  ctx.ellipse(300, 428, 130, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a569bd';
  ctx.beginPath();
  ctx.ellipse(300, 428, 96, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  drawCat(ctx, { ...GREY, x: 238, y: 442, s: 0.85, pose: 'play', flip: true, t, phase: 0.8 });
  const yarn = roomYarnPos(t, side);
  drawYarnBall(ctx, yarn.x, yarn.y, 13, '#d93636');

  // foreground cats: a stretch, a cat by the lamp, and — right panel
  // only — a tiny kitten sitting in a slipper
  drawCat(ctx, { ...BLUE, x: 120, y: 448, s: 0.9, pose: 'stretch' });
  drawCat(ctx, { ...ORANGE, x: 420, y: 448, s: 0.88, pose: 'stand', tail: 'up' });
  // the slipper (both panels) and its kitten (right panel only)
  ctx.fillStyle = '#e77a90';
  ctx.beginPath();
  ctx.ellipse(540, 448, 26, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  rr(ctx, 522, 434, 36, 10, 5, '#d1657f');
  if (side === 1) drawCat(ctx, { ...WHITE, x: 540, y: 438, s: 0.42, pose: 'sit', eyes: 'happy' });
}

// =========================================================================

export const SCENES = [
  {
    id: 'cafe',
    name: 'Cat Café',
    sub: 'twelve cats, one teacup',
    time: 240,
    hitR: 30,
    paint: paintCafe,
    diffs: [
      { key: 'toy', label: 'the swinging toy', pos: cafeToyPos, alive: true },
      { key: 'bow', label: "the teacup cat's bow", pos: () => ({ x: 449, y: 282 }) },
      { key: 'lamp', label: 'the middle lamp', pos: () => ({ x: 308, y: 66 }) },
      { key: 'bird', label: 'the bird at the window', pos: () => ({ x: 150, y: 94 }) },
      { key: 'paw', label: 'the chalk paw print', pos: () => ({ x: 546, y: 136 }) },
      { key: 'extra', label: 'the extra kitten', pos: () => ({ x: 448, y: 172 }) },
      { key: 'chaircat', label: "the chair cat's colour", pos: () => ({ x: 261, y: 268 }) },
    ],
  },
  {
    id: 'garden',
    name: 'Garden Chase',
    sub: 'eleven cats, one butterfly',
    time: 210,
    hitR: 26,
    paint: paintGarden,
    diffs: [
      { key: 'butterfly', label: 'the butterfly', pos: gardenFlyPos, alive: true },
      { key: 'potkitten', label: 'the kitten in the pot', pos: () => ({ x: 90, y: 330 }) },
      { key: 'flipcat', label: 'the stretching cat', pos: () => ({ x: 218, y: 402 }) },
      { key: 'hat', label: "the napping cat's sun hat", pos: () => ({ x: 171, y: 98 }) },
      { key: 'flower', label: 'the big flower', pos: () => ({ x: 300, y: 392 }) },
      { key: 'can', label: 'the watering can', pos: () => ({ x: 562, y: 412 }) },
      { key: 'bushcat', label: 'the cat in the bush', pos: () => ({ x: 548, y: 276 }) },
    ],
  },
  {
    id: 'room',
    name: 'Cozy Living Room',
    sub: 'twelve cats, one rolling yarn ball',
    time: 180,
    hitR: 22,
    paint: paintRoom,
    diffs: [
      { key: 'yarn', label: 'the rolling yarn ball', pos: roomYarnPos, alive: true },
      { key: 'boxcat', label: 'the cat in the box', pos: () => ({ x: 500, y: 336 }) },
      { key: 'sofacat', label: "the sofa cat's colour", pos: () => ({ x: 228, y: 238 }) },
      { key: 'slipper', label: 'the kitten in the slipper', pos: () => ({ x: 540, y: 414 }) },
      { key: 'picture', label: 'the picture on the wall', pos: () => ({ x: 302, y: 91 }) },
      { key: 'book', label: 'the missing book', pos: () => ({ x: 531, y: 308 }) },
      { key: 'shade', label: 'the lamp shade', pos: () => ({ x: 404, y: 252 }) },
      { key: 'tail', label: "the curtain cat's tail", pos: () => ({ x: 200, y: 196 }) },
    ],
  },
];
