// rng.js — a tiny deterministic random source (mulberry32). The scenes
// scatter grass tufts, stars on the chalkboard and rug threads with it, so
// both panels of a scene always scatter identically and a screenshot taken
// today matches one taken tomorrow.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// scatter(count, seed) hands back `count` pseudo-random points in the unit
// square from a fixed seed — same list on every call, every machine.
export function scatter(count, seed) {
  const next = makeRng(seed);
  const pts = [];
  for (let i = 0; i < count; i++) pts.push({ x: next(), y: next(), r: next() });
  return pts;
}
