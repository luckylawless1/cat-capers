// cats.js — the cat painter. Every cat in Cat Capers is drawn from these
// primitives at run time: ears, whiskers, stripes and all. One function,
// many cats — poses (sit, sleep, loaf, stand, stretch, peek, play),
// patterns (solid, tabby, patch, points) and accessories (bow, collar,
// sun hat, bell) combine so no two cats in a scene need look alike.
//
// Local space: the cat stands on y = 0 and a sitting cat is about 64
// units tall; `s` scales, `flip` mirrors. Colours come from the caller.

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function ear(ctx, x, y, s, fur, inner) {
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(x - 7 * s, y + 4 * s);
  ctx.lineTo(x - 5 * s, y - 9 * s);
  ctx.lineTo(x + 4 * s, y - 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.moveTo(x - 4.6 * s, y + 1.6 * s);
  ctx.lineTo(x - 3.8 * s, y - 5.4 * s);
  ctx.lineTo(x + 1.8 * s, y - 1.4 * s);
  ctx.closePath();
  ctx.fill();
}

function face(ctx, o, hx, hy, hr) {
  const { fur, cream, inner, pattern, dark } = o;
  // ears behind the head
  ear(ctx, hx - hr * 0.62, hy - hr * 0.62, 1, fur, inner);
  ctx.save();
  ctx.translate(hx + hr * 0.62, hy - hr * 0.62);
  ctx.scale(-1, 1);
  ear(ctx, 0, 0, 1, pattern === 'points' ? dark : fur, inner);
  ctx.restore();
  // head
  ctx.fillStyle = fur;
  ellipse(ctx, hx, hy, hr, hr * 0.92);
  if (pattern === 'patch') {
    ctx.fillStyle = o.patch || '#e8913a';
    ellipse(ctx, hx - hr * 0.45, hy - hr * 0.4, hr * 0.42, hr * 0.3);
  }
  // muzzle
  ctx.fillStyle = pattern === 'points' ? dark : cream;
  ellipse(ctx, hx, hy + hr * 0.38, hr * 0.52, hr * 0.34);
  // eyes
  ctx.strokeStyle = '#2b2130';
  ctx.fillStyle = '#2b2130';
  ctx.lineWidth = 1.6;
  for (const sgn of [-1, 1]) {
    const ex = hx + sgn * hr * 0.38;
    const ey = hy - hr * 0.05;
    if (o.eyes === 'shut' || o.eyes === 'happy') {
      ctx.beginPath();
      if (o.eyes === 'shut') ctx.arc(ex, ey, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
      else ctx.arc(ex, ey + 2.5, 3.2, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      ellipse(ctx, ex, ey, 2.3, 3.1);
    }
  }
  // nose + mouth
  ctx.fillStyle = '#e77a90';
  ctx.beginPath();
  ctx.moveTo(hx - 2.6, hy + hr * 0.3);
  ctx.lineTo(hx + 2.6, hy + hr * 0.3);
  ctx.lineTo(hx, hy + hr * 0.3 + 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(43,33,48,0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hx, hy + hr * 0.3 + 3);
  ctx.quadraticCurveTo(hx, hy + hr * 0.52, hx - 4, hy + hr * 0.5);
  ctx.moveTo(hx, hy + hr * 0.3 + 3);
  ctx.quadraticCurveTo(hx, hy + hr * 0.52, hx + 4, hy + hr * 0.5);
  ctx.stroke();
  // whiskers
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  for (const sgn of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(hx + sgn * hr * 0.45, hy + hr * (0.3 + i * 0.08));
      ctx.lineTo(hx + sgn * hr * 1.15, hy + hr * (0.18 + i * 0.16));
      ctx.stroke();
    }
  }
  if (pattern === 'tabby') {
    ctx.strokeStyle = o.dark;
    ctx.lineWidth = 1.6;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(hx + i * 5, hy - hr * 0.92);
      ctx.lineTo(hx + i * 5, hy - hr * 0.62);
      ctx.stroke();
    }
  }
}

function stripes(ctx, o, x, y, w) {
  if (o.pattern !== 'tabby') return;
  ctx.strokeStyle = o.dark;
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + i * (w / 2.4), y);
    ctx.quadraticCurveTo(x - w / 2 + i * (w / 2.4) + 4, y + 7, x - w / 2 + i * (w / 2.4), y + 13);
    ctx.stroke();
  }
}

