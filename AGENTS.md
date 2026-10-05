# AGENTS.md

Orientation notes for this repository. Read this first when picking the project back up.

## What this project is

An **interactive handwritten digit recognition** application, built as the final project for a
Vanderbilt Data Science master's deep learning course. A user draws a digit (0–9) on a 28×28
pixel surface in the browser; deep-learning models will predict the digit from that image.

The full requirement/grading rubric lives in [`FINAL_PROJECT_INSTRUCTIONS.md`](./FINAL_PROJECT_INSTRUCTIONS.md).
**That file is the source of truth for what "success" means.** Key expectations from it:

- At least one genuine deep neural network is central to the app (not a wrapper around a commercial API).
- A reputable public dataset (MNIST planned).
- Real model inference served by the deployed app (no mock/hard-coded outputs).
- A working online URL, a `.md` report, and a 3–8 minute `.mp4` video, with exact file naming.
- Meaningful evaluation **and** failure/error analysis.

## Current status / milestone

**Milestone 1 — interactive drawing frontend (complete / in progress).**
Scope is deliberately limited to the web framework and the drawing surface. No machine learning
is implemented yet.

Explicitly **not** built yet, by design: MNIST loading, logistic regression, PCA, CNN, PyTorch,
scikit-learn, FastAPI, API calls, model inference, prediction UI, auth, database, deployment.

Do not add these until the drawing milestone is reviewed and the next phase is requested.

## Repository layout

```
digit-recognition/
├── frontend/            # Svelte + Vite + TypeScript + Tailwind (the app for now)
│   ├── src/
│   │   ├── components/
│   │   │   ├── PixelGrid.svelte      # 28×28 drawing surface (pointer handling, rendering)
│   │   │   └── DebugPanel.svelte     # dev-only readouts + copy 784 values
│   │   ├── lib/drawing/
│   │   │   ├── constants.ts          # GRID_SIZE=28, PIXEL_COUNT=784, clamping
│   │   │   ├── types.ts              # Point, Cell, BrushConfig, BrushKernel
│   │   │   ├── brush.ts              # kernel build, stamp, stroke interpolation
│   │   │   └── state.svelte.ts       # reactive image (784 values) + debug state
│   │   ├── App.svelte                # layout, Clear button, brush-size control
│   │   ├── main.ts
│   │   └── app.css                   # Tailwind import + global styles
│   ├── index.html
│   ├── package.json / bun.lock
│   ├── vite.config.ts
│   └── svelte.config.js
├── backend/             # FUTURE: Python + FastAPI + PyTorch (placeholder only)
├── experiments/         # FUTURE: model comparison runs (placeholder only)
├── notebooks/           # FUTURE: MNIST exploration / analysis (placeholder only)
├── FINAL_PROJECT_INSTRUCTIONS.md
├── AGENTS.md
└── README.md
```

## Architecture

Frontend and machine learning are kept cleanly separated:

```
User → Svelte frontend → 28×28 logical drawing → 784 normalized values
                                                         │
                                        [future] Python FastAPI → preprocessing → model → prediction
```

Real interactions use the browser's **pointer events** so mouse, trackpad, stylus and touch are
supported; mouse is the primary target. The drawing surface is a 28×28 grid of DOM cells, not a
freehand canvas — the pixelation is intentional and matches MNIST.

### Data representation

- The logical image is **always 28×28 = 784** values, regardless of on-screen size.
- Values are normalized intensities in `[0, 1]`; `0` = background, `1` = maximum.
- The canonical store is the reactive `image.pixels` (`number[]`) in
  `src/lib/drawing/state.svelte.ts`. `toFloat32Array()` returns a `Float32Array` snapshot — the
  form the future model will consume.
- Hover/brush preview is a **separate transient glow buffer** and never mutates `image.pixels`.

### Drawing behavior

- Holding the pointer down paints intensity, so repeated/longer exposure builds brightness
  (a pressure-like feel with a normal mouse).
- A `requestAnimationFrame` loop stamps the brush at the current pointer position each frame and
  interpolates from the last painted point, so fast drags stay continuous and dwelling builds up.
- The brush uses a configurable radial falloff kernel (`src/lib/drawing/brush.ts`); center is
  strongest, neighbors weaker. Tune `DEFAULT_BRUSH` (radius, flow, spacing) or the UI brush size.

## Technology stack

- **Bun** is the runtime/package manager. Use `bun install`, `bun run dev`, `bun add`.
  Do not use npm/pnpm/yarn unless there is a compelling compatibility reason.
- **Vite** + **Svelte 5** (runes: `$state`, `$derived`, `$props`) + **TypeScript**.
  Plain Vite SPA (not SvelteKit), chosen because the project is a single-page static app and the
  original spec used `src/App.svelte` + `src/main.ts`.
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (`@import "tailwindcss"` in `app.css`,
  no `tailwind.config.js` needed). Custom CSS is used for the specialized pixel grid.
- Future backend: Python, FastAPI, PyTorch, scikit-learn, NumPy.

## Commands

Run from `frontend/`:

```bash
bun install        # install dependencies
bun run dev        # start dev server (hot reload)
bun run build      # production build
bun run preview    # preview the production build
bun run check      # svelte-check + TypeScript type checking
```

## Conventions / principles

1. Keep frontend and ML concerns separated; preserve room for the Python/FastAPI backend.
2. Don't prematurely build the backend or add dependencies.
3. Prefer simple, explainable code; avoid unexplained magic numbers (brush params are configurable).
4. Keep the logical drawing representation exactly 28×28; scale only visually.
5. The numeric drawing state matters more than the DOM representation.
6. Never fabricate ML results or add fake/placeholder predictions.
7. Document meaningful architectural decisions (README / this file).

## Gen-AI usage

This project was developed with AI coding assistance. Per course policy, the developer is
responsible for understanding and verifying the final system, and the report/video must explain
which tools were used and for what.
