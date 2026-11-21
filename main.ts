// Cat Capers — hand-in program for the make.fun spot-the-difference
// bounty.
//
// The game itself is the static site under game/ (plain files, no build
// step, no network). This program's only job is the hand-in: mirror game/
// and screenshots/ into the output directory and write dossier.json there
// with the kit's buildDossier, byte for byte as the gate will rebuild it.
//
// Run it the way the grader does (Node 22, standard library only):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps for this competition, passed to the dossier builder so a
// local run refuses anything the sealed scorer would refuse: at most 4
// screenshots of 256 KiB each, at most 993 entries and 48 MiB under game/,
// and no game/ path longer than 1000 bytes.
const DOSSIER_LIMITS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function mirrorIntoOutput(): void {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
  }
}

mirrorIntoOutput();
// The dossier is written from the output copy, not the repository, so what
// the judge reads is exactly what was handed in.
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_LIMITS));