function tailPath(ctx, kind, t, phase) {
  ctx.beginPath();
  if (kind === 'up') {
    ctx.moveTo(24, -22);
    ctx.quadraticCurveTo(36, -34, 30, -52);
  } else if (kind === 'down') {
    ctx.moveTo(24, -10);
    ctx.quadraticCurveTo(40, -6, 46, -14);
  } else if (kind === 'swish') {
    const sway = Math.sin(t * 2.4 + phase) * 7;
    ctx.moveTo(24, -16);
    ctx.quadraticCurveTo(40, -26 + sway, 34 + sway, -44 + sway);
  } else { // curl around the front
    ctx.moveTo(24, -8);
    ctx.quadraticCurveTo(30, 2, 8, 1);
    ctx.quadraticCurveTo(-14, 0, -22, -6);
  }
  ctx.stroke();
}

function accessory(ctx, o, hx, hy, hr) {
  if (o.accessory === 'bow') {
    ctx.fillStyle = o.bowColor || '#e0218a';
    const bx = hx + hr * 0.72;
    const by = hy - hr * 0.78;
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + sgn * 9, by - 5);
      ctx.lineTo(bx + sgn * 9, by + 5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (o.accessory === 'collar' || o.accessory === 'bell') {
    ctx.strokeStyle = o.bowColor || '#3a86c8';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(hx, hy + hr * 0.72, hr * 0.62, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
    if (o.accessory === 'bell') {
      ctx.fillStyle = '#f4b41a';
      ctx.beginPath();
      ctx.arc(hx, hy + hr * 1.18, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (o.accessory === 'hat') {
    ctx.fillStyle = '#f6c945';
    ctx.beginPath();
    ctx.ellipse(hx, hy - hr * 0.92, hr * 1.05, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx, hy - hr * 1.12, hr * 0.55, hr * 0.3, 0, Math.PI, 0);
    ctx.fill();
  }
}

// drawCat(ctx, opts) — opts: x, y, s, fur, cream, dark, inner, pattern,
// patch, pose, flip, eyes, tail, accessory, bowColor, t, phase.
export function drawCat(ctx, o) {
  const t = o.t || 0;
  const phase = o.phase || 0;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale((o.flip ? -1 : 1) * (o.s || 1), o.s || 1);
  ctx.lineCap = 'round';

  const fur = o.fur;
  // tail sits behind the body in most poses
  ctx.strokeStyle = o.pattern === 'points' ? o.dark : fur;
  ctx.lineWidth = 5.5;
  if (o.pose !== 'sleep' && o.pose !== 'peek') tailPath(ctx, o.tail || 'curl', t, phase);

  if (o.pose === 'sleep') {
    ctx.fillStyle = fur;
    ellipse(ctx, 0, -9, 30, 11);
    stripes(ctx, o, -6, -18, 30);
    ctx.strokeStyle = fur;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-28, -6);
    ctx.quadraticCurveTo(-40, -2, -34, -12);
    ctx.stroke();
    face(ctx, { ...o, eyes: 'shut' }, 24, -13, 13.5);
    if (o.showZ !== false) {
      ctx.fillStyle = 'rgba(90,80,140,0.8)';
      ctx.font = 'bold 11px Georgia, serif';
      const bob = Math.sin(t * 1.6 + phase) * 1.5;
      ctx.fillText('z', 34, -30 + bob);
      ctx.font = 'bold 14px Georgia, serif';
      ctx.fillText('Z', 41, -40 + bob);
    }
  } else if (o.pose === 'loaf') {
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(0, -11, 29, 12.5, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-29, -12, 58, 12);
    ellipse(ctx, 0, -1.5, 29, 3.5);
    stripes(ctx, o, -4, -24, 34);
    face(ctx, o, 16, -16, 13);
  } else if (o.pose === 'stand') {
    ctx.fillStyle = fur;
    for (const lx of [-16, -7, 12, 21]) ctx.fillRect(lx - 2.5, -16, 5, 16);
    ellipse(ctx, 0, -26, 27, 12);
    stripes(ctx, o, 0, -38, 34);
    face(ctx, o, 30, -36, 13.5);
  } else if (o.pose === 'stretch') {
    ctx.fillStyle = fur;
    ctx.save();
    ctx.rotate(-0.32);
    ellipse(ctx, 2, -20, 29, 11);
    ctx.restore();
    stripes(ctx, o, 2, -36, 30);
    ctx.fillRect(-24, -8, 5, 9);
    ctx.fillRect(16, -3, 5, 5);
    ctx.fillRect(24, -3, 5, 5);
    face(ctx, o, 32, -12, 12.5);
  } else if (o.pose === 'peek') {
    // just a head and two paws over an edge at y = 0; the caller draws
    // the occluding furniture after (or before) as the scene needs.
    face(ctx, o, 0, -13, 15);
    ctx.fillStyle = fur;
    ellipse(ctx, -15, -1, 6, 4);
    ellipse(ctx, 15, -1, 6, 4);
  } else if (o.pose === 'play') {
    ctx.fillStyle = fur;
    ellipse(ctx, -2, -16, 24, 17);
    ctx.fillRect(-8, -14, 5.5, 14);
    ctx.save();
    ctx.rotate(-0.5 - Math.sin(t * 2.4 + phase) * 0.12);
    ctx.fillRect(6, -34, 5.5, 22);
    ellipse(ctx, 8.5, -35, 4.5, 3.4);
    ctx.restore();
    stripes(ctx, o, -8, -32, 28);
    face(ctx, { ...o, eyes: o.eyes || 'happy' }, 2, -42, 14.5);
  } else { // sit (default)
    ctx.fillStyle = fur;
    ellipse(ctx, 0, -15, 23, 16); // haunches
    ellipse(ctx, 0, -30, 16.5, 19); // chest
    ctx.fillStyle = o.cream;
    ellipse(ctx, 0, -26, 10, 14); // bib
    ctx.fillStyle = fur;
    ctx.fillRect(-11, -12, 6, 12);
    ctx.fillRect(5, -12, 6, 12);
    stripes(ctx, o, 0, -46, 24);
    face(ctx, o, 0, -56, 15);
    accessory(ctx, o, 0, -56, 15);
  }
  // accessories for the head-centric poses
  if (o.pose === 'loaf') accessory(ctx, o, 16, -16, 13);
  if (o.pose === 'stand') accessory(ctx, o, 30, -36, 13.5);
  if (o.pose === 'peek') accessory(ctx, o, 0, -13, 15);
  ctx.restore();
}

// A simple fish biscuit / treat, used on café plates.
export function drawFish(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(15, -5);
  ctx.lineTo(15, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2130';
  ctx.beginPath();
  ctx.arc(-5, -1, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// A butterfly: two wing pairs around a body, wings flap with t.
export function drawButterfly(ctx, x, y, s, color, t, phase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const flap = 0.45 + Math.abs(Math.sin(t * 9 + phase)) * 0.55;
  ctx.fillStyle = color;
  for (const sgn of [-1, 1]) {
    ctx.save();
    ctx.scale(sgn * flap, 1);
    ctx.beginPath();
    ctx.ellipse(7, -3, 7.5, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, 4, 5.5, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#2b2130';
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.8, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
