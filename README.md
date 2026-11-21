# cat-capers

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/luckylawless1/cat-capers/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/luckylawless1/cat-capers/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Cat Capers** is a spot-the-difference game in a world absolutely full of cats. Two pictures sit side by side, near-identical twins; somewhere in each pair a few things have quietly changed — and most of them are cats. Three hand-painted scenes — a cat café (twelve cats, one of them in a teacup), a garden chase (eleven cats and a butterfly), a cozy living room (twelve cats and a rolling ball of yarn) — hide 22 differences between them (7, 7 and 8). A bow changes colour, a kitten appears in a slipper, a sofa cat turns from black to white, a stretching cat flips around. One difference in every scene is *alive*: a kitten bats a swinging toy, a butterfly flutters over a different flower bed in each panel, a yarn ball rolls back and forth — its marker and its hit area move with it.

- A ticking clock with a shrinking time bar, and wrong clicks cost 5 seconds; three misses end the hunt
- Streak scoring: chained finds pay more, and finishing a scene pays a time bonus
- A magnifier loupe (M) that shows the *other* panel at ×2, three hint charges (H) that pulse the next hiding place
- Original synthesised WebAudio chimes — no audio files, no network, no build step

## Run it

```sh
node serve.ts
```

then open http://localhost:8080 — or serve the `game/` folder with any static file server. `node main.ts` with `MAKEFUN_OUTPUT_DIR` set writes the hand-in (`game/`, `screenshots/` and `dossier.json`) the way the make.fun grader runs it.

The source is split by job under `game/src/`: `cats.js` paints every cat from primitives (poses, patterns, accessories), `scenes.js` paints the three scenes and hides the differences, `engine.js` keeps the rules, `render.js` draws the HUD, panels, markers and loupe, `input.js` reads the mouse and keyboard, `audio.js` makes the sounds, `rng.js` keeps the scatter deterministic.

---
<sub>Entered on [make.fun](https://make.fun/?ref=sv4ravjn&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
