# Digit Recognition

Interactive handwritten digit recognition — a Vanderbilt Data Science deep learning final project.

A user draws a digit (0–9) on a **28×28 pixel** surface in the browser. Later milestones will send
that image to a Python deep-learning backend for real inference; this repository currently contains
the frontend and the interactive drawing system only.

> **Project requirements:** [`FINAL_PROJECT_INSTRUCTIONS.md`](./FINAL_PROJECT_INSTRUCTIONS.md)
> **Repo orientation:** [`AGENTS.md`](./AGENTS.md)
> **Milestone 1** (this repo state): framework + drawing surface. **No machine learning yet.**

## Status

| Phase | Status |
| --- | --- |
| Frontend framework (Bun + Svelte + TS + Tailwind + Vite) | ✅ |
| 28×28 pixel drawing surface with intensity painting | ✅ |
| Clear/reset + debug readouts | ✅ |
| MNIST, logistic regression, PCA, CNN, FastAPI, deployment | ⬜ not started (by design) |

## Requirements

- [Bun](https://bun.sh/) (tested with 1.4.x) — used as the runtime and package manager.

## Run the frontend

```bash
cd frontend
bun install
bun run dev
```

Then open the printed local URL (default `http://localhost:5173`).

Other scripts (run from `frontend/`):

```bash
bun run build      # production build
bun run preview    # preview the production build
bun run check      # svelte-check + TypeScript type checking
```

## Repository layout

```
digit-recognition/
├── frontend/          # Svelte + Vite + TypeScript + Tailwind app
├── backend/           # future: Python + FastAPI + PyTorch
├── experiments/       # future: model comparison runs
├── notebooks/         # future: MNIST exploration / analysis
├── FINAL_PROJECT_INSTRUCTIONS.md
├── AGENTS.md
└── README.md
```

## How the drawing works

- The logical image is always **28×28 = 784** values, in normalized intensity `[0, 1]`
  (0 = background, 1 = maximum). This matches MNIST and never changes with screen size.
- The surface is a grid of individual cells (not a freehand canvas), so the pixelation is visible
  and intentional.
- **Hover** shows a soft accent-tinted brush preview. It is purely visual and does not modify the
  stored pixel data.
- **Drawing** (pointer held down) paints intensity additively: repeated or slow movement brightens
  pixels, and the brush has a configurable radial falloff so neighbours are weaker than the centre.
- A `requestAnimationFrame` loop interpolates between pointer positions, so fast drags still produce
  continuous strokes.
- **Clear** resets all 784 values to zero immediately.

The numeric data lives in `frontend/src/lib/drawing/state.svelte.ts`. `toFloat32Array()` returns the
784 values as a `Float32Array` — the exact form the future model will consume.

### Frontend source map

| Path | Purpose |
| --- | --- |
| `src/components/PixelGrid.svelte` | 28×28 surface: rendering, pointer handling, hover, painting |
| `src/components/DebugPanel.svelte` | Dev readouts + copy the 784 values |
| `src/lib/drawing/constants.ts` | `GRID_SIZE`, `PIXEL_COUNT`, clamping |
| `src/lib/drawing/types.ts` | `Point`, `Cell`, `BrushConfig`, `BrushKernel` |
| `src/lib/drawing/brush.ts` | Kernel build, `stamp`, `stroke` interpolation |
| `src/lib/drawing/state.svelte.ts` | Reactive image + debug state |

## Technology decisions

- **Plain Vite + Svelte 5 SPA** rather than SvelteKit: the app is a single static page, and the
  original plan used `src/App.svelte` + `src/main.ts`.
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (no `tailwind.config.js`). Custom CSS is
  used for the pixel grid where utility classes would be less clear.
- **Svelte 5 runes** (`$state`, `$derived`, `$props`) for fine-grained reactivity, so a pointer move
  updates only the cells that actually change.

## Not included yet

MNIST loading, logistic regression, PCA, CNN, PyTorch, scikit-learn, FastAPI, API requests,
model inference, prediction UI, authentication, databases, and deployment infrastructure.
