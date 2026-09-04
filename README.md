# ⭕✖️ Caro vô hạn — caro against the machine on a board with no edges

A Vietnamese-rules caro (gomoku) game you play against the machine, on a board that
never ends. Five in a row wins — unless your opponent has blocked both ends. Everything
is drawn in code on a canvas: no sprite sheet, no image files. No server, no sign-in.

**Play**: <https://levananhduc.github.io/web-game-gomoku/>

**Status:** milestones 1 to 3 of 7 are done — the game is playable and the opponent is
real. See [`docs/04-state/backlog.md`](docs/04-state/backlog.md).

Releases and the Pages deploy are automated from `main`; the version comes from
Conventional Commit prefixes. The contract is in [`CLAUDE.md`](CLAUDE.md).

## Features

- **The board has no edges**

  - Drag to move, wheel to zoom, one button to fit every mark back on screen
  - Coordinates are integers and go negative; the first move of a game is `0, 0`
  - No board edge means "blocked" has exactly one meaning — an enemy mark, never a wall

- **Vietnamese caro rules, stated precisely**

  - Five or more in a row wins, judged on the maximal run through the last move
  - A run blocked by enemy marks at **both** ends does not win, however long it is
  - Six in a row wins when it is not blocked; six blocked at both ends does not
  - There is no draw: an unbounded board never runs out of cells

- **Play against the machine**

  - Choose who moves first; the machine answers every move
  - Undo takes back your move **and** the machine's reply
  - Resign closes the game when it is no longer worth finishing

- **An opponent that actually plays**

  - Minimax with alpha-beta pruning, running in a Web Worker so the board never freezes
  - Evaluation is built around **open ends**, not run length: a five blocked at both ends
    is worth nothing, and broken shapes like `x x . x` count as the threats they are
  - Three difficulties that differ in search depth, time budget and one more thing —
    **Easy is weakened by occasionally not seeing your threat at all**, because a
    shallower search still blocks perfectly and would never feel easy
  - Hard reaches depth 6 inside its 1.5s budget; Easy answers in under 10ms
  - Every level is reproducible from a seed, so a bug found while playing can be replayed

- **Marks are told apart by shape, not by colour**

  - You play `X`, the machine plays `O`, drawn as pen strokes with a slight lean
  - Shape carries the meaning, so a greyscale screenshot still reads correctly
  - The winning five gets a pen stroke through it, cased so it stays visible where it
    crosses a mark

- **Reads as a sheet of graph paper**

  - Faint rules with a heavier one every five cells, like a Vietnamese exercise book
  - Light and dark are two full palettes; the canvas follows the system setting
  - Every colour comes from one file, so re-skinning touches nothing else

- **Built for touch as much as for a mouse**

  - On touch, a tap previews the mark and a second tap on the same cell commits it — a
    misdropped mark loses the game, and a finger is wider than a cell
  - With a mouse, a click places directly, because a misclick almost never happens
  - Dragging out and back counts as a drag, not a tap

- **No sign-in, no server, nothing leaves the browser**
  - No account, no analytics, no telemetry, no external font
  - Infrastructure ceiling for this project is 0đ, and that is what rules out online play

## Tech Stack

- **Framework**: Next.js 15 (App Router, `output: 'export'`), React 19, TypeScript strict
- **Rendering**: Canvas 2D, drawn procedurally — no asset files
- **Styling**: Tailwind CSS v3, lucide-react icons, self-hosted fonts via `next/font`
- **Testing**: vitest + happy-dom (130 unit tests, including 25 tactical positions for the engine)
- **Hosting**: static, intended for GitHub Pages

## Commands

```bash
yarn install
yarn dev          # http://localhost:3000
yarn test         # unit tests
yarn typecheck
yarn lint
yarn build        # static export into out/
```

No environment variables are needed — see [`.env.example`](.env.example), which says so
explicitly rather than leaving the question open.

## Documentation

Start at [`docs/README.md`](docs/README.md). It is the only file that talks about the
other files, and it carries a status marker per document so you can tell at a glance
which ones are worth reading.

Two things worth reading before changing code:

- [`docs/03-design/invariants.md`](docs/03-design/invariants.md) — twelve things that
  break **silently**: tests stay green and the result is still wrong.
- [`docs/decisions/`](docs/decisions/README.md) — nine ADRs, each naming the options it
  rejected and what the decision costs.
