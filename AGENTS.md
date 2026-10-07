# AGENTS.md

Orientation notes for this repository. Read this first when picking the project back up.

## What this project is

**DrawDigit** — an **interactive handwritten digit recognition** application, built as the final
project for a Vanderbilt Data Science master's deep learning course. A user draws a digit (0–9) on
a 28×28 pixel surface in the browser; a convolutional neural network trained on MNIST predicts the
digit from that image. Inference runs **in the browser**.

The full requirement/grading rubric lives in [`FINAL_PROJECT_INSTRUCTIONS.md`](./FINAL_PROJECT_INSTRUCTIONS.md).
**That file is the source of truth for what "success" means.** Key expectations from it:

- At least one genuine deep neural network is central to the app (not a wrapper around a commercial API).
- A reputable public dataset (MNIST).
- Real model inference in the deployed app (no mock/hard-coded outputs) — here it runs client-side.
- A working online URL, a `.md` report, and a 3–8 minute `.mp4` video, with exact file naming.
- Meaningful evaluation **and** failure/error analysis.

## Current status / milestone

- **Milestone 1 — interactive drawing frontend: complete.** The 28×28 surface, brush, and debug
  readouts work. No machine learning is wired into the app yet.
- **Milestone 2 — in-browser inference: next.** Train an MNIST CNN, export it to ONNX, and run it
  in the frontend with `onnxruntime-web`.

Explicitly **not** built yet, by design: MNIST loading, CNN training, ONNX export, the
`onnxruntime-web` runtime, MNIST-style input preprocessing in JS, prediction UI, and Netlify
deployment. Do not add these until the current milestone is reviewed and the next phase is
requested.

## Key architectural decision: client-side inference

The deployed model runs **entirely in the browser**; the trained weights ship as a static asset
(committed under `frontend/public/models/`). There is **no inference server** and no FastAPI
backend. Rationale:

- An MNIST CNN is tiny (~1.2M parameters; roughly 1–5 MB as fp32 weights, less when quantized).
- Single-image inference takes a few milliseconds on CPU (WebAssembly), well within the
  "reasonable latency" requirement.
- A static site is trivial and cheap to deploy (Netlify), with no server to run.

The rubric lists "a JavaScript front end with a Python backend, or similar" — client-side
inference still runs the *real trained model*, so it satisfies the "real model inference"
requirement. Python/PyTorch is still used, but **offline** for training, in `training/`.

### Preprocessing (required to match MNIST)

MNIST digits are size-normalized and centered by center of mass. A hand-drawn digit does not match
that distribution by default, so the frontend must reproduce the pipeline before inference:
threshold → crop to bounding box → scale to a 20×20 box → place in 28×28 and center by center of
mass → normalize to `[0, 1]`. This preprocessing is part of the technical contribution and must be
documented in the report.

## Repository layout

```
frontend/               # Svelte + Vite + TypeScript + Tailwind (the deployed app)
├── public/models/       # exported ONNX weights, committed and served to the browser
├── src/
│   ├── components/
│   │   ├── PixelGrid.svelte      # 28×28 drawing surface (pointer handling, rendering)
│   │   └── DebugPanel.svelte     # dev-only readouts + copy 784 values
│   ├── lib/drawing/
│   │   ├── constants.ts          # GRID_SIZE=28, PIXEL_COUNT=784, clamping
│   │   ├── types.ts              # Point, Cell, BrushConfig, BrushKernel
│   │   ├── brush.ts              # kernel build, stamp, stroke interpolation
│   │   └── state.svelte.ts       # reactive image (784 values) + debug state
│   ├── App.svelte                # layout, Clear button, brush-size control
│   ├── main.ts
│   └── app.css                   # Tailwind import + global styles
├── index.html
├── package.json / bun.lock
├── vite.config.ts
├── netlify.toml                  # static deploy config (base=frontend, bun build, publish dist)
└── svelte.config.js
training/               # PyTorch CNN training + ONNX export (offline; never deployed)
experiments/            # model comparison / ablation runs
notebooks/              # MNIST exploration / analysis
FINAL_PROJECT_INSTRUCTIONS.md
AGENTS.md
README.md
```

## Architecture

Training and runtime are kept cleanly separated; the contract between them is the exported ONNX
model plus the documented preprocessing spec.

```
User → Svelte frontend → 28×28 drawing → 784 values
                                            │
              [offline] PyTorch CNN training → ONNX artifact (committed to the repo)
                                            │
   browser: preprocessing → onnxruntime-web → logits → predicted digit + confidence
```

Real interactions use the browser's **pointer events** so mouse, trackpad, stylus and touch are
supported; mouse is the primary target. The drawing surface is a 28×28 grid of DOM cells, not a
freehand canvas — the pixelation is intentional and matches MNIST.

### Data representation

- The logical image is **always 28×28 = 784** values, regardless of on-screen size.
- Values are normalized intensities in `[0, 1]`; `0` = background, `1` = maximum.
- The canonical store is the reactive `image.pixels` (`number[]`) in
  `src/lib/drawing/state.svelte.ts`. `toFloat32Array()` returns a `Float32Array` snapshot — the
  form the model consumes.
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
- **Training / export:** Python + PyTorch (in `training/`), exporting to ONNX.
- **Runtime inference:** `onnxruntime-web` (WASM, with WebGPU where available).
- **Deployment:** Netlify static hosting built from `frontend/`.

## Commands

Run from `frontend/`:

```bash
bun install        # install dependencies
bun run dev        # start dev server (hot reload)
bun run build      # production build
bun run preview    # preview the production build
bun run check      # svelte-check + TypeScript type checking
```

Training commands (future, from `training/`): a train script and an ONNX export script. Keep the
exact commands here once they exist.

## Conventions / principles

1. Keep training (offline) and frontend (runtime) separated; the contract is the ONNX model plus a
   documented preprocessing spec.
2. Don't prematurely add dependencies or build future milestones before they are requested.
3. Prefer simple, explainable code; avoid unexplained magic numbers (brush params are configurable).
4. Keep the logical drawing representation exactly 28×28; scale only visually.
5. The numeric drawing state matters more than the DOM representation.
6. Never fabricate ML results or add fake/placeholder predictions.
7. The shipped ONNX artifact under `frontend/public/models/` is **committed on purpose** (see the
   exception in `.gitignore`); don't blanket-ignore it.
8. Document meaningful architectural decisions (README / this file).

## Gen-AI usage

This project was developed with AI coding assistance. Per course policy, the developer is
responsible for understanding and verifying the final system, and the report/video must explain
which tools were used and for what.
